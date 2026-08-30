import { kv } from '@vercel/kv';

const BASE_QUESTIONS_URL = '/data/base-questions.json';
const LOCAL_DB_NAME = 'ostad_dana_questions';
const LOCAL_STORE_NAME = 'ai_generated_questions';

export interface QuestionItem {
  id: string;
  text: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  isAiGenerated?: boolean;
}

export interface QuestionCategory {
  id: string;
  name: string;
  icon: string;
  questions: QuestionItem[];
}

// لود سوالات پایه (آفلاین)
export const loadBaseQuestions = async () => {
  try {
    const res = await fetch(BASE_QUESTIONS_URL);
    if (!res.ok) throw new Error('Failed to fetch base questions');
    return await res.json();
  } catch (e) {
    console.error('خطا در لود سوالات پایه:', e);
    return null;
  }
};

// دریافت سوالات ذخیره شده محلی از IndexedDB
export const getLocalAIQuestions = async (): Promise<QuestionItem[]> => {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(LOCAL_DB_NAME, 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(LOCAL_STORE_NAME)) {
          db.createObjectStore(LOCAL_STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(LOCAL_STORE_NAME)) {
          resolve([]);
          return;
        }
        const tx = db.transaction(LOCAL_STORE_NAME, 'readonly');
        const store = tx.objectStore(LOCAL_STORE_NAME);
        const getAllReq = store.getAll();
        getAllReq.onsuccess = () => resolve(getAllReq.result || []);
        getAllReq.onerror = () => resolve([]);
      };
      request.onerror = () => resolve([]);
    } catch (e) {
      resolve([]);
    }
  });
};

// پاک کردن سوالات محلی بعد از سینک موفق
export const clearLocalAIQuestions = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(LOCAL_DB_NAME, 1);
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(LOCAL_STORE_NAME)) {
          resolve(true);
          return;
        }
        const tx = db.transaction(LOCAL_STORE_NAME, 'readwrite');
        const store = tx.objectStore(LOCAL_STORE_NAME);
        const clearReq = store.clear();
        clearReq.onsuccess = () => resolve(true);
        clearReq.onerror = () => resolve(false);
      };
      request.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
};

// ذخیره سوال AI در IndexedDB (آفلاین)
export const saveQuestionLocally = async (question: QuestionItem) => {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(LOCAL_DB_NAME, 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(LOCAL_STORE_NAME)) {
          db.createObjectStore(LOCAL_STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        const tx = db.transaction(LOCAL_STORE_NAME, 'readwrite');
        const store = tx.objectStore(LOCAL_STORE_NAME);
        store.put({ ...question, isAiGenerated: true });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(false);
      };
      request.onerror = () => reject(false);
    } catch (e) {
      reject(e);
    }
  });
};

// حذف سوال محلی AI
export const deleteLocalAIQuestion = async (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(LOCAL_DB_NAME, 1);
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(LOCAL_STORE_NAME)) {
          resolve(true);
          return;
        }
        const tx = db.transaction(LOCAL_STORE_NAME, 'readwrite');
        const store = tx.objectStore(LOCAL_STORE_NAME);
        store.delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      };
      request.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
};

// سینک سوالات AI به Vercel KV (آنلاین)
export const syncQuestionsToCloud = async (userId: string) => {
  try {
    const localQuestions = await getLocalAIQuestions();
    if (localQuestions.length === 0) return true;
    
    const key = `user_questions:${userId}`;
    let existing: QuestionItem[] = [];
    try {
      existing = await kv.get<QuestionItem[]>(key) || [];
    } catch (err) {
      existing = [];
    }
    
    const merged = [...existing, ...localQuestions].slice(-200); // حداکثر ۲۰۰ سوال AI
    
    await kv.set(key, merged);
    
    // پاک کردن لوکال بعد از سینک موفق
    await clearLocalAIQuestions();
    return true;
  } catch (e) {
    console.error('خطا در سینک:', e);
    return false;
  }
};

// دریافت تمام سوالات (پایه + AI)
export const getAllQuestions = async (userId?: string) => {
  const base = await loadBaseQuestions();
  const localAI = await getLocalAIQuestions();
  
  let cloudAI: QuestionItem[] = [];
  if (userId) {
    try {
      cloudAI = await kv.get<QuestionItem[]>(`user_questions:${userId}`) || [];
    } catch (e) {}
  }
  
  const allAI = [...localAI, ...cloudAI];
  // Remove duplicates by id
  const uniqueAI = Array.from(new Map(allAI.map(item => [item.id, item])).values());

  const baseCategories: QuestionCategory[] = base?.categories || [];
  const baseTotal = baseCategories.reduce((sum, c) => sum + (c.questions?.length || 0), 0);

  return {
    base: baseCategories,
    aiGenerated: uniqueAI,
    total: baseTotal + uniqueAI.length
  };
};
