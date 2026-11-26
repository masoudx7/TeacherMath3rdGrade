/**
 * React Hook for Progressive, Persistent & Offline-First Question Bank (Up to 5,000 Questions)
 * هوک مدیریت بانک سوالات با ذخیره آفلاین در IndexedDB، همگام‌سازی سرور و رشد خودکار تا ۵۰۰۰ سوال
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { QuizQuestion, ChapterId, QuestionDifficulty } from '../types';
import { SAMPLE_QUIZZES } from '../data/curriculum';
import {
  getOfflineQuestions,
  saveOfflineQuestions,
  getOfflineBankStats,
  OFFLINE_BANK_MAX_QUESTIONS,
} from '../utils/offlineQuestionBank';
import { apiUrl } from '../utils/apiConfig';

export interface UseQuestionBankOptions {
  chapterId: ChapterId;
  difficulty?: QuestionDifficulty;
  autoRefillThreshold?: number; // سقف هدف هر فصل (۸ فصل × ۶۲۵ = ۵۰۰۰ سوال)
  enableAutoRefill?: boolean;
}

const STARTUP_GROW_SESSION_KEY = 'ostad_bank_startup_grow_v1';

/**
 * همگام‌سازی بانک سوالات سرور با حافظه آفلاین (IndexedDB) و رشد خودکار هنگام اجرای برنامه
 */
