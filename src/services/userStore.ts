/**
 * Server-Side User & Progress Store with Conflict Resolution
 * سازگار با Vercel KV / Redis / Express Server
 */

import { StudentProfile } from '../types';

export interface SyncDelta {
  stars?: number;
  xp?: number;
  level?: number;
  streakDays?: number;
  solvedCount?: number;
  scannedImagesCount?: number;
  unlockedBadges?: string[];
  chapterMastery?: Record<string, number>;
  clientTimestamp?: number;
}

export interface StoredUserProfile extends StudentProfile {
  userId: string;
  hashedPhone: string;
  createdAt: string;
  updatedAt: string;
  serverVersion: number;
}

export interface IUserStore {
  getProfile(userId: string): Promise<StoredUserProfile | null>;
  saveProfile(profile: StoredUserProfile): Promise<void>;
  deleteProfile(userId: string): Promise<boolean>;
  syncProgress(userId: string, clientProfile: StudentProfile): Promise<{ mergedProfile: StoredUserProfile; conflictResolved: boolean }>;
}

/**
 * کلید ماسک کردن شماره تلفن برای حفظ حریم خصوصی کودک در گزارش‌های عمومی
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 11) return '۰۹***';
  return phone.slice(0, 4) + '***' + phone.slice(phone.length - 4);
}

/**
 * پیاده‌سازی ذخیره‌سازی ابری و محلی با استراتژی تطبیق و حل تعارض (Conflict Resolution)
 * قوانین حل تعارض برای دانش‌آموز:
 * ۱. ستاره‌ها، امتیاز و سوالات حل‌شده: ماکزیمم (هرگز دستاورد کودک پاک نمی‌شود).
 * ۲. مدال‌های بازشده: اجتماع دو مجموعه (Union Set).
 * ۳. تسلط بر فصل‌ها (Mastery): بالاترین درصد کسب‌شده در هر فصل.
 * ۴. روزهای پیاپی (Streak): بر اساس جدیدترین زمان فعالیت محاسبه می‌شود.
 */
export class MemoryOrKvUserStore implements IUserStore {
  private inMemoryDb = new Map<string, StoredUserProfile>();

  // در صورت استقرار روی Vercel با KV یا Redis
  private isKvAvailable(): boolean {
    return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  }

  async getProfile(userId: string): Promise<StoredUserProfile | null> {
    const cleanId = userId.trim();

    if (this.isKvAvailable()) {
      try {
        const res = await fetch(`${process.env.KV_REST_API_URL}/get/user:profile:${cleanId}`, {
          headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.result) {
            return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
          }
        }
      } catch (err) {
        console.warn('[Vercel KV] Error fetching profile, falling back to memory:', err);
      }
    }

    return this.inMemoryDb.get(cleanId) || null;
  }

  async saveProfile(profile: StoredUserProfile): Promise<void> {
    const cleanId = profile.userId.trim();
    profile.updatedAt = new Date().toISOString();
    profile.serverVersion = (profile.serverVersion || 0) + 1;

    if (this.isKvAvailable()) {
      try {
        await fetch(`${process.env.KV_REST_API_URL}/set/user:profile:${cleanId}`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(profile)
        });
      } catch (err) {
        console.warn('[Vercel KV] Error saving profile, falling back to memory:', err);
      }
    }

    this.inMemoryDb.set(cleanId, profile);
  }

  async deleteProfile(userId: string): Promise<boolean> {
    const cleanId = userId.trim();
    if (this.isKvAvailable()) {
      try {
        await fetch(`${process.env.KV_REST_API_URL}/del/user:profile:${cleanId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
        });
      } catch (err) {
        console.warn('[Vercel KV] Error deleting profile:', err);
      }
    }
    return this.inMemoryDb.delete(cleanId);
  }

  /**
   * الگوریتم هوشمند حل تعارض همگام‌سازی (Two-Way Smart Sync)
   */
  async syncProgress(userId: string, clientProfile: StudentProfile): Promise<{ mergedProfile: StoredUserProfile; conflictResolved: boolean }> {
    const existing = await this.getProfile(userId);
    const nowIso = new Date().toISOString();

    if (!existing) {
      // ایجاد پروفایل نو در سرور
      const newStored: StoredUserProfile = {
        ...clientProfile,
        userId,
        hashedPhone: maskPhoneNumber(clientProfile.phoneNumber || userId),
        createdAt: nowIso,
        updatedAt: nowIso,
        serverVersion: 1,
      };
      await this.saveProfile(newStored);
      return { mergedProfile: newStored, conflictResolved: false };
    }

    // ادغام پیشرفت با تضمین عدم از بین رفتن دستاوردهای کودک
    const mergedStars = Math.max(existing.stars || 0, clientProfile.stars || 0);
    const mergedXp = Math.max(existing.xp || 0, clientProfile.xp || 0);
    const mergedLevel = Math.max(existing.level || 1, clientProfile.level || 1);
    const mergedSolved = Math.max(existing.solvedCount || 0, clientProfile.solvedCount || 0);
    const mergedScanned = Math.max(existing.scannedImagesCount || 0, clientProfile.scannedImagesCount || 0);
    const mergedStreak = Math.max(existing.streakDays || 1, clientProfile.streakDays || 1);

    // اجتماع مدال‌های کسب‌شده
    const badgeSet = new Set<string>([
      ...(existing.unlockedBadges || []),
      ...(clientProfile.unlockedBadges || [])
    ]);
    const mergedBadges = Array.from(badgeSet);

    // بالاترین درصد تسلط برای هر یک از فصل‌های کتاب ریاضی سوم
    const mergedMastery: Record<string, number> = { ...(existing.chapterMastery || {}) };
    if (clientProfile.chapterMastery) {
      for (const [chId, val] of Object.entries(clientProfile.chapterMastery)) {
        mergedMastery[chId] = Math.max(mergedMastery[chId] || 0, val || 0);
      }
    }

    // ادغام وضعیت اشتراک و دسترسی VIP
    let mergedSubscription = existing.subscription || clientProfile.subscription;
    if (existing.subscription && clientProfile.subscription) {
      const existingVip = existing.subscription.isVip;
      const clientVip = clientProfile.subscription.isVip;
      if (existingVip && !clientVip) {
        mergedSubscription = existing.subscription;
      } else if (!existingVip && clientVip) {
        mergedSubscription = clientProfile.subscription;
      } else {
        // هر دو دارای اشتراک هستند، انقضای بیشتر انتخاب می‌شود
        const eExp = existing.subscription.expiresAt ? new Date(existing.subscription.expiresAt).getTime() : 0;
        const cExp = clientProfile.subscription.expiresAt ? new Date(clientProfile.subscription.expiresAt).getTime() : 0;
        mergedSubscription = eExp >= cExp ? existing.subscription : clientProfile.subscription;
      }
    }

    const mergedProfile: StoredUserProfile = {
      ...existing,
      name: clientProfile.name || existing.name,
      avatar: clientProfile.avatar || existing.avatar,
      stars: mergedStars,
      xp: mergedXp,
      level: mergedLevel,
      solvedCount: mergedSolved,
      scannedImagesCount: mergedScanned,
      streakDays: mergedStreak,
      unlockedBadges: mergedBadges,
      chapterMastery: mergedMastery as any,
      subscription: mergedSubscription,
      updatedAt: nowIso,
      serverVersion: (existing.serverVersion || 0) + 1,
    };

    await this.saveProfile(mergedProfile);
    return { mergedProfile, conflictResolved: true };
  }
}

export const userStore = new MemoryOrKvUserStore();
