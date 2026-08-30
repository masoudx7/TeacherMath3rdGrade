import { kv } from '@vercel/kv';

export interface Mistake {
  id: string;
  userId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  timestamp: string;
  resolved: boolean;
}

export const saveMistake = async (userId: string, mistake: Omit<Mistake, 'id' | 'timestamp' | 'resolved'>) => {
  const newMistake: Mistake = {
    ...mistake,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    resolved: false
  };
  const key = `mistakes:${userId}`;
  const current = await kv.get<Mistake[]>(key) || [];
  const updated = [newMistake, ...current].slice(0, 50);
  await kv.set(key, updated);
  return newMistake;
};

export const getMistakes = async (userId: string): Promise<Mistake[]> => {
  const key = `mistakes:${userId}`;
  return await kv.get<Mistake[]>(key) || [];
};

export const resolveMistake = async (userId: string, mistakeId: string) => {
  const key = `mistakes:${userId}`;
  const current = await kv.get<Mistake[]>(key) || [];
  const updated = current.map(m => m.id === mistakeId ? { ...m, resolved: true } : m);
  await kv.set(key, updated);
  return updated.filter(m => m.resolved).length;
};
