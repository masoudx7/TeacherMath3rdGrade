import React from 'react';
import { StudentProfile } from '../types';
import { AVATARS } from '../data/curriculum';
import { playSound } from '../utils/sound';
import { 
  Bot, 
  Camera, 
  Gamepad2, 
  BarChart2, 
  BookOpen, 
  Star, 
  Volume2, 
  VolumeX, 
  Flame, 
  Award,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Trophy
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: StudentProfile;
  onOpenProfile: () => void;
  onOpenPhoneAuth: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenProfile,
  onOpenPhoneAuth,
  soundEnabled,
  setSoundEnabled,
}) => {
  const selectedAvatar = AVATARS.find(a => a.id === profile.avatar) || AVATARS[0];

  const tabs = [
    { id: 'tutor', label: 'معلم دانا', shortLabel: 'گفتگو', icon: Bot, badge: 'هوشمند' },
    { id: 'scan', label: 'اسکن مسئله', shortLabel: 'اسکن', icon: Camera, badge: 'عکس' },
    { id: 'games', label: 'بازی‌های ریاضی', shortLabel: 'بازی', icon: Gamepad2, badge: 'تمرین' },
    { id: 'leaderboard', label: 'جدول برترین‌ها', shortLabel: 'برترین‌ها', icon: Trophy, badge: '🏆' },
    { id: 'curriculum', label: 'فصل‌های کتاب', shortLabel: 'فصل‌ها', icon: BookOpen },
    { id: 'progress', label: 'کارنامه من', shortLabel: 'کارنامه', icon: BarChart2 },
  ];

  const handleTabClick = (tabId: string) => {
    playSound('click', soundEnabled);
    setActiveTab(tabId);
  };

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#FFF9E5]/95 backdrop-blur-md pb-2 pt-2 sm:pt-3 px-2 sm:px-6">
        <div className="max-w-7xl mx-auto bg-white p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-[0_4px_0_0_#E0E0E0] sm:shadow-[0_8px_0_0_#E0E0E0] border-2 border-slate-100 flex items-center justify-between gap-2">
          {/* App Title & Mascot */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#FF6B6B] rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-xs border-2 border-white shrink-0 transform hover:rotate-6 transition-transform">
              🦉
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-2xl font-bold text-[#2D3436] tracking-tight flex items-center gap-1.5 truncate">
                <span className="truncate">آموزگار هوشمند</span>
                <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFEAA7] text-[#D35400] border border-[#FDCB6E] shrink-0">
                  سوم
                </span>
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">ریاضی سوم ابتدایی - دستیار یادگیری گام به گام</p>
            </div>
          </div>

          {/* Profile & Rewards Stats */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border-2 text-xs sm:text-sm font-bold flex items-center justify-center transition-all cursor-pointer min-w-[38px] min-h-[38px] ${
                soundEnabled 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100' 
                  : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
              }`}
              title={soundEnabled ? 'صدا فعال است' : 'صدا غیرفعال است'}
              aria-label="تنظیم صدا"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Streak */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-[#FFF3F0] border-2 border-[#FAB1A0] rounded-full text-[#D35400] text-xs sm:text-sm font-bold">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 fill-orange-400 animate-bounce" />
              <span>{profile.streakDays} روز</span>
            </div>

            {/* Stars Pill */}
            <div className="bg-[#FFEAA7] px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 border-[#FDCB6E] flex items-center gap-1 text-[#D35400] font-bold text-xs sm:text-sm shadow-xs">
              <span className="text-sm sm:text-lg">⭐</span>
              <span>{profile.stars}</span>
            </div>

            {/* Level (Desktop only) */}
            <div className="hidden md:flex items-center gap-1 px-3 py-2 bg-purple-50 border-2 border-purple-200 rounded-full text-purple-700 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>سطح {profile.level}</span>
            </div>

            {/* Phone Auth Login Button */}
            <button
              onClick={() => {
                playSound('click', soundEnabled);
                onOpenPhoneAuth();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full border-2 text-xs font-bold transition-all cursor-pointer shadow-xs ${
                profile.isLoggedIn
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 animate-pulse'
              }`}
              title={profile.isLoggedIn ? `ورود فعال: ${profile.phoneNumber}` : 'ورود با شماره موبایل'}
            >
              {profile.isLoggedIn ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="hidden lg:inline text-[11px] dir-ltr">{profile.phoneNumber?.slice(-4)}...</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full font-black">فعال</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="text-xs sm:text-xs">ورود با موبایل</span>
                </>
              )}
            </button>

            {/* Avatar Button */}
            <button
              onClick={() => {
                playSound('click', soundEnabled);
                onOpenProfile();
              }}
              className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:pl-3 sm:pr-1.5 sm:py-1.5 bg-[#E1F5FE] border-2 border-[#74B9FF] rounded-full hover:bg-sky-100 transition-all cursor-pointer shadow-xs min-h-[38px]"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#74B9FF] rounded-full border-2 border-white shadow-xs flex items-center justify-center text-sm sm:text-lg shrink-0">
                {selectedAvatar.icon}
              </div>
              <div className="text-right hidden sm:block">
                <p className="font-bold text-slate-800 text-xs max-w-[90px] truncate">{profile.name}</p>
                <p className="text-[10px] text-sky-700 font-bold">پروفایل من</p>
              </div>
            </button>
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
