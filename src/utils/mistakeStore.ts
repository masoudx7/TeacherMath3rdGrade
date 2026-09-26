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

const isKvReady = () => Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

export const saveMistake = async (userId: string, mistake: Omit<Mistake, 'id' | 'timestamp' | 'resolved'>) => {
  const newMistake: Mistake = {
    ...mistake,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    resolved: false
  };
  const key = `mistakes:${userId}`;

  if (isKvReady()) {
    try {
      const current = await kv.get<Mistake[]>(key) || [];
      const updated = [newMistake, ...current].slice(0, 50);
      await kv.set(key, updated);
      return newMistake;
    } catch (err) {
      console.warn('[KV] Error saving mistake, falling back to local storage:', err);
    }
  }

  // Fallback to localStorage in browser
  try {
    const raw = localStorage.getItem(`local_${key}`);
    const current: Mistake[] = raw ? JSON.parse(raw) : [];
    const updated = [newMistake, ...current].slice(0, 50);
    localStorage.setItem(`local_${key}`, JSON.stringify(updated));
  } catch (e) {
    // ignore
  }

  return newMistake;
};

export const getMistakes = async (userId: string): Promise<Mistake[]> => {
  const key = `mistakes:${userId}`;
  if (isKvReady()) {
    try {
      return await kv.get<Mistake[]>(key) || [];
    } catch (err) {
      console.warn('[KV] Error getting mistakes:', err);
    }
  }

  try {
    const raw = localStorage.getItem(`local_${key}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const resolveMistake = async (userId: string, mistakeId: string) => {
  const key = `mistakes:${userId}`;
  if (isKvReady()) {
    try {
      const current = await kv.get<Mistake[]>(key) || [];
      const updated = current.map(m => m.id === mistakeId ? { ...m, resolved: true } : m);
      await kv.set(key, updated);
      return updated.filter(m => m.resolved).length;
    } catch (err) {
      console.warn('[KV] Error resolving mistake:', err);
    }
  }

  try {
    const raw = localStorage.getItem(`local_${key}`);
    const current: Mistake[] = raw ? JSON.parse(raw) : [];
    const updated = current.map(m => m.id === mistakeId ? { ...m, resolved: true } : m);
    localStorage.setItem(`local_${key}`, JSON.stringify(updated));
    return updated.filter(m => m.resolved).length;
  } catch (e) {
    return 0;
  }
};
