import { StudentProfile, SubscriptionInfo, SubscriptionPlanId } from '../types';
import { PRICING_PLANS } from '../data/pricingPlans';

export const FREE_DAILY_AI_LIMIT = 7;

/**
 * دریافت تاریخ امروز به فرمت YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * بررسی اینکه آیا کاربر دارای اشتراک فعال طلایی (VIP) است یا خیر
 */
export function isUserVip(profile?: StudentProfile | null): boolean {
  if (!profile || !profile.subscription) return false;
  if (!profile.subscription.isVip) return false;

  // اگر تاریخ انقضا مشخص شده باشد، بررسی می‌کنیم که نگذشته باشد
  if (profile.subscription.expiresAt) {
    const expires = new Date(profile.subscription.expiresAt).getTime();
    if (Date.now() > expires) {
      return false; // اشتراک منقضی شده است
    }
  }

  return true;
}

/**
 * محاسبه روزهای باقیمانده از اشتراک طلایی
 */
export function getRemainingSubscriptionDays(profile?: StudentProfile | null): number | null {
  if (!isUserVip(profile) || !profile?.subscription?.expiresAt) return null;
  const expires = new Date(profile.subscription.expiresAt).getTime();
  const diffMs = expires - Date.now();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * بررسی دسترسی به فصل‌های کتاب:
 * - فصل‌های ۱ و ۲ برای همه رایگان است.
 * - فصل‌های ۳ تا ۸ نیاز به اشتراک طلایی دارند.
 */
export function canAccessChapter(profile?: StudentProfile | null, chapterNumber?: number): boolean {
  if (!chapterNumber || chapterNumber <= 2) return true; // فصل‌های ۱ و ۲ کاملاً رایگان هستند
  return isUserVip(profile); // فصل‌های ۳ تا ۸ نیازمند VIP
}

/**
 * سهمیه سوالات هوش مصنوعی (استاد دانا و اسکنر تکالیف):
 * - کاربران VIP: نامحدود
 * - کاربران رایگان: ۳ سوال روزانه رایگان + بسته‌های سوال خریداری‌شده
 */
export function checkAiQuota(profile?: StudentProfile | null): {
  allowed: boolean;
  remainingDaily: number;
  extraQuestions: number;
  totalAvailable: number;
  isVip: boolean;
  dailyUsed: number;
} {
  const vip = isUserVip(profile);
  if (vip) {
    return {
      allowed: true,
      remainingDaily: 999,
      extraQuestions: 999,
      totalAvailable: 999,
      isVip: true,
      dailyUsed: 0,
    };
  }

  const today = getTodayDateString();
  const sub = profile?.subscription;
  const dailyUsed = (sub && sub.lastAiDate === today) ? (sub.dailyAiUsed || 0) : 0;
  const extraQuestions = sub?.extraAiQuestions || 0;
  const remainingDaily = Math.max(0, FREE_DAILY_AI_LIMIT - dailyUsed);
  const totalAvailable = remainingDaily + extraQuestions;

  return {
    allowed: totalAvailable > 0,
    remainingDaily,
    extraQuestions,
    totalAvailable,
    isVip: false,
    dailyUsed,
  };
}

/**
 * ثبت مصرف یک سوال هوش مصنوعی در پروفایل دانش‌آموز
 */
export function consumeAiQuota(profile?: StudentProfile | null): StudentProfile {
  const safeProfile: StudentProfile = profile || {
    name: 'دانش‌آموز',
    avatar: 'fox',
    stars: 0,
    xp: 0,
    level: 1,
    streakDays: 1,
    solvedCount: 0,
    scannedImagesCount: 0,
    unlockedBadges: [],
    chapterMastery: { patterns: 0, place_value: 0, fractions: 0, multiplication_division: 0, perimeter_area: 0, regrouping: 0, statistics: 0, advanced_multiplication: 0 },
    history: []
  };

  if (isUserVip(safeProfile)) {
    return safeProfile; // مشترکین VIP نیازی به کسر سهمیه ندارند
  }

  const today = getTodayDateString();
  const currentSub: SubscriptionInfo = safeProfile.subscription || {
    plan: 'free',
    isVip: false,
    expiresAt: null,
    extraAiQuestions: 0,
    dailyAiUsed: 0,
    lastAiDate: today,
  };

  const isToday = currentSub.lastAiDate === today;
  const currentDailyUsed = isToday ? (currentSub.dailyAiUsed || 0) : 0;
  let newDailyUsed = currentDailyUsed;
  let newExtraQuestions = currentSub.extraAiQuestions || 0;

  if (currentDailyUsed < FREE_DAILY_AI_LIMIT) {
    // از سهمیه رایگان روزانه کسر می‌شود
    newDailyUsed += 1;
  } else if (newExtraQuestions > 0) {
    // از بسته سوالات خریداری شده کسر می‌شود
    newExtraQuestions -= 1;
  }

  const updatedSub: SubscriptionInfo = {
    ...currentSub,
    dailyAiUsed: newDailyUsed,
    lastAiDate: today,
    extraAiQuestions: newExtraQuestions,
  };

  return {
    ...safeProfile,
    subscription: updatedSub,
  };
}

/**
 * فعال‌سازی یا تمدید اشتراک بر روی پروفایل
 */
export function activatePlan(profile?: StudentProfile | null, planId: SubscriptionPlanId = 'yearly'): StudentProfile {
  const safeProfile: StudentProfile = profile || {
    name: 'دانش‌آموز',
    avatar: 'fox',
    stars: 0,
    xp: 0,
    level: 1,
    streakDays: 1,
    solvedCount: 0,
    scannedImagesCount: 0,
    unlockedBadges: [],
    chapterMastery: { patterns: 0, place_value: 0, fractions: 0, multiplication_division: 0, perimeter_area: 0, regrouping: 0, statistics: 0, advanced_multiplication: 0 },
    history: []
  };

  const currentSub = safeProfile.subscription;
  const now = new Date();
  const today = getTodayDateString();

  if (planId === 'ai_pack_50') {
    // خرید بسته سوال: ۵۰ سوال به موجودی اضافه می‌شود بدون تغییر وضعیت VIP
    const updatedSub: SubscriptionInfo = {
      plan: currentSub?.plan || 'free',
      isVip: currentSub?.isVip || false,
      expiresAt: currentSub?.expiresAt || null,
      extraAiQuestions: (currentSub?.extraAiQuestions || 0) + 50,
      dailyAiUsed: currentSub?.dailyAiUsed || 0,
      lastAiDate: currentSub?.lastAiDate || today,
    };
    return { ...safeProfile, subscription: updatedSub };
  }

  // اشتراک زمانی
  const plan = PRICING_PLANS.find(p => p.id === planId);
  const durationDays = plan?.durationDays || 30;

  // اگر قبلاً اشتراک فعال داشته، مهلت جدید به انتهای اشتراک فعلی اضافه می‌شود
  let baseTime = now.getTime();
  if (currentSub?.isVip && currentSub.expiresAt) {
    const currentExp = new Date(currentSub.expiresAt).getTime();
    if (currentExp > baseTime) {
      baseTime = currentExp;
    }
  }

  const newExpiresAt = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000).toISOString();

  const newSub: SubscriptionInfo = {
    plan: planId,
    isVip: true,
    expiresAt: newExpiresAt,
    startDate: now.toISOString(),
    extraAiQuestions: currentSub?.extraAiQuestions || 0,
    dailyAiUsed: 0,
    lastAiDate: today,
  };

  return {
    ...safeProfile,
    subscription: newSub,
  };
}

/**
 * قالب‌بندی قیمت به تومان با جداکننده ارقام فارسی
 */
export function formatToman(amount: number): string {
  if (typeof amount !== 'number') return '۰ تومان';
  return amount.toLocaleString('fa-IR') + ' تومان';
}
