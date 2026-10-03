import { useState, useEffect, useCallback } from 'react';
import { StudentProfile, ChapterId } from '../types';
import { BADGES } from '../data/curriculum';
import { fetchServerProfile, syncProgressToServer } from '../utils/syncManager';

const STORAGE_KEY = 'math_tutor_3rd_profile_v3';
const ACCOUNTS_STORAGE_KEY = 'math_tutor_accounts_map_v1';

export const DEFAULT_PROFILE: StudentProfile = {
  phoneNumber: '',
  isLoggedIn: false,
  name: 'دانش‌آموز مهمان',
  avatar: 'fox',
  stars: 0,
  xp: 0,
  level: 1,
  streakDays: 1,
  solvedCount: 0,
  scannedImagesCount: 0,
  unlockedBadges: [],
  chapterMastery: {
    patterns: 0,
    place_value: 0,
    fractions: 0,
    multiplication_division: 0,
    perimeter_area: 0,
    regrouping: 0,
    statistics: 0,
    advanced_multiplication: 0,
  },
  history: [],
};

export const getSavedAccountsMap = (): Record<string, StudentProfile> => {
  try {
    const data = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Error reading accounts map:', e);
    return {};
  }
};

export const saveAccountToStore = (userProfile: StudentProfile) => {
  if (!userProfile.phoneNumber || !userProfile.isLoggedIn) return;
  try {
    const map = getSavedAccountsMap();
    map[userProfile.phoneNumber] = userProfile;
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Error saving user account:', e);
  }
};

import { evaluateTrophies } from '../utils/trophyEngine';

export const calculateUnlockedBadges = (prof: StudentProfile): string[] => {
  const existingUnlocked = prof.unlockedBadges || [];
  const newlyUnlocked = evaluateTrophies(prof);
  const badgeSet = new Set([...existingUnlocked, ...newlyUnlocked]);
  return Array.from(badgeSet);
};

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_PROFILE, ...parsed };
        merged.unlockedBadges = calculateUnlockedBadges(merged);
        return merged;
      }
    } catch (e) {
      console.error('Error loading profile from localStorage:', e);
    }
    const initial = { ...DEFAULT_PROFILE };
    initial.unlockedBadges = calculateUnlockedBadges(initial);
    return initial;
  });

  // ذخیره در localStorage و همگام‌سازی ابری در هر تغییر
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      if (profile.isLoggedIn && profile.phoneNumber) {
        saveAccountToStore(profile);
        syncProgressToServer(profile);
      }
    } catch (e) {
      console.error('Error persisting profile:', e);
    }
  }, [profile]);

  const addStars = useCallback((count: number) => {
    setProfile((prev) => {
      const newStars = prev.stars + count;
      const newXp = prev.xp + count * 10;
      const newLevel = Math.floor(newStars / 25) + 1;
      const updated = { ...prev, stars: newStars, xp: newXp, level: newLevel };
      updated.unlockedBadges = calculateUnlockedBadges(updated);
      return updated;
    });
  }, []);

  const incrementSolved = useCallback(() => {
    setProfile((prev) => {
      const newSolved = prev.solvedCount + 1;
      const updated = { ...prev, solvedCount: newSolved };
      updated.unlockedBadges = calculateUnlockedBadges(updated);
      return updated;
    });
  }, []);

  const incrementScanned = useCallback(() => {
    setProfile((prev) => {
      const newScanned = prev.scannedImagesCount + 1;
      const updated = { ...prev, scannedImagesCount: newScanned };
      updated.unlockedBadges = calculateUnlockedBadges(updated);
      return updated;
    });
  }, []);

  const updateChapterMastery = useCallback((chapterId: ChapterId, percentage: number) => {
    setProfile((prev) => {
      const current = prev.chapterMastery?.[chapterId] || 0;
      if (percentage <= current) return prev;
      const newMastery = { ...prev.chapterMastery, [chapterId]: percentage };
      const updated = { ...prev, chapterMastery: newMastery };
      updated.unlockedBadges = calculateUnlockedBadges(updated);
      return updated;
    });
  }, []);

  const handleLogin = useCallback(async (phoneNumber: string, name?: string, serverProfile?: any) => {
    if (serverProfile) {
      const restored: StudentProfile = {
        ...DEFAULT_PROFILE,
        ...serverProfile,
        phoneNumber,
        isLoggedIn: true,
        name: name && name.trim() ? name.trim() : serverProfile.name || 'دانش‌آموز کوشا',
      };
      restored.unlockedBadges = calculateUnlockedBadges(restored);
      setProfile(restored);
      saveAccountToStore(restored);
      return;
    }

    try {
      const remote = await fetchServerProfile(phoneNumber);
      if (remote) {
        const restored: StudentProfile = {
          ...DEFAULT_PROFILE,
          ...remote,
          phoneNumber,
          isLoggedIn: true,
          name: name && name.trim() ? name.trim() : remote.name || 'دانش‌آموز کوشا',
        };
        restored.unlockedBadges = calculateUnlockedBadges(restored);
        setProfile(restored);
        saveAccountToStore(restored);
        return;
      }
    } catch (e) {
      console.warn('Could not fetch server profile:', e);
    }

    const accounts = getSavedAccountsMap();
    const existing = accounts[phoneNumber];
    if (existing) {
      const restored = {
        ...existing,
        phoneNumber,
        isLoggedIn: true,
        name: name && name.trim() ? name.trim() : existing.name || 'دانش‌آموز کوشا',
      };
      restored.unlockedBadges = calculateUnlockedBadges(restored);
      setProfile(restored);
      saveAccountToStore(restored);
    } else {
      const newProf: StudentProfile = {
        ...DEFAULT_PROFILE,
        phoneNumber,
        isLoggedIn: true,
        name: name && name.trim() ? name.trim() : 'دانش‌آموز کوشا',
      };
      newProf.unlockedBadges = calculateUnlockedBadges(newProf);
      setProfile(newProf);
      saveAccountToStore(newProf);
    }
  }, []);

  const handleLogout = useCallback(() => {
    if (profile.phoneNumber && profile.isLoggedIn) {
      saveAccountToStore(profile);
      syncProgressToServer(profile);
    }

    const resetProfile: StudentProfile = {
      ...DEFAULT_PROFILE,
      name: 'دانش‌آموز مهمان',
      isLoggedIn: false,
      phoneNumber: '',
    };
    resetProfile.unlockedBadges = [];
    setProfile(resetProfile);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetProfile));
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  return {
    profile,
    setProfile,
    addStars,
    incrementSolved,
    incrementScanned,
    updateChapterMastery,
    handleLogin,
    handleLogout,
  };
}
