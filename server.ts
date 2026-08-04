import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '15mb' }));

const PORT = 3000;

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

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

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. Chat with Math Tutor API
app.post('/api/tutor/chat', async (req, res) => {
  try {
    const { prompt, history } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'متن سوال الزامی است.' });
    }

    const chatMessages = [
      { role: 'user', parts: [{ text: TUTOR_SYSTEM_INSTRUCTION }] },
      { role: 'model', parts: [{ text: 'سلام! من معلم ریاضی سوم شما هستم. 준비 برای یادگیری ریاضی شاد! چه سوالی داری عزیزم؟ 😊⭐' }] }
    ];

    if (Array.isArray(history)) {
      history.forEach((msg: any) => {
        chatMessages.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      });
    }

    chatMessages.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: chatMessages,
      config: {
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || 'پاسخی دریافت نشد.' });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'خطا در ارتباط با معلم هوشمند: ' + (err.message || 'مشکل فنی') });
  }
});

// 2. Solve Image Math Problem API
app.post('/api/tutor/solve-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png', userQuestion = '' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'تصویر ارسال نشده است.' });
    }

    // Clean base64 string if data URL prefix exists
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `
این تصویر حاوی یک مسئله یا صفحه از کتاب یا برگه تمرین ریاضی پایه سوم ابتدایی است.
لطفاً:
1. مسئله یا سوال موجود در عکس را دقیق بخوان و متن آن را بازنویسی کن.
2. آن را گام به گام با زبان کودکانه، شیرین و بسیار ساده برای یک دانش‌آموز پایه سوم ابتدایی حل و تشریح کن.
3. پاسخ نهایی را کاملاً واضح و مشخص کن.
4. در پایان، یک سوال مشابه کودکانه مطرح کن تا دانش‌آموز خودش هم تمرین کند!

${userQuestion ? `نکته یا سوال خاص دانش‌آموز در مورد عکس: ${userQuestion}` : ''}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
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
      config: {
        systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
        temperature: 0.5,
      },
    });

    res.json({ explanation: response.text || 'تصویر قابل تحلیل نبود.' });
  } catch (err: any) {
    console.error('Image solver error:', err);
    res.status(500).json({ error: 'خطا در بررسی عکس مسئله ریاضی: ' + (err.message || 'مشکل فنی') });
  }
});

// 3. Generate Custom Quiz Questions API
app.post('/api/tutor/generate-quiz', async (req, res) => {
  try {
    const { chapterId, chapterTitle, count = 3 } = req.body;

    const prompt = `یک آزمون کوتاه ${count} سوالی از درس ریاضی پایه سوم ابتدایی برای فصل "${chapterTitle || chapterId}" تولید کن.
    سوالات باید استاندارد، شاد و کاملاً منطبق بر کتاب ریاضی سوم دبستان ایران باشند.`;

    const response = await ai.models.generateContent({
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
    res.status(500).json({ error: 'خطا در تولید آزمون هوشمند: ' + (err.message || 'مشکل فنی') });
  }
});

// Vite & Static file handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
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

startServer();
