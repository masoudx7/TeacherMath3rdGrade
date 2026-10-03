import { StudentProfile } from '../types';
import { TROPHIES } from '../data/playstationTrophies';

export const evaluateTrophies = (profile: StudentProfile): string[] => {
  const newlyUnlocked: string[] = [];
  const currentUnlocked = profile.unlockedBadges || [];

  TROPHIES.forEach(trophy => {
    if (currentUnlocked.includes(trophy.id)) return;

    let conditionMet = false;
    const { type, threshold } = trophy.condition;

    switch (type) {
      case 'solved':
        conditionMet = profile.solvedCount >= (threshold as number);
        break;
      case 'streak':
        conditionMet = profile.streakDays >= (threshold as number);
        break;
      case 'mastery':
        const numThreshold = threshold as number;
        if (numThreshold <= 1) {
          conditionMet = Object.values(profile.chapterMastery || {}).some(m => m >= numThreshold);
        } else {
          conditionMet = Object.values(profile.chapterMastery || {}).filter(m => m >= 0.8).length >= numThreshold;
        }
        break;
    }

    if (conditionMet) {
      newlyUnlocked.push(trophy.id);
    }
  });
  return newlyUnlocked;
};
