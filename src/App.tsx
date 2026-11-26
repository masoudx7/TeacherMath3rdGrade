import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AITutorChat } from './components/AITutorChat';
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
import { ParentalConsentModal } from './components/ParentalConsentModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { OstadDanaSplash } from './components/OstadDanaSplash';
import { DailyPracticeSection } from './components/DailyPracticeSection';
import { ReportsPage } from './admin/ReportsPage';
import { StudentProfile, ChapterId } from './types';
import { BADGES } from './data/playstationTrophies';
import { evaluateTrophies } from './utils/trophyEngine';
import { fetchServerProfile, syncProgressToServer } from './utils/syncManager';
import { syncAndGrowOfflineQuestionBank } from './hooks/useQuestionBank';
import { getLocalDateKey } from './utils/dailyExercises';
import { initCapacitorBridge } from './utils/capacitorBridge';

const STORAGE_KEY = 'math_tutor_3rd_profile_v4';
const ACCOUNTS_STORAGE_KEY = 'math_tutor_accounts_map_v1';
const PARENTAL_CONSENT_KEY = 'math_tutor_parental_consent_v1';

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

// Helper to evaluate honor badges, award their bonus stars cleanly, and return finalized profile
const finalizeProfileWithBadges = (prof: StudentProfile): StudentProfile => {
  let working: StudentProfile = {
    ...prof,
    unlockedBadges: Array.isArray(prof.unlockedBadges) ? [...prof.unlockedBadges] : [],
  };

  // Up to 2 passes so bonus stars from a newly unlocked badge can also unlock star/level badges
  for (let pass = 0; pass < 2; pass++) {
    const newlyUnlockedIds = evaluateTrophies(working);
    if (newlyUnlockedIds.length === 0) break;

    const bonusStars = newlyUnlockedIds.reduce((sum, id) => {
      const badge = BADGES.find((b) => b.id === id);
      return sum + (badge?.bonusStars || 2);
    }, 0);

    const nextStars = (working.stars || 0) + bonusStars;
    const nextXp = (working.xp || 0) + bonusStars * 10;
    const nextLevel = Math.floor(nextXp / 100) + 1;

    working = {
      ...working,
      stars: nextStars,
      xp: nextXp,
      level: Math.max(working.level || 1, nextLevel),
      unlockedBadges: Array.from(new Set([...working.unlockedBadges, ...newlyUnlockedIds])),
    };
  }

  return working;
};

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('tutor');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isPhoneAuthOpen, setIsPhoneAuthOpen] = useState<boolean>(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState<boolean>(false);
  const [selectedChapterForGames, setSelectedChapterForGames] = useState<ChapterId>('patterns');
  const [celebrationQueue, setCelebrationQueue] = useState<CelebrationData[]>([]);
  const [tutorExternalPrompt, setTutorExternalPrompt] = useState<{ id: string; text: string } | null>(null);
  const tutorChatContainerRef = React.useRef<HTMLDivElement>(null);

  // وضعیت و کنترل مودال اجباری رضایت ولی در بدو ورود (حتی حالت مهمان)
  const [isParentalConsentOpen, setIsParentalConsentOpen] = useState<boolean>(() => {
    try {
      const consent = localStorage.getItem(PARENTAL_CONSENT_KEY);
      return !consent; // اگر هنوز تایید نشده باشد، کل برنامه قفل می‌ماند
    } catch {
      return true;
    }
  });
  const [isReviewPrivacyOpen, setIsReviewPrivacyOpen] = useState<boolean>(false);

  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_PROFILE, ...parsed };
        return finalizeProfileWithBadges(merged);
      }
    } catch (e) {
      console.error(e);
    }
    return finalizeProfileWithBadges({ ...DEFAULT_PROFILE });
  });

  const prevLevelRef = React.useRef<number>(profile.level || 1);
  const prevBadgesRef = React.useRef<string[]>(profile.unlockedBadges || []);
  const suppressNextCelebrationRef = React.useRef<boolean>(false);

  // همگام‌سازی و رشد خودکار بانک سوالات آفلاین (تا ۵۰۰۰ سوال) در هر بار اجرای اپ
  useEffect(() => {
    const timer = setTimeout(() => {
      syncAndGrowOfflineQuestionBank().catch(() => {});
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const backStateRef = React.useRef({
    showSplash,
    activeTab,
    isProfileOpen,
    isPhoneAuthOpen,
    isSubscriptionOpen,
    isReviewPrivacyOpen,
    isParentalConsentOpen,
    hasCelebration: celebrationQueue.length > 0,
  });

  backStateRef.current = {
    showSplash,
    activeTab,
    isProfileOpen,
    isPhoneAuthOpen,
    isSubscriptionOpen,
    isReviewPrivacyOpen,
    isParentalConsentOpen,
    hasCelebration: celebrationQueue.length > 0,
  };

  useEffect(() => {
    return initCapacitorBridge({
      handleBackPress: () => {
        const s = backStateRef.current;
        if (s.hasCelebration) {
          setCelebrationQueue((prev) => prev.slice(1));
          return true;
        }
        if (s.isProfileOpen) {
          setIsProfileOpen(false);
          return true;
        }
        if (s.isPhoneAuthOpen) {
          setIsPhoneAuthOpen(false);
          return true;
        }
        if (s.isSubscriptionOpen) {
          setIsSubscriptionOpen(false);
          return true;
        }
        if (s.isReviewPrivacyOpen) {
          setIsReviewPrivacyOpen(false);
          return true;
        }
        if (s.isParentalConsentOpen) {
          return true;
        }
        if (!s.showSplash && s.activeTab !== 'tutor') {
          setActiveTab('tutor');
          return true;
        }
        return false;
      },
    });
  }, []);

  // ثبت و ذخیره تاییدیه رضایت والدین و همگام‌سازی با سرور در صورت لاگین
  const handleAcceptParentalConsent = () => {
    try {
      const consentPayload = {
        accepted: true,
        timestamp: new Date().toISOString(),
        version: '1.0',
      };
      localStorage.setItem(PARENTAL_CONSENT_KEY, JSON.stringify(consentPayload));
    } catch (e) {
      console.error('Error saving consent to localStorage:', e);
    }

    setIsParentalConsentOpen(false);

    setProfile((prev) => {
      const updated: StudentProfile = {
        ...prev,
        parentalConsentAccepted: true,
        parentalConsentDate: new Date().toISOString(),
      };
      saveAccountToStore(updated);
      if (updated.phoneNumber && updated.isLoggedIn) {
        syncProgressToServer(updated).catch(() => {});
      }
      return updated;
    });
  };

  const handleLoginSuccess = async (phoneNumber: string, name?: string, serverProfile?: any) => {
    const syncConsentFromRemote = (remoteData?: any) => {
      if (remoteData?.parentalConsentAccepted) {
        try {
          localStorage.setItem(
            PARENTAL_CONSENT_KEY,
            JSON.stringify({
              accepted: true,
              timestamp: remoteData.parentalConsentDate || new Date().toISOString(),
              version: '1.0',
            })
          );
        } catch {}
        setIsParentalConsentOpen(false);
      }
    };

    // ۱. اگر پروفایل از سرور دریافت شده باشد، مستقیماً بازیابی می‌شود
    if (serverProfile) {
      syncConsentFromRemote(serverProfile);
      const restoredProfile = finalizeProfileWithBadges({
        ...DEFAULT_PROFILE,
        ...serverProfile,
        phoneNumber,
        isLoggedIn: true,
        name: name && name.trim() ? name.trim() : serverProfile.name || 'دانش‌آموز کوشا',
      });
      suppressNextCelebrationRef.current = true;
      setProfile(restoredProfile);
      saveAccountToStore(restoredProfile);
      return;
    }

    // ۲. در غیر این صورت، از سرور استعلام می‌شود (برای سناریوی تغییر دستگاه یا پاک شدن کش)
    try {
      const remote = await fetchServerProfile(phoneNumber);
      if (remote) {
        syncConsentFromRemote(remote);
        const restoredProfile = finalizeProfileWithBadges({
          ...DEFAULT_PROFILE,
          ...remote,
          phoneNumber,
          isLoggedIn: true,
          name: name && name.trim() ? name.trim() : remote.name || 'دانش‌آموز کوشا',
        });
        suppressNextCelebrationRef.current = true;
        setProfile(restoredProfile);
        saveAccountToStore(restoredProfile);
        return;
      }
    } catch (e) {
      console.warn('Could not fetch server profile on login:', e);
    }

    // ۳. بررسی حافظه محلی ذخیره‌شده
    const accounts = getSavedAccountsMap();
    const existingAccount = accounts[phoneNumber];

    if (existingAccount) {
      const restoredProfile = finalizeProfileWithBadges({
        ...existingAccount,
        phoneNumber,
        isLoggedIn: true,
        name: name && name.trim() ? name.trim() : existingAccount.name || 'دانش‌آموز کوشا',
      });
      suppressNextCelebrationRef.current = true;
      setProfile(restoredProfile);
      saveAccountToStore(restoredProfile);
    } else {
      // ایجاد پروفایل نو
      const newProfile = finalizeProfileWithBadges({
        ...DEFAULT_PROFILE,
        phoneNumber,
        isLoggedIn: true,
        name: name && name.trim() ? name.trim() : 'دانش‌آموز کوشا',
      });
      suppressNextCelebrationRef.current = true;
      setProfile(newProfile);
      saveAccountToStore(newProfile);
    }
  };

  const handleLogout = () => {
    // 1. Save progress of current logged-in user before logging out
    if (profile.phoneNumber && profile.isLoggedIn) {
      saveAccountToStore(profile);
      syncProgressToServer(profile);
    }

    // 2. Reset active profile to guest defaults (0 stars, cleared stats, logged out)
    const resetProfile: StudentProfile = {
      ...DEFAULT_PROFILE,
      name: 'دانش‌آموز مهمان',
      isLoggedIn: false,
      phoneNumber: '',
      unlockedBadges: [],
    };
    suppressNextCelebrationRef.current = true;
    setProfile(resetProfile);

    // 3. Clear session storage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetProfile));
    } catch (e) {
      console.error(e);
    }
  };

  // Save profile to localStorage on updates & sync to server
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      if (profile.isLoggedIn && profile.phoneNumber) {
        saveAccountToStore(profile);
        syncProgressToServer(profile);
      }
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  // Trigger celebrations cleanly whenever level increases or new honor badges unlock
  useEffect(() => {
    const currentBadges = profile.unlockedBadges || [];
    if (suppressNextCelebrationRef.current) {
      suppressNextCelebrationRef.current = false;
      prevLevelRef.current = profile.level || 1;
      prevBadgesRef.current = currentBadges;
      return;
    }

    const queued: CelebrationData[] = [];

    if ((profile.level || 1) > prevLevelRef.current) {
      queued.push({
        type: 'level_up',
        title: `تبریک! به سطح ${profile.level} رسیدی! 👑`,
        subtitle: 'آفرین! تلاش و تمرین پیوسته‌ات باعث شد یک پله بزرگ بالا بروی!',
        icon: '🏆',
        starsEarned: 10,
      });
    }

    const newlyUnlockedIds = currentBadges.filter((id) => !prevBadgesRef.current.includes(id));
    newlyUnlockedIds.forEach((id) => {
      const badgeObj = BADGES.find((b) => b.id === id);
      if (badgeObj) {
        queued.push({
          type: 'badge',
          title: `نشان افتخار «${badgeObj.title}» باز شد!`,
          subtitle: badgeObj.encouragement || badgeObj.description,
          icon: badgeObj.icon,
          starsEarned: badgeObj.bonusStars || 3,
        });
      }
    });

    prevLevelRef.current = profile.level || 1;
    prevBadgesRef.current = currentBadges;

    if (queued.length > 0) {
      const timer = setTimeout(() => {
        setCelebrationQueue((prev) => [...prev, ...queued]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [profile.level, profile.unlockedBadges]);

  // Handle adding stars & level progression
  const handleAddStars = (count: number) => {
    setProfile(prev => {
      const newStars = prev.stars + count;
      const newXp = prev.xp + count * 10;
      const newLevel = Math.floor(newXp / 100) + 1;

      return finalizeProfileWithBadges({
        ...prev,
        stars: newStars,
        xp: newXp,
        level: Math.max(prev.level || 1, newLevel),
      });
    });
  };

  const handleIncrementSolved = () => {
    setProfile(prev =>
      finalizeProfileWithBadges({
        ...prev,
        solvedCount: (prev.solvedCount || 0) + 1,
      })
    );
  };

  const handleIncrementScanned = () => {
    setProfile(prev =>
      finalizeProfileWithBadges({
        ...prev,
        scannedImagesCount: (prev.scannedImagesCount || 0) + 1,
      })
    );
  };

  const handleRecordHistory = (chapterId: ChapterId, score: number, total: number) => {
    setProfile(prev => {
      const newMastery = { ...prev.chapterMastery };
      const currentVal = newMastery[chapterId] || 50;
      const perfPercent = Math.round((score / Math.max(1, total)) * 100);
      newMastery[chapterId] = Math.min(100, Math.round((currentVal + perfPercent) / 2));

      return finalizeProfileWithBadges({
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
      });
    });
  };

  const handleUpdateProfile = (updated: Partial<StudentProfile>) => {
    setProfile(prev => finalizeProfileWithBadges({ ...prev, ...updated }));
  };

  const handleEnterOstadDana = () => {
    setActiveTab('tutor');
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <OstadDanaSplash
        onEnter={handleEnterOstadDana}
        soundEnabled={soundEnabled}
        studentName={profile.name}
      />
    );
  }

  const handleAskDailyQuestionInTutor = (questionText: string) => {
    setTutorExternalPrompt({
      id: `daily_${Date.now()}`,
      text: questionText,
    });
    tutorChatContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDailyHabitCompleted = (newHabitStreak: number) => {
    const todayKey = getLocalDateKey();
    setProfile((prev) =>
      finalizeProfileWithBadges({
        ...prev,
        streakDays: Math.max(prev.streakDays || 1, newHabitStreak),
        lastActiveDate: todayKey,
      })
    );

    setCelebrationQueue((prev) => [
      ...prev,
      {
        type: 'quiz_perfect',
        title: 'آفرین! هر ۳ تمرین امروز کامل شد!',
        subtitle: `عادت مطالعه روزانه تو عالی پیش می‌ره (${newHabitStreak} روز پیوسته). فردا با ۳ تمرین تازه برگرد!`,
        icon: '🌟',
        starsEarned: 5,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#FBF6EC] text-[#26354D] flex flex-col font-sans dir-rtl selection:bg-[#FFEAA7]">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenPhoneAuth={() => setIsPhoneAuthOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onOpenSplash={() => setShowSplash(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Content Area */}
      <main className={`flex-1 min-h-0 flex flex-col ${activeTab === 'tutor' ? 'py-3 sm:py-5 px-2.5 sm:px-6 pb-24 sm:pb-10 space-y-4' : 'py-4 sm:py-6 px-3 sm:px-6 pb-24 sm:pb-10 space-y-4'} max-w-7xl mx-auto w-full overflow-x-hidden box-border`}>
        {/* Dynamic AI Math Tip of the Day - Only show on other tabs so chat has maximum vertical space */}
        {activeTab !== 'tutor' && <AIDailyTip soundEnabled={soundEnabled} />}

        {activeTab === 'tutor' && (
          <>
            <DailyPracticeSection
              soundEnabled={soundEnabled}
              onAddStars={handleAddStars}
              onIncrementSolved={handleIncrementSolved}
              onAskOstadDana={handleAskDailyQuestionInTutor}
              onDailyHabitCompleted={handleDailyHabitCompleted}
              onRecordChapterAttempt={handleRecordHistory}
            />

            <div ref={tutorChatContainerRef} className="w-full">
              <AITutorChat
                soundEnabled={soundEnabled}
                onAddStars={handleAddStars}
                onIncrementSolved={handleIncrementSolved}
                profile={profile}
                onUpdateProfile={(updated) => setProfile(updated)}
                onOpenSubscription={() => setIsSubscriptionOpen(true)}
                externalPrompt={tutorExternalPrompt}
                onExternalPromptConsumed={() => setTutorExternalPrompt(null)}
              />
            </div>
          </>
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
            onIncrementSolved={handleIncrementSolved}
            onRecordChapterAttempt={handleRecordHistory}
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
            onFeatureBadge={(badgeId) => handleUpdateProfile({ featuredBadgeId: badgeId })}
            onNavigateToPractice={(chapterId) => {
              if (chapterId) {
                setSelectedChapterForGames(chapterId);
                setActiveTab('games');
              } else {
                setActiveTab('tutor');
              }
            }}
          />
        )}

        {activeTab === 'parent_report' && (
          <ParentReport
            profile={profile}
            soundEnabled={soundEnabled}
            onDataWiped={handleLogout}
          />
        )}

        {activeTab === 'admin_reports' && (
          <ReportsPage
            onClose={() => setActiveTab('tutor')}
          />
        )}
      </main>

      {/* Clean Quiet Footer on non-chat views */}
      {activeTab !== 'tutor' && (
        <footer className="bg-white/80 border-t border-slate-200/80 py-3.5 px-4 text-center text-xs text-slate-500 font-medium mb-16 sm:mb-0 flex flex-col sm:flex-row items-center justify-center gap-2">
          <p>آموزش مفهومی ریاضی پایه سوم ابتدایی</p>
          <span className="hidden sm:inline text-slate-300" aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setIsReviewPrivacyOpen(true)}
            className="text-slate-700 hover:text-[#1E293B] underline font-bold transition-colors cursor-pointer"
          >
            حریم خصوصی کودکان و اختیارات اولیا
          </button>
          <span className="hidden sm:inline text-slate-300" aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setActiveTab('admin_reports')}
            className="text-slate-700 hover:text-[#1E293B] font-bold transition-colors cursor-pointer"
          >
            پنل مدیریت گزارش‌ها
          </button>
        </footer>
      )}


      {/* مودال اجباری رضایت ولی در بدو ورود (قفل کامل اپلیکیشن تا زمان پذیرش) */}
      <ParentalConsentModal
        isOpen={isParentalConsentOpen}
        isMandatoryGate={true}
        onConsentAccepted={handleAcceptParentalConsent}
        phoneNumber={profile.phoneNumber}
        studentName={profile.name}
        soundEnabled={soundEnabled}
      />

      {/* مودال مرور اختیاری سیاست حریم خصوصی و اختیارات اولیا از فوتر */}
      <ParentalConsentModal
        isOpen={isReviewPrivacyOpen}
        isMandatoryGate={false}
        onClose={() => setIsReviewPrivacyOpen(false)}
        phoneNumber={profile.phoneNumber}
        studentName={profile.name}
        onDataWiped={handleLogout}
        soundEnabled={soundEnabled}
      />

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

      {/* Subscription Modal */}
      {isSubscriptionOpen && (
        <SubscriptionModal
          isOpen={isSubscriptionOpen}
          onClose={() => setIsSubscriptionOpen(false)}
          profile={profile}
          soundEnabled={soundEnabled}
          onPurchaseSuccess={(updatedProfile) => {
            setProfile(updatedProfile);
          }}
        />
      )}

      {/* Friendly In-App Reminder Toast & Time Settings */}
      <InAppReminderBanner
        studentName={profile.name}
        soundEnabled={soundEnabled}
      />

      {/* Encouragement Success & Badge Celebration Modal */}
      <SuccessCelebrationModal
        data={celebrationQueue[0] || null}
        onClose={() => setCelebrationQueue((prev) => prev.slice(1))}
        soundEnabled={soundEnabled}
      />
    </div>
  );
}
