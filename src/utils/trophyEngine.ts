import { StudentProfile } from '../types';
import { TROPHIES, Trophy } from '../data/playstationTrophies';

export interface TrophyProgress {
  current: number;
  target: number;
  unit: string;
  percent: number;
}

export const getTrophyProgress = (trophy: Trophy, profile: StudentProfile): TrophyProgress => {
  let current = 0;
  let target = 1;
  let unit = '';

  const { type, threshold, chapterId, minMasteryPercent } = trophy.condition;
  const masteryMap = profile.chapterMastery || ({} as Record<string, number>);

  switch (type) {
    case 'solved': {
      current = profile.solvedCount || 0;
      target = Math.max(1, Number(threshold) || 1);
      unit = 'مسئله';
      break;
    }
    case 'streak': {
      current = profile.streakDays || 1;
      target = Math.max(1, Number(threshold) || 1);
      unit = 'روز پیاپی';
      break;
    }
    case 'stars': {
      current = profile.stars || 0;
      target = Math.max(1, Number(threshold) || 1);
      unit = 'ستاره';
      break;
    }
    case 'level': {
      current = profile.level || 1;
      target = Math.max(1, Number(threshold) || 1);
      unit = 'سطح';
      break;
    }
    case 'chapter_mastery': {
      current = Math.round(chapterId ? masteryMap[chapterId] || 0 : 0);
      target = Math.max(1, Number(threshold) || 60);
      unit = '٪ تسلط';
      break;
    }
    case 'mastery': {
      const numThreshold = Number(threshold) || 0.5;
      const masteryVals = Object.values(masteryMap).map((v) => Number(v) || 0);

      // Single-chapter percentage threshold (stored in 0..1 form like 0.5 / 0.8 or 50 / 80)
      if (numThreshold <= 1) {
        target = Math.round(numThreshold * 100);
        current = Math.round(Math.max(0, ...masteryVals));
        unit = '٪ تسلط';
      } else {
        // Multi-chapter count reaching >= minMasteryPercent (default 80%)
        const requiredPercent = minMasteryPercent ?? 80;
        target = numThreshold;
        current = masteryVals.filter((m) => m >= requiredPercent).length;
        unit = 'فصل مسلط';
      }
      break;
    }
    default: {
      current = profile.solvedCount || 0;
      target = 10;
      unit = 'مسئله';
    }
  }

  const percent = Math.min(100, Math.max(0, Math.round((current / target) * 100)));
  return { current, target, unit, percent };
};

export const isTrophyConditionMet = (trophy: Trophy, profile: StudentProfile): boolean => {
  const { current, target } = getTrophyProgress(trophy, profile);
  return current >= target;
};

export const evaluateTrophies = (profile: StudentProfile): string[] => {
  const newlyUnlocked: string[] = [];
  const currentUnlocked = profile.unlockedBadges || [];

  for (const trophy of TROPHIES) {
    if (currentUnlocked.includes(trophy.id)) continue;
    if (isTrophyConditionMet(trophy, profile)) {
      newlyUnlocked.push(trophy.id);
    }
  }

  return newlyUnlocked;
};
