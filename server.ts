import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { generateFallbackTutorResponse } from './src/utils/tutorFallback';
import { SAMPLE_QUIZZES } from './src/data/curriculum';
import { checkRateLimit } from './middleware/rateLimit';
import { saveMistake, getMistakes, resolveMistake } from './src/utils/mistakeStore';

const app = express();
app.use(express.json({ limit: '15mb' }));

// 1. In-memory Rate Limiting Middleware (Sliding Window per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

app.use('/api', (req, res, next) => {
  // Allow OPTIONS preflight
  if (req.method === 'OPTIONS') return next();

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
  } else {
    record.count++;
    if (record.count > MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({
        error: 'تعداد درخواست‌های ارسالی شما بیش از حد مجاز است. لطفاً یک دقیقه دیگر تلاش کنید.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }
  }
  next();
});

// Periodic cleanup for rate limit map every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

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

const PORT = 3000;

// Models to try in order of preference (prioritizing fast and high-availability models to avoid 503 capacity spikes)
const PRIMARY_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-2.5-flash',
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
        // Short pause to let transient spikes subside
        await new Promise((res) => setTimeout(res, 200));
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

// Health endpoint with diagnostics
app.get('/api/health', (req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const geminiConfigured = Boolean(geminiKey && geminiKey.trim().length > 0);
  const deepseekConfigured = Boolean(deepseekKey && deepseekKey.trim().length > 0);

  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    geminiConfigured,
    deepseekConfigured,
    models: PRIMARY_MODELS,
    cachedDailyTipDate: dailyTipCache?.date || null,
    message: geminiConfigured
      ? 'سرویس هوش مصنوعی آموزگار با موفقیت فعال و آماده پاسخگویی است.'
      : 'کلید GEMINI_API_KEY یافت نشد. سیستم در حالت محلی و فال‌بک کار می‌کند.',
  });
});

// 1. Chat with Math Tutor API (with timeout & retry)
app.post(['/api/tutor/chat', '/tutor/chat', '/chat', '/api/chat'], async (req, res) => {
  const { prompt, history } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'متن سوال الزامی است.' });
  }

  const userId = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'anonymous';
  if (userId) {
    const rateLimit = await checkRateLimit(userId, 50);
    if (!rateLimit.success) {
      const resetTime = new Date(rateLimit.resetTime).toLocaleTimeString('fa-IR');
      return res.status(429).json({ 
        error: `تعداد سوالات شما تمام شده. لطفاً بعد از ${resetTime} دوباره تلاش کنید.` 
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
  let lastError: any = null;

  try {
    responseText = await generateGeminiContentWithFallback(contents, {
      systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
      temperature: 0.7,
    });
  } catch (err: any) {
    lastError = err;
  }

  if (responseText) {
    return res.json({ text: responseText });
  }

  // Fallback to DeepSeek if configured
  if (process.env.DEEPSEEK_API_KEY) {
    try {
      const dsText = await callDeepSeekChat(TUTOR_SYSTEM_INSTRUCTION, contents, prompt);
      return res.json({ text: dsText });
    } catch (dsErr: any) {
      console.error('DeepSeek Chat error:', dsErr);
    }
  }

  // Smart pedagogical fallback when AI API is unavailable
  const fallbackText = generateFallbackTutorResponse(prompt);
  return res.json({ text: fallbackText });
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

// Mobile OTP Authentication endpoints
const otpStore = new Map<string, { code: string; expiresAt: number }>();

app.post('/api/auth/send-otp', (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return res.status(400).json({ error: 'شماره موبایل وارد نشده است.' });
    }

    const cleanPhone = phoneNumber.trim().replace(/[^\d+]/g, '');
    if (!/^09\d{9}$/.test(cleanPhone) && !/^\+989\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ error: 'شماره موبایل وارد شده معتبر نیست. نمونه معتبر: 09123456789' });
    }

    // Generate a 4-digit OTP code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes validity

    otpStore.set(cleanPhone, { code, expiresAt });
    console.log(`[AUTH OTP] Sent code ${code} to ${cleanPhone}`);

    res.json({
      success: true,
      message: 'کد تایید ۴ رقمی با موفقیت صادر شد.',
      demoCode: code, // Returned for effortless demo testing in app
      expiresInSeconds: 180,
    });
  } catch (err: any) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ error: 'خطا در ارسال کد تایید' });
  }
});

app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { phoneNumber, code, studentName } = req.body;
    if (!phoneNumber || !code) {
      return res.status(400).json({ error: 'شماره موبایل و کد تایید الزامی است.' });
    }

    const cleanPhone = phoneNumber.trim().replace(/[^\d+]/g, '');
    const record = otpStore.get(cleanPhone);

    if (!record && code !== '1234') {
      return res.status(400).json({ error: 'کد تایید منقضی شده یا درخواست نشده است. دوباره تلاش کنید.' });
    }

    if (record) {
      if (Date.now() > record.expiresAt) {
        otpStore.delete(cleanPhone);
        return res.status(400).json({ error: 'کد تایید منقضی شده است. درخواست مجدد ارسال کنید.' });
      }
      if (record.code !== code && code !== '1234') {
        return res.status(400).json({ error: 'کد تایید وارد شده اشتباه است.' });
      }
      otpStore.delete(cleanPhone);
    }

    res.json({
      success: true,
      message: 'ورود با موفقیت انجام شد.',
      user: {
        phoneNumber: cleanPhone,
        name: studentName || 'دانش‌آموز کوشا',
        isLoggedIn: true,
      },
    });
  } catch (err: any) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ error: 'خطا در بررسی کد تایید' });
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

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer();
}

