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
    let list: MistakeRecord[] = saved ? JSON.parse(saved) : [];

    const existingIdx = list.findIndex(m => m.question === question);
    if (existingIdx >= 0) {
      list[existingIdx] = {
        ...list[existingIdx],
        wrongAnswer,
        correctAnswer,
        attempts: list[existingIdx].attempts + 1,
        timestamp: Date.now(),
        resolved: false
      };
    } else {
      const newRecord: MistakeRecord = {
        id: 'mstk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
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
    localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('mistake-added'));
    }
  } catch (e) {
    console.error('Error recording instant mistake:', e);
  }
};
