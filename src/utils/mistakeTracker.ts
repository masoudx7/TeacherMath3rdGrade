import { MistakeRecord, ChapterId } from '../types';
import { MISTAKES_STORAGE_KEY } from '../components/MistakeNotebook';

export const addMistakeInstant = (
  chapterId: ChapterId | string,
  question: string,
  wrongAnswer: string,
  correctAnswer: string,
  explanation: string = 'پاسخ نادرست در تمرین یا بازی؛ نیاز به مرور مجدد دارد.'
) => {
  if (!question) return;
  try {
    const saved = localStorage.getItem(MISTAKES_STORAGE_KEY);
    let list: MistakeRecord[] = [];
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        list = parsed;
      }
    }

    const existingIdx = list.findIndex(m => m.question === question);
    if (existingIdx >= 0) {
      list[existingIdx] = {
        ...list[existingIdx],
        wrongAnswer,
        correctAnswer,
        explanation: explanation || list[existingIdx].explanation,
        attempts: (list[existingIdx].attempts || 1) + 1,
        timestamp: Date.now(),
        resolved: false
      };
    } else {
      const newRecord: MistakeRecord = {
        id: 'mstk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        chapterId: (chapterId as ChapterId) || 'patterns',
        question,
        wrongAnswer,
        correctAnswer,
        explanation,
        timestamp: Date.now(),
        resolved: false,
        attempts: 1,
        retryCount: 0
      };
      list.unshift(newRecord);
    }

    localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('mistake-added'));
    }
  } catch (e) {
    console.error('Error recording instant mistake:', e);
  }
};
