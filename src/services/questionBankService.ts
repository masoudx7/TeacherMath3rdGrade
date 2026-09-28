/**
 * Question Bank Service & Normalized Lightweight Storage
 * ساختار دیتابیس نرمال‌سازی‌شده، سبک و فوق‌سریع برای Vercel KV و Serverless
 * 
 * ساختار کلیدها:
 * - q:{questionId}                     -> آبجکت کامل سوال
 * - list:{chapterId}:{difficulty}      -> آرایه شناسه‌های سوالات
 * - hash:{hash}                        -> شناسه سوال جهت ضدتکرار دائمی
 * - stats:total                        -> شمارنده اتمیک مجموع سوالات
 * - stats:{chapterId}                  -> شمارنده اتمیک فصل
 * - stats:{chapterId}:{difficulty}     -> شمارنده اتمیک فصل و سطح دشواری
 */

import { QuizQuestion, ChapterId, QuestionDifficulty } from '../types';
import { SAMPLE_QUIZZES } from '../data/curriculum';

export interface GenerateBatchParams {
  chapterId: ChapterId;
  difficulty: QuestionDifficulty;
  count?: number;
  existingTitles?: string[];
}

export interface QuestionBankStats {
  totalQuestions: number;
  byChapter: Record<string, number>;
  byDifficulty: Record<QuestionDifficulty, number>;
}

const ALL_CHAPTERS: ChapterId[] = [
  'patterns',
  'place_value',
  'fractions',
  'multiplication_division',
  'perimeter_area',
  'regrouping',
  'statistics',
  'advanced_multiplication',
];

const ALL_DIFFICULTIES: QuestionDifficulty[] = ['easy', 'medium', 'hard'];

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
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

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

// کلاینت Vercel KV به صورت کاملاً تنبل و امن در Serverless
let cachedKvClient: any = null;
let kvAttempted = false;

async function getSafeKvClient() {
  if (kvAttempted) return cachedKvClient;
  kvAttempted = true;

  const hasKvEnv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  if (!hasKvEnv) {
    return null;
  }

  try {
    const kvModule = await import('@vercel/kv');
    cachedKvClient = kvModule.kv || (kvModule as any).default?.kv || kvModule;
    return cachedKvClient;
  } catch (err) {
    console.warn('[QuestionBankService] Failed to load @vercel/kv dynamically, using in-memory store:', err);
    return null;
  }
}

