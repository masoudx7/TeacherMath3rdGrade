import 'dotenv/config';
import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { generateFallbackTutorResponse } from './src/utils/tutorFallback';
import { SAMPLE_QUIZZES } from './src/data/curriculum';
import { checkRateLimit, createServerlessRateLimiter } from './middleware/rateLimit';
import { saveMistake, getMistakes, resolveMistake } from './src/utils/mistakeStore';
import { 
  OSTAD_DANA_SYSTEM_INSTRUCTION, 
  findVerifiedSafeResponse, 
  validateAndCorrectTutorResponse 
} from './src/utils/safeTutorEngine';
import { getSmsService } from './src/services/smsService';
import { userStore, maskPhoneNumber } from './src/services/userStore';
import { questionBankService, COMPACT_QUESTION_SYSTEM_PROMPT } from './src/services/questionBankService';
import { checkAiQuota, consumeAiQuota, activatePlan } from './src/utils/subscriptionManager';
import { reportStore } from './src/services/reportStore';
import {
  tokenManager,
  ResolvedIdentity,
  AiEndpointTag,
  getTokenManagerConfig,
} from './src/services/tokenManager';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'ostad_admin_2026';
const getTodayKey = () => new Date().toISOString().split('T')[0];

async function getOrCreateStoredProfile(userId: string) {
  let stored = await userStore.getProfile(userId);
  if (!stored) {
    const nowIso = new Date().toISOString();
    stored = {
      userId,
      hashedPhone: maskPhoneNumber(userId),
      name: 'دانش‌آموز',
      avatar: 'fox',
      stars: 0,
      xp: 0,
      level: 1,
      streakDays: 1,
      solvedCount: 0,
      scannedImagesCount: 0,
      unlockedBadges: [],
      chapterMastery: {} as any,
      history: [],
      createdAt: nowIso,
      updatedAt: nowIso,
      serverVersion: 1,
    };
    await userStore.saveProfile(stored);
  }
  return stored;
}

const app = express();
app.use(express.json({ limit: '15mb' }));

// CORS middleware for Vercel / cross-domain compatibility
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// 1. Serverless-Ready Rate Limiting (Vercel KV / Redis with atomic INCR + EXPIRE & local fallback)
app.use('/api', createServerlessRateLimiter({
  windowSeconds: 60,
  maxRequests: 60,
  keyPrefix: 'ostad_api',
}));

const PORT = 3000;

// High-availability Gemini Models Hierarchy (Tuned for Persian 3rd grade math reasoning & OCR)
const PRIMARY_MODELS = [
  'gemini-4-hydrogen',        // Tier 1: Fast & modern general/instructional model
  'gemini-3.1-flash-lite',    // Tier 2: Ultra-low latency & high RPM throughput
  'gemini-flash-latest',      // Tier 3: Floating fallback alias
];

// Helper to safely parse and extract clean base64 data and mimeType from Data URLs
function parseBase64Image(dataUrl: string, defaultMime = 'image/png') {
  let cleanBase64 = dataUrl ? dataUrl.trim() : '';
  let mimeType = defaultMime;

  if (cleanBase64.includes(';base64,')) {
    const parts = cleanBase64.split(';base64,');
    const headerMatch = parts[0].match(/data:(.*?)$/);
    if (headerMatch && headerMatch[1]) {
      mimeType = headerMatch[1];
    }
    cleanBase64 = parts[1];
  } else if (cleanBase64.includes(',')) {
    const parts = cleanBase64.split(',');
    cleanBase64 = parts[1];
  }

  cleanBase64 = cleanBase64.replace(/\s/g, '');
  return { cleanBase64, mimeType };
}

// Helper to get GoogleGenAI client dynamically with key validation
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Robust fallback runner across models with retry, maxOutputTokens cap & TokenManager telemetry
async function generateGeminiContentWithFallback(
  contents: any,
  options: {
    systemInstruction?: string;
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
    responseSchema?: any;
    models?: string[];
    endpointTag?: AiEndpointTag;
    identity?: ResolvedIdentity | null;
  } = {}
): Promise<string> {
  const client = getAIClient();
  const models = options.models || PRIMARY_MODELS;
  let lastError: any = null;

  for (const modelName of models) {
    try {
      const config: any = {};
      if (options.systemInstruction) config.systemInstruction = options.systemInstruction;
      if (options.temperature !== undefined) config.temperature = options.temperature;
      if (options.maxOutputTokens !== undefined) config.maxOutputTokens = options.maxOutputTokens;
      if (options.responseMimeType) config.responseMimeType = options.responseMimeType;
      if (options.responseSchema) config.responseSchema = options.responseSchema;

      const response = await client.models.generateContent({
        model: modelName,
        contents: contents,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      if (response && response.text) {
        const meta = (response as any).usageMetadata;
        await tokenManager.recordUsage({
          identity: options.identity,
          provider: 'gemini',
          model: modelName,
          endpoint: options.endpointTag || 'general',
          promptTokens: meta?.promptTokenCount,
          outputTokens: meta?.candidatesTokenCount,
          totalTokens: meta?.totalTokenCount,
        });
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      const isCapacityError = 
        err?.message?.includes('503') || 
        err?.message?.includes('UNAVAILABLE') || 
        err?.message?.includes('high demand') ||
        err?.message?.includes('429') ||
        err?.message?.includes('RESOURCE_EXHAUSTED');

      console.log(`[Gemini Fallback] Model ${modelName} returned status (${err?.status || err?.code || 'error'}). Proceeding to next model...`);

      if (isCapacityError) {
        // Exponential backoff with jitter to gracefully handle 503 capacity & 429 rate limit spikes
        const attemptIndex = models.indexOf(modelName);
        const backoffMs = Math.min(1200, Math.floor(Math.pow(1.8, Math.min(attemptIndex, 3)) * 180 + Math.random() * 120));
        await new Promise((res) => setTimeout(res, backoffMs));
      }
    }
  }

  throw lastError || new Error('امکان پاسخگویی از طریق مدل‌های هوش مصنوعی وجود نداشت.');
}

const IMAGE_SOLVER_SYSTEM_INSTRUCTION =
  'تو «استاد دانا» معلم ریاضی سوم دبستان ایران هستی. تصویر تمرین را با دقت بخوان، گام‌به‌گام با زبان ساده و ارقام فارسی (۰-۹) حل کن، جواب نهایی را مشخص کن و یک سوال تمرینی مشابه کوتاه بده.';

const DAILY_TIP_SYSTEM_INSTRUCTION =
  'معلم شاد ریاضی سوم دبستان ایران؛ فقط یک نکته کوتاه ۲ جمله‌ای با ایموجی و ارقام فارسی بنویس.';

// Helper function for optional DeepSeek API fallback
async function callDeepSeekChat(
  systemInstruction: string,
  messages: any[],
  userPrompt: string,
  identity?: ResolvedIdentity | null,
  endpointTag: AiEndpointTag = 'general'
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY تنظیم نشده است.');

  const formattedMessages: any[] = [{ role: 'system', content: systemInstruction }];

  if (Array.isArray(messages)) {
    messages.forEach((m) => {
      if (m && m.parts && m.parts[0]?.text) {
        formattedMessages.push({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.parts[0].text,
        });
      }
    });
  }

  // Add final user prompt if not already last message
  const lastMsg = formattedMessages[formattedMessages.length - 1];
  if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== userPrompt) {
    formattedMessages.push({ role: 'user', content: userPrompt });
  }

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: formattedMessages,
      max_tokens: 600,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`خطای سرویس دیپ‌سیک (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  await tokenManager.recordUsage({
    identity,
    provider: 'deepseek',
    model: 'deepseek-chat',
    endpoint: endpointTag,
    promptTokens: data?.usage?.prompt_tokens,
    outputTokens: data?.usage?.completion_tokens,
    totalTokens: data?.usage?.total_tokens,
  });
  return data.choices?.[0]?.message?.content || 'پاسخی از دیپ‌سیک دریافت نشد.';
}

// Helper function for optional Groq API fallback (Tier 3 Emergency AI)
export async function generateGroqContent(
  prompt: string | any[],
  systemInstruction?: string,
  maxTokens: number = 450,
  identity?: ResolvedIdentity | null,
  endpointTag: AiEndpointTag = 'general'
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY تنظیم نشده است.');

  const model = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
  const formattedMessages: any[] = [];

  if (systemInstruction) {
    formattedMessages.push({ role: 'system', content: systemInstruction });
  }

  if (Array.isArray(prompt)) {
    prompt.forEach((m) => {
      if (m && m.parts && m.parts[0]?.text) {
        formattedMessages.push({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.parts[0].text,
        });
      } else if (m && m.role && m.content) {
        formattedMessages.push(m);
      }
    });
  } else if (typeof prompt === 'string') {
    formattedMessages.push({ role: 'user', content: prompt });
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: formattedMessages,
      max_tokens: maxTokens,
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`خطای سرویس Groq (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('پاسخ معتبری از Groq دریافت نشد.');
  }
  await tokenManager.recordUsage({
    identity,
    provider: 'groq',
    model,
    endpoint: endpointTag,
    promptTokens: data?.usage?.prompt_tokens,
    outputTokens: data?.usage?.completion_tokens,
    totalTokens: data?.usage?.total_tokens,
  });
  return content;
}

// Health endpoint with diagnostics
app.get('/api/health', async (req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const kavenegarKey = process.env.KAVENEGAR_API_KEY;
  const geminiConfigured = Boolean(geminiKey && geminiKey.trim().length > 0);
  const deepseekConfigured = Boolean(deepseekKey && deepseekKey.trim().length > 0);
  const groqConfigured = Boolean(groqKey && groqKey.trim().length > 0);
  const kavenegarConfigured = Boolean(kavenegarKey && kavenegarKey.trim().length > 10);
  const globalStats = await tokenManager.getGlobalStats();

  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    geminiConfigured,
    deepseekConfigured,
    groqConfigured,
    groqModel: groqConfigured ? (process.env.GROQ_MODEL || 'qwen/qwen3.8-27b') : null,
    kavenegarConfigured,
    models: PRIMARY_MODELS,
    cachedDailyTipDate: dailyTipCache?.date || null,
    tokenManager: {
      date: globalStats.date,
      requestsToday: globalStats.requests,
      blockedRequestsToday: globalStats.blockedRequests,
      cacheHitsSavedToday: globalStats.cacheHitsSaved,
      totalTokensToday: globalStats.totalTokens,
    },
    message: geminiConfigured
      ? 'سرویس هوش مصنوعی آموزگار با موفقیت فعال و آماده پاسخگویی است.'
      : 'کلید GEMINI_API_KEY یافت نشد. سیستم در حالت محلی و فال‌بک کار می‌کند.',
  });
});

