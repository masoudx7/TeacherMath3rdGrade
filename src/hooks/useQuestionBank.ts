/**
 * React Hook for Progressive & Auto-Refilling Question Bank
 * هوک مدیریت بانک سوالات با شارژ خودکار تدریجی و دومرحله‌ای در پس‌زمینه
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { QuizQuestion, ChapterId, QuestionDifficulty } from '../types';
import { SAMPLE_QUIZZES } from '../data/curriculum';

export interface UseQuestionBankOptions {
  chapterId: ChapterId;
  difficulty?: QuestionDifficulty;
  autoRefillThreshold?: number; // سقف هدف برای رشد بانک (پیش‌فرض: ۲۵ سوال)
  enableAutoRefill?: boolean;
}

export function useQuestionBank(options: UseQuestionBankOptions) {
  const {
    chapterId,
    difficulty,
    autoRefillThreshold = 25,
    enableAutoRefill = true,
  } = options;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ممانعت از اجرای همزمان، چرخه‌های تکراری و حلقه بی‌نهایت
  const hasTriggeredRefillRef = useRef<boolean>(false);
  const isExecutingRefillRef = useRef<boolean>(false);
  const currentChapterRef = useRef<ChapterId>(chapterId);

  // بررسی تغییر فصل جهت ریست کردن فلگ شارژ خودکار
  useEffect(() => {
    if (currentChapterRef.current !== chapterId) {
      currentChapterRef.current = chapterId;
      hasTriggeredRefillRef.current = false;
      isExecutingRefillRef.current = false;
    }
  }, [chapterId]);

  // لود اولیه سوالات (ترکیب سوالات کتاب درسی و سوالات ذخیره شده قبلی در KV)
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // ۱. دریافت فوری سوالات پایه از حافظه محلی
    const chapterList = SAMPLE_QUIZZES[chapterId] || [];
    const baseList = chapterList.filter((q) => {
      return difficulty ? q.difficulty === difficulty : true;
    });

    try {
      // ۲. دریافت سوالات بروز شده از سرور / KV
      const url = `/api/questions?chapterId=${chapterId}${difficulty ? `&difficulty=${difficulty}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(data.questions);
          return data.questions;
        }
      }
    } catch (err) {
      console.warn('[useQuestionBank] خطا در اتصال به سرور، استفاده از سوالات محلی:', err);
    }

    setQuestions(baseList);
    return baseList;
  }, [chapterId, difficulty]);

  // متد تولید یک بسته ۳تایی سوال جدید
  const generateSingleBatch = useCallback(
    async (
      targetDifficulty: QuestionDifficulty = difficulty || 'medium',
      currentPool: QuizQuestion[]
    ): Promise<QuizQuestion[]> => {
      try {
        const res = await fetch('/api/questions/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chapterId,
            difficulty: targetDifficulty,
            count: 3,
            existingTitles: currentPool.map((q) => q.question),
          }),
        });

        if (!res.ok) {
          throw new Error('خطا در تولید سوالات جدید توسط هوش مصنوعی');
        }

        const data = await res.json();
        if (Array.isArray(data.newQuestions) && data.newQuestions.length > 0) {
          const freshQuestions: QuizQuestion[] = data.newQuestions;
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
    [chapterId, difficulty]
  );

  // تابع در دسترس برای کاربر یا فراخوانی دستی
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

  // بارگذاری داده‌ها هنگام mount یا تغییر وابستگی‌ها
  useEffect(() => {
    fetchQuestions().finally(() => setIsLoading(false));
  }, [fetchQuestions]);

  // ========================================================
  // منطق شارژ خودکار تدریجی و دومرحله‌ای (Progressive Auto-Refill)
  // ========================================================
  useEffect(() => {
    // شرایط خروج سریع برای جلوگیری از حلقه یا اجرای تکراری
    if (
      !enableAutoRefill ||
      isLoading ||
      isGenerating ||
      isExecutingRefillRef.current ||
      hasTriggeredRefillRef.current
    ) {
      return;
    }

    const currentCount = questions.length;

    // اگر ظرفیت پر شده باشد، نیاز به اقدامی نیست
    if (currentCount >= autoRefillThreshold) {
      return;
    }

    // علامت‌گذاری اینکه برای این چرخه شارژ فعال شد تا از اجرای مجدد جلوگیری شود
    hasTriggeredRefillRef.current = true;
    isExecutingRefillRef.current = true;

    const executeRefillSequence = async () => {
      setIsGenerating(true);
      try {
        let activePool = [...questions];

        if (currentCount < 12) {
          // سناریو ۱: اگر کمتر از ۱۲ سوال باشد، دو بسته متوالی ۳ تایی (در مجموع ۶ سوال) تولید می‌شود
          const firstBatch = await generateSingleBatch(difficulty || 'medium', activePool);
          if (firstBatch.length > 0) {
            activePool = [...activePool, ...firstBatch];
          }

          // ایجاد یک وقفه کوچک (۱.۲ ثانیه) برای جلوگیری از تلاقی یا خستگی مدل
          await new Promise((res) => setTimeout(res, 1200));

          // تولید بسته دوم
          await generateSingleBatch(difficulty || 'medium', activePool);
        } else if (currentCount < autoRefillThreshold) {
          // سناریو ۲: اگر بین ۱۲ تا ۲۴ سوال باشد، تنها یک بسته ۳ تایی برای تکمیل نرم تولید می‌شود
          await generateSingleBatch(difficulty || 'medium', activePool);
        }
      } catch (err) {
        console.warn('[useQuestionBank Refill Sequence Warning]', err);
      } finally {
        setIsGenerating(false);
        isExecutingRefillRef.current = false;
      }
    };

    // تاخیر کوتاه ۸۰۰ میلی‌ثانیه‌ای بعد از لود تا به هیچ وجه مانع تعامل اولیه کودک نشود
    const timer = setTimeout(() => {
      executeRefillSequence();
    }, 800);

    return () => clearTimeout(timer);
  }, [
    questions,
    autoRefillThreshold,
    enableAutoRefill,
    isLoading,
    isGenerating,
    generateSingleBatch,
    difficulty,
  ]);

  return {
    questions,
    isLoading,
    isGenerating,
    error,
    refreshQuestions: fetchQuestions,
    generateMore,
    totalCount: questions.length,
  };
}
