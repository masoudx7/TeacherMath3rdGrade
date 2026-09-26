/**
 * React Hook for Progressive & Auto-Refilling Question Bank
 * هوک مدیریت بانک سوالات با شارژ خودکار تدریجی در پس‌زمینه
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { QuizQuestion, ChapterId, QuestionDifficulty } from '../types';
import { SAMPLE_QUIZZES } from '../data/curriculum';

export interface UseQuestionBankOptions {
  chapterId: ChapterId;
  difficulty?: QuestionDifficulty;
  autoRefillThreshold?: number; // اگر تعداد سوالات فصل کمتر از ۱۲ بود، خودکار ۳ سوال در پس‌زمینه تولید شود
  enableAutoRefill?: boolean;
}

export function useQuestionBank(options: UseQuestionBankOptions) {
  const {
    chapterId,
    difficulty,
    autoRefillThreshold = 12,
    enableAutoRefill = true,
  } = options;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const hasTriggeredRefillRef = useRef<boolean>(false);

  // لود اولیه سوالات (ترکیب سوالات کتاب درسی و سوالات تولیدشده قبلی)
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // ۱. دریافت فوری سوالات پایه از حافظه محلی
    const chapterList = SAMPLE_QUIZZES[chapterId] || [];
    const baseList = chapterList.filter((q) => {
      return difficulty ? q.difficulty === difficulty : true;
    });

    try {
      // ۲. دریافت سوالات بروز شده از سرور
      const url = `/api/questions?chapterId=${chapterId}${difficulty ? `&difficulty=${difficulty}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(data.questions);
          return;
        }
      }
    } catch (err) {
      console.warn('[useQuestionBank] خطا در اتصال به سرور، استفاده از سوالات محلی:', err);
    }

    // در صورت آفلاین بودن، سوالات اولیه کتاب نمایش داده می‌شود
    setQuestions(baseList);
    setIsLoading(false);
  }, [chapterId, difficulty]);

  // تولید یک بسته ۳تایی سوال جدید در پس‌زمینه
  const generateMore = useCallback(
    async (targetDifficulty: QuestionDifficulty = difficulty || 'medium') => {
      if (isGenerating) return;

      setIsGenerating(true);
      setError(null);

      try {
        const res = await fetch('/api/questions/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chapterId,
            difficulty: targetDifficulty,
            count: 3,
            existingTitles: questions.map((q) => q.question),
          }),
        });

        if (!res.ok) {
          throw new Error('خطا در تولید سوالات جدید توسط هوش مصنوعی');
        }

        const data = await res.json();
        if (Array.isArray(data.newQuestions) && data.newQuestions.length > 0) {
          setQuestions((prev) => {
            const existingIds = new Set(prev.map((q) => q.id));
            const fresh = data.newQuestions.filter((q: QuizQuestion) => !existingIds.has(q.id));
            return [...prev, ...fresh];
          });
        }
      } catch (err: any) {
        console.error('[useQuestionBank Generate Error]', err);
        setError(err.message || 'خطا در افزودن سوال');
      } finally {
        setIsGenerating(false);
      }
    },
    [chapterId, difficulty, isGenerating, questions]
  );

  useEffect(() => {
    hasTriggeredRefillRef.current = false;
    fetchQuestions().finally(() => setIsLoading(false));
  }, [fetchQuestions]);

  // سازوکار هوشمند پر کردن تدریجی بانک (Auto-Refill Threshold)
  useEffect(() => {
    if (!enableAutoRefill || isLoading || isGenerating || hasTriggeredRefillRef.current) {
      return;
    }

    if (questions.length < autoRefillThreshold) {
      hasTriggeredRefillRef.current = true;
      // تاخیر کوچک برای عدم ایجاد تداخل با رندر اولیه
      const timer = setTimeout(() => {
        generateMore(difficulty || 'medium');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [questions.length, autoRefillThreshold, enableAutoRefill, isLoading, isGenerating, generateMore, difficulty]);

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
