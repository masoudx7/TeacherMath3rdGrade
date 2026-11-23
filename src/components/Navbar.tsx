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
import ostadDanaEmblem from '../assets/images/ostad_dana_emblem_1795466544643.jpg';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: StudentProfile;
  onOpenProfile: () => void;
  onOpenPhoneAuth: () => void;
  onOpenSubscription: () => void;
  onOpenSplash?: () => void;
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
  onOpenSplash,
  soundEnabled,
  setSoundEnabled,
}) => {
  const [logoImgError, setLogoImgError] = React.useState(false);
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
      {/* Warm Soft-Neomorphic Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#FFFDF8]/92 backdrop-blur-md border-b border-amber-200/55 shadow-[0_8px_28px_-14px_rgba(120,82,40,0.16)] w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Brand Zone: Clickable Ostad Dana Emblem */}
          <button
            type="button"
            onClick={() => {
              playSound('click', soundEnabled);
              if (onOpenSplash) {
                onOpenSplash();
              } else {
                handleTabClick('tutor');
              }
            }}
            className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0 text-right cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl py-1"
            title="بازگشت به صفحه آغازین استاد دانا"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#FFF9E5] rounded-2xl flex items-center justify-center shadow-[0_6px_14px_-6px_rgba(120,82,40,0.28),inset_0_1px_0_#fff] border border-amber-200/80 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
              {!logoImgError ? (
                <img
                  src={ostadDanaEmblem}
                  alt="لوگو استاد دانا"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoImgError(true)}
                  className="w-full h-full object-cover scale-105"
                />
              ) : (
                <span className="text-lg sm:text-xl" aria-hidden="true">🦉</span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold text-[#26354D] tracking-tight truncate">
                استاد دانا
              </h1>
              <p className="text-[11px] text-amber-900/55 hidden xl:block font-medium">ریاضی سوم ابتدایی</p>
            </div>
          </button>

          {/* Desktop Inline Soft Navigation */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar" aria-label="منوی اصلی">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'clay-btn-primary'
                      : 'text-slate-600 hover:text-[#26354D] hover:bg-[#F5EFE3]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-300' : 'text-amber-700/60'}`} />
                  <span>{tab.shortLabel === 'گفتگو' ? 'استاد دانا' : tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Utility Metrics & Account Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Soft Inset Streak & Stars */}
            <div className="clay-inset flex items-center gap-2 px-3 py-1.5 text-xs font-bold tabular-nums shrink-0">
              <span className="flex items-center gap-1 text-orange-700" title="روزهای پیوسته">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400 shrink-0" />
                <span>{profile.streakDays}</span>
              </span>
              <span className="text-amber-900/20" aria-hidden="true">|</span>
              <span className="flex items-center gap-1 text-amber-800" title="ستاره‌ها">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                <span>{profile.stars}</span>
              </span>
            </div>

            {/* Subscription Button */}
            <button
              type="button"
              onClick={() => {
                playSound('click', soundEnabled);
                onOpenSubscription();
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[36px] ${
                isVip
                  ? 'clay-btn-warm'
                  : 'clay-soft hover:bg-amber-50 text-amber-900'
              }`}
              title={isVip ? 'اشتراک طلایی فعال است' : 'خرید اشتراک طلایی'}
            >
              <Crown className={`w-3.5 h-3.5 shrink-0 ${isVip ? 'text-[#26354D] fill-[#26354D]' : 'text-amber-600'}`} />
              <span className="hidden sm:inline">طلایی</span>
              {isVip && remainingDays !== null && (
                <span className="text-[11px] opacity-85 tabular-nums">({remainingDays}ر)</span>
              )}
            </button>

            {/* Phone Auth Button */}
            <button
              type="button"
              onClick={() => {
                playSound('click', soundEnabled);
                onOpenPhoneAuth();
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[36px] ${
                profile.isLoggedIn
                  ? 'bg-emerald-50 border border-emerald-200/80 text-emerald-800 shadow-[0_6px_14px_-8px_rgba(16,185,129,0.3)] hover:bg-emerald-100/70'
                  : 'clay-soft text-[#26354D] hover:bg-white'
              }`}
              title={profile.isLoggedIn ? `ورود فعال: ${profile.phoneNumber}` : 'ورود با شماره موبایل'}
            >
              {profile.isLoggedIn ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="hidden md:inline text-[11px] dir-ltr tabular-nums">{profile.phoneNumber?.slice(-4)}...</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-amber-700/70 shrink-0" />
                  <span className="hidden sm:inline">ورود</span>
                </>
              )}
            </button>

            {/* Student Avatar Button */}
            <button
              type="button"
              onClick={() => {
                playSound('click', soundEnabled);
                onOpenProfile();
              }}
              className="clay-soft flex items-center gap-1.5 pl-2.5 pr-1 py-1 hover:bg-white transition-all cursor-pointer min-h-[36px] shrink-0"
              title="پروفایل و آواتار"
            >
              <div className="w-7 h-7 bg-[#FFF3D6] border border-amber-200/70 rounded-xl flex items-center justify-center text-sm shrink-0 shadow-inner">
                {selectedAvatar.icon}
              </div>
              <span className="text-xs font-bold text-[#26354D] hidden xl:inline max-w-[84px] truncate">{profile.name}</span>
            </button>
          </div>
        </div>

        {/* Tablet Secondary Tab Strip (sm to lg) */}
        <nav className="hidden sm:flex lg:hidden border-t border-amber-100/80 bg-[#FBF6EC]/70 px-4 py-1.5 justify-center gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'clay-btn-primary'
                    : 'text-slate-600 hover:text-[#26354D] hover:bg-white/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.shortLabel === 'گفتگو' ? 'استاد دانا' : tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Soft Clay Mobile Bottom Navigation Dock */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFDF9]/95 backdrop-blur-lg border-t border-amber-200/60 rounded-t-3xl shadow-[0_-10px_28px_-10px_rgba(120,82,40,0.16)] py-1.5 px-1.5 sm:hidden flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all cursor-pointer min-w-[48px] min-h-[46px] ${
                isActive ? 'text-[#26354D] font-extrabold' : 'text-slate-400 font-medium hover:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'clay-btn-primary' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[11px] mt-0.5 whitespace-nowrap ${isActive ? 'text-[#26354D] font-extrabold' : 'text-slate-500'}`}>
                {tab.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