export async function syncAndGrowOfflineQuestionBank(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

  try {
    // ۱. ابتدا تمام سوالات ذخیره‌شده در دیتابیس سرور را در IndexedDB کلاینت همگام می‌کنیم
    const exportRes = await fetch(apiUrl('/api/questions/export-offline'));
    if (exportRes.ok) {
      const exportData = await exportRes.json();
      if (Array.isArray(exportData.questions) && exportData.questions.length > 0) {
        await saveOfflineQuestions(exportData.questions);
      }
      if (exportData.stats && exportData.stats.remainingCapacity <= 0) {
        return;
      }
    }

    // ۲. در هر بار اجرای برنامه (یک بار در هر نشست)، یک بسته جدید تولید و در دیتابیس + آفلاین ذخیره می‌کنیم
    if (sessionStorage.getItem(STARTUP_GROW_SESSION_KEY)) {
      return;
    }
    sessionStorage.setItem(STARTUP_GROW_SESSION_KEY, String(Date.now()));

    const growRes = await fetch(apiUrl('/api/questions/auto-grow'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (growRes.ok) {
      const growData = await growRes.json();
      if (Array.isArray(growData.newQuestions) && growData.newQuestions.length > 0) {
        await saveOfflineQuestions(growData.newQuestions);
      }
    }
  } catch (err) {
    console.warn('[OfflineBankSync] همگام‌سازی پس‌زمینه با مشکل مواجه شد، بانک آفلاین فعال است:', err);
  }
}

export function useQuestionBank(options: UseQuestionBankOptions) {
  const {
    chapterId,
    difficulty,
    autoRefillThreshold = 625,
    enableAutoRefill = false,
  } = options;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [offlineBankTotal, setOfflineBankTotal] = useState<number>(120);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const triggeredChaptersRef = useRef<Set<string>>(new Set());
  const isExecutingRefillRef = useRef<boolean>(false);

  const refreshOfflineCount = useCallback(async () => {
    const stats = await getOfflineBankStats();
    setOfflineBankTotal(stats.total);
  }, []);

  useEffect(() => {
    refreshOfflineCount();
    const handler = () => {
      refreshOfflineCount();
    };
    window.addEventListener('offline-bank-updated', handler);
    return () => window.removeEventListener('offline-bank-updated', handler);
  }, [refreshOfflineCount]);

  // لود اولیه سوالات (اول از IndexedDB آفلاین + کتاب درسی، سپس همگام‌سازی با سرور)
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const offlineList = await getOfflineQuestions(chapterId, difficulty);
    if (offlineList.length > 0) {
      setQuestions(offlineList);
    } else {
      const chapterList = SAMPLE_QUIZZES[chapterId] || [];
      const baseList = chapterList.filter((q) => (difficulty ? q.difficulty === difficulty : true));
      setQuestions(baseList);
    }

    try {
      if (typeof navigator === 'undefined' || navigator.onLine !== false) {
        const url = apiUrl(`/api/questions?chapterId=${chapterId}${difficulty ? `&difficulty=${difficulty}` : ''}`);
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.questions) && data.questions.length > 0) {
            await saveOfflineQuestions(data.questions);
            const mergedOffline = await getOfflineQuestions(chapterId, difficulty);
            setQuestions(mergedOffline.length > 0 ? mergedOffline : data.questions);
            await refreshOfflineCount();
            return mergedOffline.length > 0 ? mergedOffline : data.questions;
          }
        }
      }
    } catch (err) {
      console.warn('[useQuestionBank] آفلاین یا عدم دسترسی به سرور؛ استفاده از بانک ذخیره‌شده دستگاه:', err);
    }

    await refreshOfflineCount();
    return offlineList;
  }, [chapterId, difficulty, refreshOfflineCount]);

  // تولید بسته ۵ تایی سوال جدید و ذخیره همزمان در دیتابیس سرور و IndexedDB آفلاین
  const generateSingleBatch = useCallback(
    async (
      targetDifficulty: QuestionDifficulty = difficulty || 'medium',
      currentPool: QuizQuestion[]
    ): Promise<QuizQuestion[]> => {
      try {
        const res = await fetch(apiUrl('/api/questions/generate'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chapterId,
            difficulty: targetDifficulty,
            count: 5,
            existingTitles: currentPool.slice(-20).map((q) => q.question),
          }),
        });

        if (!res.ok) {
          throw new Error('خطا در تولید سوالات جدید توسط هوش مصنوعی');
        }

        const data = await res.json();
        if (Array.isArray(data.newQuestions) && data.newQuestions.length > 0) {
          const freshQuestions: QuizQuestion[] = data.newQuestions;
          await saveOfflineQuestions(freshQuestions);
          await refreshOfflineCount();

          setQuestions((prev) => {
            const existingIds = new Set(prev.map((q) => q.id));
            const fresh = freshQuestions.filter((q) => !existingIds.has(q.id));
            return [...prev, ...fresh];
          });
          return freshQuestions;
        }
        return [];
      } catch (err: any) {
        console.error('[useQuestionBank Generate Error]', err);
        setError(err.message || 'خطا در افزودن سوال');
        return [];
      }
    },
    [chapterId, difficulty, refreshOfflineCount]
  );

  const generateMore = useCallback(
    async (targetDifficulty: QuestionDifficulty = difficulty || 'medium') => {
      if (isGenerating || isExecutingRefillRef.current) return [];
      setIsGenerating(true);
      setError(null);
      try {
        return await generateSingleBatch(targetDifficulty, questions);
      } finally {
        setIsGenerating(false);
      }
    },
    [difficulty, isGenerating, generateSingleBatch, questions]
  );

  useEffect(() => {
    fetchQuestions().finally(() => setIsLoading(false));
  }, [fetchQuestions]);

  // شارژ خودکار نرم هنگام باز کردن هر فصل (تا سقف ۵۰۰۰ سوال کل / ۶۲۵ در هر فصل)
  useEffect(() => {
    const bucketKey = `${chapterId}:${difficulty || 'all'}`;
    if (
      !enableAutoRefill ||
      isLoading ||
      isGenerating ||
      isExecutingRefillRef.current ||
      triggeredChaptersRef.current.has(bucketKey) ||
      offlineBankTotal >= OFFLINE_BANK_MAX_QUESTIONS
    ) {
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return;
    }

    if (questions.length >= autoRefillThreshold) {
      return;
    }

    triggeredChaptersRef.current.add(bucketKey);
    isExecutingRefillRef.current = true;

    const timer = setTimeout(async () => {
      setIsGenerating(true);
      try {
        await generateSingleBatch(difficulty || 'medium', questions);
      } catch (err) {
        console.warn('[useQuestionBank Refill Warning]', err);
      } finally {
        setIsGenerating(false);
        isExecutingRefillRef.current = false;
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [
    chapterId,
    questions,
    autoRefillThreshold,
    enableAutoRefill,
    isLoading,
    isGenerating,
    generateSingleBatch,
    difficulty,
    offlineBankTotal,
  ]);

  return {
    questions,
    offlineBankTotal,
    maxQuestions: OFFLINE_BANK_MAX_QUESTIONS,
    isLoading,
    isGenerating,
    error,
    refreshQuestions: fetchQuestions,
    generateMore,
    totalCount: questions.length,
  };
}
