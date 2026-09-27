import { Request, Response, NextFunction } from 'express';

export interface RateLimitOptions {
  windowSeconds?: number;
  maxRequests?: number;
  keyPrefix?: string;
  skipOptions?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  total: number;
}

// حافظه محلی کش برای محیط توسعه (Dev) یا در صورت عدم دسترسی به KV
const memoryFallbackMap = new Map<string, { count: number; resetTime: number }>();

// تابع پاک‌سازی حافظه بدون استفاده از setInterval در سطح ماژول (Serverless-Safe)
function pruneExpiredMemoryKeys() {
  if (memoryFallbackMap.size < 150) return;
  const now = Date.now();
  for (const [key, value] of memoryFallbackMap.entries()) {
    if (now > value.resetTime) {
      memoryFallbackMap.delete(key);
    }
  }
}

// بارگذاری تنبل (Lazy) برای کلاینت KV
let cachedKv: any = null;
let kvLoadAttempted = false;

async function getSafeKv() {
  if (kvLoadAttempted) return cachedKv;
  kvLoadAttempted = true;

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const kvModule = await import('@vercel/kv');
      cachedKv = kvModule.kv || (kvModule as any).default?.kv || kvModule;
      return cachedKv;
    } catch (err) {
      console.warn('[RateLimit] @vercel/kv could not be loaded dynamically, using memory fallback:', err);
    }
  }
  return null;
}

/**
 * بررسی محدودیت نرخ درخواست سازگار با محیط‌های Serverless Vercel
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 60,
  windowSeconds: number = 60,
  keyPrefix: string = 'rl'
): Promise<RateLimitResult> {
  const now = Date.now();
  const key = `${keyPrefix}:${identifier}`;
  const windowMs = windowSeconds * 1000;

  // ۱. تلاش برای استفاده از Vercel KV در صورت وجود متغیرهای محیطی
  const kv = await getSafeKv();
  if (kv && typeof kv.incr === 'function') {
    try {
      const current = await kv.incr(key);

      if (current === 1 && typeof kv.expire === 'function') {
        await kv.expire(key, windowSeconds);
      }

      const remaining = Math.max(0, limit - current);
      const resetTime = now + windowMs;

      return {
        success: current <= limit,
        remaining,
        resetTime,
        total: current,
      };
    } catch (err) {
      console.warn('[Serverless RateLimit] KV error, falling back to memory:', err);
    }
  }

  // ۲. فال‌بک امن در حافظه
  pruneExpiredMemoryKeys();

  let record = memoryFallbackMap.get(key);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    memoryFallbackMap.set(key, record);
    return {
      success: true,
      remaining: limit - 1,
      resetTime: record.resetTime,
      total: 1,
    };
  }

  record.count++;
  const remaining = Math.max(0, limit - record.count);
  return {
    success: record.count <= limit,
    remaining,
    resetTime: record.resetTime,
    total: record.count,
  };
}

/**
 * میدل‌ویر Express برای محافظت خودکار از مسیرهای API
 */
export function createServerlessRateLimiter(options: RateLimitOptions = {}) {
  const {
    windowSeconds = 60,
    maxRequests = 60,
    keyPrefix = 'api_rl',
    skipOptions = true,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // عبور خودکار درخواست‌های OPTIONS و مسیر سلامت
    if ((skipOptions && req.method === 'OPTIONS') || req.path === '/health') {
      return next();
    }

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'anonymous-ip';

    try {
      const result = await checkRateLimit(clientIp, maxRequests, windowSeconds, keyPrefix);

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));

      if (!result.success) {
        const retryAfterSeconds = Math.max(1, Math.ceil((result.resetTime - Date.now()) / 1000));
        res.setHeader('Retry-After', retryAfterSeconds);
        return res.status(429).json({
          error: `تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً ${retryAfterSeconds} ثانیه دیگر مجدداً تلاش کنید.`,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: retryAfterSeconds,
        });
      }

      next();
    } catch (err) {
      console.error('[RateLimit Middleware Error]', err);
      next();
    }
  };
}
