/**
 * Question Bank Service & Incremental Generation Engine
 * سیستم تولید تدریجی و ضدتکرار سوالات با بارگذاری کاملاً تنبل (Lazy) سازگار با Vercel Serverless
 */

import { QuizQuestion, ChapterId, QuestionDifficulty } from '../types';
import { SAMPLE_QUIZZES } from '../data/curriculum';

export interface GenerateBatchParams {
  chapterId: ChapterId;
  difficulty: QuestionDifficulty;
  count?: number; // تعداد بهینه: ۳
  existingTitles?: string[];
}

export interface QuestionBankStats {
  totalQuestions: number;
  byChapter: Record<string, number>;
  byDifficulty: Record<QuestionDifficulty, number>;
}

// سیستم نرمال‌سازی متن جهت جلوگیری قطعی از تولید سوال تکراری
export function normalizeQuestionText(text: string): string {
  if (!text) return '';
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
 * پرامپت سیستمی فوق‌العاده متمرکز و کوتاه برای تولید ۳ سوال باکیفیت بدون مقاومت مدل
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

// کلاینت Vercel KV به صورت پویا و تنبل (Lazy Dynamic Import)
let cachedKvClient: any = null;
let kvAttempted = false;

async function getSafeKvClient() {
  if (kvAttempted) return cachedKvClient;
  kvAttempted = true;

  // بررسی دقیق متغیرهای محیطی قبل از تلاش برای لود ماژول
  const hasKvEnv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  if (!hasKvEnv) {
    return null;
  }

  try {
    const kvModule = await import('@vercel/kv');
    cachedKvClient = kvModule.kv || (kvModule as any).default?.kv || kvModule;
    return cachedKvClient;
  } catch (err) {
    console.warn('[QuestionBankService] Failed to dynamically load @vercel/kv, using in-memory store:', err);
    return null;
  }
}

export class QuestionBankService {
  private inMemoryQuestions = new Map<string, QuizQuestion[]>();
  private knownHashes = new Set<string>();
  private hashesInitialized = false;

  // هیچ پردازش سنگینی در constructor انجام نمی‌شود تا زمان startup سرورلس صفر میلی‌ثانیه باشد
  constructor() {}

  private initHashesIfNeeded(): void {
    if (this.hashesInitialized) return;
    this.hashesInitialized = true;
    try {
      if (SAMPLE_QUIZZES && typeof SAMPLE_QUIZZES === 'object') {
        Object.values(SAMPLE_QUIZZES).flat().forEach((q) => {
          if (q && q.question) {
            this.knownHashes.add(generateQuestionHash(q.question));
          }
        });
      }
    } catch (e) {
      console.warn('[QuestionBankService] Error initializing initial hashes:', e);
    }
  }

  /**
   * دریافت سوالات یک فصل و سطح دشواری
   */
  async getQuestions(chapterId: ChapterId, difficulty?: QuestionDifficulty): Promise<QuizQuestion[]> {
    this.initHashesIfNeeded();

    const chapterList = SAMPLE_QUIZZES[chapterId] || [];
    const baseQuestions = chapterList.filter((q) => {
      return difficulty ? q.difficulty === difficulty : true;
    });

    let kvQuestions: QuizQuestion[] = [];
    const kvKey = difficulty ? `questions:${chapterId}:${difficulty}` : `questions:${chapterId}:all`;

    const kv = await getSafeKvClient();
    if (kv) {
      try {
        const data = await kv.get(kvKey);
        if (Array.isArray(data)) {
          kvQuestions = data;
        }
      } catch (err) {
        console.warn(`[KV] Warning reading key ${kvKey}, falling back:`, err);
        kvQuestions = this.inMemoryQuestions.get(kvKey) || [];
      }
    } else {
      kvQuestions = this.inMemoryQuestions.get(kvKey) || [];
    }

    // ادغام و حذف تکراری‌ها بر اساس هش
    const all = [...baseQuestions, ...kvQuestions];
    const uniqueMap = new Map<string, QuizQuestion>();
    all.forEach((q) => {
      if (!q || !q.question) return;
      const hash = generateQuestionHash(q.question);
      if (!uniqueMap.has(hash)) {
        uniqueMap.set(hash, q);
      }
    });

    return Array.from(uniqueMap.values());
  }

  /**
   * ذخیره سوالات جدید با جلوگیری قطعی از تکرار
   */
  async saveNewQuestions(chapterId: ChapterId, difficulty: QuestionDifficulty, incoming: QuizQuestion[]): Promise<QuizQuestion[]> {
    this.initHashesIfNeeded();

    if (!Array.isArray(incoming) || incoming.length === 0) {
      return [];
    }

    const validFreshQuestions: QuizQuestion[] = [];

    for (const q of incoming) {
      if (!q || !q.question) continue;
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

    const kv = await getSafeKvClient();
    if (kv) {
      try {
        const stored = await kv.get(kvKey);
        if (Array.isArray(stored)) {
          existingList = stored;
        }
      } catch (err) {
        console.warn('[KV] Error fetching before save:', err);
        existingList = this.inMemoryQuestions.get(kvKey) || [];
      }
    } else {
      existingList = this.inMemoryQuestions.get(kvKey) || [];
    }

    const updatedList = [...existingList, ...validFreshQuestions];

    if (kv) {
      try {
        await kv.set(kvKey, updatedList);
        if (typeof kv.incrby === 'function') {
          await kv.incrby('questions:stats:total', validFreshQuestions.length);
        }
      } catch (err) {
        console.warn('[KV] Error setting updated list:', err);
        this.inMemoryQuestions.set(kvKey, updatedList);
      }
    } else {
      this.inMemoryQuestions.set(kvKey, updatedList);
    }

    return validFreshQuestions;
  }

  buildPromptForBatch(chapterId: ChapterId, difficulty: QuestionDifficulty, recentTitles: string[] = []): string {
    const avoidanceText =
      recentTitles.length > 0
        ? `\nنکته بسیار مهم: این ۳ سوال نباید شبیه یا تکراریِ سوالات زیر باشند:\n${recentTitles
            .slice(-5)
            .map((t, i) => `${i + 1}. ${t}`)
            .join('\n')}`
        : '';

    return `
یک بسته دقیقاً شامل ۳ سوال چهارگزینه‌ای مفهومی و جدید ریاضی سوم ابتدایی برای فصل «${chapterId}» در سطح سختی «${difficulty}».
${avoidanceText}

قالب خروجی دقیقاً یک آرایه JSON معتبر:
[
  {
    "question": "صورت سوال با اعداد فارسی و مثال ملموس...",
    "options": ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"],
    "correctAnswerIndex": 0,
    "hint": "راهنمایی بدون لو دادن جواب...",
    "explanation": "پاسخ تشریحی کامل...",
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

// ========================================================
// Lazy Singleton Pattern: نمونه‌سازی تنبل با Proxy
// هیچ کدی در زمان import در Serverless اجرا نمی‌شود
// ========================================================
let _instance: QuestionBankService | null = null;

export function getQuestionBankService(): QuestionBankService {
  if (!_instance) {
    _instance = new QuestionBankService();
  }
  return _instance;
}

export const questionBankService: QuestionBankService = new Proxy({} as QuestionBankService, {
  get(_target, prop) {
    const instance = getQuestionBankService();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});
