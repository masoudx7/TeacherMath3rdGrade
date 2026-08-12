import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { generateFallbackTutorResponse } from './src/utils/tutorFallback.js';

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

const PORT = 3000;

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

const TUTOR_SYSTEM_INSTRUCTION = `
تو یک معلم خصوصی بسیار مهربان، باحوصله، دلسوز و کودکانه برای درس ریاضی پایه سوم ابتدایی در ایران هستی.
نام تو "استاد دانا" یا "معلم ریاضی سوم" است.
لحن تو بسیار گرم، تشویق‌کننده، شاد و همراه با استیکرها و ایموجی‌های دوست‌داشتنی برای کودکان 8 تا 9 ساله است.

قوانین پاسخگویی تو:
1. ریاضی پایه سوم ابتدایی ایران شامل 8 فصل اصلی است:
   - فصل 1: الگوها، الگویابی، شمارش چندتا چندتا، ماشین ورودی خروجی، ساعت و تقویم
   - فصل 2: عددنویسی، اعداد 4 رقمی (هزارها)، جدول ارزش مکانی، تومان و ریال، گسترده‌نویسی، تقریب
   - فصل 3: کسرها، صورت و مخرج، مقایسه کسرها، کسر روی محور، کسرهای مساوی
   - فصل 4: ضرب و تقسیم، مفهوم دسته و عضو، جدول ضرب 1 تا 10، خاصیت جابه‌جایی، تقسیم و دسته‌بندی
   - فصل 5: محیط و مساحت، محیط مربع و مستطیل، مساحت با مربع واحد
   - فصل 6: جمع و تفریق تکنیکی اعداد 4 رقمی با انتقال و جدول ارزش مکانی
   - فصل 7: آمار و احتمال، چوب‌خط، نمودار ستونی، چرخنده شانس
   - فصل 8: ضرب اعداد بزرگتر (ضرب 10، 100، 1000)، ضرب دو رقم در یک رقم، راهبردهای حل مسئله (رسم شکل، جدول حدس و آزمایش، الگویابی، زیرمسئله)

2. ساختار پاسخگویی:
   - همیشه ابتدا به دانش‌آموز آفرین و انرژی مثبت بده (مثل: "سلام قهرمان ریاضی!", "آفرین پسرم/دخترم که این سوال قشنگ رو پرسیدی! 🌟").
   - مسئله یا موضوع را مرحله به مرحله (گام به گام) با عبارات خیلی ساده، مثال‌های روزمره (مثل پیتزا، شکلات، سیب، پول جیبی) توضیح بده.
   - از ایموجی‌های جذاب استفاده کن.
   - در انتهای توضیح، یک سوال کوچک یا تمرین مشابه کوتاه بپرس تا دانش‌آموز یادگیری‌اش را امتحان کند.
   - اگر مسئله اعداد فارسی داشت حتماً با اعداد فارسی و خوانا جواب بده.
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

// Health endpoint
app.get('/api/health', (req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const geminiConfigured = Boolean(geminiKey && geminiKey.trim().length > 0);
  const deepseekConfigured = Boolean(deepseekKey && deepseekKey.trim().length > 0);

  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    geminiConfigured,
    deepseekConfigured,
    message: geminiConfigured
      ? 'GEMINI_API_KEY بر روی سرور دریافت شده است.'
      : 'کلید GEMINI_API_KEY یافت نشد. لطفاً در پنل Vercel در بخش Environment Variables کلید را اضافه کرده و پروژه را دوباره Redeploy کنید.',
  });
});

// 1. Chat with Math Tutor API
app.post(['/api/tutor/chat', '/tutor/chat', '/chat', '/api/chat'], async (req, res) => {
  const { prompt, history } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'متن سوال الزامی است.' });
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
  const modelsToTry = ['gemini-3.6-flash', 'gemini-3.1-pro-preview', 'gemini-flash-latest'];
  let lastError: any = null;

  try {
    const client = getAIClient();
    for (const modelName of modelsToTry) {
      try {
        const response = await client.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (e: any) {
        lastError = e;
        console.warn(`Model ${modelName} failed:`, e.message);
      }
    }
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

// 2. Solve Image Math Problem API
app.post(['/api/tutor/solve-image', '/tutor/solve-image', '/solve-image'], async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png', userQuestion = '' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'تصویر ارسال نشده است.' });
    }

    const client = getAIClient();
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `
این تصویر حاوی یک مسئله یا صفحه از کتاب یا برگه تمرین ریاضی پایه سوم ابتدایی است.
لطفاً:
۱. مسئله یا سوال موجود در عکس را دقیق بخوان و متن آن را بازنویسی کن.
۲. آن را گام به گام با زبان کودکانه، شیرین و بسیار ساده برای یک دانش‌آموز پایه سوم ابتدایی حل و تشریح کن.
۳. پاسخ نهایی را کاملاً واضح و مشخص کن.
۴. در پایان، یک سوال مشابه کودکانه مطرح کن تا دانش‌آموز خودش هم تمرین کند!

${userQuestion ? `نکته یا سوال خاص دانش‌آموز در مورد عکس: ${userQuestion}` : ''}
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            { text: promptText },
          ],
        },
      ],
      config: {
        systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
        temperature: 0.5,
      },
    });

    res.json({ explanation: response.text || 'تصویر قابل تحلیل نبود.' });
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
  try {
    const { chapterId, chapterTitle, count = 3 } = req.body;

    const client = getAIClient();
    const prompt = `یک آزمون کوتاه ${count} سوالی از درس ریاضی پایه سوم ابتدایی برای فصل "${chapterTitle || chapterId}" تولید کن.
    سوالات باید استاندارد، شاد و کاملاً منطبق بر کتاب ریاضی سوم دبستان ایران باشند.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
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
      },
    });

    const quizData = JSON.parse(response.text || '[]');
    res.json({ questions: quizData });
  } catch (err: any) {
    console.error('Quiz generator error:', err);
    if (err?.message === 'GEMINI_API_KEY_MISSING') {
      return res.status(500).json({
        error: 'کلید API تنظیم نشده است. لطفاً در تنظیمات Vercel گزینه Environment Variables متغیر GEMINI_API_KEY را اضافه کرده و پروژه را Redeploy نمایید.',
      });
    }
    res.status(500).json({ error: 'خطا در تولید آزمون هوشمند: ' + (err.message || 'مشکل فنی') });
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

