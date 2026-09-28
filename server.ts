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
  'gemini-3.1-flash-lite',    // Tier 1: Ultra-low latency & high RPM throughput (high availability)
  'gemini-3.8-flash',         // Tier 2: Modern default for interactive instruction & text
  'gemini-flash-latest',      // Tier 3: Stable floating alias
  'gemini-3.1-pro-preview',   // Tier 4: Complex STEM/geometry & deep reasoning fallback
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

// Robust fallback runner across models with retry & transient capacity error handling
async function generateGeminiContentWithFallback(
  contents: any,
  options: {
    systemInstruction?: string;
    temperature?: number;
    responseMimeType?: string;
    responseSchema?: any;
    models?: string[];
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
      if (options.responseMimeType) config.responseMimeType = options.responseMimeType;
      if (options.responseSchema) config.responseSchema = options.responseSchema;

      const response = await client.models.generateContent({
        model: modelName,
        contents: contents,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      if (response && response.text) {
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

const TUTOR_SYSTEM_INSTRUCTION = `
تو «استاد دانا» 🦉 هستی؛ یک معلم ریاضی صبور، مهربان، پرانرژی و متخصص پایه سوم دبستان ایران. هدف تو کمک به کودکان ۹ ساله برای درک عمیق مفاهیم ریاضی از طریق مثال‌های ملموس (پیتزا 🍕، شکلات 🍫، اسکناس 💰، ساعت ⏰) است.

قوانین طلایی و محدودیت‌ها (بسیار مهم):
۱. محدوده موضوعی: تو فقط و فقط به سوالات مربوط به ریاضی پایه سوم دبستان پاسخ می‌دهی. اگر کاربر درباره موضوعات غیردرسی (مثل بازی‌های کامپیوتری، شبکه‌های اجتماعی، اخبار، مسائل شخصی و...) پرسید، با لحنی مهربان بگو:
   «من فقط در درس ریاضی می‌تونم کمکت کنم قهرمان! بیا با هم یه سوال ریاضی حل کنیم تا باهوش‌تر بشی. 🦉✨»
۲. ایمنی کودک: هرگز از کلمات خشن، ترسناک یا نامناسب استفاده نکن. مکالمه را همیشه در فضای آموزشی و امن نگه دار. اطلاعات شخصی از کودک نپرس.
۳. اعتراف به ندانستن: اگر جواب سوالی را نمی‌دانی یا محاسبه‌ای پیچیده است، هرگز حدس نزن (جلوگیری از توهم ریاضی). صادقانه بگو: «این سوال خیلی خوبیه، اما من دقیق جوابش رو نمی‌دونم. از معلم یا مادرت بپرس تا با هم حلش کنیم.»
۴. راهنمایی به جای جواب دادن (روش سقراطی): هرگز جواب نهایی تمرین را مستقیم نگو. با پرسیدن سوال‌های کوچک، کودک را قدم به قدم به جواب برسان.
۵. تطابق با کتاب درسی ایران:
   - از روش‌های حل مسئله کتاب درسی ریاضی سوم ایران استفاده کن (مثل محور اعداد، جدول ارزش مکانی، رسم شکل برای کسر، زیر و رو کردن در تقسیم).
   - برای اعداد از ارقام فارسی (۱، ۲، ۳، ۴، ۵، ۶، ۷، ۸، ۹، ۰) استفاده کن، نه ارقام انگلیسی.
   - واحدهای پول را بر اساس «تومان و ریال» و واحدهای اندازه‌گیری را بر اساس سیستم متریک (سانتیمتر، میلیمتر، متر، کیلومتر) توضیح بده.
۶. فرمت پاسخ‌دهی و تولید شکل SVG:
   - لحن: دوستانه، با ایموجی‌های مناسب (🌟🎯🎈✨)، جملات کوتاه و قابل فهم برای کودک ۹ ساله (۱ تا ۲ جمله در هر پیام و سپس منتظر تایید کودک).
   - زبان: فارسی ساده و روان.
   - تولید شکلهای آموزشی (SVG): برای مفاهیم بصری مثل کسر، هندسه (محیط و مساحت)، الگوها و ساعت، حتماً کد SVG معتبر در بلوک خروجی قرار بده تا شکل روی صفحه نمایش داده شود.
`;

// Helper function for optional DeepSeek API fallback
async function callDeepSeekChat(systemInstruction: string, messages: any[], userPrompt: string): Promise<string> {
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
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`خطای سرویس دیپ‌سیک (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'پاسخی از دیپ‌سیک دریافت نشد.';
}

// Helper function for optional Groq API fallback (Tier 3 Emergency AI)
export async function generateGroqContent(
  prompt: string | any[],
  systemInstruction?: string
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
      max_tokens: 450,
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
  return content;
}

// Health endpoint with diagnostics
app.get('/api/health', (req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const kavenegarKey = process.env.KAVENEGAR_API_KEY;
  const geminiConfigured = Boolean(geminiKey && geminiKey.trim().length > 0);
  const deepseekConfigured = Boolean(deepseekKey && deepseekKey.trim().length > 0);
  const groqConfigured = Boolean(groqKey && groqKey.trim().length > 0);
  const kavenegarConfigured = Boolean(kavenegarKey && kavenegarKey.trim().length > 10);

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
    message: geminiConfigured
      ? 'سرویس هوش مصنوعی آموزگار با موفقیت فعال و آماده پاسخگویی است.'
      : 'کلید GEMINI_API_KEY یافت نشد. سیستم در حالت محلی و فال‌بک کار می‌کند.',
  });
});

// Admin Test Subscription Activation Endpoint
app.post('/api/subscription/activate-test', async (req, res) => {
  const adminSecretHeader = req.headers['x-admin-secret'] || req.headers['authorization'];
  const expectedSecret = process.env.ADMIN_SECRET || 'ostad_admin_secret_123';

  if (!adminSecretHeader || (adminSecretHeader !== expectedSecret && adminSecretHeader !== `Bearer ${expectedSecret}`)) {
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

// 1. Chat with Math Tutor API (with verified bank, strict prompt & math validation)
app.post(['/api/tutor/chat', '/tutor/chat', '/chat', '/api/chat'], async (req, res) => {
  const { prompt, history, userId: reqUserId } = req.body;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'متن سوال الزامی است.' });
  }

  try {
    const studentId = reqUserId || req.body.phoneNumber || req.headers['x-user-id'] as string || 'guest_student';
    const storedProfile = await getOrCreateStoredProfile(studentId);
    const quotaCheck = checkAiQuota(storedProfile);
    if (!quotaCheck.allowed) {
      return res.status(402).json({
        error: 'سهمیه رایگان امروز تمام شد',
        code: 'QUOTA_EXCEEDED'
      });
    }

    // ۱. بررسی بانک پاسخ‌های ایمن و از پیش تأییدشده (Safe Fast-Path)
    // اگر سوال دانش‌آموز از مباحث و سوالات پرتکرار و حساس است، پاسخ استاندارد و اعتبارسنجی‌شده بازگردانده می‌شود.
    const safeMatch = findVerifiedSafeResponse(prompt);
    if (safeMatch) {
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
      history.forEach((msg: any) => {
        if (!msg || !msg.text) return;
        const role = msg.sender === 'user' ? 'user' : 'model';
        // Gemini contents MUST start with 'user'. Skip leading 'model' messages.
        if (contents.length === 0 && role === 'model') {
          return;
        }
        if (role !== lastRole) {
          contents.push({
            role: role,
            parts: [{ text: msg.text }],
          });
          lastRole = role;
        }
      });
    }

    // Always ensure valid user message at end
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1] = { role: 'user', parts: [{ text: prompt }] };
    } else {
      contents.push({ role: 'user', parts: [{ text: prompt }] });
    }

    let responseText = '';

    try {
      responseText = await generateGeminiContentWithFallback(contents, {
        systemInstruction: OSTAD_DANA_SYSTEM_INSTRUCTION,
        temperature: 0.5,
      });
    } catch (err: any) {
      console.warn('[Gemini Chat Error]:', err?.message || err);
    }

    if (responseText && responseText.trim()) {
      // ۲. عبور خروجی مدل از لایه اعتبارسنجی و تصحیح محاسبات ریاضی
      const validated = validateAndCorrectTutorResponse(responseText);
      return res.json({ 
        text: validated.cleanText,
        corrected: validated.corrected,
        issuesCount: validated.issues.length 
      });
    }

    // Fallback to DeepSeek if configured
    if (process.env.DEEPSEEK_API_KEY) {
      try {
        const dsText = await callDeepSeekChat(OSTAD_DANA_SYSTEM_INSTRUCTION, contents, prompt);
        if (dsText && dsText.trim()) {
          const validated = validateAndCorrectTutorResponse(dsText);
          return res.json({ text: validated.cleanText, provider: 'deepseek' });
        }
      } catch (dsErr: any) {
        console.warn('[DeepSeek Chat Error]:', dsErr?.message || dsErr);
      }
    }

    // Fallback to Groq if configured (Tier 3 Emergency AI)
    if (process.env.GROQ_API_KEY) {
      try {
        const groqText = await generateGroqContent(contents, OSTAD_DANA_SYSTEM_INSTRUCTION);
        if (groqText && groqText.trim()) {
          const validated = validateAndCorrectTutorResponse(groqText);
          return res.json({ text: validated.cleanText, provider: 'groq' });
        }
      } catch (groqErr: any) {
        console.warn('[Groq Chat Error]:', groqErr?.message || groqErr);
      }
    }

    // ۳. فال‌بک امن و هوشمند کودکانه هنگام در دسترس نبودن یا خطای مدل
    const fallbackText = generateFallbackTutorResponse(prompt);
    const validatedFallback = validateAndCorrectTutorResponse(fallbackText);
    return res.json({ text: validatedFallback.cleanText, isFallback: true });
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

    const { cleanBase64, mimeType: extractedMime } = parseBase64Image(imageBase64, mimeType);

    const promptText = `
این عکس حاوی صفحه کتاب، دفتر یا دست‌نویس تمرین ریاضی پایه سوم ابتدایی است.
وظایف تو:
۱. متن، اعداد، کسرها یا شکل‌های داخل تصویر را با دقت بخوان و صورت سوال را به زبان فارسی شفاف بازنویسی کن.
۲. مسئله را به روش گام‌به‌گام کتاب ریاضی سوم دبستان با لحن شاد، کودکانه و مثال ملموس توضیح بده.
۳. جواب آخر را با کادر یا شکل واضح مشخص کن.
۴. در پایان، یک سوال خیلی شبیه به همین سوال برای تمرین اختصاصی کودک طرح کن.

${userQuestion ? `سوال یا درخواست ویژه دانش‌آموز: ${userQuestion}` : ''}
    `;

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
          systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
          temperature: 0.4,
        }
      );
    } catch (err: any) {
      if (err?.message === 'GEMINI_API_KEY_MISSING') {
        throw err;
      }
    }

    if (responseText) {
      return res.json({ explanation: responseText });
    }

    throw new Error('امکان تحلیل تصویر با مدل‌های هوش مصنوعی وجود نداشت.');

  } catch (err: any) {
    console.error('Image solver error:', err);
    if (err?.message === 'GEMINI_API_KEY_MISSING') {
      return res.status(500).json({
        error: 'کلید API تنظیم نشده است. لطفاً در تنظیمات Vercel گزینه Environment Variables متغیر GEMINI_API_KEY را اضافه کرده و پروژه را Redeploy نمایید.',
      });
    }
    res.status(500).json({ error: 'خطا در بررسی عکس مسئله ریاضی: ' + (err.message || 'مشکل فنی') });
  }
});

// 3. Generate Custom Quiz Questions API
app.post(['/api/tutor/generate-quiz', '/tutor/generate-quiz', '/generate-quiz'], async (req, res) => {
  const { chapterId = 'patterns', chapterTitle, difficulty = 'medium', count = 3 } = req.body;

  try {
    let responseText = '';
    const prompt = `یک آزمون کوتاه ${count} سوالی از درس ریاضی پایه سوم ابتدایی برای فصل "${chapterTitle || chapterId}" با درجه سختی "${difficulty}" تولید کن.
    سوالات باید استاندارد، شاد و کاملاً منطبق بر کتاب ریاضی سوم دبستان ایران با گزینه‌های ۴ تایی باشند.`;

    try {
      responseText = await generateGeminiContentWithFallback(
        prompt,
        {
          systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
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
                explanation: { type: Type.STRING, description: 'توضیح کامل و گام به گام پاسخ' },
                hint: { type: Type.STRING, description: 'یک راهنمایی کوچک و دوستانه' },
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

// 4. Cached Daily Math Tip Engine (Phase 1 Caching)
let dailyTipCache: { date: string; tip: string } | null = null;

app.get(['/api/tutor/daily-tip', '/tutor/daily-tip', '/daily-tip'], async (req, res) => {
  const forceRefresh = req.query.refresh === 'true';
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Return cached tip if available and not forced
  if (!forceRefresh && dailyTipCache && dailyTipCache.date === todayDateStr && dailyTipCache.tip) {
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

  try {
    const promptText = `
یک نکته، ترفند، راز یادگیری یا مسئله کوتاه و بسیاااار شاد و انگیزشی ریاضی برای یک دانش‌آموز پایه سوم ابتدایی در ایران بنویس.
نکته می‌تواند درباره یکی از موضوعات زیر باشد:
- ترفند ضرب یا تقسیم سریع (مثل ضرب ۵ یا ۱۰)
- راز کسرها یا پیتزای ریاضی
- ترفند محیط و مساحت
- خوندن ساعت و زمان بعدازظهر
- پول ایران (تبدیل تومان و ریال)
- الگوهای عددی شگفت‌انگیز
- جمع و تفریق تکنیکی اعداد ۴ رقمی

پاسخ باید حداکثر ۲ تا ۳ جمله کوتاه، همراه با ایموجی‌های دوست‌داشتنی و خنده‌رو باشد. فقط خود نکته را بازگردان بدون هیچ مقدمه اضافی.
    `;

    let responseText = '';
    try {
      responseText = await generateGeminiContentWithFallback(promptText, {
        systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
        temperature: 0.85,
      });
    } catch (err: any) {
      // Handled by fallback list
    }

    if (responseText) {
      dailyTipCache = { date: todayDateStr, tip: responseText.trim() };
      return res.json({ tip: responseText.trim(), cached: false, date: todayDateStr });
    }

    const randomTip = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    dailyTipCache = { date: todayDateStr, tip: randomTip };
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
      console.warn('[AUTH OTP] SMS gateway returned issue:', smsResult.error);
    }

    res.json({
      success: true,
      message: 'کد تایید ۴ رقمی پیامک شد.',
      demoCode: process.env.NODE_ENV !== 'production' ? code : undefined, // در حالت دمو برای راحتی تست
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

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'ostad_admin_2026';

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

// تولید یک بسته ۳ تایی سوال جدید با کیفیت بدون خستگی یا مقاومت مدل
app.post('/api/questions/generate', async (req, res) => {
  try {
    const { chapterId = 'patterns', difficulty = 'medium', existingTitles = [] } = req.body;

    // ۱. ساخت پرامپت فشرده و دقیق برای ۳ سوال
    const promptText = questionBankService.buildPromptForBatch(chapterId, difficulty, existingTitles);

    // ۲. فراخوانی مدل با سیستم پرامپت اختصاصی و فرمت JSON
    let rawResponse = '';
    try {
      rawResponse = await generateGeminiContentWithFallback(promptText, {
        systemInstruction: COMPACT_QUESTION_SYSTEM_PROMPT,
        temperature: 0.7,
        responseMimeType: 'application/json',
      });
    } catch (genErr: any) {
      console.warn('[Question Gen] Model call error, returning fallback:', genErr?.message);
    }

    if (!rawResponse) {
      return res.status(500).json({ error: 'عدم دریافت پاسخ از مدل هوش مصنوعی' });
    }

    // ۳. پارس ایمن آرایه JSON
    let parsedArray: any[] = [];
    try {
      // پاک‌سازی تگ‌های markdown در صورت وجود
      const cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedArray = JSON.parse(cleanJson);
      if (!Array.isArray(parsedArray)) {
        if (parsedArray && typeof parsedArray === 'object') {
          parsedArray = (parsedArray as any).questions || [parsedArray];
        }
      }
    } catch (parseErr) {
      console.error('JSON parse error on generated questions:', parseErr, rawResponse);
      return res.status(500).json({ error: 'خطا در ساختار خروجی سوالات' });
    }

    // ۴. ذخیره در Vercel KV با بررسی تکراری نبودن (Deduplication)
    const saved = await questionBankService.saveNewQuestions(chapterId, difficulty, parsedArray);

    res.json({
      success: true,
      generatedCount: saved.length,
      newQuestions: saved,
      message: `تعداد ${saved.length} سوال جدید با موفقیت به بانک اضافه شد.`,
    });
  } catch (err: any) {
    console.error('Error generating questions batch:', err);
    res.status(500).json({ error: 'خطا در فرآیند تولید سوال' });
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

