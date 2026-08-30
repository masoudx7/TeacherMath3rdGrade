import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AITutorChat } from './components/AITutorChat';
import { ImageSolver } from './components/ImageSolver';
import { GamesHub } from './components/InteractiveGames/GamesHub';
import { ProgressDashboard } from './components/ProgressDashboard';
import { CurriculumGuide } from './components/CurriculumGuide';
import { Leaderboard } from './components/Leaderboard';
import { StudentProfileModal } from './components/StudentProfileModal';
import { PhoneAuthModal } from './components/PhoneAuthModal';
import { InAppReminderBanner } from './components/InAppReminderBanner';
import { SuccessCelebrationModal, CelebrationData } from './components/SuccessCelebrationModal';
import { AIDailyTip } from './components/AIDailyTip';
import { MistakeNotebook } from './components/MistakeNotebook';
import { ParentReport } from './components/ParentReport';
import { MyQuestionsView } from './components/MyQuestionsView';
import { StudentProfile, ChapterId } from './types';
import { BADGES } from './data/curriculum';

const STORAGE_KEY = 'math_tutor_3rd_profile_v3';
const ACCOUNTS_STORAGE_KEY = 'math_tutor_accounts_map_v1';

const DEFAULT_PROFILE: StudentProfile = {
  phoneNumber: '',
  isLoggedIn: false,
  name: 'دانش‌آموز مهمان',
  avatar: 'fox',
  stars: 0,
  xp: 0,
  level: 1,
  streakDays: 1, // شروع روز ورود حتماً ۱ روز است
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
  history: []
};

// Helper to get all saved user accounts from localStorage
const getSavedAccountsMap = (): Record<string, StudentProfile> => {
  try {
    const data = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Error reading accounts map:', e);
    return {};
  }
};

