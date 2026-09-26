/**
 * Seed Script for Question Bank (تزریق اولیه ۱۲۰+ سوال استاندارد)
 * 
 * نحوه اجرا:
 * npx tsx scripts/seed-questions.ts
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { 
  questionBankService, 
  COMPACT_QUESTION_SYSTEM_PROMPT,
  generateQuestionHash
} from '../src/services/questionBankService';
import { ChapterId, QuestionDifficulty, QuizQuestion } from '../src/types';

// بررسی کلیدهای محیطی
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('\x1b[31m%s\x1b[0m', '❌ خطای بحرانی: متغیر محیطی GEMINI_API_KEY تنظیم نشده است.');
  console.log('لطفاً در فایل .env یا خط فرمان، GEMINI_API_KEY را مشخص کنید.');
  process.exit(1);
}

const aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

const CHAPTERS: { id: ChapterId; name: string }[] = [
  { id: 'patterns', name: '۱. الگوها و شمارش' },
  { id: 'place_value', name: '۲. عددنویسی و ارزش مکانی' },
  { id: 'fractions', name: '۳. کسرها' },
  { id: 'multiplication_division', name: '۴. ضرب و تقسیم' },
  { id: 'perimeter_area', name: '۵. محیط و مساحت' },
  { id: 'regrouping', name: '۶. جمع و تفریق با انتقال' },
  { id: 'statistics', name: '۷. آمار و احتمال' },
  { id: 'advanced_multiplication', name: '۸. ضرب‌های پیشرفته' },
];

const DIFFICULTIES: QuestionDifficulty[] = ['easy', 'medium', 'hard'];
const TARGET_PER_DIFFICULTY = 5; // ۵ سوال برای هر سطح (مجموعاً ۱۵ سوال برای هر فصل × ۸ فصل = ۱۲۰ سوال)

// ایجاد تاخیر کنترل‌شده جهت پیشگیری از Rate Limit
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateBatchFromGemini(
  chapterId: ChapterId, 
  difficulty: QuestionDifficulty,
  existingTitles: string[]
): Promise<QuizQuestion[]> {
  const promptText = questionBankService.buildPromptForBatch(chapterId, difficulty, existingTitles);

  let rawText = '';
  for (const model of MODELS) {
    try {
      const response = await aiClient.models.generateContent({
        model,
        contents: promptText,
        config: {
          systemInstruction: COMPACT_QUESTION_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      if (response && response.text) {
        rawText = response.text;
        break;
      }
    } catch (err: any) {
      console.warn(`\x1b[33m[هشدار]\x1b[0m مدل ${model} با خطا مواجه شد، سوییچ به مدل بعدی...`);
      await sleep(1000);
    }
  }

  if (!rawText) {
    throw new Error('مدل‌های هوش مصنوعی پاسخی ارائه ندادند.');
  }

  const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJson);
  const array = Array.isArray(parsed) ? parsed : (parsed?.questions || [parsed]);
  return array;
}

async function main() {
  console.log('\n\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════');
  console.log('\x1b[1m\x1b[32m%s\x1b[0m', ' 🦉 آغاز اسکریپت تزریق و آماده‌سازی بانک ۱۲۰ سوال ریاضی سوم');
  console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════\n');

  const isKvActive = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  console.log(
    isKvActive 
      ? '🟢 وضعیت ذخیره‌سازی: \x1b[32mVercel KV ابری فعال است.\x1b[0m' 
      : '🟡 وضعیت ذخیره‌سازی: \x1b[33mVercel KV متصل نیست؛ سوالات در حافظه و فایل لوکال ذخیره می‌شوند.\x1b[0m'
  );

  const startTime = Date.now();
  let totalNewAdded = 0;
  const allCollectedForLocalExport: Record<string, QuizQuestion[]> = {};

  for (const ch of CHAPTERS) {
    console.log(`\n📌 در حال پردازش فصل: \x1b[1m\x1b[35m${ch.name}\x1b[0m`);
    allCollectedForLocalExport[ch.id] = [];

    for (const diff of DIFFICULTIES) {
      const diffLabel = diff === 'easy' ? 'آسان' : diff === 'medium' ? 'متوسط' : 'سخت';
      process.stdout.write(`   ↳ سطح [${diffLabel}]: `);

      let currentQuestions = await questionBankService.getQuestions(ch.id, diff);
      let needed = Math.max(0, TARGET_PER_DIFFICULTY - currentQuestions.length);

      if (needed === 0) {
        console.log(`\x1b[32mتکمیل است (${currentQuestions.length} سوال موجود)\x1b[0m`);
        allCollectedForLocalExport[ch.id].push(...currentQuestions);
        continue;
      }

      console.log(`نیاز به ${needed} سوال جدید (موجود: ${currentQuestions.length})`);

      while (needed > 0) {
        let attempts = 0;
        let successBatch = false;

        while (attempts < 2 && !successBatch) {
          attempts++;
          try {
            process.stdout.write(`      ⚡ فراخوانی بسته ۳ تایی (تلاش ${attempts})... `);
            const freshBatch = await generateBatchFromGemini(
              ch.id, 
              diff, 
              currentQuestions.map(q => q.question)
            );

            const saved = await questionBankService.saveNewQuestions(ch.id, diff, freshBatch);
            
            if (saved.length > 0) {
              totalNewAdded += saved.length;
              needed = Math.max(0, needed - saved.length);
              currentQuestions = [...currentQuestions, ...saved];
              successBatch = true;
              console.log(`\x1b[32m+${saved.length} سوال جدید ثبت شد.\x1b[0m`);
            } else {
              console.log(`\x1b[33mسوالات تکراری بودند، تلاش مجدد...\x1b[0m`);
            }
          } catch (err: any) {
            console.log(`\x1b[31mخطا در بسته: ${err.message}\x1b[0m`);
          }

          // ایجاد تاخیر بین هر بسته (۱.۸ ثانیه)
          await sleep(1800);
        }

        if (!successBatch) {
          console.warn(`      ⚠️ پس از ۲ تلاش سوال جدیدی اضافه نشد، عبور به مرحله بعد.`);
          break;
        }
      }

      allCollectedForLocalExport[ch.id].push(...currentQuestions);
    }
  }

  // در صورت فعال نبودن KV، سوالات برای استفاده آفلاین در پوشه public ذخیره می‌شوند
  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const outputPath = path.join(dataDir, 'seeded-questions.json');
    fs.writeFileSync(outputPath, JSON.stringify(allCollectedForLocalExport, null, 2), 'utf8');
    console.log(`\n💾 نسخه پشتیبان محلی سوالات در مسیر ذخیره شد: \x1b[34m${outputPath}\x1b[0m`);
  } catch (err) {
    // نادیده گرفتن خطای فایل محلی در محیط‌های read-only
  }

  // گزارش آمار نهایی
  const durationSec = Math.round((Date.now() - startTime) / 1000);
  console.log('\n\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════');
  console.log(`\x1b[1m\x1b[32m✔ عملیات با موفقیت پایان یافت!\x1b[0m زمان سپری شده: ${durationSec} ثانیه`);
  console.log(`➕ مجموع سوالات جدید تولید و ذخیره‌شده: \x1b[1m${totalNewAdded}\x1b[0m`);
  console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════\n');

  // چاپ جدول تفکیکی آمار
  const tableData: any[] = [];
  for (const ch of CHAPTERS) {
    const easyQ = await questionBankService.getQuestions(ch.id, 'easy');
    const medQ = await questionBankService.getQuestions(ch.id, 'medium');
    const hardQ = await questionBankService.getQuestions(ch.id, 'hard');
    const total = easyQ.length + medQ.length + hardQ.length;

    tableData.push({
      'فصل': ch.name,
      'آسان': easyQ.length,
      'متوسط': medQ.length,
      'سخت': hardQ.length,
      'مجموع فصل': total,
      'وضعیت': total >= 15 ? '✅ استاندارد' : '⚠️ نیاز به شارژ',
    });
  }

  console.table(tableData);
}

main().catch((err) => {
  console.error('\x1b[31m%s\x1b[0m', 'خطای پیش‌بینی نشده در اجرای اسکریپت:', err);
  process.exit(1);
});
