import { kv } from '@vercel/kv';

const memoryFallback = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(userId: string, limit: number = 50) {
  const key = `rate_limit:${userId}`;
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  
  try {
    // Check if KV is configured (has required env vars)
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      throw new Error('KV not configured');
    }

    const current = await kv.get<{ count: number; resetTime: number }>(key);
    
    if (!current || now > current.resetTime) {
      await kv.set(key, { count: 1, resetTime: now + windowMs }, { ex: 3600 });
      return { success: true, remaining: limit - 1, resetTime: now + windowMs };
    }
    
    if (current.count >= limit) {
      return { success: false, remaining: 0, resetTime: current.resetTime };
    }
    
    await kv.set(key, { count: current.count + 1, resetTime: current.resetTime }, { ex: 3600 });
    return { success: true, remaining: limit - current.count - 1, resetTime: current.resetTime };
  } catch (e) {
    // Fallback to in-memory map if @vercel/kv is not configured or fails
    let current = memoryFallback.get(userId);
    if (!current || now > current.resetTime) {
      current = { count: 1, resetTime: now + windowMs };
      memoryFallback.set(userId, current);
      return { success: true, remaining: limit - 1, resetTime: current.resetTime };
    }

    if (current.count >= limit) {
      return { success: false, remaining: 0, resetTime: current.resetTime };
    }

    current.count++;
    memoryFallback.set(userId, current);
    return { success: true, remaining: limit - current.count - 1, resetTime: current.resetTime };
  }
}
