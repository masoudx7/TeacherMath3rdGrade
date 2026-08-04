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

const STORAGE_KEY = 'math_tutor_3rd_profile_v2';

const DEFAULT_PROFILE: StudentProfile = {
  name: 'علی کوچولو',
  avatar: 'fox',
  stars: 12,
  xp: 120,
  level: 2,
  streakDays: 3,
  solvedCount: 8,
  scannedImagesCount: 1,
  unlockedBadges: ['first_step', 'star_collector'],
  chapterMastery: {
    patterns: 80,
    place_value: 85,
    fractions: 65,
    multiplication_division: 90,
    perimeter_area: 55,
    regrouping: 70,
    statistics: 60,
    advanced_multiplication: 45,
  },
  history: [
    { date: '1403/05/10', chapterId: 'patterns', score: 3, total: 3 },
    { date: '1403/05/11', chapterId: 'multiplication_division', score: 3, total: 3 },
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('tutor');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PROFILE;
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

      // Check badge unlocks
      const currentBadges = new Set(prev.unlockedBadges);
      BADGES.forEach(b => {
        if (b.requiredStars && newStars >= b.requiredStars) currentBadges.add(b.id);
        if (b.requiredSolved && prev.solvedCount >= b.requiredSolved) currentBadges.add(b.id);
        if (b.requiredScanned && prev.scannedImagesCount >= b.requiredScanned) currentBadges.add(b.id);
      });

      return {
        ...prev,
        stars: newStars,
        xp: newXp,
        level: newLevel,
        unlockedBadges: Array.from(currentBadges),
      };
    });
  };

  const handleIncrementSolved = () => {
    setProfile(prev => {
      const newCount = prev.solvedCount + 1;
      const currentBadges = new Set(prev.unlockedBadges);
      BADGES.forEach(b => {
        if (b.requiredSolved && newCount >= b.requiredSolved) currentBadges.add(b.id);
      });
      return {
        ...prev,
        solvedCount: newCount,
        unlockedBadges: Array.from(currentBadges),
      };
    });
  };

  const handleIncrementScanned = () => {
    setProfile(prev => {
      const newScanned = prev.scannedImagesCount + 1;
      const currentBadges = new Set(prev.unlockedBadges);
      BADGES.forEach(b => {
        if (b.requiredScanned && newScanned >= b.requiredScanned) currentBadges.add(b.id);
      });
      return {
        ...prev,
        scannedImagesCount: newScanned,
        unlockedBadges: Array.from(currentBadges),
      };
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
