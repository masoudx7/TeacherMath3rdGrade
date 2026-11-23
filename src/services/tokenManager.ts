/**
 * Server-Side AI Token & Daily Request Manager (Vercel KV / Upstash Redis + In-Memory Fallback)
 * سیستم مدیریت متمرکز توکن و سهمیه روزانه درخواست‌های هوش مصنوعی (Gemini / Groq / DeepSeek)
 */

import type { Request } from 'express';
import { StudentProfile } from '../types';
import { FREE_DAILY_AI_LIMIT, isUserVip } from '../utils/subscriptionManager';

export type AiProvider = 'gemini' | 'groq' | 'deepseek';
export type AiEndpointTag =
  | 'tutor_chat'
  | 'solve_image'
  | 'generate_quiz'
  | 'question_bank'
  | 'daily_tip'
  | 'general';

export interface ResolvedIdentity {
  userId: string | null;
  ip: string;
  trackingKeys: string[]; // Enforces both userId (if present) and IP bucket
  primaryKey: string;
}

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: 'USER_DAILY_REQUEST_LIMIT' | 'USER_DAILY_TOKEN_LIMIT' | 'GLOBAL_DAILY_BUDGET_LIMIT';
  message?: string;
  isVip: boolean;
  dailyLimit: number;
  requestsUsed: number;
  remainingRequests: number;
  tokensUsedToday: number;
  tokenLimit: number;
  resetAtIso: string;
}

export interface ProviderUsageStats {
  requests: number;
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface DailyGlobalTokenStats {
  date: string;
  requests: number;
  blockedRequests: number;
  cacheHitsSaved: number;
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
  dailyGlobalRequestLimit: number;
  dailyGlobalTokenLimit: number;
  byProvider: Record<AiProvider, ProviderUsageStats>;
  byEndpoint: Record<string, ProviderUsageStats>;
}

const DAY_TTL_SECONDS = 48 * 60 * 60; // Auto-expire KV keys after 48 hours

function parsePositiveInt(envVal: string | undefined, fallback: number): number {
  const parsed = Number(envVal);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function getTokenManagerConfig() {
  return {
    freeDailyRequests: parsePositiveInt(process.env.DAILY_FREE_AI_LIMIT, FREE_DAILY_AI_LIMIT),
    vipDailyRequests: parsePositiveInt(process.env.DAILY_VIP_AI_LIMIT, 100),
    freeDailyTokens: parsePositiveInt(process.env.DAILY_FREE_AI_TOKEN_LIMIT, 35_000),
    vipDailyTokens: parsePositiveInt(process.env.DAILY_VIP_AI_TOKEN_LIMIT, 300_000),
    globalDailyRequests: parsePositiveInt(process.env.DAILY_GLOBAL_AI_REQUEST_LIMIT, 1_500),
    globalDailyTokens: parsePositiveInt(process.env.DAILY_GLOBAL_AI_TOKEN_LIMIT, 2_000_000),
  };
}

function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getNextMidnightIso(): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return next.toISOString();
}

function sanitizeKeySegment(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 64) || 'anonymous';
}

// Lazy @vercel/kv loader (matches reportStore/userStore pattern)
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
    } catch (err) {
      console.warn('[TokenManager] @vercel/kv unavailable, using memory store:', err);
    }
  }
  return null;
}

class ServerTokenManager {
  private memoryCounters = new Map<string, number>();
  private memoryDate = getTodayDateKey();

  private createEmptyGlobalStats(date: string): DailyGlobalTokenStats {
    const cfg = getTokenManagerConfig();
    return {
      date,
      requests: 0,
      blockedRequests: 0,
      cacheHitsSaved: 0,
      promptTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      dailyGlobalRequestLimit: cfg.globalDailyRequests,
      dailyGlobalTokenLimit: cfg.globalDailyTokens,
      byProvider: {
        gemini: { requests: 0, promptTokens: 0, outputTokens: 0, totalTokens: 0 },
        groq: { requests: 0, promptTokens: 0, outputTokens: 0, totalTokens: 0 },
        deepseek: { requests: 0, promptTokens: 0, outputTokens: 0, totalTokens: 0 },
      },
      byEndpoint: {},
    };
  }

