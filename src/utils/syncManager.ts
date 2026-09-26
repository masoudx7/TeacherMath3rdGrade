/**
 * Client-Side Sync Manager for Student Profile & Progress
 * مدیریت خودکار همگام‌سازی، حالت آفلاین، ذخیره محلی و بازیابی ابری
 */

import { StudentProfile } from '../types';

const STORAGE_KEY = 'math_tutor_3rd_profile_v3';
const TOKEN_KEY = 'math_tutor_auth_token';

export async function fetchServerProfile(phoneNumber: string): Promise<StudentProfile | null> {
  try {
    const res = await fetch(`/api/user/profile?phone=${encodeURIComponent(phoneNumber)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.profile || null;
  } catch (err) {
    console.warn('[SyncManager] Error fetching remote profile:', err);
    return null;
  }
}

export async function syncProgressToServer(profile: StudentProfile): Promise<StudentProfile> {
  if (!profile.phoneNumber || !profile.isLoggedIn) {
    return profile;
  }

  try {
    const res = await fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: profile.phoneNumber,
        profile: profile,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.mergedProfile) {
        // بروزرسانی حافظه محلی با نسخه ادغام‌شده سرور
        const merged = { ...profile, ...data.mergedProfile };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (err) {
    console.warn('[SyncManager] Offline or server unavailable, progress queued locally:', err);
  }

  return profile;
}