// Helper to save a single user profile to localStorage store
const saveAccountToStore = (userProfile: StudentProfile) => {
  if (!userProfile.phoneNumber || !userProfile.isLoggedIn) return;
  try {
    const map = getSavedAccountsMap();
    map[userProfile.phoneNumber] = userProfile;
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Error saving user account:', e);
  }
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
  const [isPhoneAuthOpen, setIsPhoneAuthOpen] = useState<boolean>(false);
  const [selectedChapterForGames, setSelectedChapterForGames] = useState<ChapterId>('patterns');
  const [celebrationData, setCelebrationData] = useState<CelebrationData | null>(null);

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

  const handleLoginSuccess = (phoneNumber: string, name?: string) => {
    const accounts = getSavedAccountsMap();
    const existingAccount = accounts[phoneNumber];

    if (existingAccount) {
      // Restore previous user profile!
      const restoredProfile: StudentProfile = {
        ...existingAccount,
        phoneNumber,
        isLoggedIn: true,
        name: name && name.trim() ? name.trim() : existingAccount.name || 'دانش‌آموز کوشا',
      };
      restoredProfile.unlockedBadges = getUnlockedBadges(restoredProfile);
      setProfile(restoredProfile);
    } else {
      // Brand new user profile for this phone number
      const newProfile: StudentProfile = {
        ...DEFAULT_PROFILE,
        phoneNumber,
        isLoggedIn: true,
        name: name && name.trim() ? name.trim() : 'دانش‌آموز کوشا',
      };
      newProfile.unlockedBadges = getUnlockedBadges(newProfile);
      setProfile(newProfile);
    }
  };

  const handleLogout = () => {
    // 1. Save progress of current logged-in user before logging out
    if (profile.phoneNumber && profile.isLoggedIn) {
      saveAccountToStore(profile);
    }

    // 2. Reset active profile to guest defaults (0 stars, cleared stats, logged out)
    const resetProfile: StudentProfile = {
      ...DEFAULT_PROFILE,
      name: 'دانش‌آموز مهمان',
      isLoggedIn: false,
      phoneNumber: '',
    };
    resetProfile.unlockedBadges = [];
    setProfile(resetProfile);

    // 3. Clear session storage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetProfile));
    } catch (e) {
      console.error(e);
    }
  };

  // Save profile to localStorage on updates & sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      if (profile.isLoggedIn && profile.phoneNumber) {
        saveAccountToStore(profile);

        // Sync to server leaderboard
        fetch('/api/leaderboard/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: profile.phoneNumber,
            name: profile.name,
            avatar: profile.avatar,
            phoneNumber: profile.phoneNumber,
            stars: profile.stars,
            level: profile.level,
            solvedCount: profile.solvedCount,
            unlockedBadges: profile.unlockedBadges,
            chapterMastery: profile.chapterMastery,
          }),
        }).catch(err => console.warn('Leaderboard auto-sync failed:', err));
      }
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  // Helper to trigger celebration modals
  const triggerBadgeOrLevelCheck = (prev: StudentProfile, updated: StudentProfile) => {
    if (updated.level > prev.level) {
      setTimeout(() => {
        setCelebrationData({
          type: 'level_up',
          title: `تبریک! به سطح ${updated.level} رسیدی! 👑`,
          subtitle: `آفرین! تلاش و تمرین زیادت باعث شد یک گام بزرگ برداری!`,
          icon: '🏆',
          starsEarned: 10,
        });
      }, 300);
    } else if (updated.unlockedBadges.length > prev.unlockedBadges.length) {
      const newlyUnlockedId = updated.unlockedBadges.find(id => !prev.unlockedBadges.includes(id));
      const badgeObj = BADGES.find(b => b.id === newlyUnlockedId);
      if (badgeObj) {
        setTimeout(() => {
          setCelebrationData({
            type: 'badge',
            title: `مدال جدید «${badgeObj.title}» باز شد! 🎖️`,
            subtitle: badgeObj.description,
            icon: badgeObj.icon,
            starsEarned: 5,
          });
        }, 300);
      }
    }
  };

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
      triggerBadgeOrLevelCheck(prev, updatedState);
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
      triggerBadgeOrLevelCheck(prev, updatedState);
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
      triggerBadgeOrLevelCheck(prev, updatedState);
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
        onOpenPhoneAuth={() => setIsPhoneAuthOpen(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Content Area */}
      <main className={`flex-1 ${activeTab === 'tutor' ? 'py-1 sm:py-3 px-1 sm:px-4 pb-18 sm:pb-4' : 'py-3 sm:py-6 px-2 sm:px-6 pb-24 sm:pb-8'} max-w-7xl mx-auto w-full`}>
        {/* Dynamic AI Math Tip of the Day - Only show on other tabs so chat has maximum vertical space */}
        {activeTab !== 'tutor' && <AIDailyTip soundEnabled={soundEnabled} />}

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
            targetChapterId={selectedChapterForGames}
            onAddStars={handleAddStars}
            onIncrementSolved={handleIncrementSolved}
            onRecordHistory={handleRecordHistory}
          />
        )}

        {activeTab === 'mistakes' && (
          <MistakeNotebook
            soundEnabled={soundEnabled}
            onAddStars={handleAddStars}
            userId={profile.phoneNumber || 'guest_student'}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard
            currentProfile={profile}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'curriculum' && (
          <CurriculumGuide
            soundEnabled={soundEnabled}
            onAddStars={handleAddStars}
            onSelectChapterForGame={(chapterId) => {
              setSelectedChapterForGames(chapterId as ChapterId);
              setActiveTab('games');
            }}
            onSelectChapterForQuiz={(chapterId) => {
              setSelectedChapterForGames(chapterId as ChapterId);
              setActiveTab('games');
            }}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressDashboard
            profile={profile}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'parent_report' && (
          <ParentReport
            profile={profile}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'my_questions' && (
          <MyQuestionsView
            profile={profile}
            soundEnabled={soundEnabled}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-slate-200/80 py-3.5 px-4 text-center text-[11px] sm:text-xs text-slate-500 font-bold mb-16 sm:mb-0">
        <p>برنامه‌ریزی و طراحی ویژه کتاب ریاضی پایه سوم ابتدایی 📚⭐️</p>
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

      {/* Phone OTP Login Modal */}
      <PhoneAuthModal
        isOpen={isPhoneAuthOpen}
        onClose={() => setIsPhoneAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        soundEnabled={soundEnabled}
        currentPhoneNumber={profile.phoneNumber}
        isLoggedIn={profile.isLoggedIn}
        onLogout={handleLogout}
      />

      {/* Friendly In-App Reminder Toast & Time Settings */}
      <InAppReminderBanner
        studentName={profile.name}
        soundEnabled={soundEnabled}
      />

      {/* Encouragement Success & Badge Celebration Modal */}
      <SuccessCelebrationModal
        data={celebrationData}
        onClose={() => setCelebrationData(null)}
        soundEnabled={soundEnabled}
      />
    </div>
  );
}