  private globalStats: DailyGlobalTokenStats = this.createEmptyGlobalStats(getTodayDateKey());

  private rollDateIfNeeded(): string {
    const today = getTodayDateKey();
    if (this.memoryDate !== today) {
      this.memoryCounters.clear();
      this.memoryDate = today;
      this.globalStats = this.createEmptyGlobalStats(today);
    }
    return today;
  }

  private async getCounter(key: string): Promise<number> {
    this.rollDateIfNeeded();
    const kv = await getSafeKv();
    if (kv && typeof kv.get === 'function') {
      try {
        const val = await kv.get(key);
        if (val !== null && val !== undefined) {
          return Number(val) || 0;
        }
      } catch (err) {
        console.warn('[TokenManager] KV get failed, reading memory:', err);
      }
    }
    return this.memoryCounters.get(key) || 0;
  }

  private async incrCounter(key: string, amount: number = 1): Promise<number> {
    this.rollDateIfNeeded();
    const nextMem = (this.memoryCounters.get(key) || 0) + amount;
    this.memoryCounters.set(key, nextMem);

    const kv = await getSafeKv();
    if (kv && typeof kv.incrby === 'function') {
      try {
        const kvVal = await kv.incrby(key, amount);
        if (kvVal === amount && typeof kv.expire === 'function') {
          await kv.expire(key, DAY_TTL_SECONDS);
        }
        return Number(kvVal) || nextMem;
      } catch (err) {
        console.warn('[TokenManager] KV incrby failed, keeping memory counter:', err);
      }
    } else if (kv && typeof kv.incr === 'function' && amount === 1) {
      try {
        const kvVal = await kv.incr(key);
        if (kvVal === 1 && typeof kv.expire === 'function') {
          await kv.expire(key, DAY_TTL_SECONDS);
        }
        return Number(kvVal) || nextMem;
      } catch (err) {
        console.warn('[TokenManager] KV incr failed, keeping memory counter:', err);
      }
    }

    return nextMem;
  }

  /**
   * استخراج امن شناسه کاربر و IP جهت جلوگیری از دور زدن محدودیت روزانه
   */
  resolveIdentity(req: Request): ResolvedIdentity {
    const forwarded = req.headers['x-forwarded-for'];
    const rawIp = Array.isArray(forwarded)
      ? forwarded[0]
      : typeof forwarded === 'string'
      ? forwarded.split(',')[0]
      : req.socket?.remoteAddress || 'unknown_ip';

    const cleanIp = sanitizeKeySegment(String(rawIp).trim());

    const rawBodyUser =
      (req.body && (req.body.userId || req.body.phoneNumber)) ||
      (req.query && (req.query.userId as string)) ||
      (req.headers['x-user-id'] as string) ||
      '';

    const trimmedUser = String(rawBodyUser).trim();
    const isRealUser =
      trimmedUser.length >= 3 &&
      trimmedUser !== 'guest_student' &&
      trimmedUser !== 'anonymous';

    const cleanUser = isRealUser ? sanitizeKeySegment(trimmedUser) : null;
    const trackingKeys = cleanUser ? [`u_${cleanUser}`, `ip_${cleanIp}`] : [`ip_${cleanIp}`];

    return {
      userId: cleanUser,
      ip: cleanIp,
      trackingKeys,
      primaryKey: trackingKeys[0],
    };
  }

