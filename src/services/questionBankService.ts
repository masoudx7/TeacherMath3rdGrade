/**
 * Question Bank Service & Normalized Lightweight Storage
 * ساختار دیتابیس نرمال‌سازی‌شده، سبک و پایدار (Vercel KV + دیتابیس فایل محلی روی دیسک تا ۵۰۰۰ سوال)
 * 
 * ساختار کلیدها:
 * - q:{questionId}                     -> آبجکت کامل سوال
 * - list:{chapterId}:{difficulty}      -> آرایه شناسه‌های سوالات
 * - hash:{hash}                        -> شناسه سوال جهت ضدتکرار دائمی
 * - stats:total                        -> شمارنده اتمیک مجموع سوالات
 * - stats:{chapterId}                  -> شمارنده اتمیک فصل
 * - stats:{chapterId}:{difficulty}     -> شمارنده اتمیک فصل و سطح دشواری
 */

import fs from 'fs';
import path from 'path';
import { QuizQuestion, ChapterId, QuestionDifficulty } from '../types';
import { SAMPLE_QUIZZES, CHAPTERS } from '../data/curriculum';

export const MAX_BANK_QUESTIONS = 5000;
export const MAX_PER_CHAPTER = 625; // 8 chapters * 625 = 5000

export interface GenerateBatchParams {
  chapterId: ChapterId;
  difficulty: QuestionDifficulty;
  count?: number;
  existingTitles?: string[];
}

export interface QuestionBankStats {
  totalQuestions: number;
  maxQuestions: number;
  remainingCapacity: number;
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
const LOCAL_DB_DIR = path.join(process.cwd(), 'data');
const LOCAL_DB_FILE = path.join(LOCAL_DB_DIR, 'question-bank.json');
const SEEDED_PUBLIC_FILE = path.join(process.cwd(), 'public', 'data', 'seeded-questions.json');

interface DiskDatabaseSchema {
  version: number;
  updatedAt: string;
  questions: QuizQuestion[];
}

// سیستم نرمال‌سازی متن جهت جلوگیری قطعی از تولید سوال تکراری
export function normalizeQuestionText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString())
    .replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString())
    .replace(/[\s\u200c\-_،,.:;؟!]/g, '')
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

export function isValidQuizQuestion(q: any): q is QuizQuestion {
  if (!q || typeof q.question !== 'string' || q.question.trim().length < 6) return false;
  if (!Array.isArray(q.options) || q.options.length !== 4) return false;
  const cleanOpts = q.options.map((o: any) => (typeof o === 'string' ? o.trim() : '')).filter(Boolean);
  if (cleanOpts.length !== 4) return false;
  if (new Set(cleanOpts).size < 4) return false;
  if (typeof q.correctAnswerIndex !== 'number' || q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) {
    return false;
  }
  return true;
}

export const COMPACT_QUESTION_SYSTEM_PROMPT =
  'طراح سوال ریاضی سوم دبستان ایران. قوانین: ارقام فارسی (۰-۹)، ۴ گزینه متمایز، correctAnswerIndex بین ۰ تا ۳، مثال‌های ملموس ایرانی. خروجی فقط آرایه JSON معتبر.';

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
    console.warn('[QuestionBankService] Failed to load @vercel/kv dynamically, using disk/memory store:', err);
    return null;
  }
}

export class QuestionBankService {
  private inMemoryQuestions = new Map<string, QuizQuestion>();
  private inMemoryLists = new Map<string, string[]>();
  private inMemoryHashes = new Map<string, string>();
  private inMemoryCounters = new Map<string, number>();
  private knownHashes = new Set<string>();
  private initialized = false;
  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {}

  private initStoreIfNeeded(): void {
    if (this.initialized) return;
    this.initialized = true;

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

    // بارگذاری سوالات پیش‌پرشدۀ احتمالی از public/data/seeded-questions.json
    this.loadSeededPublicFile();
    // بارگذاری دیتابیس پایدار فایل محلی از data/question-bank.json
    this.loadFromDiskDatabase();
  }

  private indexLocalQuestion(item: QuizQuestion): void {
    if (!item || !item.id || !item.question) return;
    const ch: ChapterId = ALL_CHAPTERS.includes(item.chapterId) ? item.chapterId : 'patterns';
    const diff: QuestionDifficulty = ALL_DIFFICULTIES.includes(item.difficulty as QuestionDifficulty)
      ? (item.difficulty as QuestionDifficulty)
      : 'medium';

    const key = `q:${item.id}`;
    const alreadyStored = this.inMemoryQuestions.has(key);
    this.inMemoryQuestions.set(key, { ...item, chapterId: ch, difficulty: diff });

    const hash = generateQuestionHash(item.question);
    this.knownHashes.add(hash);
    this.inMemoryHashes.set(hash, item.id);

    const listKey = `list:${ch}:${diff}`;
    const existingList = this.inMemoryLists.get(listKey) || [];
    if (!existingList.includes(item.id)) {
      existingList.push(item.id);
      this.inMemoryLists.set(listKey, existingList);

      // فقط اگر سوال پایه کتاب درسی نباشد به شمارنده تولیدشده اضافه شود
      const isBaseQuestion = (SAMPLE_QUIZZES[ch] || []).some((bq) => bq.id === item.id);
      if (!alreadyStored && !isBaseQuestion) {
        this.inMemoryCounters.set('stats:total', (this.inMemoryCounters.get('stats:total') || 0) + 1);
        this.inMemoryCounters.set(`stats:${ch}`, (this.inMemoryCounters.get(`stats:${ch}`) || 0) + 1);
        this.inMemoryCounters.set(`stats:${ch}:${diff}`, (this.inMemoryCounters.get(`stats:${ch}:${diff}`) || 0) + 1);
      }
    }
  }

