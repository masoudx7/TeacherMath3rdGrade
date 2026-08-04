import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AITutorChat } from './components/AITutorChat';
import { ImageSolver } from './components/ImageSolver';
import { GamesHub } from './components/InteractiveGames/GamesHub';
import { ProgressDashboard } from './components/ProgressDashboard';
import { CurriculumGuide } from './components/CurriculumGuide';
import { StudentProfileModal } from './components/StudentProfileModal';
import { StudentProfile, ChapterId } from './types';
import { BADGES } from './data/curriculum';

const STORAGE_KEY = 'math_tutor_3rd_profile_v3';

const DEFAULT_PROFILE: StudentProfile = {
  name: 'دانش‌آموز کوشا',
  avatar: 'fox',
  stars: 0,
  xp: 0,
  level: 1,
  streakDays: 1, // شروع روز ورود حتماً ۱ روز است
  solvedCount: 0,
  scannedImagesCount: 0,
  unlockedBadges: [],
  chapterMastery: {
    patterns: 20,
    place_value: 15,
    fractions: 10,
    multiplication_division: 10,
    perimeter_area: 5,
    regrouping: 5,
    statistics: 0,
    advanced_multiplication: 0,
  },
  history: []
};

// Helper to check badge unlocks based on current stats
const getUnlockedBadges = (prof: StudentProfile): string[] => {
  const badgeSet = new Set(prof.unlockedBadges || []);
  BADGES.forEach(b => {
    let qualifies = true;
    if (b.requiredStars !== undefined && prof.stars < b.requiredStars) qualifies = false;
    if (b.requiredSolved !== undefined && prof.solvedCount < b.requiredSolved) qualifies = false;
    if (b.requiredScanned !== undefined && prof.scannedImagesCount < b.requiredScanned) qualifies = false;
    if (b.requiredStreak !== undefined && prof.streakDays < b.requiredStreak) qualifies = false;
    if (b.requiredLevel !== undefined && prof.level < b.requiredLevel) qualifies = false;

    if (qualifies) {
      badgeSet.add(b.id);
    }
  });
  return Array.from(badgeSet);
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('tutor');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_PROFILE, ...parsed };
        merged.unlockedBadges = getUnlockedBadges(merged);
        return merged;
      }
    } catch (e) {
      console.error(e);
    }
    const initial = { ...DEFAULT_PROFILE };
    initial.unlockedBadges = getUnlockedBadges(initial);
    return initial;
  });

  // Save profile to localStorage on updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  // Handle adding stars & level progression
  const handleAddStars = (count: number) => {
    setProfile(prev => {
      const newStars = prev.stars + count;
      const newXp = prev.xp + count * 10;
      const newLevel = Math.floor(newXp / 100) + 1;

      const updatedState: StudentProfile = {
        ...prev,
        stars: newStars,
        xp: newXp,
        level: newLevel,
      };

      updatedState.unlockedBadges = getUnlockedBadges(updatedState);
      return updatedState;
    });
  };

  const handleIncrementSolved = () => {
    setProfile(prev => {
      const newCount = prev.solvedCount + 1;
      const updatedState: StudentProfile = {
        ...prev,
        solvedCount: newCount,
      };
      updatedState.unlockedBadges = getUnlockedBadges(updatedState);
      return updatedState;
    });
  };

  const handleIncrementScanned = () => {
    setProfile(prev => {
      const newScanned = prev.scannedImagesCount + 1;
      const updatedState: StudentProfile = {
        ...prev,
        scannedImagesCount: newScanned,
      };
      updatedState.unlockedBadges = getUnlockedBadges(updatedState);
      return updatedState;
    });
  };

  const handleRecordHistory = (chapterId: ChapterId, score: number, total: number) => {
    setProfile(prev => {
      const newMastery = { ...prev.chapterMastery };
      const currentVal = newMastery[chapterId] || 50;
      const perfPercent = Math.round((score / total) * 100);
      newMastery[chapterId] = Math.min(100, Math.round((currentVal + perfPercent) / 2));

      return {
        ...prev,
        chapterMastery: newMastery,
        history: [
          ...prev.history,
          {
            date: new Date().toLocaleDateString('fa-IR'),
            chapterId,
            score,
            total,
          }
        ]
      };
    });
  };

  const handleUpdateProfile = (updated: Partial<StudentProfile>) => {
    setProfile(prev => ({ ...prev, ...updated }));
  };

  return (
    <div className="min-h-screen bg-[#FFF9E5] text-[#4A4A4A] flex flex-col font-sans dir-rtl selection:bg-[#FFEAA7]">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onOpenProfile={() => setIsProfileOpen(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Content Area */}
      <main className="flex-1 py-6 px-3 sm:px-6 max-w-7xl mx-auto w-full">
        {activeTab === 'tutor' && (
          <AITutorChat
            soundEnabled={soundEnabled}
            onAddStars={handleAddStars}
            onIncrementSolved={handleIncrementSolved}
          />
        )}

        {activeTab === 'scan' && (
          <ImageSolver
            soundEnabled={soundEnabled}
            onAddStars={handleAddStars}
            onIncrementScanned={handleIncrementScanned}
          />
        )}

        {activeTab === 'games' && (
          <GamesHub
            soundEnabled={soundEnabled}
            onAddStars={handleAddStars}
            onIncrementSolved={handleIncrementSolved}
            onRecordHistory={handleRecordHistory}
          />
        )}

        {activeTab === 'curriculum' && (
          <CurriculumGuide
            soundEnabled={soundEnabled}
            onSelectChapterForQuiz={() => setActiveTab('games')}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressDashboard
            profile={profile}
            soundEnabled={soundEnabled}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-slate-200/80 py-4 text-center text-xs text-slate-500 font-bold">
        <p>برنامه‌ریزی و طراحی ویژه کتاب ریاضی پایه سوم ابتدایی 📚⭐️ با پشتیبانی هوش مصنوعی Gemini 3.6</p>
      </footer>

      {/* Profile Edit Modal */}
      {isProfileOpen && (
        <StudentProfileModal
          profile={profile}
          onSave={handleUpdateProfile}
          onClose={() => setIsProfileOpen(false)}
          soundEnabled={soundEnabled}
        />
      )}
    </div>
  );
}