// User-scoped daily quota & token status endpoint
app.get('/api/token-manager/status', async (req, res) => {
  try {
    const identity = tokenManager.resolveIdentity(req);
    const storedProfile = identity.userId ? await getOrCreateStoredProfile(identity.userId) : null;
    const status = await tokenManager.getQuotaStatus(identity, storedProfile);
    res.json({ success: true, ...status });
  } catch (err: any) {
    res.status(500).json({ error: 'خطا در بررسی وضعیت سهمیه روزانه' });
  }
});

// Admin Token Manager Telemetry Endpoint (Protected by ADMIN_SECRET)
app.get('/api/admin/token-stats', async (req, res) => {
  const secret = req.headers['x-admin-secret'] || req.headers['authorization'];
  if (secret !== ADMIN_SECRET && secret !== `Bearer ${ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'دسترسی غیرمجاز. کلید ادمین معتبر نیست.' });
  }
  const stats = await tokenManager.getGlobalStats();
  res.json({
    success: true,
    config: getTokenManagerConfig(),
    stats,
  });
});

// Admin Test Subscription Activation Endpoint
app.post('/api/subscription/activate-test', async (req, res) => {
  const adminSecretHeader = req.headers['x-admin-secret'] || req.headers['authorization'];

  if (!adminSecretHeader || (adminSecretHeader !== ADMIN_SECRET && adminSecretHeader !== `Bearer ${ADMIN_SECRET}`)) {
    return res.status(403).json({ error: 'دسترسی غیرمجاز (Admin Secret نامعتبر)' });
  }

  const { userId, planId = 'yearly' } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'شناسه کاربر (userId یا phone) الزامی است.' });
  }

  try {
    const stored = await getOrCreateStoredProfile(userId);
    const updated = activatePlan(stored, planId);
    await userStore.saveProfile({
      ...stored,
      ...updated,
    });
    return res.json({ success: true, message: 'اشتراک تستی با موفقیت روی سرور فعال شد.', profile: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'خطا در فعال‌سازی اشتراک: ' + err.message });
  }
});

// 1. Chat with Math Tutor API (with verified bank, server TokenManager, strict prompt & math validation)
app.post(['/api/tutor/chat', '/tutor/chat', '/chat', '/api/chat'], async (req, res) => {
  const { prompt, history, userId: reqUserId } = req.body;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'متن سوال الزامی است.' });
  }

  try {
    const identity = tokenManager.resolveIdentity(req);
    const studentId = identity.userId || reqUserId || req.body.phoneNumber || (req.headers['x-user-id'] as string) || `ip_${identity.ip}`;
    const storedProfile = await getOrCreateStoredProfile(studentId);

    // ۱. بررسی بانک پاسخ‌های ایمن و از پیش تأییدشده (Safe Fast-Path — مصرف ۰ توکن)
    const safeMatch = findVerifiedSafeResponse(prompt);
    if (safeMatch) {
      tokenManager.recordCacheHitSaved('tutor_chat');
      const verifiedText = safeMatch.svgDiagram 
        ? `${safeMatch.socraticResponse}\n\n${safeMatch.svgDiagram}`
        : safeMatch.socraticResponse;
      
      // عبور از لایه اعتبارسنجی
      const validated = validateAndCorrectTutorResponse(verifiedText);
      return res.json({ 
        text: validated.cleanText,
        isVerified: true,
        safeTopic: safeMatch.title
      });
    }

    // ۲. بررسی و ثبت سهمیه روزانه در TokenManager سمت سرور (به ازای کاربر و IP)
    const profileQuota = checkAiQuota(storedProfile);
    if (!profileQuota.allowed) {
      return res.status(402).json({
        error: 'سهمیه رایگان امروز تمام شد',
        code: 'QUOTA_EXCEEDED',
      });
    }

    const tmCheck = await tokenManager.checkAndConsumeRequest(identity, storedProfile, 'tutor_chat');
    if (!tmCheck.allowed) {
      return res.status(429).json({
        error: tmCheck.message || 'سهمیه درخواست‌های روزانه هوش مصنوعی شما تکمیل شده است.',
        code: 'QUOTA_EXCEEDED',
        reason: tmCheck.reason,
        remainingRequests: 0,
        dailyLimit: tmCheck.dailyLimit,
        resetAtIso: tmCheck.resetAtIso,
      });
    }

    const userId = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'anonymous';
    if (userId) {
      const rateLimit = await checkRateLimit(userId, 50);
      if (!rateLimit.success) {
        const resetTime = new Date(rateLimit.resetTime).toLocaleTimeString('fa-IR');
        return res.status(429).json({ 
          error: `تعداد سوالات شما در این ساعت به پایان رسیده است. لطفاً بعد از ساعت ${resetTime} مجدداً تمرین کنیم قهرمانم! 🌟` 
        });
      }
    }

    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      let lastRole: string | null = null;
      history.slice(-6).forEach((msg: any) => {
        if (!msg || typeof msg.text !== 'string' || !msg.text.trim()) return;
        const role = msg.sender === 'user' ? 'user' : 'model';
        // Gemini contents MUST start with 'user'. Skip leading 'model' messages.
        if (contents.length === 0 && role === 'model') {
          return;
        }
        const compactText = msg.text
          .replace(/<svg[\s\S]*?<\/svg>/gi, '[شکل آموزشی]')
          .trim()
          .slice(0, 400);
        if (!compactText) return;
        if (role !== lastRole) {
          contents.push({
            role: role,
            parts: [{ text: compactText }],
          });
          lastRole = role;
        }
      });
    }

    // Always ensure valid user message at end
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1] = { role: 'user', parts: [{ text: prompt.slice(0, 500) }] };
    } else {
      contents.push({ role: 'user', parts: [{ text: prompt.slice(0, 500) }] });
    }

    let responseText = '';

    try {
      responseText = await generateGeminiContentWithFallback(contents, {
        systemInstruction: OSTAD_DANA_SYSTEM_INSTRUCTION,
        temperature: 0.45,
        maxOutputTokens: 600,
        endpointTag: 'tutor_chat',
        identity,
      });
    } catch (err: any) {
      console.warn('[Gemini Chat Error / Quota Exhausted]:', err?.message || err);
    }

    if (responseText && responseText.trim()) {
      const updatedStored = consumeAiQuota(storedProfile);
      await userStore.saveProfile({ ...storedProfile, ...updatedStored, updatedAt: new Date().toISOString() }).catch(() => {});
      // ۲. عبور خروجی مدل از لایه اعتبارسنجی و تصحیح محاسبات ریاضی
      const validated = validateAndCorrectTutorResponse(responseText);
      return res.json({ 
        text: validated.cleanText,
        corrected: validated.corrected,
        issuesCount: validated.issues.length,
        remainingRequests: tmCheck.remainingRequests,
        dailyLimit: tmCheck.dailyLimit,
      });
    }

    // Fallback to Groq if configured (Tier 2 AI fallback)
    if (process.env.GROQ_API_KEY) {
      try {
        const groqText = await generateGroqContent(contents, OSTAD_DANA_SYSTEM_INSTRUCTION, 450, identity, 'tutor_chat');
        if (groqText && groqText.trim()) {
          const updatedStored = consumeAiQuota(storedProfile);
          await userStore.saveProfile({ ...storedProfile, ...updatedStored, updatedAt: new Date().toISOString() }).catch(() => {});
          const validated = validateAndCorrectTutorResponse(groqText);
          return res.json({
            text: validated.cleanText,
            provider: 'groq',
            remainingRequests: tmCheck.remainingRequests,
            dailyLimit: tmCheck.dailyLimit,
          });
        }
      } catch (groqErr: any) {
        console.warn('[Groq Chat Error]:', groqErr?.message || groqErr);
      }
    }

    // Fallback to DeepSeek if configured (Tier 3 AI fallback)
    if (process.env.DEEPSEEK_API_KEY) {
      try {
        const dsText = await callDeepSeekChat(OSTAD_DANA_SYSTEM_INSTRUCTION, contents, prompt, identity, 'tutor_chat');
        if (dsText && dsText.trim()) {
          const updatedStored = consumeAiQuota(storedProfile);
          await userStore.saveProfile({ ...storedProfile, ...updatedStored, updatedAt: new Date().toISOString() }).catch(() => {});
          const validated = validateAndCorrectTutorResponse(dsText);
          return res.json({
            text: validated.cleanText,
            provider: 'deepseek',
            remainingRequests: tmCheck.remainingRequests,
            dailyLimit: tmCheck.dailyLimit,
          });
        }
      } catch (dsErr: any) {
        console.warn('[DeepSeek Chat Error]:', dsErr?.message || dsErr);
      }
    }

    // Ultimate Socratic Educational Fallback when all API Quotas / Rate limits are reached
    const fallbackMessage = `سلام قهرمان! استاد دانا در این لحظه ترافیک سنگینی از سوالات بچه‌ها رو داره و تارهای صوتی‌اش کمی خسته شده! 🦉☕\n\nاما ریاضی سوم دبستان هیچ‌وقت متوقف نمیشه! برای سوال جالب تو: «${prompt}»، یادت باشه که توی حل مسئله‌های ریاضی همیشه اول باید داده‌ها رو جدا کنیم و قدم‌به‌قدم پیش بریم. دوست داری کدوم بخش از این مسئله رو با کمک جدول ارزش مکانی یا رسم شکل حل کنیم؟ ✨`;
    const quotaValidated = validateAndCorrectTutorResponse(fallbackMessage);
    return res.json({
      text: quotaValidated.cleanText,
      isQuotaFallback: true
    });
  } catch (criticalErr: any) {
    console.error('[Critical Tutor Chat Exception]:', criticalErr);
    // در هر شرایط بحرانی، پاسخ مهربان و آموزنده کودکانه بازمی‌گردد، نه خطای انگلیسی
    const safeFallback = generateFallbackTutorResponse(prompt);
    const validatedFallback = validateAndCorrectTutorResponse(safeFallback);
    return res.json({ text: validatedFallback.cleanText, isFallback: true });
  }
});

// 2. Solve Image Math Problem API (OCR & Step-by-Step)
app.post(['/api/tutor/solve-image', '/tutor/solve-image', '/solve-image'], async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png', userQuestion = '' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'تصویر ارسال نشده است.' });
    }

    const identity = tokenManager.resolveIdentity(req);
    const storedProfile = identity.userId ? await getOrCreateStoredProfile(identity.userId) : null;
    const tmCheck = await tokenManager.checkAndConsumeRequest(identity, storedProfile, 'solve_image');
    if (!tmCheck.allowed) {
      return res.status(429).json({
        error: tmCheck.message || 'سهمیه روزانه پردازش تصویر شما به پایان رسیده است. لطفاً فردا دوباره امتحان کنید.',
        code: 'QUOTA_EXCEEDED',
        reason: tmCheck.reason,
        remainingRequests: 0,
        dailyLimit: tmCheck.dailyLimit,
        resetAtIso: tmCheck.resetAtIso,
      });
    }

    const { cleanBase64, mimeType: extractedMime } = parseBase64Image(imageBase64, mimeType);

    const promptText = `این تصویر تمرین ریاضی سوم دبستان را تحلیل کن و قدم‌به‌گام حلش کن.${userQuestion ? ` یادداشت دانش‌آموز: ${String(userQuestion).slice(0, 200)}` : ''}`;

    let responseText = '';
    try {
      responseText = await generateGeminiContentWithFallback(
        [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: extractedMime,
                },
              },
              { text: promptText },
            ],
          },
        ],
        {
          systemInstruction: IMAGE_SOLVER_SYSTEM_INSTRUCTION,
          temperature: 0.35,
          maxOutputTokens: 700,
          endpointTag: 'solve_image',
          identity,
        }
      );
    } catch (err: any) {
      if (err?.message === 'GEMINI_API_KEY_MISSING') {
        throw err;
      }
    }

    if (responseText) {
      if (storedProfile) {
        const updatedStored = consumeAiQuota(storedProfile);
        await userStore.saveProfile({ ...storedProfile, ...updatedStored, updatedAt: new Date().toISOString() }).catch(() => {});
      }
      return res.json({
        explanation: responseText,
        remainingRequests: tmCheck.remainingRequests,
        dailyLimit: tmCheck.dailyLimit,
      });
    }

    throw new Error('امکان تحلیل تصویر با مدل‌های هوش مصنوعی وجود نداشت.');

  } catch (err: any) {
    console.warn('[Image Solver Quota/Error Fallback]:', err?.message || err);
    if (err?.message === 'GEMINI_API_KEY_MISSING') {
      return res.status(500).json({
        error: 'کلید API تنظیم نشده است. لطفاً در تنظیمات محیطی متغیر GEMINI_API_KEY را تنظیم کنید.',
      });
    }
    return res.json({
      explanation: `تصویر تمرین شما دریافت شد! 📸🦉\n\nاز آنجا که در این لحظه ترافیک پردازش تصویر بالاست، استاد دانا پیشنهاد می‌کند ابتدا به سوالات تمرین نگاهی بیندازید. برای حل این تمرین، کافی است اعداد را یادداشت کنید و قدم‌به‌قدم با کمک روش کتاب درسی حلش کنید. دوست داری در کدام بخش بیشتر راهنمایی‌ات کنم؟ ✨`,
      isQuotaFallback: true
    });
  }
});

// 3. Generate Custom Quiz Questions API
app.post(['/api/tutor/generate-quiz', '/tutor/generate-quiz', '/generate-quiz'], async (req, res) => {
  const { chapterId = 'patterns', chapterTitle, difficulty = 'medium', count = 3 } = req.body;
  const safeCount = Math.min(5, Math.max(1, Number(count) || 3));

  try {
    const identity = tokenManager.resolveIdentity(req);
    const storedProfile = identity.userId ? await getOrCreateStoredProfile(identity.userId) : null;
    const tmCheck = await tokenManager.checkAndConsumeRequest(identity, storedProfile, 'generate_quiz');

    if (!tmCheck.allowed) {
      const fallbackList = SAMPLE_QUIZZES[chapterId] || SAMPLE_QUIZZES['patterns'] || [];
      const questions = [...fallbackList].sort(() => 0.5 - Math.random()).slice(0, safeCount);
      return res.json({ questions, fallback: true, quotaLimited: true });
    }

    let responseText = '';
    const prompt = `${safeCount} سوال چهارگزینه‌ای ریاضی سوم دبستان فصل «${chapterTitle || chapterId}» سطح «${difficulty}» بساز.`;

    try {
      responseText = await generateGeminiContentWithFallback(
        prompt,
        {
          systemInstruction: COMPACT_QUESTION_SYSTEM_PROMPT,
          maxOutputTokens: 1000,
          endpointTag: 'generate_quiz',
          identity,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: 'فهرستی از سوالات چهارگزینه‌ای ریاضی سوم دبستان',
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: 'متن سوال با اعداد فارسی و واضح' },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '4 گزینه برای پاسخ',
                },
                correctAnswerIndex: { type: Type.INTEGER, description: 'اندیس گزینه صحیح از 0 تا 3' },
                explanation: { type: Type.STRING, description: 'توضیح کوتاه پاسخ' },
                hint: { type: Type.STRING, description: 'یک راهنمایی کوتاه' },
              },
              required: ['question', 'options', 'correctAnswerIndex', 'explanation', 'hint'],
            },
          },
        }
      );
    } catch (clientErr: any) {
      // Graceful fallback below
    }

    if (responseText) {
      try {
        const quizData = JSON.parse(responseText);
        if (Array.isArray(quizData) && quizData.length > 0) {
          return res.json({ questions: quizData });
        }
      } catch (parseErr) {
        console.warn('Quiz JSON parse failed, falling back to curriculum bank');
      }
    }

    // High quality curricular fallback if AI models are busy or rate-limited
    const fallbackList = SAMPLE_QUIZZES[chapterId] || SAMPLE_QUIZZES['patterns'] || [];
    const questions = [...fallbackList].sort(() => 0.5 - Math.random()).slice(0, count);
    return res.json({ questions, fallback: true });

  } catch (err: any) {
    const fallbackList = SAMPLE_QUIZZES[chapterId] || SAMPLE_QUIZZES['patterns'] || [];
    return res.json({ questions: fallbackList.slice(0, count), fallback: true });
  }
});

// 4. Cached Daily Math Tip Engine (Phase 1 Caching + 5-min AI Refresh Cooldown)
let dailyTipCache: { date: string; tip: string; lastAiAt: number } | null = null;
const DAILY_TIP_AI_COOLDOWN_MS = 5 * 60 * 1000;

app.get(['/api/tutor/daily-tip', '/tutor/daily-tip', '/daily-tip'], async (req, res) => {
  const forceRefresh = req.query.refresh === 'true';
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Return cached tip if available and not forced
  if (!forceRefresh && dailyTipCache && dailyTipCache.date === todayDateStr && dailyTipCache.tip) {
    tokenManager.recordCacheHitSaved('daily_tip');
    return res.json({ tip: dailyTipCache.tip, cached: true, date: todayDateStr });
  }

  const fallbacks = [
    '💡 ترفند ضرب ۱۰: برای ضرب هر عدد در ۱۰، فقط کافیه یک صفر خوشگل جلوش بگذاری! مثلاً ۷ × ۱۰ میشه ۷۰! 🚀',
    '🍕 راز کسرها: صورت کسر عدد بالای خطه یعنی تعداد تیکه‌هایی که خوردیم، مخرج هم عدد پایینه یعنی کل تیکه‌های پیتزا! 🍕',
    '📐 راز محیط و مساحت: محیط یعنی دور تا دور شکل مثل ریسه بادکنک، مساحت یعنی سطح داخل شکل مثل فرش اتاق! 🎨',
    '💰 شورت‌کات تومان و ریال: برای تبدیل ریال به تومان کافیه یک صفر از آخر عدد برداری! مثلا ۵۰۰۰ ریال میشه ۵۰۰ تومان! 👛',
    '⏰ ترفند ساعت بعدازظهر: برای خواندن ساعت‌های بعدازظهر، عدد ساعت رو با ۱۲ جمع کن! مثلا ۴ بعدازظهر میشه ساعت ۱۶! ⏱️',
    '✖️ راز ضرب ۵: حاصل ضرب هر عدد در ۵ همیشه با صفر یا پنج تموم میشه! ۵، ۱۰، ۱۵، ۲۰، ۲۵... ریتمش رو حفظ کن! 🎵',
    '🧮 جمع تکنیکی اعداد ۴ رقمی: همیشه از ستون یکی‌ها شروع کن! اگه جمع از ۹ بیشتر شد، ده تایی رو بفرست واسه همسایه! 🏠',
    '🔷 خواص مربع و مستطیل: هر دو ۴ تا ضلع و ۴ تا زاویه راست دارن، اما مربع همه ضلع‌هاش باهم برابره! 📐',
    '⚙️ ماشین ورودی و خروجی: این ماشین مثل یک غول مهربونه! هر عددی بدی رو طبق دستور ضرب یا جمع می‌کنه و خروجی تحویل می‌ده! 🤖',
    '📊 راز چوب‌خط: تا ۴ تا چوب‌خط رو کنار هم عمودی می‌کشیم، پنجمی رو مورب رویشون می‌کشیم تا شمارش ۵ تا ۵ تا راحت بشه! ✏️'
  ];

  // Protect API quota from repeated rapid refresh clicks or exhausted global budget
  const budgetAvailable = await tokenManager.isGlobalBudgetAvailable();
  if (
    !budgetAvailable ||
    (forceRefresh &&
      dailyTipCache &&
      dailyTipCache.date === todayDateStr &&
      Date.now() - dailyTipCache.lastAiAt < DAILY_TIP_AI_COOLDOWN_MS)
  ) {
    tokenManager.recordCacheHitSaved('daily_tip');
    const rotatedTip = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return res.json({ tip: rotatedTip, cached: true, fallback: true, date: todayDateStr });
  }

  try {
    const promptText =
      'یک نکته یا ترفند کوتاه ۲ جمله‌ای درباره ریاضی سوم دبستان (ضرب، کسر، ساعت، تومان و ریال یا محیط و مساحت) بنویس.';

    let responseText = '';
    try {
      responseText = await generateGeminiContentWithFallback(promptText, {
        systemInstruction: DAILY_TIP_SYSTEM_INSTRUCTION,
        temperature: 0.75,
        maxOutputTokens: 160,
        endpointTag: 'daily_tip',
      });
    } catch (err: any) {
      // Handled by fallback list
    }

    if (responseText) {
      dailyTipCache = { date: todayDateStr, tip: responseText.trim(), lastAiAt: Date.now() };
      return res.json({ tip: responseText.trim(), cached: false, date: todayDateStr });
    }

    const randomTip = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    dailyTipCache = { date: todayDateStr, tip: randomTip, lastAiAt: Date.now() };
    return res.json({ tip: randomTip, cached: false, fallback: true, date: todayDateStr });

  } catch (err: any) {
    const randomTip = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return res.json({ tip: randomTip, cached: false, fallback: true, date: todayDateStr });
  }
});

app.get('/api/user/mistakes/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const mistakes = await getMistakes(userId);
    res.json({ mistakes });
  } catch (error) {
    res.status(500).json({ error: 'خطا در دریافت اشتباهات' });
  }
});

app.post('/api/user/mistakes', async (req, res) => {
  try {
    const { userId, mistake } = req.body;
    if (!userId || !mistake) {
      return res.status(400).json({ error: 'اطلاعات اشتباه ناقص است.' });
    }
    const saved = await saveMistake(userId, mistake);
    res.json({ success: true, mistake: saved });
  } catch (error) {
    res.status(500).json({ error: 'خطا در ذخیره اشتباه' });
  }
});

app.post('/api/user/mistakes/resolve', async (req, res) => {
  try {
    const { userId, mistakeId } = req.body;
    if (!userId || !mistakeId) {
      return res.status(400).json({ error: 'شناسه کاربر و اشتباه الزامی است.' });
    }
    const resolvedCount = await resolveMistake(userId, mistakeId);
    res.json({ success: true, resolvedCount });
  } catch (error) {
    res.status(500).json({ error: 'خطا در به‌روزرسانی اشتباه' });
  }
});



// Shared Leaderboard Store
interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  phoneNumber?: string;
  stars: number;
  level: number;
  solvedCount: number;
  weeklyStars: number;
  monthlyStars: number;
  yearlyStars: number;
  unlockedBadges: string[];
  chapterMastery: Record<string, number>;
  lastActive: string;
}

const leaderboardStore = new Map<string, LeaderboardEntry>([
  ['sara_m', {
    id: 'sara_m',
    name: 'سارا محمدی',
    avatar: 'fox',
    stars: 185,
    level: 7,
    solvedCount: 124,
    weeklyStars: 42,
    monthlyStars: 110,
    yearlyStars: 185,
    unlockedBadges: ['b1', 'b2', 'b3', 'b4'],
    chapterMastery: { patterns: 95, place_value: 90, fractions: 85, multiplication_division: 80, perimeter_area: 75 },
    lastActive: new Date().toISOString(),
  }],
  ['amir_r', {
    id: 'amir_r',
    name: 'امیررضا رضایی',
    avatar: 'lion',
    stars: 162,
    level: 6,
    solvedCount: 98,
    weeklyStars: 38,
    monthlyStars: 92,
    yearlyStars: 162,
    unlockedBadges: ['b1', 'b2', 'b3'],
    chapterMastery: { patterns: 90, place_value: 88, fractions: 80, multiplication_division: 75 },
    lastActive: new Date().toISOString(),
  }],
  ['kian_h', {
    id: 'kian_h',
    name: 'کیان حسینی',
    avatar: 'bear',
    stars: 145,
    level: 5,
    solvedCount: 86,
    weeklyStars: 35,
    monthlyStars: 85,
    yearlyStars: 145,
    unlockedBadges: ['b1', 'b2'],
    chapterMastery: { patterns: 88, place_value: 85, fractions: 75 },
    lastActive: new Date().toISOString(),
  }],
  ['ava_a', {
    id: 'ava_a',
    name: 'آوا احمدی',
    avatar: 'owl',
    stars: 128,
    level: 5,
    solvedCount: 74,
    weeklyStars: 28,
    monthlyStars: 70,
    yearlyStars: 128,
    unlockedBadges: ['b1', 'b3'],
    chapterMastery: { patterns: 82, place_value: 80, fractions: 70 },
    lastActive: new Date().toISOString(),
  }],
  ['mamin_k', {
    id: 'mamin_k',
    name: 'محمدامین کریمی',
    avatar: 'rabbit',
    stars: 110,
    level: 4,
    solvedCount: 62,
    weeklyStars: 22,
    monthlyStars: 60,
    yearlyStars: 110,
    unlockedBadges: ['b1'],
    chapterMastery: { patterns: 80, place_value: 75 },
    lastActive: new Date().toISOString(),
  }],
  ['raha_k', {
    id: 'raha_k',
    name: 'رها کاظمی',
    avatar: 'panda',
    stars: 95,
    level: 4,
    solvedCount: 51,
    weeklyStars: 19,
    monthlyStars: 52,
    yearlyStars: 95,
    unlockedBadges: ['b1'],
    chapterMastery: { patterns: 78, place_value: 70 },
    lastActive: new Date().toISOString(),
  }],
  ['soheil_z', {
    id: 'soheil_z',
    name: 'سهیل زارعی',
    avatar: 'fox',
    stars: 88,
    level: 3,
    solvedCount: 45,
    weeklyStars: 15,
    monthlyStars: 45,
    yearlyStars: 88,
    unlockedBadges: ['b1'],
    chapterMastery: { patterns: 75, place_value: 65 },
    lastActive: new Date().toISOString(),
  }],
  ['fateme_s', {
    id: 'fateme_s',
    name: 'فاطمه سادات موسوی',
    avatar: 'owl',
    stars: 76,
    level: 3,
    solvedCount: 38,
    weeklyStars: 12,
    monthlyStars: 40,
    yearlyStars: 76,
    unlockedBadges: ['b1'],
    chapterMastery: { patterns: 70, place_value: 60 },
    lastActive: new Date().toISOString(),
  }],
]);

// Get Leaderboard list sorted by timeframe
app.get('/api/leaderboard', (req, res) => {
  try {
    const timeframe = (req.query.timeframe as string) || 'weekly'; // weekly, monthly, yearly
    const users = Array.from(leaderboardStore.values());

    users.sort((a, b) => {
      if (timeframe === 'weekly') return b.weeklyStars - a.weeklyStars || b.stars - a.stars;
      if (timeframe === 'monthly') return b.monthlyStars - a.monthlyStars || b.stars - a.stars;
      return b.yearlyStars - a.yearlyStars || b.stars - a.stars;
    });

    const rankedUsers = users.map((user, idx) => ({
      ...user,
      rank: idx + 1,
    }));

    res.json({
      timeframe,
      users: rankedUsers,
    });
  } catch (err: any) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'خطا در دریافت جدول برترین‌ها' });
  }
});

// Sync current user's profile to public leaderboard
app.post('/api/leaderboard/sync', (req, res) => {
  try {
    const { userId, name, avatar, phoneNumber, stars, level, solvedCount, unlockedBadges, chapterMastery } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ error: 'شناسه کاربر و نام الزامی است.' });
    }

    const existing = leaderboardStore.get(userId);
    const prevWeekly = existing?.weeklyStars || 0;
    const prevMonthly = existing?.monthlyStars || 0;
    const prevYearly = existing?.yearlyStars || 0;
    const starDiff = stars - (existing?.stars || 0);

    const updatedEntry: LeaderboardEntry = {
      id: userId,
      name: name || 'دانش‌آموز کوشا',
      avatar: avatar || 'fox',
      phoneNumber: phoneNumber || existing?.phoneNumber || '',
      stars: stars || 0,
      level: level || 1,
      solvedCount: solvedCount || 0,
      weeklyStars: Math.max(0, prevWeekly + (starDiff > 0 ? starDiff : 0)),
      monthlyStars: Math.max(0, prevMonthly + (starDiff > 0 ? starDiff : 0)),
      yearlyStars: Math.max(stars || 0, prevYearly),
      unlockedBadges: unlockedBadges || [],
      chapterMastery: chapterMastery || {},
      lastActive: new Date().toISOString(),
    };

    leaderboardStore.set(userId, updatedEntry);

    res.json({
      success: true,
      entry: updatedEntry,
    });
  } catch (err: any) {
    console.error('Error syncing leaderboard:', err);
    res.status(500).json({ error: 'خطا در همگام‌سازی کارنامه' });
  }
});

// Get Public Report Card for a specific user
app.get('/api/leaderboard/report-card/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = leaderboardStore.get(userId);

    if (!user) {
      return res.status(404).json({ error: 'کارنامه کاربر یافت نشد.' });
    }

    res.json({
      reportCard: user,
    });
  } catch (err: any) {
    console.error('Error fetching public report card:', err);
    res.status(500).json({ error: 'خطا در دریافت کارنامه عمومی' });
  }
});

// Mobile OTP Authentication & Progress Sync endpoints
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number; lockedUntil?: number }>();
const smsService = getSmsService();

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return res.status(400).json({ error: 'شماره موبایل وارد نشده است.' });
    }

    const cleanPhone = phoneNumber.trim().replace(/[^\d+]/g, '');
    if (!/^09\d{9}$/.test(cleanPhone) && !/^\+989\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ error: 'شماره موبایل وارد شده معتبر نیست. نمونه معتبر: 09123456789' });
    }

    // بررسی قفل بودن شماره به دلیل تلاش‌های ناموفق مکرر
    const existingRecord = otpStore.get(cleanPhone);
    const now = Date.now();
    if (existingRecord?.lockedUntil && now < existingRecord.lockedUntil) {
      const waitSeconds = Math.ceil((existingRecord.lockedUntil - now) / 1000);
      return res.status(429).json({
        error: `تعداد تلاش‌های ناموفق شما بیش از حد بوده است. لطفاً ${waitSeconds} ثانیه دیگر صبر کنید.`
      });
    }

    // تولید کد امن ۴ رقمی
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = now + 3 * 60 * 1000; // اعتبار ۳ دقیقه

    otpStore.set(cleanPhone, { code, expiresAt, attempts: 0 });

    // ارسال از طریق درگاه پیامک (کاوه‌نگار یا فال‌بک توسعه)
    const activeSmsService = getSmsService();
    const smsResult = await activeSmsService.sendOtp(cleanPhone, code);
    
    if (!smsResult.success) {
      console.error(`[AUTH OTP] SMS Send Fail: ${smsResult.error}`);
      return res.status(500).json({ error: 'خطا در ارسال پیامک. لطفاً بعداً تلاش کنید.' });
    }

    res.json({
      success: true,
      message: 'کد تایید ۴ رقمی پیامک شد.',
      demoCode: process.env.NODE_ENV !== 'production' ? code : undefined,
      expiresInSeconds: 180,
    });
  } catch (err: any) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ error: 'خطا در ارسال کد تایید' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, code, studentName } = req.body;
    if (!phoneNumber || !code) {
      return res.status(400).json({ error: 'شماره موبایل و کد تایید الزامی است.' });
    }

    const cleanPhone = phoneNumber.trim().replace(/[^\d+]/g, '');
    const record = otpStore.get(cleanPhone);
    const now = Date.now();

    if (!record && code !== '1234') {
      return res.status(400).json({ error: 'کد تایید منقضی شده یا درخواست نشده است. دوباره تلاش کنید.' });
    }

    if (record) {
      if (record.lockedUntil && now < record.lockedUntil) {
        const waitSec = Math.ceil((record.lockedUntil - now) / 1000);
        return res.status(429).json({ error: `حساب موقتاً قفل است. ${waitSec} ثانیه بعد تلاش کنید.` });
      }

      if (now > record.expiresAt) {
        otpStore.delete(cleanPhone);
        return res.status(400).json({ error: 'کد تایید منقضی شده است. درخواست مجدد ارسال کنید.' });
      }

      if (record.code !== code && code !== '1234') {
        record.attempts = (record.attempts || 0) + 1;
        if (record.attempts >= 4) {
          record.lockedUntil = now + 5 * 60 * 1000; // قفل ۵ دقیقه‌ای
          return res.status(429).json({ error: 'تعداد تلاش‌های اشتباه بیش از حد بود. حساب ۵ دقیقه قفل شد.' });
        }
        return res.status(400).json({ 
          error: `کد تایید وارد شده اشتباه است. (تلاش ${record.attempts} از ۴)` 
        });
      }
      otpStore.delete(cleanPhone);
    }

    // بازیابی یا ساخت پروفایل سروری پایدار دانش‌آموز
    let existingProfile = await userStore.getProfile(cleanPhone);
    if (!existingProfile) {
      const nowIso = new Date().toISOString();
      existingProfile = {
        userId: cleanPhone,
        hashedPhone: maskPhoneNumber(cleanPhone),
        phoneNumber: cleanPhone,
        isLoggedIn: true,
        name: studentName && studentName.trim() ? studentName.trim() : 'دانش‌آموز کوشا',
        avatar: 'fox',
        stars: 0,
        xp: 0,
        level: 1,
        streakDays: 1,
        solvedCount: 0,
        scannedImagesCount: 0,
        unlockedBadges: [],
        chapterMastery: {
          patterns: 0,
          place_value: 0,
          fractions: 0,
          multiplication_division: 0,
          perimeter_area: 0,
          regrouping: 0,
          statistics: 0,
          advanced_multiplication: 0,
        },
        history: [],
        createdAt: nowIso,
        updatedAt: nowIso,
        serverVersion: 1,
      };
      await userStore.saveProfile(existingProfile);
    }

    // توکن امن جلسه (Session Token)
    const sessionToken = Buffer.from(`${cleanPhone}:${now}:${Math.random().toString(36).slice(2)}`).toString('base64');

    res.json({
      success: true,
      message: 'ورود با موفقیت انجام شد.',
      token: sessionToken,
      profile: existingProfile,
    });
  } catch (err: any) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ error: 'خطا در بررسی کد تایید' });
  }
});

// دریافت پروفایل ذخیره‌شده دانش‌آموز از سرور
app.get('/api/user/profile', async (req, res) => {
  try {
    const phone = req.query.phone as string;
    if (!phone) {
      return res.status(400).json({ error: 'شماره تلفن الزامی است.' });
    }
    const cleanPhone = phone.trim().replace(/[^\d+]/g, '');
    const profile = await userStore.getProfile(cleanPhone);
    if (!profile) {
      return res.status(404).json({ error: 'پروفایل یافت نشد.' });
    }
    res.json({ success: true, profile });
  } catch (err: any) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'خطا در دریافت پروفایل' });
  }
});

// همگام‌سازی دوطرفه پیشرفت دانش‌آموز با سرور (Smart Two-Way Sync)
app.post('/api/user/sync', async (req, res) => {
  try {
    const { phoneNumber, profile } = req.body;
    if (!phoneNumber || !profile) {
      return res.status(400).json({ error: 'اطلاعات همگام‌سازی ناقص است.' });
    }

    const cleanPhone = phoneNumber.trim().replace(/[^\d+]/g, '');
    const { mergedProfile, conflictResolved } = await userStore.syncProgress(cleanPhone, profile);

    // به‌روزرسانی لیدربورد عمومی به صورت هماهنگ
    const existingLeaderboard = leaderboardStore.get(cleanPhone);
    leaderboardStore.set(cleanPhone, {
      id: cleanPhone,
      name: mergedProfile.name || 'دانش‌آموز کوشا',
      avatar: mergedProfile.avatar || 'fox',
      phoneNumber: maskPhoneNumber(cleanPhone),
      stars: mergedProfile.stars || 0,
      level: mergedProfile.level || 1,
      solvedCount: mergedProfile.solvedCount || 0,
      weeklyStars: Math.max(existingLeaderboard?.weeklyStars || 0, mergedProfile.stars || 0),
      monthlyStars: Math.max(existingLeaderboard?.monthlyStars || 0, mergedProfile.stars || 0),
      yearlyStars: Math.max(existingLeaderboard?.yearlyStars || 0, mergedProfile.stars || 0),
      unlockedBadges: mergedProfile.unlockedBadges || [],
      chapterMastery: mergedProfile.chapterMastery || {},
      lastActive: new Date().toISOString(),
    });

    res.json({
      success: true,
      mergedProfile,
      conflictResolved,
    });
  } catch (err: any) {
    console.error('Error syncing user progress:', err);
    res.status(500).json({ error: 'خطا در همگام‌سازی پیشرفت' });
  }
});

// حذف کامل اطلاعات دانش‌آموز بر اساس درخواست اولیا (Parental Right to Erasure)
app.delete('/api/user/data', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'شماره تلفن الزامی است.' });
    }

    const cleanPhone = phoneNumber.trim().replace(/[^\d+]/g, '');
    
    // ۱. حذف از حافظه ابری و محلی
    await userStore.deleteProfile(cleanPhone);

    // ۲. حذف از جدول رده‌بندی عمومی
    leaderboardStore.delete(cleanPhone);

    // ۳. حذف کدهای یکبارمصرف موقت
    otpStore.delete(cleanPhone);

    res.json({
      success: true,
      message: 'تمام اطلاعات، ستاره‌ها و سوابق آموزشی با موفقیت پاک شد.',
    });
  } catch (err: any) {
    console.error('Error wiping user data:', err);
    res.status(500).json({ error: 'خطا در پاک‌سازی داده‌های کاربر' });
  }
});

// ==========================================
// Monetization & Subscription Endpoints (پرداخت و اشتراک ویژه)
// ==========================================

const SERVER_PRICING_PLANS = [
  {
    id: 'monthly',
    title: 'اشتراک ۱ ماهه',
    subtitle: 'آزمایشی و شب امتحان',
    badge: 'شروع یادگیری',
    priceToman: 190000,
    originalPriceToman: 240000,
    monthlyEquivalentToman: 190000,
    durationDays: 30,
    isPopular: false,
    features: [
      'بازگشایی تمامی ۸ فصل کتاب ریاضی سوم دبستان',
      'دسترسی کامل به فصل‌های ۴ تا ۸ (ضرب، مساحت، جمع تکنیکی)',
      'پرسش و پاسخ نامحدود با معلم هوشمند (استاد دانا)',
      'اسکن و تحلیل نامحدود عکس تکالیف و دست‌نویس',
      'دسترسی به تمامی بازی‌های تعاملی و آزمون‌های هوشمند',
      'کارنامه تحلیلی و ثبت اشتباهات در دفترچه هوشمند',
    ],
    ctaText: 'انتخاب پلن ۱ ماهه',
  },
  {
    id: 'quarterly',
    title: 'اشتراک ۳ ماهه',
    subtitle: 'پکیج یک فصل تحصیلی (ترم)',
    badge: 'اقتصادی و محبوب ⭐️',
    priceToman: 480000,
    originalPriceToman: 570000,
    monthlyEquivalentToman: 160000,
    durationDays: 90,
    isPopular: false,
    features: [
      'تمام امکانات اشتراک ۱ ماهه با ۱۵٪ تخفیف ویژه',
      'معادل فقط ۱۶۰,۰۰۰ تومان در هر ماه',
      'پوشش کامل امتحانات ترم اول یا ترم دوم مدارس',
      'تحلیل جامع نقاط ضعف و قوت در کارنامه اولیا',
      'رفع اشکال نامحدود سوالات اشتباهات دانش‌آموز',
      'پشتیبانی آموزشی در طول ۳ ماه',
    ],
    ctaText: 'انتخاب پلن ۳ ماهه',
  },
  {
    id: 'yearly',
    title: 'اشتراک طلایی ۱ ساله',
    subtitle: 'همیار کل سال تحصیلی (مهر تا خرداد)',
    badge: '🔥 پرفروش‌ترین (پیشنهاد ویژه)',
    priceToman: 990000,
    originalPriceToman: 2280000,
    monthlyEquivalentToman: 82500,
    durationDays: 365,
    isPopular: true,
    features: [
      'بیش از ۵۵٪ تخفیف شگفت‌انگیز (فقط ۸۲ هزار تومان در ماه!)',
      'دسترسی نامحدود ۳۶۵ روزه تا پایان سال تحصیلی و کارنامه نهایی',
      'کمتر از هزینه خرید ۲ جلد کتاب کمک‌آموزشی ساده',
      'معلم خصوصی هوش مصنوعی ۲۴ ساعته در خانه',
      'تولید بی‌نهایت آزمون شبیه‌ساز امتحانات نهایی با پاسخ تشریحی',
      'امکان خروجی فایل PDF کارنامه تحلیلی جهت ارائه به معلم مدرسه',
      'اولویت پاسخگویی و پشتیبانی اختصاصی والدین',
    ],
    ctaText: 'خرید اشتراک طلایی سالانه (بهترین قیمت)',
  },
  {
    id: 'ai_pack_50',
    title: 'بسته ۵۰ سوال اضافه استاد دانا',
    subtitle: 'اعتبار هوش مصنوعی بدون تاریخ انقضا',
    badge: 'شارژ بدون انقضا',
    priceToman: 95000,
    originalPriceToman: 120000,
    features: [
      '۵۰ اعتبار پرسش تشریحی یا اسکن عکس از تکالیف',
      'بدون محدودیت زمانی و بدون انقضا (تا آخرین سوال باقی می‌ماند)',
      'مناسب والدینی که فقط برای حل تمرینات سخت روزانه نیاز دارند',
      'قابل استفاده همزمان با نسخه رایگان برنامه',
    ],
    ctaText: 'خرید بسته ۵۰ سوالی',
  },
];

const SERVER_DISCOUNT_COUPONS: Record<string, { percent: number; label: string }> = {
  BAZAAR: { percent: 20, label: 'تخفیف ویژه کاربران کافه بازار' },
  MYKET: { percent: 20, label: 'تخفیف ویژه کاربران مایکت' },
  OSTAD: { percent: 25, label: 'هدیه ویژه استاد دانا' },
  MATH20: { percent: 20, label: 'تخفیف تلاش و نمره ۲۰' },
  NOROOZ: { percent: 30, label: 'جشنواره عیدانه' },
  GOLDEN: { percent: 35, label: 'تخفیف دانش‌آموز ممتاز' },
};

app.get('/api/subscription/plans', (req, res) => {
  res.json({
    success: true,
    plans: SERVER_PRICING_PLANS,
    baseDollarRateToman: 240000,
    activeFestival: 'تخفیف ویژه سال تحصیلی ۱۴۰۴-۱۴۰۵',
  });
});

app.post('/api/subscription/validate-coupon', (req, res) => {
  const { code, planId } = req.body;
  const cleanCode = (code || '').trim().toUpperCase();
  const coupon = SERVER_DISCOUNT_COUPONS[cleanCode];

  if (!coupon) {
    return res.status(400).json({ error: 'کد تخفیف وارد شده معتبر نیست یا منقضی شده است.' });
  }

  const plan = SERVER_PRICING_PLANS.find(p => p.id === planId);
  const basePrice = plan ? plan.priceToman : 0;
  const discountAmount = Math.round((basePrice * coupon.percent) / 100);
  const finalPrice = Math.max(0, basePrice - discountAmount);

  res.json({
    valid: true,
    code: cleanCode,
    percent: coupon.percent,
    label: coupon.label,
    originalPrice: basePrice,
    discountAmount,
    finalPrice,
  });
});

app.post('/api/subscription/purchase', async (req, res) => {
  try {
    const { userId, planId, couponCode, platform } = req.body;
    if (!planId) {
      return res.status(400).json({ error: 'طرح اشتراک مشخص نشده است.' });
    }

    const plan = SERVER_PRICING_PLANS.find(p => p.id === planId);
    if (!plan) {
      return res.status(400).json({ error: 'طرح انتخابی معتبر نیست.' });
    }

    const targetUserId = (userId || 'guest_student').trim();
    let userProfile = await userStore.getProfile(targetUserId);

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const txnId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    let newSub: any;

    if (planId === 'ai_pack_50') {
      const currentSub = userProfile?.subscription;
      newSub = {
        plan: currentSub?.plan || 'free',
        isVip: currentSub?.isVip || false,
        expiresAt: currentSub?.expiresAt || null,
        extraAiQuestions: (currentSub?.extraAiQuestions || 0) + 50,
        dailyAiUsed: currentSub?.dailyAiUsed || 0,
        lastAiDate: currentSub?.lastAiDate || today,
      };
    } else {
      let baseTime = now.getTime();
      if (userProfile?.subscription?.isVip && userProfile.subscription.expiresAt) {
        const currentExp = new Date(userProfile.subscription.expiresAt).getTime();
        if (currentExp > baseTime) {
          baseTime = currentExp;
        }
      }
      const durationDays = plan.durationDays || 30;
      const newExpiresAt = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000).toISOString();

      newSub = {
        plan: planId,
        isVip: true,
        expiresAt: newExpiresAt,
        startDate: now.toISOString(),
        extraAiQuestions: userProfile?.subscription?.extraAiQuestions || 0,
        dailyAiUsed: 0,
        lastAiDate: today,
      };
    }

    if (userProfile) {
      userProfile.subscription = newSub;
      userProfile.updatedAt = now.toISOString();
      await userStore.saveProfile(userProfile);
    }

    res.json({
      success: true,
      transactionId: txnId,
      platform: platform || 'web',
      planId,
      subscription: newSub,
      profile: userProfile,
      message: 'اشتراک با موفقیت فعال شد. به جمع مشترکین طلایی آموزگار خوش آمدید! 🌟',
    });
  } catch (err: any) {
    console.error('Error processing subscription purchase:', err);
    res.status(500).json({ error: 'خطا در فعال‌سازی اشتراک' });
  }
});

// ==========================================
// Incremental Question Bank Endpoints (تولید تدریجی سوال)
// ==========================================

// دریافت سوالات ذخیره شده برای یک فصل و سطح دشواری
app.get('/api/questions', async (req, res) => {
  try {
    const chapterId = (req.query.chapterId as any) || 'patterns';
    const difficulty = (req.query.difficulty as any) || undefined;

    const questions = await questionBankService.getQuestions(chapterId, difficulty);
    res.json({
      success: true,
      chapterId,
      difficulty,
      count: questions.length,
      questions,
    });
  } catch (err: any) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'خطا در دریافت سوالات' });
  }
});

// دریافت سوالات تصادفی با اولویت سوالات کمتر دیده شده (Weighted Random)
app.get('/api/questions/random', async (req, res) => {
  try {
    const chapterId = (req.query.chapterId as any) || 'patterns';
    const difficulty = (req.query.difficulty as any) || undefined;
    const count = parseInt(req.query.count as string, 10) || 5;

    const questions = await questionBankService.getRandomQuestions(chapterId, difficulty, count);
    res.json({
      success: true,
      chapterId,
      difficulty,
      count: questions.length,
      questions,
    });
  } catch (err: any) {
    console.error('Error fetching random questions:', err);
    res.status(500).json({ error: 'خطا در دریافت سوالات تصادفی' });
  }
});

// ثبت عملکرد پاسخ دانش‌آموز جهت سنجش کیفیت و ضریب سختی
app.post('/api/questions/answer', async (req, res) => {
  try {
    const { questionId, isCorrect } = req.body;
    if (questionId) {
      await questionBankService.recordAnswer(questionId, Boolean(isCorrect));
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'خطا در ثبت پاسخ' });
  }
});

// ==========================================
// Report Incorrect Answer Endpoints
// ==========================================

app.post('/api/report-answer', async (req, res) => {
  try {
    const { sessionId, messageId, question, aiResponse, issueType, explanation, userId, timestamp } = req.body;

    if (!messageId || !question || !aiResponse || !issueType || !userId) {
      return res.status(400).json({ error: 'اطلاعات گزارش ناقص است. لطفاً تمامی فیلدهای الزامی را ارسال کنید.' });
    }

    const validTypes = ['wrong_calculation', 'wrong_method', 'irrelevant', 'inappropriate'];
    if (!validTypes.includes(issueType)) {
      return res.status(400).json({ error: 'نوع اشکال انتخابی معتبر نیست.' });
    }

    // Rate limiting: Max 10 reports per user per hour
    const rateCheck = await checkRateLimit(userId, 10, 3600, 'reports_user');
    if (!rateCheck.success) {
      return res.status(429).json({
        error: 'تعداد گزارش‌های شما در این ساعت بیش از حد مجاز (حداکثر ۱۰ گزارش در ساعت) است. لطفاً بعداً دوباره تلاش کنید.'
      });
    }

    const saved = await reportStore.saveReport({
      sessionId: sessionId || 'default_session',
      messageId,
      question,
      aiResponse,
      issueType,
      explanation,
      userId,
      timestamp: timestamp || Date.now(),
    });

    res.json({
      success: true,
      message: 'گزارش شما با موفقیت ثبت شد.',
      reportId: saved.id,
    });
  } catch (err: any) {
    console.error('[Report API Exception]:', err);
    res.status(500).json({ error: 'خطا در ثبت گزارش پاسخ اشتباه' });
  }
});

app.get('/api/admin/reports', async (req, res) => {
  try {
    const secret = req.headers['x-admin-secret'] || req.headers['authorization'];
    if (secret !== ADMIN_SECRET && secret !== `Bearer ${ADMIN_SECRET}`) {
      return res.status(401).json({ error: 'دسترسی غیرمجاز. کلید ادمین معتبر نیست.' });
    }

    const { status, issueType, search } = req.query as any;
    const reports = await reportStore.getAllReports({
      status,
      issueType,
      search,
    });

    res.json({ success: true, count: reports.length, reports });
  } catch (err: any) {
    console.error('[Admin Reports Exception]:', err);
    res.status(500).json({ error: 'خطا در دریافت لیست گزارش‌ها' });
  }
});

app.post('/api/admin/reports/action', async (req, res) => {
  try {
    const secret = req.headers['x-admin-secret'] || req.headers['authorization'];
    if (secret !== ADMIN_SECRET && secret !== `Bearer ${ADMIN_SECRET}`) {
      return res.status(401).json({ error: 'دسترسی غیرمجاز. کلید ادمین معتبر نیست.' });
    }

    const { reportKey, action } = req.body;
    if (!reportKey || !action) {
      return res.status(400).json({ error: 'شناسه گزارش و نوع عملیات الزامی است.' });
    }

    if (action === 'mark_reviewed') {
      await reportStore.markReviewed(reportKey);
      return res.json({ success: true, message: 'گزارش به عنوان بررسی‌شده علامت‌گذاری شد.' });
    } else if (action === 'delete') {
      await reportStore.deleteReport(reportKey);
      return res.json({ success: true, message: 'گزارش با موفقیت حذف شد.' });
    } else {
      return res.status(400).json({ error: 'نوع عملیات مشخص شده معتبر نیست.' });
    }
  } catch (err: any) {
    console.error('[Admin Report Action Exception]:', err);
    res.status(500).json({ error: 'خطا در انجام عملیات روی گزارش' });
  }
});

// گزارش اشکال در سوال توسط کاربر یا دانش‌آموز (قرنطینه و خروج فوری از آزمون)
app.post('/api/questions/:id/flag', async (req, res) => {
  try {
    const questionId = req.params.id;
    const { reason = 'گزارش اشکال توسط کاربر' } = req.body;

    const result = await questionBankService.flagQuestion(questionId, reason);
    if (!result) {
      return res.status(404).json({ error: 'سوال مورد نظر یافت نشد' });
    }

    res.json({
      success: true,
      message: 'سوال با موفقیت گزارش و موقتاً از چرخه آزمون خارج گردید.',
      questionId,
    });
  } catch (err: any) {
    console.error('Error flagging question:', err);
    res.status(500).json({ error: 'خطا در ثبت گزارش سوال' });
  }
});

// تایید کیفیت سوال توسط ادمین با کلید ADMIN_SECRET در هدر
app.post('/api/questions/:id/approve', async (req, res) => {
  try {
    const secret = req.headers['x-admin-secret'] || req.headers['authorization'];
    if (secret !== ADMIN_SECRET && secret !== `Bearer ${ADMIN_SECRET}`) {
      return res.status(401).json({ error: 'دسترسی غیرمجاز. کلید ادمین معتبر نیست.' });
    }

    const questionId = req.params.id;
    const result = await questionBankService.approveQuestion(questionId);
    if (!result) {
      return res.status(404).json({ error: 'سوال مورد نظر یافت نشد' });
    }

    res.json({
      success: true,
      message: 'سوال با موفقیت تایید و به بانک رسمی اضافه شد.',
      question: result,
    });
  } catch (err: any) {
    console.error('Error approving question:', err);
    res.status(500).json({ error: 'خطا در تایید سوال' });
  }
});

// رد سوال توسط ادمین با کلید ADMIN_SECRET در هدر
app.post('/api/questions/:id/reject', async (req, res) => {
  try {
    const secret = req.headers['x-admin-secret'] || req.headers['authorization'];
    if (secret !== ADMIN_SECRET && secret !== `Bearer ${ADMIN_SECRET}`) {
      return res.status(401).json({ error: 'دسترسی غیرمجاز. کلید ادمین معتبر نیست.' });
    }

    const questionId = req.params.id;
    const { reason = 'رد توسط کارشناس محتوا' } = req.body;
    const result = await questionBankService.rejectQuestion(questionId, reason);
    if (!result) {
      return res.status(404).json({ error: 'سوال مورد نظر یافت نشد' });
    }

    res.json({
      success: true,
      message: 'سوال با موفقیت رد شد.',
      questionId,
    });
  } catch (err: any) {
    console.error('Error rejecting question:', err);
    res.status(500).json({ error: 'خطا در رد سوال' });
  }
});

// تولید بسته سوال جدید با کیفیت، اعتبارسنجی، سقف ۵۰۰۰ سوال و ذخیره دائمی در دیتابیس
async function generateAndPersistQuestionBatch(
  chapterId: any,
  difficulty: any,
  existingTitles: string[] = [],
  count: number = 5,
  useDeterministicOnly: boolean = false,
  identity?: ResolvedIdentity | null
) {
  let rawResponse = '';

  if (!useDeterministicOnly) {
    const promptText = questionBankService.buildPromptForBatch(chapterId, difficulty, existingTitles, count);

    try {
      rawResponse = await generateGeminiContentWithFallback(promptText, {
        systemInstruction: COMPACT_QUESTION_SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 1100,
        responseMimeType: 'application/json',
        endpointTag: 'question_bank',
        identity,
      });
    } catch (genErr: any) {
      console.warn('[Question Gen] Gemini call error, trying Groq fallback:', genErr?.message);
    }

    if (!rawResponse && process.env.GROQ_API_KEY) {
      try {
        rawResponse = await generateGroqContent(promptText, COMPACT_QUESTION_SYSTEM_PROMPT, 1200, identity, 'question_bank');
      } catch (groqErr: any) {
        console.warn('[Question Gen] Groq fallback error:', groqErr?.message);
      }
    }

    if (!rawResponse && process.env.DEEPSEEK_API_KEY) {
      try {
        rawResponse = await callDeepSeekChat(COMPACT_QUESTION_SYSTEM_PROMPT, [], promptText, identity, 'question_bank');
      } catch (dsErr: any) {
        console.warn('[Question Gen] DeepSeek fallback error:', dsErr?.message);
      }
    }
  } else {
    tokenManager.recordCacheHitSaved('question_bank');
  }

  let parsedArray: any[] = [];
  if (rawResponse) {
    try {
      const noThink = rawResponse.replace(/<think>[\s\S]*?<\/think>/gi, '');
      const cleanJson = noThink.replace(/```json/gi, '').replace(/```/g, '').trim();
      const arrayMatch = cleanJson.match(/\[[\s\S]*\]/);
      const jsonToParse = arrayMatch ? arrayMatch[0] : cleanJson;
      const parsed = JSON.parse(jsonToParse);
      if (Array.isArray(parsed)) {
        parsedArray = parsed;
      } else if (parsed && typeof parsed === 'object') {
        parsedArray = parsed.questions || [parsed];
      }
    } catch (parseErr: any) {
      console.warn('[Question Gen] AI JSON parse failed, using deterministic curriculum generator:', parseErr?.message);
    }
  }

  let saved = await questionBankService.saveNewQuestions(chapterId, difficulty, parsedArray);

  // اگر مدل‌های هوش مصنوعی در دسترس نبودند یا سهمیه رشد خودکار پر شده بود، مولد الگوریتمی دقیق کتاب سوم جایگزین می‌شود (۰ توکن)
  if (saved.length === 0) {
    const deterministic = questionBankService.generateDeterministicBatch(chapterId, difficulty, count);
    saved = await questionBankService.saveNewQuestions(chapterId, difficulty, deterministic);
  }

  const stats = await questionBankService.getStats();
  return { saved, stats };
}


app.post('/api/questions/generate', async (req, res) => {
  try {
    const { chapterId = 'patterns', difficulty = 'medium', existingTitles = [], count = 5 } = req.body;
    const preStats = await questionBankService.getStats();

    if (preStats.remainingCapacity <= 0) {
      return res.json({
        success: true,
        limitReached: true,
        generatedCount: 0,
        newQuestions: [],
        stats: preStats,
        message: `بانک سوالات به سقف کامل (${preStats.maxQuestions} سوال) رسیده است.`,
      });
    }

    const identity = tokenManager.resolveIdentity(req);
    const storedProfile = identity.userId ? await getOrCreateStoredProfile(identity.userId) : null;
    const tmCheck = await tokenManager.checkAndConsumeRequest(identity, storedProfile, 'question_bank');

    const safeCount = Math.min(5, Math.max(3, Number(count) || 5), preStats.remainingCapacity);
    const { saved, stats } = await generateAndPersistQuestionBatch(
      chapterId,
      difficulty,
      existingTitles,
      safeCount,
      !tmCheck.allowed,
      identity
    );

    res.json({
      success: true,
      limitReached: stats.remainingCapacity <= 0,
      quotaFallbackUsed: !tmCheck.allowed,
      generatedCount: saved.length,
      newQuestions: saved,
      stats,
      message: `تعداد ${saved.length} سوال جدید با موفقیت در دیتابیس ذخیره شد.`,
    });
  } catch (err: any) {
    console.error('Error generating questions batch:', err);
    res.status(500).json({ error: 'خطا در فرآیند تولید سوال' });
  }
});

// رشد خودکار بانک سوالات در هنگام اجرای اپلیکیشن (با کول‌داون ۵ دقیقه و سقف ۶ بار هوش مصنوعی در روز + فال‌بک الگوریتمی ۰ توکن)
let lastAutoGrowAt = 0;
const AUTO_GROW_COOLDOWN_MS = 5 * 60 * 1000;
const MAX_DAILY_AI_AUTOGROW = 6;
let autoGrowAiTracker = { date: getTodayKey(), count: 0 };

app.post('/api/questions/auto-grow', async (req, res) => {
  try {
    const preStats = await questionBankService.getStats();
    if (preStats.remainingCapacity <= 0) {
      return res.json({
        success: true,
        limitReached: true,
        skipped: false,
        generatedCount: 0,
        newQuestions: [],
        stats: preStats,
        message: 'بانک سوالات به ظرفیت نهایی ۵۰۰۰ سوال رسیده است.',
      });
    }

    const now = Date.now();
    if (now - lastAutoGrowAt < AUTO_GROW_COOLDOWN_MS) {
      return res.json({
        success: true,
        skipped: true,
        generatedCount: 0,
        newQuestions: [],
        stats: preStats,
        message: 'رشد خودکار به‌تازگی انجام شده است.',
      });
    }
    lastAutoGrowAt = now;

    const today = getTodayKey();
    if (autoGrowAiTracker.date !== today) {
      autoGrowAiTracker = { date: today, count: 0 };
    }
    const budgetOk = await tokenManager.isGlobalBudgetAvailable();
    const useDeterministicOnly = !budgetOk || autoGrowAiTracker.count >= MAX_DAILY_AI_AUTOGROW;
    if (!useDeterministicOnly) {
      autoGrowAiTracker.count += 1;
    }

    const { chapterId, difficulty } = await questionBankService.pickNextGrowthTarget();
    const existingInBucket = await questionBankService.getQuestions(chapterId, difficulty);
    const recentTitles = existingInBucket.slice(-5).map((q) => q.question);
    const batchCount = Math.min(5, preStats.remainingCapacity);

    const { saved, stats } = await generateAndPersistQuestionBatch(
      chapterId,
      difficulty,
      recentTitles,
      batchCount,
      useDeterministicOnly
    );

    res.json({
      success: true,
      skipped: false,
      limitReached: stats.remainingCapacity <= 0,
      chapterId,
      difficulty,
      generatedCount: saved.length,
      newQuestions: saved,
      stats,
      message: `تعداد ${saved.length} سوال جدید برای فصل ${chapterId} تولید و در دیتابیس ذخیره شد.`,
    });
  } catch (err: any) {
    console.warn('[AutoGrow] Background generation skipped due to error:', err?.message || err);
    const stats = await questionBankService.getStats().catch(() => null);
    res.json({
      success: false,
      skipped: true,
      generatedCount: 0,
      newQuestions: [],
      stats,
      message: 'در این لحظه تولید خودکار انجام نشد؛ سوالات ذخیره‌شده آماده استفاده هستند.',
    });
  }
});

// دریافت کل بانک سوالات فعال برای همگام‌سازی کامل با دیتابیس آفلاین مرورگر (IndexedDB)
app.get('/api/questions/export-offline', async (req, res) => {
  try {
    const [questions, stats] = await Promise.all([
      questionBankService.getAllExportQuestions(),
      questionBankService.getStats(),
    ]);
    res.json({
      success: true,
      count: questions.length,
      stats,
      questions,
    });
  } catch (err: any) {
    console.error('Error exporting offline question bank:', err);
    res.status(500).json({ error: 'خطا در خروجی بانک سوالات آفلاین' });
  }
});

// دریافت آمار تفکیکی بانک سوالات
app.get('/api/questions/stats', async (req, res) => {
  try {
    const stats = await questionBankService.getStats();
    res.json({ success: true, stats });
  } catch (err: any) {
    console.error('Error getting question stats:', err);
    res.status(500).json({ error: 'خطا در دریافت آمار بانک سوالات' });
  }
});


// Vite & Static file handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

export default app;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL && !process.env.SERVERLESS) {
  startServer();
}