  private loadSeededPublicFile(): void {
    try {
      if (!fs.existsSync(SEEDED_PUBLIC_FILE)) return;
      const raw = fs.readFileSync(SEEDED_PUBLIC_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        Object.values(parsed).flat().forEach((q: any) => {
          if (q && q.id && q.question) {
            this.indexLocalQuestion({ ...q, status: q.status || 'approved' });
          }
        });
      }
    } catch (err) {
      // فایل اختیاری است
    }
  }

  private loadFromDiskDatabase(): void {
    try {
      if (!fs.existsSync(LOCAL_DB_FILE)) return;
      const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf8');
      const parsed: DiskDatabaseSchema = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.questions)) {
        for (const q of parsed.questions) {
          this.indexLocalQuestion(q);
        }
        console.info(`[QuestionBankService] Loaded ${parsed.questions.length} persistent questions from disk database.`);
      }
    } catch (err) {
      console.warn('[QuestionBankService] Could not load disk database:', err);
    }
  }

  private schedulePersistToDisk(): void {
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
    }
    this.persistTimer = setTimeout(() => {
      this.persistToDiskNow();
    }, 250);
  }

  private persistToDiskNow(): void {
    try {
      if (!fs.existsSync(LOCAL_DB_DIR)) {
        fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
      }
      const allStored = Array.from(this.inMemoryQuestions.values());
      const payload: DiskDatabaseSchema = {
        version: 1,
        updatedAt: new Date().toISOString(),
        questions: allStored,
      };
      const tmpFile = `${LOCAL_DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(payload), 'utf8');
      fs.renameSync(tmpFile, LOCAL_DB_FILE);
    } catch (err) {
      // در محیط‌های read-only (مانند Vercel Serverless) صرفاً چشم‌پوشی می‌شود
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

        const legacyKey = `questions:${chapterId}:${difficulty}`;
        const legacyQuestions: QuizQuestion[] = await kv.get(legacyKey);
        if (Array.isArray(legacyQuestions) && legacyQuestions.length > 0) {
          const migratedIds: string[] = [];
          for (const item of legacyQuestions) {
            if (!item || !item.id) continue;
            migratedIds.push(item.id);
            await kv.set(`q:${item.id}`, item);
            const hash = generateQuestionHash(item.question);
            await kv.set(`hash:${hash}`, item.id);
            this.knownHashes.add(hash);
          }

          await kv.set(listKey, migratedIds);
          if (typeof kv.incrby === 'function') {
            await kv.incrby('stats:total', migratedIds.length);
            await kv.incrby(`stats:${chapterId}`, migratedIds.length);
            await kv.incrby(`stats:${chapterId}:${difficulty}`, migratedIds.length);
          }

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

  private async fetchKvQuestionsChunked(kv: any, ids: string[]): Promise<QuizQuestion[]> {
    if (!ids || ids.length === 0) return [];
    const results: QuizQuestion[] = [];
    const CHUNK_SIZE = 100;

    for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
      const slice = ids.slice(i, i + CHUNK_SIZE);
      const keys = slice.map((id) => `q:${id}`);
      if (typeof kv.mget === 'function') {
        try {
          const chunkRes = await kv.mget(...keys);
          if (Array.isArray(chunkRes)) {
            results.push(...(chunkRes.filter(Boolean) as QuizQuestion[]));
          }
          continue;
        } catch (err) {
          console.warn('[KV] chunked mget failed, falling back to get:', err);
        }
      }
      const fallbackItems = await Promise.all(keys.map((k) => kv.get(k).catch(() => null)));
      results.push(...(fallbackItems.filter(Boolean) as QuizQuestion[]));
    }

    return results;
  }

  /**
   * دریافت مجموع سوالات یک فصل با سطح دشواری مشخص یا کل فصول
   */
  async getQuestions(chapterId: ChapterId, difficulty?: QuestionDifficulty): Promise<QuizQuestion[]> {
    this.initStoreIfNeeded();

    // ۱. دریافت سوالات پایه آفلاین از سرفصل درسی
    const chapterList = SAMPLE_QUIZZES[chapterId] || [];
    const baseQuestionsRaw = chapterList.filter((q) => {
      return difficulty ? q.difficulty === difficulty : true;
    });

    const kv = await getSafeKvClient();

    // بررسی آیا سوال پایه وضعیت متفاوتی (مانند flagged) در حافظه/KV دارد یا خیر
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

    let storedQuestions: QuizQuestion[] = [];
    if (allFetchedIds.length > 0) {
      if (kv) {
        storedQuestions = await this.fetchKvQuestionsChunked(kv, allFetchedIds);
      } else {
        storedQuestions = allFetchedIds
          .map((id) => this.inMemoryQuestions.get(`q:${id}`))
          .filter(Boolean) as QuizQuestion[];
      }
    }

    // ادغام و یکتاسازی بر اساس هش
    const all = [...baseQuestions, ...storedQuestions];
    const uniqueMap = new Map<string, QuizQuestion>();
    all.forEach((q) => {
      if (!q || !q.question) return;
      const hash = generateQuestionHash(q.question);
      if (!uniqueMap.has(hash)) {
        uniqueMap.set(hash, q);
      }
    });

    // بازگرداندن تمام سوالات فعال (سوالات flagged و rejected حذف می‌شوند)
    return Array.from(uniqueMap.values()).filter(
      (q) => q.status !== 'flagged' && q.status !== 'rejected'
    );
  }

  /**
   * دریافت کل بانک سوالات برای همگام‌سازی آفلاین دستگاه (تا ۵۰۰۰ سوال)
   */
  async getAllExportQuestions(): Promise<QuizQuestion[]> {
    this.initStoreIfNeeded();
    const perChapter = await Promise.all(ALL_CHAPTERS.map((ch) => this.getQuestions(ch)));
    const flat = perChapter.flat();
    const dedup = new Map<string, QuizQuestion>();
    for (const q of flat) {
      if (!q || !q.id) continue;
      if (!dedup.has(q.id)) {
        dedup.set(q.id, q);
      }
    }
    return Array.from(dedup.values()).slice(0, MAX_BANK_QUESTIONS);
  }

  /**
   * انتخاب هوشمند فصل و سطح دشواری با کمترین سوال جهت رشد متوازن تا ۵۰۰۰ سوال
   */
  async pickNextGrowthTarget(): Promise<{ chapterId: ChapterId; difficulty: QuestionDifficulty; stats: QuestionBankStats }> {
    const stats = await this.getStats();
    let bestChapter: ChapterId = 'patterns';
    let bestDifficulty: QuestionDifficulty = 'medium';
    let minCount = Number.MAX_SAFE_INTEGER;

    // جستجوی سطل (فصل + سطح) با کمترین سوال
    for (const ch of ALL_CHAPTERS) {
      for (const diff of ALL_DIFFICULTIES) {
        const list = await this.getQuestions(ch, diff);
        if (list.length < minCount) {
          minCount = list.length;
          bestChapter = ch;
          bestDifficulty = diff;
        }
      }
    }

    return { chapterId: bestChapter, difficulty: bestDifficulty, stats };
  }

  /**
   * ذخیره سوال جدید با رعایت سقف ۵۰۰۰ سوال، اعتبارسنجی ساختار و ذخیره‌سازی پایدار روی دیسک + KV
   */
  async saveNewQuestions(
    chapterId: ChapterId,
    difficulty: QuestionDifficulty,
    incoming: QuizQuestion[]
  ): Promise<QuizQuestion[]> {
    this.initStoreIfNeeded();

    if (!Array.isArray(incoming) || incoming.length === 0) {
      return [];
    }

    const currentStats = await this.getStats();
    if (currentStats.remainingCapacity <= 0) {
      return [];
    }

    const kv = await getSafeKvClient();
    const validFreshQuestions: QuizQuestion[] = [];
    const newIds: string[] = [];
    let allowedLeft = currentStats.remainingCapacity;

    for (const q of incoming) {
      if (allowedLeft <= 0) break;
      if (!isValidQuizQuestion(q)) continue;

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
        status: q.status || 'approved',
        createdAt: q.createdAt || new Date().toISOString(),
        timesShown: q.timesShown ?? 0,
        timesCorrect: q.timesCorrect ?? 0,
      };

      validFreshQuestions.push(enrichedQuestion);
      newIds.push(questionId);
      allowedLeft--;

      // ذخیره در حافظه و دیسک محلی
      this.inMemoryQuestions.set(`q:${questionId}`, enrichedQuestion);
      this.inMemoryHashes.set(hash, questionId);

      // ذخیره در Vercel KV در صورت فعال بودن
      if (kv && typeof kv.set === 'function') {
        try {
          await kv.set(`q:${questionId}`, enrichedQuestion);
          await kv.set(`hash:${hash}`, questionId);
        } catch (err) {
          console.warn(`[KV] Error saving question item q:${questionId}:`, err);
        }
      }
    }

    if (validFreshQuestions.length === 0) {
      return [];
    }

    // به‌روزرسانی لیست شناسه‌ها و شمارنده‌ها
    const listKey = `list:${chapterId}:${difficulty}`;
    const existingLocalList = this.inMemoryLists.get(listKey) || [];
    this.inMemoryLists.set(listKey, Array.from(new Set([...existingLocalList, ...newIds])));

    this.inMemoryCounters.set('stats:total', (this.inMemoryCounters.get('stats:total') || 0) + validFreshQuestions.length);
    this.inMemoryCounters.set(`stats:${chapterId}`, (this.inMemoryCounters.get(`stats:${chapterId}`) || 0) + validFreshQuestions.length);
    this.inMemoryCounters.set(`stats:${chapterId}:${difficulty}`, (this.inMemoryCounters.get(`stats:${chapterId}:${difficulty}`) || 0) + validFreshQuestions.length);

    if (kv && typeof kv.get === 'function' && typeof kv.set === 'function') {
      try {
        const existingIds: string[] = (await kv.get(listKey)) || [];
        const mergedIds = Array.from(new Set([...existingIds, ...newIds]));
        await kv.set(listKey, mergedIds);

        if (typeof kv.incrby === 'function') {
          await kv.incrby('stats:total', validFreshQuestions.length);
          await kv.incrby(`stats:${chapterId}`, validFreshQuestions.length);
          await kv.incrby(`stats:${chapterId}:${difficulty}`, validFreshQuestions.length);
        }
      } catch (err) {
        console.warn(`[KV] Error updating ID list for ${listKey}:`, err);
      }
    }

    // ذخیره پایدار روی فایل دیتابیس دیسک
    this.persistToDiskNow();

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

    const scored = all.map((q) => ({
      question: q,
      score: (q.timesShown || 0) + Math.random() * 2.5,
    }));

    scored.sort((a, b) => a.score - b.score);
    const selected = scored.slice(0, count).map((item) => item.question);

    this.recordImpressions(selected.map((q) => q.id)).catch(() => {});

    return selected;
  }

  async recordImpressions(questionIds: string[]): Promise<void> {
    if (!questionIds || questionIds.length === 0) return;
    this.initStoreIfNeeded();
    const kv = await getSafeKvClient();

    let modifiedLocal = false;
    for (const id of questionIds) {
      const localItem = this.inMemoryQuestions.get(`q:${id}`);
      if (localItem) {
        localItem.timesShown = (localItem.timesShown || 0) + 1;
        modifiedLocal = true;
      }

      if (kv && typeof kv.get === 'function' && typeof kv.set === 'function') {
        try {
          const item: QuizQuestion = await kv.get(`q:${id}`);
          if (item) {
            item.timesShown = (item.timesShown || 0) + 1;
            await kv.set(`q:${id}`, item);
          }
        } catch {}
      }
    }

    if (modifiedLocal) {
      this.schedulePersistToDisk();
    }
  }

  async recordAnswer(questionId: string, isCorrect: boolean): Promise<void> {
    this.initStoreIfNeeded();
    const kv = await getSafeKvClient();

    const localItem = this.inMemoryQuestions.get(`q:${questionId}`);
    if (localItem && isCorrect) {
      localItem.timesCorrect = (localItem.timesCorrect || 0) + 1;
      this.schedulePersistToDisk();
    }

    if (kv && typeof kv.get === 'function' && typeof kv.set === 'function') {
      try {
        const item: QuizQuestion = await kv.get(`q:${questionId}`);
        if (item) {
          if (isCorrect) {
            item.timesCorrect = (item.timesCorrect || 0) + 1;
          }
          await kv.set(`q:${questionId}`, item);
        }
      } catch {}
    }
  }

  async flagQuestion(questionId: string, reason?: string): Promise<QuizQuestion | null> {
    this.initStoreIfNeeded();
    const kv = await getSafeKvClient();
    const key = `q:${questionId}`;
    let item: QuizQuestion | null = this.inMemoryQuestions.get(key) || null;

    if (!item && kv && typeof kv.get === 'function') {
      try {
        item = await kv.get(key);
      } catch (err) {
        console.warn('[KV] Error getting question for flag:', err);
      }
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
    this.persistToDiskNow();

    console.info(`[QuestionBankService:QualityGate] سوال با شناسه ${questionId} پرچم‌گذاری و قرنطینه شد:`, { reason });
    return item;
  }

  async approveQuestion(questionId: string): Promise<QuizQuestion | null> {
    this.initStoreIfNeeded();
    const kv = await getSafeKvClient();
    const key = `q:${questionId}`;
    let item: QuizQuestion | null = this.inMemoryQuestions.get(key) || null;

    if (!item && kv && typeof kv.get === 'function') {
      try {
        item = await kv.get(key);
      } catch {}
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
      } catch {}
    }
    this.inMemoryQuestions.set(key, item);
    this.persistToDiskNow();

    return item;
  }

  async rejectQuestion(questionId: string, reason?: string): Promise<QuizQuestion | null> {
    this.initStoreIfNeeded();
    const kv = await getSafeKvClient();
    const key = `q:${questionId}`;
    let item: QuizQuestion | null = this.inMemoryQuestions.get(key) || null;

    if (!item && kv && typeof kv.get === 'function') {
      try {
        item = await kv.get(key);
      } catch {}
    }

    if (!item) return null;

    item.status = 'rejected';
    item.flaggedReason = reason || 'رد توسط کارشناس محتوا';

    if (kv && typeof kv.set === 'function') {
      try {
        await kv.set(key, item);
      } catch {}
    }
    this.inMemoryQuestions.set(key, item);
    this.persistToDiskNow();

    return item;
  }

  async getStats(): Promise<QuestionBankStats> {
    this.initStoreIfNeeded();
    const kv = await getSafeKvClient();

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

        const totalQuestions = baseTotal + kvTotal;
        return {
          totalQuestions,
          maxQuestions: MAX_BANK_QUESTIONS,
          remainingCapacity: Math.max(0, MAX_BANK_QUESTIONS - totalQuestions),
          byChapter,
          byDifficulty,
        };
      } catch (err) {
        console.warn('[QuestionBankService] Failed to read atomic stats from KV:', err);
      }
    }

    const memTotal = this.inMemoryCounters.get('stats:total') || 0;
    for (const ch of ALL_CHAPTERS) {
      byChapter[ch] += this.inMemoryCounters.get(`stats:${ch}`) || 0;
      for (const d of ALL_DIFFICULTIES) {
        byDifficulty[d] += this.inMemoryCounters.get(`stats:${ch}:${d}`) || 0;
      }
    }

    const totalQuestions = baseTotal + memTotal;
    return {
      totalQuestions,
      maxQuestions: MAX_BANK_QUESTIONS,
      remainingCapacity: Math.max(0, MAX_BANK_QUESTIONS - totalQuestions),
      byChapter,
      byDifficulty,
    };
  }

  buildPromptForBatch(
    chapterId: ChapterId,
    difficulty: QuestionDifficulty,
    recentTitles: string[] = [],
    count: number = 5
  ): string {
    const chapterMeta = CHAPTERS.find((c) => c.id === chapterId);
    const chapterName = chapterMeta ? chapterMeta.title : chapterId;
    const safeCount = Math.min(5, Math.max(3, count));
    const avoidanceText =
      recentTitles.length > 0
        ? `\nتکراری نباشد با:\n${recentTitles
            .slice(-5)
            .map((t) => `- ${t.slice(0, 75)}`)
            .join('\n')}`
        : '';

    return `${safeCount} سوال چهارگزینه‌ای ریاضی سوم دبستان فصل «${chapterName}» سطح «${difficulty}» بساز.${avoidanceText}
فرمت آرایه JSON: [{"question":"","options":["","","",""],"correctAnswerIndex":0,"hint":"","explanation":""}]`;
  }

  /**
   * مولد الگوریتمی سوالات استاندارد ریاضی سوم دبستان (تضمین ۱۰۰٪ صحت ریاضی در زمان آفلاین یا خطای مدل‌های هوش مصنوعی)
   */
  generateDeterministicBatch(
    chapterId: ChapterId,
    difficulty: QuestionDifficulty = 'medium',
    count: number = 5
  ): QuizQuestion[] {
    this.initStoreIfNeeded();
    const fa = (n: number | string) =>
      String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const buildUniqueOptions = (correctText: string, candidates: string[]): { options: string[]; correctAnswerIndex: number } => {
      const set = new Set<string>([correctText]);
      for (const c of candidates) {
        if (set.size >= 4) break;
        if (c && c !== correctText) set.add(c);
      }
      let pad = 1;
      while (set.size < 4) {
        set.add(`${correctText} (${fa(pad++)})`);
      }
      const list = Array.from(set).slice(0, 4).sort(() => Math.random() - 0.5);
      return { options: list, correctAnswerIndex: list.indexOf(correctText) };
    };

    const items = ['مداد', 'شکلات', 'سیب', 'دفتر', 'بادکنک', 'گلوله تیله', 'بستنی', 'نان بربری', 'گل', 'کارت امتیاز'];
    const names = ['علی', 'سارا', 'کیان', 'آوا', 'امیررضا', 'رها', 'محمدامین', 'فاطمه'];
    const results: QuizQuestion[] = [];
    const safeCount = Math.min(8, Math.max(1, count));
    let attempts = 0;

    while (results.length < safeCount && attempts < safeCount * 8) {
      attempts++;
      let question = '';
      let correctText = '';
      let distractors: string[] = [];
      let hint = '';
      let explanation = '';

      if (chapterId === 'patterns') {
        if (Math.random() < 0.65) {
          const start = difficulty === 'easy' ? rand(2, 20) : rand(10, 120);
          const step = difficulty === 'easy' ? pick([2, 3, 4, 5, 10]) : pick([6, 7, 8, 9, 12, 15, 25]);
          const seq = [start, start + step, start + step * 2, start + step * 3];
          const ans = start + step * 4;
          question = `در الگوی عددی روبه‌رو، عدد بعدی کدام است؟ ${seq.map(fa).join(' ، ')} ، ___`;
          correctText = fa(ans);
          distractors = [fa(ans + 1), fa(ans - step), fa(ans + step), fa(ans - 2), fa(ans + 2)];
          hint = `ببین بین هر دو عدد متوالی چند واحد اضافه شده است.`;
          explanation = `در این الگو هر مرحله ${fa(step)} واحد به عدد قبلی اضافه می‌شود. پس ${fa(seq[3])} + ${fa(step)} = ${fa(ans)} می‌شود.`;
        } else {
          const hour = rand(1, 11);
          const min = pick([15, 30, 45]);
          const nextHour = hour === 12 ? 1 : hour + 1;
          const label = min === 15 ? 'یک ربع' : min === 30 ? 'نیم ساعت' : 'سه ربع';
          question = `اگر ساعت الان ${fa(hour)} باشد و ${label} بگذرد، ساعت چند می‌شود؟`;
          correctText = `${fa(hour)}:${fa(min)}`;
          distractors = [`${fa(nextHour)}:${fa(min)}`, `${fa(hour)}:${fa(min === 15 ? 30 : 15)}`, `${fa(hour)}:۰۰`, `${fa(hour)}:${fa(min === 45 ? 30 : 45)}`];
          hint = `${label} برابر با ${fa(min)} دقیقه است.`;
          explanation = `با گذشت ${fa(min)} دقیقه از ساعت ${fa(hour)}، عقربه ساعت دقیقاً ساعت ${fa(hour)} و ${fa(min)} دقیقه را نشان می‌دهد.`;
        }
      } else if (chapterId === 'place_value') {
        const mode = rand(1, 3);
        if (mode === 1) {
          const th = rand(1, 9);
          const hu = rand(0, 9);
          const te = rand(0, 9);
          const on = rand(1, 9);
          const num = th * 1000 + hu * 100 + te * 10 + on;
          const place = pick([
            { name: 'هزارگان', val: th * 1000, d: [th, th * 100, th * 10] },
            { name: 'صدگان', val: hu * 100, d: [hu, hu * 10, hu * 1000] },
            { name: 'دهگان', val: te * 10, d: [te, te * 100, te * 1000] },
          ]);
          question = `در عدد ۴ رقمی ${fa(num)}، ارزش مکانی رقم «${fa(place.name === 'هزارگان' ? th : place.name === 'صدگان' ? hu : te)}» در مرتبه ${place.name} چقدر است؟`;
          correctText = fa(place.val);
          distractors = [...place.d.map(fa), fa(place.val + 10), fa(place.val + 100)];
          hint = `جایگاه رقم را از سمت راست (یکان، دهگان، صدگان، هزارگان) بشمار.`;
          explanation = `چون این رقم در خانه ${place.name} قرار دارد، ارزش مکانی آن برابر با ${fa(place.val)} است.`;
        } else if (mode === 2) {
          const toman = rand(2, 95) * (difficulty === 'easy' ? 10 : 100);
          const rial = toman * 10;
          question = `${pick(names)} یک دفتر با قیمت ${fa(rial)} ریال خرید. قیمت این دفتر چند تومان است؟`;
          correctText = `${fa(toman)} تومان`;
          distractors = [`${fa(rial)} تومان`, `${fa(Math.max(1, Math.floor(toman / 10)))} تومان`, `${fa(toman * 100)} تومان`, `${fa(toman + 10)} تومان`];
          hint = `برای تبدیل ریال به تومان یک صفر از آخر عدد بردار (تقسیم بر ۱۰).`;
          explanation = `هر ۱ تومان برابر با ۱۰ ریال است؛ با برداشتن یک صفر از ${fa(rial)} ریال، قیمت برابر با ${fa(toman)} تومان می‌شود.`;
        } else {
          const base = rand(12, 88) * 10;
          const offset = pick([-4, -3, -2, -1, 1, 2, 3, 4]);
          const n = base + offset;
          const ans = base;
          question = `تقریب عدد ${fa(n)} به نزدیک‌ترین دهگان کدام است؟`;
          correctText = fa(ans);
          distractors = [fa(ans + 10), fa(ans - 10), fa(ans + 20), fa(n)];
          hint = `به رقم یکان عدد ${fa(n)} دقت کن؛ اگر کمتر از ۵ بود به عقب و اگر ۵ یا بیشتر بود به جلو گرد می‌شود.`;
          explanation = `عدد ${fa(n)} به دهگان ${fa(ans)} نزدیک‌تر است.`;
        }
      } else if (chapterId === 'fractions') {
        const denom = pick([3, 4, 5, 6, 8, 10]);
        if (Math.random() < 0.6) {
          const num = rand(1, denom - 1);
          const actor = pick(names);
          question = `${actor} یک پیتزا را به ${fa(denom)} تکه مساوی تقسیم کرد و ${fa(num)} تکه از آن را خورد. چه کسری از پیتزا خورده شده است؟`;
          correctText = `${fa(num)}/${fa(denom)}`;
          distractors = [`${fa(denom)}/${fa(num)}`, `${fa(denom - num)}/${fa(denom)}`, `${fa(num)}/${fa(denom + 1)}`, `${fa(num + 1)}/${fa(denom)}`];
          hint = `تعداد تکه‌های خورده‌شده در صورت (بالا) و کل تکه‌های مساوی در مخرج (پایین) قرار می‌گیرد.`;
          explanation = `کل تکه‌ها ${fa(denom)} (مخرج) و تکه‌های خورده‌شده ${fa(num)} (صورت) است؛ پس کسر برابر با ${fa(num)}/${fa(denom)} می‌شود.`;
        } else {
          const a = rand(1, denom - 2);
          const b = rand(a + 1, denom - 1);
          question = `کدام کسر بزرگ‌تر است؟ ${fa(a)}/${fa(denom)} یا ${fa(b)}/${fa(denom)}؟`;
          correctText = `${fa(b)}/${fa(denom)}`;
          distractors = [`${fa(a)}/${fa(denom)}`, 'هر دو برابرند', `${fa(b)}/${fa(denom + 2)}`, `${fa(1)}/${fa(denom)}`];
          hint = `وقتی مخرج‌ها مساوی هستند، کسری بزرگ‌تر است که صورت بزرگ‌تری دارد.`;
          explanation = `چون مخرج هر دو کسر ${fa(denom)} است و ${fa(b)} از ${fa(a)} بزرگ‌تر است، کسر ${fa(b)}/${fa(denom)} بزرگ‌تر است.`;
        }
      } else if (chapterId === 'multiplication_division') {
        const a = difficulty === 'easy' ? rand(2, 5) : rand(4, 9);
        const b = difficulty === 'easy' ? rand(2, 6) : rand(3, 9);
        const prod = a * b;
        const item = pick(items);
        if (Math.random() < 0.65) {
          question = `${pick(names)} ${fa(a)} بسته ${item} دارد و در هر بسته ${fa(b)} عدد ${item} هست. روی هم رفته چند ${item} دارد؟`;
          correctText = fa(prod);
          distractors = [fa(prod + a), fa(Math.max(1, prod - b)), fa(a + b), fa(prod + 2)];
          hint = `این مسئله را می‌توانی با ضرب ${fa(a)} × ${fa(b)} حل کنی.`;
          explanation = `${fa(a)} بسته ${fa(b)} تایی یعنی ${fa(a)} × ${fa(b)} = ${fa(prod)} عدد ${item}.`;
        } else {
          question = `اگر ${fa(prod)} عدد ${item} را به طور مساوی بین ${fa(a)} دوست تقسیم کنیم، به هر نفر چند ${item} می‌رسد؟`;
          correctText = fa(b);
          distractors = [fa(b + 1), fa(Math.max(1, b - 1)), fa(a), fa(prod - a)];
          hint = `فکر کن چه عددی در ${fa(a)} ضرب شود برابر با ${fa(prod)} می‌شود.`;
          explanation = `با تقسیم عادلانه: ${fa(prod)} ÷ ${fa(a)} = ${fa(b)} عدد به هر نفر می‌رسد.`;
        }
      } else if (chapterId === 'perimeter_area') {
        const isSquare = Math.random() < 0.45;
        if (isSquare) {
          const side = difficulty === 'easy' ? rand(2, 8) : rand(4, 15);
          const askPerimeter = Math.random() < 0.55;
          const ans = askPerimeter ? side * 4 : side * side;
          question = `یک باغچه مربع‌شکل با ضلع ${fa(side)} متر داریم. ${askPerimeter ? 'محیط' : 'مساحت'} این باغچه چقدر است؟`;
          correctText = `${fa(ans)} ${askPerimeter ? 'متر' : 'متر مربع'}`;
          distractors = [
            `${fa(askPerimeter ? side * side : side * 4)} ${askPerimeter ? 'متر' : 'متر مربع'}`,
            `${fa(side * 2)} ${askPerimeter ? 'متر' : 'متر مربع'}`,
            `${fa(ans + side)} ${askPerimeter ? 'متر' : 'متر مربع'}`,
            `${fa(Math.max(1, ans - 2))} ${askPerimeter ? 'متر' : 'متر مربع'}`,
          ];
          hint = askPerimeter ? 'محیط مربع یعنی مجموع هر ۴ ضلع مساوی.' : 'مساحت مربع یعنی ضلع × ضلع.';
          explanation = askPerimeter
            ? `محیط مربع = ${fa(side)} × ۴ = ${fa(ans)} متر.`
            : `مساحت مربع = ${fa(side)} × ${fa(side)} = ${fa(ans)} متر مربع.`;
        } else {
          const len = rand(5, 12);
          const wid = rand(2, len - 1);
          const askPerimeter = Math.random() < 0.5;
          const ans = askPerimeter ? (len + wid) * 2 : len * wid;
          question = `یک مستطیل به طول ${fa(len)} سانتی‌متر و عرض ${fa(wid)} سانتی‌متر است. ${askPerimeter ? 'محیط' : 'مساحت'} آن کدام است؟`;
          correctText = `${fa(ans)} ${askPerimeter ? 'سانتی‌متر' : 'سانتی‌متر مربع'}`;
          distractors = [
            `${fa(len + wid)} ${askPerimeter ? 'سانتی‌متر' : 'سانتی‌متر مربع'}`,
            `${fa(askPerimeter ? len * wid : (len + wid) * 2)} ${askPerimeter ? 'سانتی‌متر' : 'سانتی‌متر مربع'}`,
            `${fa(ans + 4)} ${askPerimeter ? 'سانتی‌متر' : 'سانتی‌متر مربع'}`,
            `${fa(Math.max(1, ans - 3))} ${askPerimeter ? 'سانتی‌متر' : 'سانتی‌متر مربع'}`,
          ];
          hint = askPerimeter ? 'فرمول محیط مستطیل: (طول + عرض) × ۲' : 'فرمول مساحت مستطیل: طول × عرض';
          explanation = askPerimeter
            ? `محیط = (${fa(len)} + ${fa(wid)}) × ۲ = ${fa(ans)} سانتی‌متر.`
            : `مساحت = ${fa(len)} × ${fa(wid)} = ${fa(ans)} سانتی‌متر مربع.`;
        }
      } else if (chapterId === 'regrouping') {
        const isAdd = Math.random() < 0.55;
        if (isAdd) {
          const a = difficulty === 'easy' ? rand(125, 489) : rand(1235, 4890);
          const b = difficulty === 'easy' ? rand(118, 495) : rand(1145, 4675);
          const ans = a + b;
          question = `حاصل جمع تکنیکی ${fa(a)} + ${fa(b)} کدام است؟`;
          correctText = fa(ans);
          distractors = [fa(ans - 10), fa(ans + 10), fa(ans - 100), fa(ans + 100)];
          hint = `جمع را از ستون یکی‌ها (سمت راست) شروع کن و ده‌بریک‌ها را فراموش نکن.`;
          explanation = `با جمع کردن یکان، دهگان، صدگان و هزارگان: ${fa(a)} + ${fa(b)} = ${fa(ans)}.`;
        } else {
          const b = difficulty === 'easy' ? rand(125, 390) : rand(1120, 3450);
          const diff = difficulty === 'easy' ? rand(115, 450) : rand(1250, 4200);
          const a = b + diff;
          question = `در یک فروشگاه ${fa(a)} تومان پول داشتیم و ${fa(b)} تومان خرید کردیم. چقدر باقی مانده است؟`;
          correctText = `${fa(diff)} تومان`;
          distractors = [`${fa(diff + 10)} تومان`, `${fa(Math.max(10, diff - 10))} تومان`, `${fa(diff + 100)} تومان`, `${fa(a + b)} تومان`];
          hint = `برای پیدا کردن باقیمانده، باید ${fa(b)} را از ${fa(a)} کم کنی.`;
          explanation = `با تفریق تکنیکی از سمت راست: ${fa(a)} − ${fa(b)} = ${fa(diff)} تومان.`;
        }
      } else if (chapterId === 'statistics') {
        if (Math.random() < 0.7) {
          const bundles = rand(2, 8);
          const singles = rand(1, 4);
          const ans = bundles * 5 + singles;
          question = `در جدول آمار کلاس، ${fa(bundles)} دسته چوب‌خط کامل (۵ تایی) و ${fa(singles)} چوب‌خط تکی کشیده شده است. مجموع آن‌ها چند تاست؟`;
          correctText = fa(ans);
          distractors = [fa(bundles + singles), fa(ans + 5), fa(Math.max(1, ans - 5)), fa(bundles * 4 + singles)];
          hint = `هر بسته کامل چوب‌خط ۵ تا است؛ پس تعداد بسته‌ها را در ۵ ضرب کن و تکی‌ها را اضافه کن.`;
          explanation = `${fa(bundles)} × ۵ = ${fa(bundles * 5)} و با ${fa(singles)} چوب‌خط تکی می‌شود ${fa(ans)}.`;
        } else {
          const red = rand(3, 8);
          const blue = rand(2, 6);
          question = `در یک کیسه ${fa(red)} تیله قرمز و ${fa(blue)} تیله آبی داریم. احتمال اینکه با چشم بسته یک تیله سبز برداریم چیست؟`;
          correctText = 'غیرممکن (ناممکن) است';
          distractors = ['حتماً اتفاق می‌افتد', 'احتمالش خیلی زیاد است', 'بیشتر از تیله قرمز است'];
          hint = `آیا اصلاً تیله سبزی داخل کیسه وجود دارد؟`;
          explanation = `چون هیچ تیله سبزی در کیسه نیست، بیرون آوردن آن غیرممکن است.`;
        }
      } else {
        // advanced_multiplication
        if (Math.random() < 0.55) {
          const a = rand(2, 9);
          const mult = pick([10, 20, 30, 40, 50, 100, 200, 300]);
          const ans = a * mult;
          question = `حاصل ضرب ${fa(a)} × ${fa(mult)} کدام است؟`;
          correctText = fa(ans);
          distractors = [fa(ans / 10), fa(ans * 10), fa(ans + a * 10), fa(a + mult)];
          hint = `ابتدا رقم‌های غیرصفر را در هم ضرب کن و سپس صفرها را جلوی جواب بگذار.`;
          explanation = `${fa(a)} × ${fa(mult)} برابر است با ${fa(ans)}.`;
        } else {
          const twoDigit = rand(12, 29);
          const oneDigit = rand(2, 5);
          const ans = twoDigit * oneDigit;
          question = `اگر در هر جعبه ${fa(twoDigit)} مدادرنگی باشد، در ${fa(oneDigit)} جعبه چند مدادرنگی وجود دارد؟`;
          correctText = fa(ans);
          distractors = [fa(ans + oneDigit), fa(ans - oneDigit), fa(ans + 10), fa(twoDigit + oneDigit)];
          hint = `عدد ${fa(twoDigit)} را به دهگان و یکان بشکن و هر بخش را در ${fa(oneDigit)} ضرب کن.`;
          explanation = `${fa(twoDigit)} × ${fa(oneDigit)} = (${fa(Math.floor(twoDigit / 10) * 10)} × ${fa(oneDigit)}) + (${fa(twoDigit % 10)} × ${fa(oneDigit)}) = ${fa(ans)}.`;
        }
      }

      const hash = generateQuestionHash(question);
      if (this.knownHashes.has(hash) || results.some((r) => generateQuestionHash(r.question) === hash)) {
        continue;
      }

      const { options, correctAnswerIndex } = buildUniqueOptions(correctText, distractors);
      results.push({
        id: `auto_${chapterId}_${difficulty}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        chapterId,
        difficulty,
        question,
        options,
        correctAnswerIndex,
        hint,
        explanation,
        status: 'approved',
        createdAt: new Date().toISOString(),
        timesShown: 0,
        timesCorrect: 0,
      });
    }

    return results;
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
