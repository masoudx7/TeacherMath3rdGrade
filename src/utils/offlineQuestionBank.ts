/**
 * Client-Side Offline Question Bank (IndexedDB)
 * ذخیره و مدیریت تا ۵۰۰۰ سوال آفلاین روی دستگاه کاربر (در مرورگر)
 */

import { QuizQuestion, ChapterId, QuestionDifficulty } from '../types';
import { SAMPLE_QUIZZES } from '../data/curriculum';

export const OFFLINE_BANK_MAX_QUESTIONS = 5000;
const DB_NAME = 'ostad_dana_offline_bank_v1';
const DB_VERSION = 1;
const STORE_NAME = 'quiz_questions';
const FLAGGED_KEY = 'ostad_dana_flagged_question_ids_v1';

function normalizeQuestionText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString())
    .replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString())
    .replace(/[\s\u200c\-_،,.:;؟!]/g, '')
    .slice(0, 80);
}

function getFlaggedIdsSet(): Set<string> {
  try {
    const raw = localStorage.getItem(FLAGGED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
}

function addFlaggedIdLocal(id: string): void {
  try {
    const set = getFlaggedIdsSet();
    set.add(id);
    localStorage.setItem(FLAGGED_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

function openOfflineDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (event: any) => {
        const db: IDBDatabase = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('chapterId', 'chapterId', { unique: false });
        }
      };
      req.onsuccess = (event: any) => resolve(event.target.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function readAllFromIdb(): Promise<QuizQuestion[]> {
  const db = await openOfflineDb();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

function notifyOfflineBankUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('offline-bank-updated'));
  }
}

/**
 * دریافت سوالات آفلاین (ترکیب سوالات کتاب درسی و سوالات ذخیره‌شده در IndexedDB)
 */
export async function getOfflineQuestions(
  chapterId?: ChapterId,
  difficulty?: QuestionDifficulty
): Promise<QuizQuestion[]> {
  const flaggedSet = getFlaggedIdsSet();
  const baseAll: QuizQuestion[] = chapterId
    ? [...(SAMPLE_QUIZZES[chapterId] || [])]
    : Object.values(SAMPLE_QUIZZES).flat();

  const idbQuestions = await readAllFromIdb();
  const combined = [...baseAll, ...idbQuestions];

  const dedupMap = new Map<string, QuizQuestion>();
  for (const q of combined) {
    if (!q || !q.question || !q.id) continue;
    if (flaggedSet.has(q.id) || q.status === 'flagged' || q.status === 'rejected') continue;
    if (chapterId && q.chapterId !== chapterId) continue;
    if (difficulty && q.difficulty !== difficulty) continue;

    const norm = normalizeQuestionText(q.question);
    if (norm && !dedupMap.has(norm)) {
      dedupMap.set(norm, q);
    }
  }

  return Array.from(dedupMap.values());
}

/**
 * ذخیره سوالات جدید یا همگام‌سازی‌شده در IndexedDB با رعایت سقف ۵۰۰۰ سوال
 */
export async function saveOfflineQuestions(incoming: QuizQuestion[]): Promise<number> {
  if (!Array.isArray(incoming) || incoming.length === 0) return 0;
  const db = await openOfflineDb();
  if (!db) return 0;

  const existingIdb = await readAllFromIdb();
  const existingNorms = new Set<string>();
  const existingIds = new Set<string>();

  // شامل کردن هش سوالات پایه کتاب درسی برای جلوگیری از تکرار در IndexedDB
  Object.values(SAMPLE_QUIZZES)
    .flat()
    .forEach((q) => {
      if (q?.id) existingIds.add(q.id);
      if (q?.question) existingNorms.add(normalizeQuestionText(q.question));
    });

  existingIdb.forEach((q) => {
    if (q?.id) existingIds.add(q.id);
    if (q?.question) existingNorms.add(normalizeQuestionText(q.question));
  });

  const baseCount = Object.values(SAMPLE_QUIZZES).flat().length;
  const currentTotal = baseCount + existingIdb.length;
  let remainingCapacity = Math.max(0, OFFLINE_BANK_MAX_QUESTIONS - currentTotal);
  if (remainingCapacity === 0) return 0;

  const toInsert: QuizQuestion[] = [];
  for (const q of incoming) {
    if (remainingCapacity <= 0) break;
    if (!q || !q.id || !q.question || !Array.isArray(q.options) || q.options.length !== 4) continue;
    if (q.status === 'flagged' || q.status === 'rejected') continue;

    const norm = normalizeQuestionText(q.question);
    if (!norm || existingIds.has(q.id) || existingNorms.has(norm)) continue;

    existingIds.add(q.id);
    existingNorms.add(norm);
    toInsert.push({ ...q, status: q.status || 'approved' });
    remainingCapacity--;
  }

  if (toInsert.length === 0) return 0;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const item of toInsert) {
        store.put(item);
      }
      tx.oncomplete = () => {
        notifyOfflineBankUpdated();
        resolve(toInsert.length);
      };
      tx.onerror = () => resolve(0);
    } catch {
      resolve(0);
    }
  });
}

/**
 * حذف سوال گزارش‌شده از حافظه آفلاین دستگاه
 */
export async function removeOfflineQuestion(questionId: string): Promise<void> {
  if (!questionId) return;
  addFlaggedIdLocal(questionId);
  const db = await openOfflineDb();
  if (!db) {
    notifyOfflineBankUpdated();
    return;
  }

  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(questionId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
  notifyOfflineBankUpdated();
}

/**
 * آمار تعداد سوالات آفلاین موجود روی دستگاه
 */
export async function getOfflineBankStats(): Promise<{
  total: number;
  maxQuestions: number;
  byChapter: Record<string, number>;
}> {
  const all = await getOfflineQuestions();
  const byChapter: Record<string, number> = {};
  for (const q of all) {
    byChapter[q.chapterId] = (byChapter[q.chapterId] || 0) + 1;
  }
  return {
    total: all.length,
    maxQuestions: OFFLINE_BANK_MAX_QUESTIONS,
    byChapter,
  };
}
