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

const memoryMistakes = new Map<string, Mistake[]>();

export const saveMistake = async (userId: string, mistake: Omit<Mistake, 'id' | 'timestamp' | 'resolved'>) => {
  const newMistake: Mistake = {
    ...mistake,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    resolved: false
  };
  const key = `mistakes:${userId}`;
  
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      throw new Error('KV not configured');
    }
    const current = await kv.get<Mistake[]>(key) || [];
    const updated = [newMistake, ...current].slice(0, 50);
    await kv.set(key, updated);
    return newMistake;
  } catch (e) {
    const current = memoryMistakes.get(userId) || [];
    const updated = [newMistake, ...current].slice(0, 50);
    memoryMistakes.set(userId, updated);
    return newMistake;
  }
};

export const getMistakes = async (userId: string): Promise<Mistake[]> => {
  const key = `mistakes:${userId}`;
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      throw new Error('KV not configured');
    }
    return await kv.get<Mistake[]>(key) || [];
  } catch (e) {
    return memoryMistakes.get(userId) || [];
  }
};

export const resolveMistake = async (userId: string, mistakeId: string) => {
  const key = `mistakes:${userId}`;
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      throw new Error('KV not configured');
    }
    const current = await kv.get<Mistake[]>(key) || [];
    const updated = current.map(m => m.id === mistakeId ? { ...m, resolved: true } : m);
    await kv.set(key, updated);
    return updated.filter(m => m.resolved).length;
  } catch (e) {
    const current = memoryMistakes.get(userId) || [];
    const updated = current.map(m => m.id === mistakeId ? { ...m, resolved: true } : m);
    memoryMistakes.set(userId, updated);
    return updated.filter(m => m.resolved).length;
  }
};
