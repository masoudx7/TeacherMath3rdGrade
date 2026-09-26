/**
 * Question Bank Service & Incremental Generation Engine
 * سیستم تولید تدریجی و ضدتکرار سوالات ریاضی پایه سوم با پشتیبانی از Vercel KV و Fallback
 */

import { kv } from '@vercel/kv';
import { QuizQuestion, ChapterId, QuestionDifficulty } from '../types';
import { SAMPLE_QUIZZES } from '../data/curriculum';

export interface GenerateBatchParams {
  chapterId: ChapterId;
  difficulty: QuestionDifficulty;
  count?: number; // تعداد بهینه: ۳ (حداکثر ۵)
  existingTitles?: string[];
}

export interface QuestionBankStats {
  totalQuestions: number;
  byChapter: Record<string, number>;
  byDifficulty: Record<QuestionDifficulty, number>;
}

// سیستم نرمال‌سازی متن جهت جلوگیری قطعی از تولید سوال تکراری
export function normalizeQuestionText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString())
    .replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString())
    .replace(/[\s\u200c\-_،,.:;؟!؟]/g, '')
    .slice(0, 80);
}

export function generateQuestionHash(text: string): string {
  const norm = normalizeQuestionText(text);
  let hash = 0;
  for (let i = 0; i < norm.length; i++) {
    const char = norm.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * پرامپت سیستمی فوق‌العاده متمرکز و کوتاه برای تولید فقط ۳ تا ۵ سوال باکیفیت بدون مقاومت مدل
 */
export const COMPACT_QUESTION_SYSTEM_PROMPT = `
تو طراح رسمی سوالات آزمون ریاضی پایه سوم ابتدایی در وزارت آموزش و پرورش ایران هستی.
وظیفه تو فقط تولید دقیق ۳ سوال چهارگزینه‌ای مفهومی، جذاب و استاندارد برای کودکان ۹ ساله است.

قوانین سخت‌گیرانه:
۱. ارقام درون صورت سوال، گزینه‌ها، راهنما و پاسخ‌نامه تشریحی حتماً با اعداد فارسی (۰ تا ۹) نوشته شوند.
۲. گزینه‌ها باید ۴ مورد کاملاً مجزا و منطقی باشند (گزینه تکراری یا بدیهی نباشد).
۳. ایندکس گزینه صحیح (correctAnswerIndex) عددی بین ۰ تا ۳ باشد.
۴. زبان سوال شاداب، کودکانه و همراه با مثال‌های ملموس زندگی ایرانی (پیتزا، شکلات، نان بربری، مدادرنگی، پول تومان و ریال) باشد.
۵. خروجی باید صرفاً یک آرایه معتبر JSON شامل ۳ شیء با فرمت مشخص‌شده باشد بدون هیچ متن توضیحی اضافه.
`;

export class QuestionBankService {
  private inMemoryQuestions = new Map<string, QuizQuestion[]>();
  private knownHashes = new Set<string>();

  constructor() {
    // بارگذاری سوالات اولیه پیش‌فرض در هش‌ها
    Object.values(SAMPLE_QUIZZES).flat().forEach((q) => {
      this.knownHashes.add(generateQuestionHash(q.question));
    });
  }

  private isKvAvailable(): boolean {
    return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  }

  /**
   * دریافت سوالات یک فصل و سطح دشواری
   */
  async getQuestions(chapterId: ChapterId, difficulty?: QuestionDifficulty): Promise<QuizQuestion[]> {
    const chapterList = SAMPLE_QUIZZES[chapterId] || [];
    const baseQuestions = chapterList.filter((q) => {
      return difficulty ? q.difficulty === difficulty : true;
    });

    let kvQuestions: QuizQuestion[] = [];
    const kvKey = difficulty ? `questions:${chapterId}:${difficulty}` : `questions:${chapterId}:all`;

    if (this.isKvAvailable()) {
      try {
        const data = await kv.get<QuizQuestion[]>(kvKey);
        if (Array.isArray(data)) {
          kvQuestions = data;
        }
      } catch (err) {
        console.warn(`[KV] خطا در خواندن سوالات کلید ${kvKey}:`, err);
      }
    } else {
      kvQuestions = this.inMemoryQuestions.get(kvKey) || [];
    }

    // ادغام و حذف تکراری‌ها
    const all = [...baseQuestions, ...kvQuestions];
    const uniqueMap = new Map<string, QuizQuestion>();
    all.forEach((q) => {
      const hash = generateQuestionHash(q.question);
      if (!uniqueMap.has(hash)) {
        uniqueMap.set(hash, q);
      }
    });

    return Array.from(uniqueMap.values());
  }

  /**
   * ذخیره سوالات جدید در Vercel KV با جلوگیری قطعی از تکرار
   */
  async saveNewQuestions(chapterId: ChapterId, difficulty: QuestionDifficulty, incoming: QuizQuestion[]): Promise<QuizQuestion[]> {
    const validFreshQuestions: QuizQuestion[] = [];

    for (const q of incoming) {
      const hash = generateQuestionHash(q.question);
      if (!this.knownHashes.has(hash)) {
        this.knownHashes.add(hash);
        validFreshQuestions.push({
          ...q,
          id: q.id || `gen_${chapterId}_${difficulty}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          chapterId,
          difficulty,
        });
      }
    }

    if (validFreshQuestions.length === 0) {
      return [];
    }

    const kvKey = `questions:${chapterId}:${difficulty}`;
    let existingList: QuizQuestion[] = [];

    if (this.isKvAvailable()) {
      try {
        const stored = await kv.get<QuizQuestion[]>(kvKey);
        if (Array.isArray(stored)) {
          existingList = stored;
        }
      } catch (err) {
        console.warn('[KV] Error fetching existing before save:', err);
      }
    } else {
      existingList = this.inMemoryQuestions.get(kvKey) || [];
    }

    const updatedList = [...existingList, ...validFreshQuestions];

    if (this.isKvAvailable()) {
      try {
        await kv.set(kvKey, updatedList);
        // بروزرسانی آمار کل در KV
        await kv.incrby('questions:stats:total', validFreshQuestions.length);
      } catch (err) {
        console.warn('[KV] Error saving updated questions:', err);
      }
    } else {
      this.inMemoryQuestions.set(kvKey, updatedList);
    }

    return validFreshQuestions;
  }

  /**
   * تولید پرامپت اختصاصی برای ۳ سوال متناسب با فصل و درجه سختی
   */
  buildPromptForBatch(chapterId: ChapterId, difficulty: QuestionDifficulty, recentTitles: string[] = []): string {
    const chapterDescriptions: Record<ChapterId, string> = {
      patterns: 'الگوهای عددی (چندتا چندتا)، خواندن ساعت و دقیقه، و ماشین ورودی-خروجی',
      place_value: 'اعداد چهاررقمی، جدول ارزش مکانی (هزارگان)، مقایسه و تقریب، پول ریال و تومان',
      fractions: 'مفهوم کسر مساوی، صورت و مخرج با شکل (پیتزا و شکلات)، مقایسه کسرها و کسر روی محور',
      multiplication_division: 'مفهوم ضرب (دسته‌های مساوی)، جدول ضرب و رابطه ضرب با تقسیم عادلانه',
      perimeter_area: 'محیط (اندازه دور شکل) و مساحت (اندازه سطح داخلی با شمارش کاشی‌ها) برای مربع و مستطیل',
      regrouping: 'جمع و تفریق ۴ رقمی با انتقال (ده‌بریک) و تکنیک‌های حل مسئله چندمرحله‌ای',
      statistics: 'نمودار ستونی، جدول داده‌ها، چوب‌خط‌های ۵تایی (卌) و احتمال (حتمی، ممکن، غیرممکن)',
      advanced_multiplication: 'ضرب اعداد در ۱۰، ۱۰۰، ضرب‌های دورقمی در یک‌رقمی و خاصیت پخش‌پذیری ضرب',
    };

    const diffGuide: Record<QuestionDifficulty, string> = {
      easy: 'آسان: مستقیم، بدون نیاز به محاسبات چندمرحله‌ای، با مثال‌های بسیار روشن برای تقویت روحیه کودک.',
      medium: 'متوسط: نیازمند یک مرحله تفکر و محاسبه، منطبق بر تمرینات کتاب درسی سوم.',
      hard: 'سخت و چالشی: نیازمند دو مرحله استدلال و استراتژی حل مسئله برای دانش‌آموزان کوشا.',
    };

    const avoidanceText = recentTitles.length > 0
      ? `\nنکته بسیار مهم: این سوالات نباید شبیه سوالات قبلی زیر باشند:\n${recentTitles.slice(-5).map((t, i) => `${i + 1}. ${t}`).join('\n')}`
      : '';

    return `
یک بسته دقیقاً شامل ۳ سوال چهارگزینه‌ای استاندارد ریاضی سوم دبستان برای:
- فصل: «${chapterDescriptions[chapterId] || chapterId}»
- سطح سختی: «${diffGuide[difficulty]}»
${avoidanceText}

قالب خروجی دقیقاً یک آرایه JSON به شکل زیر باشد:
[
  {
    "question": "متن سوال با ارقام فارسی...",
    "options": ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"],
    "correctAnswerIndex": 0,
    "hint": "راهنمایی کودکانه و دلنشین...",
    "explanation": "توضیح کامل و تشویق‌کننده علت درستی گزینه...",
    "visualType": "multiplication"
  }
]
فقط آرایه JSON را چاپ کن.
`;
  }

  /**
   * محاسبه آمار تعداد سوالات ذخیره شده
   */
  async getStats(): Promise<QuestionBankStats> {
    const chapters: ChapterId[] = [
      'patterns',
      'place_value',
      'fractions',
      'multiplication_division',
      'perimeter_area',
      'regrouping',
      'statistics',
      'advanced_multiplication',
    ];
    const difficulties: QuestionDifficulty[] = ['easy', 'medium', 'hard'];

    let total = 0;
    const byChapter: Record<string, number> = {};
    const byDiff: Record<QuestionDifficulty, number> = { easy: 0, medium: 0, hard: 0 };

    for (const ch of chapters) {
      byChapter[ch] = 0;
      for (const diff of difficulties) {
        const questions = await this.getQuestions(ch, diff);
        const count = questions.length;
        total += count;
        byChapter[ch] += count;
        byDiff[diff] += count;
      }
    }

    return {
      totalQuestions: total,
      byChapter,
      byDifficulty: byDiff,
    };
  }
}

export const questionBankService = new QuestionBankService();
