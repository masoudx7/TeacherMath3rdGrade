import React from 'react';
import { StudentProfile } from '../types';
import { AVATARS } from '../data/curriculum';
import { playSound } from '../utils/sound';
import { 
  Bot, 
  Gamepad2, 
  BarChart2, 
  BookOpen, 
  Star, 
  Flame, 
  Award,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Trophy,
  BookMarked,
  Users,
  Crown
} from 'lucide-react';
import { isUserVip, getRemainingSubscriptionDays } from '../utils/subscriptionManager';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: StudentProfile;
  onOpenProfile: () => void;
  onOpenPhoneAuth: () => void;
  onOpenSubscription: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenProfile,
  onOpenPhoneAuth,
  onOpenSubscription,
  soundEnabled,
  setSoundEnabled,
}) => {
  const selectedAvatar = AVATARS.find(a => a.id === profile.avatar) || AVATARS[0];
  const isVip = isUserVip(profile);
  const remainingDays = getRemainingSubscriptionDays(profile);

  const tabs = [
    { id: 'tutor', label: 'معلم دانا', shortLabel: 'گفتگو', icon: Bot, badge: 'هوشمند' },
    { id: 'progress', label: 'کارنامه و تروفی‌ها', shortLabel: 'کارنامه', icon: BarChart2 },
    { id: 'games', label: 'تمرین و آزمون', shortLabel: 'تمرین', icon: Gamepad2 },
    { id: 'mistakes', label: 'دفترچه اشتباهات', shortLabel: 'اشتباهات', icon: BookMarked, badge: 'رفع اشکال' },
    { id: 'curriculum', label: 'فصل‌های کتاب', shortLabel: 'فصل‌ها', icon: BookOpen },
    { id: 'parent_report', label: 'گزارش اولیا', shortLabel: 'اولیا', icon: Users },
    { id: 'leaderboard', label: 'برترین‌ها', shortLabel: 'برترین‌ها', icon: Trophy, badge: '🏆' },
  ];

  const handleTabClick = (tabId: string) => {
    playSound('click', soundEnabled);
    setActiveTab(tabId);
  };

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#FFF9E5]/95 backdrop-blur-md pb-2 pt-2 px-1.5 sm:px-6 box-border w-full max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto bg-white p-2 sm:p-4 rounded-2xl sm:rounded-3xl shadow-[0_4px_0_0_#E0E0E0] sm:shadow-[0_8px_0_0_#E0E0E0] border-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 box-border w-full max-w-full">
          {/* Main Flex Row */}
          <div className="w-full flex items-center justify-between gap-1.5 sm:gap-3">
            {/* App Title & Mascot */}
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink-0">
              <div className="w-9 h-9 sm:w-14 sm:h-14 bg-[#FF6B6B] rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl shadow-xs border-2 border-white shrink-0">
                🦉
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-2xl font-bold text-[#2D3436] tracking-tight flex items-center gap-1 truncate">
                  <span className="truncate">آموزگار سوم</span>
                  <span className="text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-[#FFEAA7] text-[#D35400] border border-[#FDCB6E] shrink-0 hidden sm:inline-block">
                    سوم
                  </span>
                </h1>
                <p className="text-[11px] text-slate-500 hidden sm:block font-medium">ریاضی سوم ابتدایی</p>
              </div>
            </div>

            {/* Profile & Rewards Stats & Actions */}
            <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
              {/* Streak */}
              <div className="flex items-center gap-0.5 px-2 py-1 sm:px-3 sm:py-2 bg-[#FFF3F0] border border-[#FAB1A0] rounded-full text-[#D35400] text-[11px] sm:text-sm font-bold shrink-0">
                <Flame className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-orange-500 fill-orange-400" />
                <span>{profile.streakDays}</span>
              </div>

              {/* Stars Pill */}
              <div className="bg-[#FFEAA7] px-2 py-1 sm:px-4 sm:py-2 rounded-full border border-[#FDCB6E] flex items-center gap-0.5 text-[#D35400] font-bold text-[11px] sm:text-sm shadow-xs shrink-0">
                <span>⭐</span>
                <span>{profile.stars}</span>
              </div>

              {/* Golden Subscription Button */}
              {isVip ? (
                <button
                  type="button"
                  onClick={() => {
                    playSound('click', soundEnabled);
                    onOpenSubscription();
                  }}
                  className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-2 rounded-full border border-amber-400 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[11px] sm:text-xs font-black shadow-xs cursor-pointer shrink-0"
                  title="اشتراک طلایی فعال است"
                >
                  <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-white shrink-0" />
                  <span className="hidden sm:inline">طلایی</span>
                  {remainingDays !== null && (
                    <span className="text-[9px] bg-black/20 px-1 rounded-full">
                      {remainingDays}ر
                    </span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    playSound('click', soundEnabled);
                    onOpenSubscription();
                  }}
                  className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-2 rounded-full border border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] sm:text-xs font-black shadow-xs animate-pulse cursor-pointer shrink-0"
                  title="خرید اشتراک طلایی"
                >
                  <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 fill-amber-400 shrink-0" />
                  <span>طلایی 👑</span>
                </button>
              )}

              {/* Phone Auth Login Button */}
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  onOpenPhoneAuth();
                }}
                className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-2 rounded-full border text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 ${
                  profile.isLoggedIn
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-amber-100 border-amber-300 text-amber-950 animate-pulse'
                }`}
                title={profile.isLoggedIn ? `ورود فعال: ${profile.phoneNumber}` : 'ورود با شماره موبایل'}
              >
                {profile.isLoggedIn ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="hidden md:inline text-[11px] dir-ltr">{profile.phoneNumber?.slice(-4)}...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="hidden sm:inline">ورود</span>
                  </>
                )}
              </button>

              {/* Avatar Button */}
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  onOpenProfile();
                }}
                className="flex items-center gap-1 p-1 sm:pl-3 sm:pr-1.5 sm:py-1.5 bg-[#E1F5FE] border border-[#74B9FF] rounded-full hover:bg-sky-100 transition-all cursor-pointer shadow-xs min-h-[34px] shrink-0"
                title="پروفایل و آواتار"
              >
                <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#74B9FF] rounded-full border border-white shadow-xs flex items-center justify-center text-sm sm:text-lg shrink-0">
                  {selectedAvatar.icon}
                </div>
                <span className="text-xs font-bold text-slate-800 hidden lg:inline max-w-[80px] truncate">{profile.name}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs Bar */}
        <nav className="mt-3 hidden sm:flex justify-center">
          <div className="bg-white rounded-full px-4 sm:px-8 py-2 flex items-center gap-2 sm:gap-4 shadow-md border-2 border-slate-200 overflow-x-auto max-w-full no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#6C5CE7] text-white shadow-[0_4px_0_0_#4834D4]'
                      : 'text-slate-500 hover:text-[#6C5CE7] hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-2 py-0.2 rounded-full font-black ${
                      isActive ? 'bg-[#FFEAA7] text-[#D35400]' : 'bg-[#FFF3F0] text-[#FF7675] border border-[#FAB1A0]'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t-2 border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-1.5 px-1 sm:hidden flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all cursor-pointer min-w-[62px] min-h-[48px] ${
                isActive
                  ? 'text-[#6C5CE7] font-black'
                  : 'text-slate-400 font-semibold hover:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive ? 'bg-[#6C5CE7] text-white shadow-xs scale-110' : ''
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'text-[#6C5CE7] font-black' : 'text-slate-500'}`}>
                {tab.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