  /**
   * بررسی سهمیه بدون افزایش شمارنده (برای نمایش وضعیت به کاربر یا کنترل پیش‌زمینه)
   */
  async getQuotaStatus(
    identity: ResolvedIdentity,
    profile?: StudentProfile | null
  ): Promise<QuotaCheckResult> {
    const today = this.rollDateIfNeeded();
    const cfg = getTokenManagerConfig();
    const vip = isUserVip(profile);
    const extraPack = !vip ? Math.max(0, profile?.subscription?.extraAiQuestions || 0) : 0;

    const dailyLimit = vip ? cfg.vipDailyRequests : cfg.freeDailyRequests + extraPack;
    const tokenLimit = vip ? cfg.vipDailyTokens : cfg.freeDailyTokens;

    const reqCounts = await Promise.all(
      identity.trackingKeys.map((k) => this.getCounter(`tm:req:${today}:${k}`))
    );
    const tokCounts = await Promise.all(
      identity.trackingKeys.map((k) => this.getCounter(`tm:tok:${today}:${k}`))
    );

    const requestsUsed = Math.max(0, ...reqCounts);
    const tokensUsedToday = Math.max(0, ...tokCounts);
    const globalReqs = await this.getCounter(`tm:global:req:${today}`);
    const globalToks = await this.getCounter(`tm:global:tok:${today}`);

    const resetAtIso = getNextMidnightIso();

    if (globalReqs >= cfg.globalDailyRequests || globalToks >= cfg.globalDailyTokens) {
      return {
        allowed: false,
        reason: 'GLOBAL_DAILY_BUDGET_LIMIT',
        message: 'ظرفیت سرور هوش مصنوعی برای امروز به سقف ایمن رسیده است. لطفاً فردا دوباره تلاش کنید.',
        isVip: vip,
        dailyLimit,
        requestsUsed,
        remainingRequests: 0,
        tokensUsedToday,
        tokenLimit,
        resetAtIso,
      };
    }

    if (requestsUsed >= dailyLimit) {
      return {
        allowed: false,
        reason: 'USER_DAILY_REQUEST_LIMIT',
        message: vip
          ? `سقف منصفانه استفاده روزانه (${dailyLimit} درخواست) برای امروز تکمیل شده است. فردا دوباره آماده پاسخگویی هستیم.`
          : `سهمیه ${dailyLimit} درخواست رایگان امروز به پایان رسید! 🌟 فردا ساعت ۰۰:۰۰ دوباره شارژ می‌شود یا می‌توانید از اشتراک طلایی استفاده کنید.`,
        isVip: vip,
        dailyLimit,
        requestsUsed,
        remainingRequests: 0,
        tokensUsedToday,
        tokenLimit,
        resetAtIso,
      };
    }

    if (tokensUsedToday >= tokenLimit) {
      return {
        allowed: false,
        reason: 'USER_DAILY_TOKEN_LIMIT',
        message: 'سقف مصرف توکن مجاز امروز شما پر شده است. لطفاً فردا ادامه دهید.',
        isVip: vip,
        dailyLimit,
        requestsUsed,
        remainingRequests: 0,
        tokensUsedToday,
        tokenLimit,
        resetAtIso,
      };
    }

    return {
      allowed: true,
      isVip: vip,
      dailyLimit,
      requestsUsed,
      remainingRequests: Math.max(0, dailyLimit - requestsUsed),
      tokensUsedToday,
      tokenLimit,
      resetAtIso,
    };
  }

  /**
   * بررسی و رزرو یک درخواست پیش از فراخوانی API مدل‌های هوش مصنوعی (Gemini/Groq/DeepSeek)
   */
  async checkAndConsumeRequest(
    identity: ResolvedIdentity,
    profile: StudentProfile | null | undefined,
    endpoint: AiEndpointTag
  ): Promise<QuotaCheckResult> {
    const status = await this.getQuotaStatus(identity, profile);

    if (!status.allowed) {
      this.globalStats.blockedRequests += 1;
      console.warn(
        `[TokenManager] Blocked ${endpoint} for ${identity.primaryKey} reason=${status.reason} (${status.requestsUsed}/${status.dailyLimit} reqs, ${status.tokensUsedToday} toks)`
      );
      return status;
    }

    const today = this.rollDateIfNeeded();
    await Promise.all([
      ...identity.trackingKeys.map((k) => this.incrCounter(`tm:req:${today}:${k}`, 1)),
      this.incrCounter(`tm:global:req:${today}`, 1),
    ]);

    const newUsed = status.requestsUsed + 1;
    return {
      ...status,
      requestsUsed: newUsed,
      remainingRequests: Math.max(0, status.dailyLimit - newUsed),
    };
  }

