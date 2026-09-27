export interface Mistake {
  id: string;
  userId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  timestamp: string;
  resolved: boolean;
}

let cachedKv: any = null;
let kvAttempted = false;

async function getSafeKv() {
  if (kvAttempted) return cachedKv;
  kvAttempted = true;

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const kvModule = await import('@vercel/kv');
      cachedKv = kvModule.kv || (kvModule as any).default?.kv || kvModule;
      return cachedKv;
    } catch (e) {
      console.warn('[mistakeStore] Failed to load KV client dynamically:', e);
    }
  }
  return null;
}

const inMemoryMistakes = new Map<string, Mistake[]>();

export const saveMistake = async (userId: string, mistake: Omit<Mistake, 'id' | 'timestamp' | 'resolved'>) => {
  const newMistake: Mistake = {
    ...mistake,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    resolved: false
  };
  const key = `mistakes:${userId}`;

  const kv = await getSafeKv();
  if (kv && typeof kv.get === 'function' && typeof kv.set === 'function') {
    try {
      const current = (await kv.get(key)) || [];
      const updated = [newMistake, ...(Array.isArray(current) ? current : [])].slice(0, 50);
      await kv.set(key, updated);
      return newMistake;
    } catch (err) {
      console.warn('[KV] Error saving mistake, falling back to local storage:', err);
    }
  }

  // Fallback to localStorage in browser environments
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(`local_${key}`);
      const current: Mistake[] = raw ? JSON.parse(raw) : [];
      const updated = [newMistake, ...current].slice(0, 50);
      localStorage.setItem(`local_${key}`, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  } else {
    const current = inMemoryMistakes.get(key) || [];
    inMemoryMistakes.set(key, [newMistake, ...current].slice(0, 50));
  }

  return newMistake;
};

export const getMistakes = async (userId: string): Promise<Mistake[]> => {
  const key = `mistakes:${userId}`;
  const kv = await getSafeKv();
  if (kv && typeof kv.get === 'function') {
    try {
      const stored = await kv.get(key);
      if (Array.isArray(stored)) return stored;
    } catch (err) {
      console.warn('[KV] Error getting mistakes:', err);
    }
  }

  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(`local_${key}`);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  return inMemoryMistakes.get(key) || [];
};

export const resolveMistake = async (userId: string, mistakeId: string) => {
  const key = `mistakes:${userId}`;
  const kv = await getSafeKv();
  if (kv && typeof kv.get === 'function' && typeof kv.set === 'function') {
    try {
      const current = (await kv.get(key)) || [];
      if (Array.isArray(current)) {
        const updated = current.map((m: Mistake) => m.id === mistakeId ? { ...m, resolved: true } : m);
        await kv.set(key, updated);
        return updated.filter((m: Mistake) => m.resolved).length;
      }
    } catch (err) {
      console.warn('[KV] Error resolving mistake:', err);
    }
  }

  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(`local_${key}`);
      const current: Mistake[] = raw ? JSON.parse(raw) : [];
      const updated = current.map(m => m.id === mistakeId ? { ...m, resolved: true } : m);
      localStorage.setItem(`local_${key}`, JSON.stringify(updated));
      return updated.filter(m => m.resolved).length;
    } catch (e) {
      return 0;
    }
  }

  const current = inMemoryMistakes.get(key) || [];
  const updated = current.map(m => m.id === mistakeId ? { ...m, resolved: true } : m);
  inMemoryMistakes.set(key, updated);
  return updated.filter(m => m.resolved).length;
};