export class QuestionBankService {
  private inMemoryQuestions = new Map<string, QuizQuestion>();
  private inMemoryLists = new Map<string, string[]>();
  private inMemoryHashes = new Map<string, string>();
  private inMemoryCounters = new Map<string, number>();
  private knownHashes = new Set<string>();
  private hashesInitialized = false;

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
      console.warn('[QuestionBankService] Error initializing base hashes:', e);
    }
  }

  /**
   * بررسی ضدتکرار در حافظه و به صورت پایدار در Vercel KV
   */
  private async isDuplicate(hash: string, kv: any): Promise<boolean> {
    if (this.knownHashes.has(hash)) return true;
    if (this.inMemoryHashes.has(hash)) return true;

    if (kv && typeof kv.get === 'function') {
      try {
        const existingId = await kv.get(`hash:${hash}`);
        if (existingId) {
          this.knownHashes.add(hash);
          return true;
        }
      } catch (err) {
        // نادیده گرفتن خطای موقت KV
      }
    }

    return false;
  }

  /**
   * بازیابی ایمن و مهاجرت خودکار داده‌های قدیمی در صورت وجود
   */
  private async getQuestionIdsWithMigration(
    chapterId: ChapterId,
    difficulty: QuestionDifficulty,
    kv: any
  ): Promise<string[]> {
    const listKey = `list:${chapterId}:${difficulty}`;

    if (kv && typeof kv.get === 'function') {
      try {
        const ids = await kv.get(listKey);
        if (Array.isArray(ids) && ids.length > 0) {
          return ids;
        }

        // ==========================================
        // مکانیزم مهاجرت سازگار به عقب (Backward Compatibility Migration)
        // اگر فرمت جدید نبود، آرایه قدیمی را بخوان و یکبار به ساختار جدید تبدیل کن
        // ==========================================
        const legacyKey = `questions:${chapterId}:${difficulty}`;
        const legacyQuestions: QuizQuestion[] = await kv.get(legacyKey);
        if (Array.isArray(legacyQuestions) && legacyQuestions.length > 0) {
          const migratedIds: string[] = [];
          for (const item of legacyQuestions) {
            if (!item || !item.id) continue;
            migratedIds.push(item.id);

            // ذخیره هر سوال به صورت منفرد
            await kv.set(`q:${item.id}`, item);

            // ثبت هش
            const hash = generateQuestionHash(item.question);
            await kv.set(`hash:${hash}`, item.id);
            this.knownHashes.add(hash);
          }

          // ذخیره لیست id ها و ثبت شمارنده‌ها
          await kv.set(listKey, migratedIds);
          if (typeof kv.incrby === 'function') {
            await kv.incrby('stats:total', migratedIds.length);
            await kv.incrby(`stats:${chapterId}`, migratedIds.length);
            await kv.incrby(`stats:${chapterId}:${difficulty}`, migratedIds.length);
          }

          // پاک‌سازی کلید قدیمی برای آزادسازی فضای KV و جلوگیری از تکرار مهاجرت
          try {
            if (typeof kv.del === 'function') {
              await kv.del(legacyKey);
            }
          } catch (delErr) {
            console.warn(`[KV] Could not delete legacy key ${legacyKey}:`, delErr);
          }

          return migratedIds;
        }
      } catch (err) {
        console.warn(`[KV] Error in getQuestionIdsWithMigration for ${listKey}:`, err);
      }
    }

    return this.inMemoryLists.get(listKey) || [];
  }

  /**
   * دریافت مجموع سوالات یک فصل با سطح دشواری مشخص یا کل فصول
   */
  async getQuestions(chapterId: ChapterId, difficulty?: QuestionDifficulty): Promise<QuizQuestion[]> {
    this.initHashesIfNeeded();

    // ۱. دریافت سوالات پایه آفلاین از سرفصل درسی
    const chapterList = SAMPLE_QUIZZES[chapterId] || [];
    const baseQuestionsRaw = chapterList.filter((q) => {
      return difficulty ? q.difficulty === difficulty : true;
    });

    const kv = await getSafeKvClient();

    // بررسی آیا سوال پایه وضعیت متفاوتی (مانند flagged یا approved) در حافظه/KV دارد یا خیر
    const baseQuestions: QuizQuestion[] = [];
    for (const bq of baseQuestionsRaw) {
      let override = this.inMemoryQuestions.get(`q:${bq.id}`);
      if (!override && kv && typeof kv.get === 'function') {
        try {
          const remote = await kv.get(`q:${bq.id}`);
          if (remote) override = remote;
        } catch {}
      }
      baseQuestions.push(override || bq);
    }

    const targetDifficulties: QuestionDifficulty[] = difficulty ? [difficulty] : ALL_DIFFICULTIES;
    const allFetchedIds: string[] = [];

    for (const diff of targetDifficulties) {
      const ids = await this.getQuestionIdsWithMigration(chapterId, diff, kv);
      allFetchedIds.push(...ids);
    }

    let kvQuestions: QuizQuestion[] = [];

    if (allFetchedIds.length > 0) {
      if (kv && typeof kv.mget === 'function') {
        try {
          const keys = allFetchedIds.map((id) => `q:${id}`);
          const results = await kv.mget(...keys);
          if (Array.isArray(results)) {
            kvQuestions = results.filter(Boolean) as QuizQuestion[];
          }
        } catch (err) {
          console.warn('[KV] mget failed, falling back to parallel get:', err);
          const individual = await Promise.all(
            allFetchedIds.map((id) => kv.get(`q:${id}`).catch(() => null))
          );
          kvQuestions = individual.filter(Boolean) as QuizQuestion[];
        }
      } else {
        kvQuestions = allFetchedIds
          .map((id) => this.inMemoryQuestions.get(`q:${id}`))
          .filter(Boolean) as QuizQuestion[];
      }
    }

    // ادغام و یکتاسازی بر اساس هش
    const all = [...baseQuestions, ...kvQuestions];
    const uniqueMap = new Map<string, QuizQuestion>();
    all.forEach((q) => {
      if (!q || !q.question) return;
      const hash = generateQuestionHash(q.question);
      if (!uniqueMap.has(hash)) {
        uniqueMap.set(hash, q);
      }
    });

    const uniqueQuestions = Array.from(uniqueMap.values());

    // ۱. حذف قطعی سوالات پرچم‌گذاری‌شده (flagged) یا ردشده (rejected) از دید دانش‌آموز
    const nonFlaggedQuestions = uniqueQuestions.filter(
      (q) => q.status !== 'flagged' && q.status !== 'rejected'
    );

    // ۲. فیلتر سوالات تاییدشده (approved) - سوالات کتاب درسی که فاقد status هستند ذاتاً approved هستند
    const approvedQuestions = nonFlaggedQuestions.filter(
      (q) => !q.status || q.status === 'approved'
    );

    // ۳. اگر تعداد سوالات تاییدشده برای اجرای آزمون کافی باشد (حداقل ۳ عدد)، فقط approved ها را نشان بده
    if (approvedQuestions.length >= 3 || nonFlaggedQuestions.length === approvedQuestions.length) {
      return approvedQuestions;
    }

    // ۴. اگر تعداد سوالات تاییدشده کم بود، موقتاً draft را نشان بده ولی در لاگ هشدار بده
    console.warn(
      `[QuestionBankService:QualityGate] تعداد سوالات تاییدشده فصل «${chapterId}» کم است (${approvedQuestions.length} مورد). استفاده موقت از سوالات پیش‌نویس (draft).`,
      { chapterId, approvedCount: approvedQuestions.length, totalAvailable: nonFlaggedQuestions.length }
    );

    return nonFlaggedQuestions;
  }

  /**
   * ذخیره سوال جدید با معماری تفکیک‌شده و آپدیت اتمیک شمارنده‌ها
   */
  async saveNewQuestions(
    chapterId: ChapterId,
    difficulty: QuestionDifficulty,
    incoming: QuizQuestion[]
  ): Promise<QuizQuestion[]> {
    this.initHashesIfNeeded();

    if (!Array.isArray(incoming) || incoming.length === 0) {
      return [];
    }

    const kv = await getSafeKvClient();
    const validFreshQuestions: QuizQuestion[] = [];
    const newIds: string[] = [];

    for (const q of incoming) {
      if (!q || !q.question) continue;
      const hash = generateQuestionHash(q.question);

      if (await this.isDuplicate(hash, kv)) {
        continue;
      }

      this.knownHashes.add(hash);
      const questionId =
        q.id || `gen_${chapterId}_${difficulty}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

      const enrichedQuestion: QuizQuestion = {
        ...q,
        id: questionId,
        chapterId,
        difficulty,
        status: q.status || 'draft', // تولیدات جدید ابتدا در وضعیت draft ذخیره می‌شوند
        createdAt: q.createdAt || new Date().toISOString(),
        timesShown: q.timesShown ?? 0,
        timesCorrect: q.timesCorrect ?? 0,
      };

      validFreshQuestions.push(enrichedQuestion);
      newIds.push(questionId);

      // ذخیره منفرد سوال و هش
      if (kv && typeof kv.set === 'function') {
        try {
          await kv.set(`q:${questionId}`, enrichedQuestion);
          await kv.set(`hash:${hash}`, questionId);
        } catch (err) {
          console.warn(`[KV] Error saving question item q:${questionId}:`, err);
        }
      } else {
        this.inMemoryQuestions.set(`q:${questionId}`, enrichedQuestion);
        this.inMemoryHashes.set(hash, questionId);
      }
    }

    if (validFreshQuestions.length === 0) {
      return [];
    }

    // به‌روزرسانی لیست شناسه‌ها
    const listKey = `list:${chapterId}:${difficulty}`;
    if (kv && typeof kv.get === 'function' && typeof kv.set === 'function') {
      try {
        const existingIds: string[] = (await kv.get(listKey)) || [];
        const mergedIds = Array.from(new Set([...existingIds, ...newIds]));
        await kv.set(listKey, mergedIds);

        // افزایش اتمیک شمارنده‌ها بدون خواندن کل ساختار
        if (typeof kv.incrby === 'function') {
          await kv.incrby('stats:total', validFreshQuestions.length);
          await kv.incrby(`stats:${chapterId}`, validFreshQuestions.length);
          await kv.incrby(`stats:${chapterId}:${difficulty}`, validFreshQuestions.length);
        }
      } catch (err) {
        console.warn(`[KV] Error updating ID list for ${listKey}:`, err);
      }
    } else {
      const existing = this.inMemoryLists.get(listKey) || [];
      this.inMemoryLists.set(listKey, Array.from(new Set([...existing, ...newIds])));

      this.inMemoryCounters.set('stats:total', (this.inMemoryCounters.get('stats:total') || 0) + validFreshQuestions.length);
      this.inMemoryCounters.set(`stats:${chapterId}`, (this.inMemoryCounters.get(`stats:${chapterId}`) || 0) + validFreshQuestions.length);
      this.inMemoryCounters.set(`stats:${chapterId}:${difficulty}`, (this.inMemoryCounters.get(`stats:${chapterId}:${difficulty}`) || 0) + validFreshQuestions.length);
    }

    return validFreshQuestions;
  }

  /**
   * متد هوشمند دریافت سوالات تصادفی با اولویت سوالات کمتر دیده شده (Weighted Random Selection)
   */
  async getRandomQuestions(
    chapterId: ChapterId,
    difficulty?: QuestionDifficulty,
    count: number = 5
  ): Promise<QuizQuestion[]> {
    const all = await this.getQuestions(chapterId, difficulty);
    if (all.length === 0) return [];

    // اولویت به سوالاتی که timesShown کمتری دارند همراه با شانس نوسان تصادفی (Jitter)
    const scored = all.map((q) => ({
      question: q,
      score: (q.timesShown || 0) + Math.random() * 2.5,
    }));

    scored.sort((a, b) => a.score - b.score);
    const selected = scored.slice(0, count).map((item) => item.question);

    // افزایش غیرمسدودکننده شمارنده دفعات نمایش در پس‌زمینه (Fire-and-forget)
    this.recordImpressions(selected.map((q) => q.id)).catch(() => {});

    return selected;
  }

  /**
   * ثبت نمایش سوال برای تعادل الگوریتم تصادفی
   */
  async recordImpressions(questionIds: string[]): Promise<void> {
    if (!questionIds || questionIds.length === 0) return;
    const kv = await getSafeKvClient();

    for (const id of questionIds) {
      if (kv && typeof kv.get === 'function' && typeof kv.set === 'function') {
        try {
          const item: QuizQuestion = await kv.get(`q:${id}`);
          if (item) {
            item.timesShown = (item.timesShown || 0) + 1;
            await kv.set(`q:${id}`, item);
          }
        } catch (e) {
          // خطای نمایش غیربحرانی است
        }
      } else {
        const item = this.inMemoryQuestions.get(`q:${id}`);
        if (item) {
          item.timesShown = (item.timesShown || 0) + 1;
        }
      }
    }
  }

  /**
   * ثبت پاسخ درست/غلط دانش‌آموز برای سنجش سختی واقعی
   */
  async recordAnswer(questionId: string, isCorrect: boolean): Promise<void> {
    const kv = await getSafeKvClient();
    if (kv && typeof kv.get === 'function' && typeof kv.set === 'function') {
      try {
        const item: QuizQuestion = await kv.get(`q:${questionId}`);
        if (item) {
          if (isCorrect) {
            item.timesCorrect = (item.timesCorrect || 0) + 1;
          }
          await kv.set(`q:${questionId}`, item);
        }
      } catch (e) {}
    } else {
      const item = this.inMemoryQuestions.get(`q:${questionId}`);
      if (item && isCorrect) {
        item.timesCorrect = (item.timesCorrect || 0) + 1;
      }
    }
  }

  /**
   * گزارش خطا در سوال توسط کاربر یا سیستم و خروج فوری آن از چرخه فعال آزمون
   */
  async flagQuestion(questionId: string, reason?: string): Promise<QuizQuestion | null> {
    const kv = await getSafeKvClient();
    const key = `q:${questionId}`;
    let item: QuizQuestion | null = null;

    if (kv && typeof kv.get === 'function') {
      try {
        item = await kv.get(key);
      } catch (err) {
        console.warn('[KV] Error getting question for flag:', err);
      }
    } else {
      item = this.inMemoryQuestions.get(key) || null;
    }

    // اگر سوال در KV نبود، در صورت وجود در سوالات پایه درسی یک کپی از آن می‌سازیم
    if (!item) {
      for (const ch of ALL_CHAPTERS) {
        const found = (SAMPLE_QUIZZES[ch] || []).find((q) => q.id === questionId);
        if (found) {
          item = { ...found };
          break;
        }
      }
    }

    if (!item) {
      console.warn(`[QuestionBankService:QualityGate] Question not found to flag: ${questionId}`);
      return null;
    }

    item.status = 'flagged';
    item.flaggedReason = reason || 'گزارش اشکال توسط کاربر';
    item.flaggedAt = new Date().toISOString();

    if (kv && typeof kv.set === 'function') {
      try {
        await kv.set(key, item);
      } catch (err) {
        console.warn('[KV] Error saving flagged question:', err);
      }
    }
    this.inMemoryQuestions.set(key, item);

    console.info(`[QuestionBankService:QualityGate] سوال با شناسه ${questionId} پرچم‌گذاری و قرنطینه شد:`, { reason });
    return item;
  }

  /**
   * تایید رسمی کیفیت سوال توسط کارشناس یا ادمین
   */
  async approveQuestion(questionId: string): Promise<QuizQuestion | null> {
    const kv = await getSafeKvClient();
    const key = `q:${questionId}`;
    let item: QuizQuestion | null = null;

    if (kv && typeof kv.get === 'function') {
      try {
        item = await kv.get(key);
      } catch (err) {}
    } else {
      item = this.inMemoryQuestions.get(key) || null;
    }

    if (!item) {
      for (const ch of ALL_CHAPTERS) {
        const found = (SAMPLE_QUIZZES[ch] || []).find((q) => q.id === questionId);
        if (found) {
          item = { ...found };
          break;
        }
      }
    }

    if (!item) return null;

    item.status = 'approved';
    item.approvedAt = new Date().toISOString();
    delete item.flaggedReason;

    if (kv && typeof kv.set === 'function') {
      try {
        await kv.set(key, item);
      } catch (err) {}
    }
    this.inMemoryQuestions.set(key, item);

    console.info(`[QuestionBankService:QualityGate] سوال با شناسه ${questionId} تایید شد.`);
    return item;
  }

  /**
   * رد سوال و خروج دائمی آن از بانک
   */
  async rejectQuestion(questionId: string, reason?: string): Promise<QuizQuestion | null> {
    const kv = await getSafeKvClient();
    const key = `q:${questionId}`;
    let item: QuizQuestion | null = null;

    if (kv && typeof kv.get === 'function') {
      try {
        item = await kv.get(key);
      } catch (err) {}
    } else {
      item = this.inMemoryQuestions.get(key) || null;
    }

    if (!item) return null;

    item.status = 'rejected';
    item.flaggedReason = reason || 'رد توسط کارشناس محتوا';

    if (kv && typeof kv.set === 'function') {
      try {
        await kv.set(key, item);
      } catch (err) {}
    }
    this.inMemoryQuestions.set(key, item);

    return item;
  }

  /**
   * دریافت آمار فوق‌سریع مستقیماً از شمارنده‌های KV (بدون اسکن ۲۴تایی سنگین)
   */
  async getStats(): Promise<QuestionBankStats> {
    const kv = await getSafeKvClient();

    // محاسبه آمار اولیه از سوالات پایه در حافظه
    let baseTotal = 0;
    const byChapter: Record<string, number> = {};
    const byDifficulty: Record<QuestionDifficulty, number> = { easy: 0, medium: 0, hard: 0 };

    for (const ch of ALL_CHAPTERS) {
      const list = SAMPLE_QUIZZES[ch] || [];
      byChapter[ch] = list.length;
      baseTotal += list.length;

      for (const diff of ALL_DIFFICULTIES) {
        const count = list.filter((q) => q.difficulty === diff).length;
        byDifficulty[diff] += count;
      }
    }

    if (kv && typeof kv.mget === 'function') {
      try {
        // خواندن همزمان تمام کلیدهای آماری در ۱ درخواست سبک (Single Round-Trip)
        const chapterKeys = ALL_CHAPTERS.map((ch) => `stats:${ch}`);
        const diffKeys: string[] = [];
        for (const ch of ALL_CHAPTERS) {
          for (const d of ALL_DIFFICULTIES) {
            diffKeys.push(`stats:${ch}:${d}`);
          }
        }

        const allKeys = ['stats:total', ...chapterKeys, ...diffKeys];
        const values = await kv.mget(...allKeys);

        const kvTotal = Number(values[0]) || 0;
        let index = 1;

        for (const ch of ALL_CHAPTERS) {
          const chVal = Number(values[index++]) || 0;
          byChapter[ch] += chVal;
        }

        for (const ch of ALL_CHAPTERS) {
          for (const d of ALL_DIFFICULTIES) {
            const diffVal = Number(values[index++]) || 0;
            byDifficulty[d] += diffVal;
          }
        }

        return {
          totalQuestions: baseTotal + kvTotal,
          byChapter,
          byDifficulty,
        };
      } catch (err) {
        console.warn('[QuestionBankService] Failed to read atomic stats from KV, calculating from lists:', err);
      }
    }

    // فال‌بک در حالت بدون KV: استفاده از شمارنده‌های محلی
    const kvTotalMem = this.inMemoryCounters.get('stats:total') || 0;
    for (const ch of ALL_CHAPTERS) {
      byChapter[ch] += this.inMemoryCounters.get(`stats:${ch}`) || 0;
      for (const d of ALL_DIFFICULTIES) {
        byDifficulty[d] += this.inMemoryCounters.get(`stats:${ch}:${d}`) || 0;
      }
    }

    return {
      totalQuestions: baseTotal + kvTotalMem,
      byChapter,
      byDifficulty,
    };
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
}

// Lazy Singleton Pattern
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