  /**
   * بررسی سریع بودجه کلی سرور برای کارهای پس‌زمینه (مثل نکته روز یا رشد خودکار بانک)
   */
  async isGlobalBudgetAvailable(): Promise<boolean> {
    const today = this.rollDateIfNeeded();
    const cfg = getTokenManagerConfig();
    const [globalReqs, globalToks] = await Promise.all([
      this.getCounter(`tm:global:req:${today}`),
      this.getCounter(`tm:global:tok:${today}`),
    ]);
    return globalReqs < cfg.globalDailyRequests && globalToks < cfg.globalDailyTokens;
  }

  /**
   * ثبت پاسخ کش‌شده یا آفلاین که بدون تماس با API گوگل/گراک صرفه‌جویی شده است
   */
  recordCacheHitSaved(endpoint: AiEndpointTag): void {
    this.rollDateIfNeeded();
    this.globalStats.cacheHitsSaved += 1;
    console.info(`[TokenManager] Zero-token fast path used for ${endpoint} (savedToday=${this.globalStats.cacheHitsSaved})`);
  }

  /**
   * ثبت دقیق توکن‌های مصرف‌شده بر اساس پاسخ واقعی مدل (Gemini usageMetadata یا Groq/DeepSeek usage)
   */
  async recordUsage(params: {
    identity?: ResolvedIdentity | null;
    provider: AiProvider;
    model?: string;
    endpoint: AiEndpointTag;
    promptTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  }): Promise<void> {
    const today = this.rollDateIfNeeded();
    const promptTokens = Math.max(0, Math.floor(params.promptTokens || 0));
    const outputTokens = Math.max(0, Math.floor(params.outputTokens || 0));
    const totalTokens = Math.max(promptTokens + outputTokens, Math.floor(params.totalTokens || 0));

    this.globalStats.requests += 1;
    this.globalStats.promptTokens += promptTokens;
    this.globalStats.outputTokens += outputTokens;
    this.globalStats.totalTokens += totalTokens;

    const pBucket = this.globalStats.byProvider[params.provider];
    if (pBucket) {
      pBucket.requests += 1;
      pBucket.promptTokens += promptTokens;
      pBucket.outputTokens += outputTokens;
      pBucket.totalTokens += totalTokens;
    }

    const eBucket = this.globalStats.byEndpoint[params.endpoint] || {
      requests: 0,
      promptTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    };
    eBucket.requests += 1;
    eBucket.promptTokens += promptTokens;
    eBucket.outputTokens += outputTokens;
    eBucket.totalTokens += totalTokens;
    this.globalStats.byEndpoint[params.endpoint] = eBucket;

    if (totalTokens > 0) {
      const ops: Promise<number>[] = [this.incrCounter(`tm:global:tok:${today}`, totalTokens)];
      if (params.identity) {
        for (const k of params.identity.trackingKeys) {
          ops.push(this.incrCounter(`tm:tok:${today}:${k}`, totalTokens));
        }
      }
      await Promise.all(ops);
    }

    console.info(
      `[TokenManager] provider=${params.provider} model=${params.model || 'default'} endpoint=${params.endpoint} in=${promptTokens} out=${outputTokens} total=${totalTokens} | dailyGlobal=${this.globalStats.totalTokens} toks (${this.globalStats.requests} calls)`
    );
  }

  /**
   * دریافت آمار کلی امروز برای داشبورد ادمین و پایش هزینه‌ها
   */
  async getGlobalStats(): Promise<DailyGlobalTokenStats> {
    const today = this.rollDateIfNeeded();
    const cfg = getTokenManagerConfig();
    const [kvReqs, kvToks] = await Promise.all([
      this.getCounter(`tm:global:req:${today}`),
      this.getCounter(`tm:global:tok:${today}`),
    ]);

    return {
      ...this.globalStats,
      requests: Math.max(this.globalStats.requests, kvReqs),
      totalTokens: Math.max(this.globalStats.totalTokens, kvToks),
      dailyGlobalRequestLimit: cfg.globalDailyRequests,
      dailyGlobalTokenLimit: cfg.globalDailyTokens,
    };
  }
}

export const tokenManager = new ServerTokenManager();
