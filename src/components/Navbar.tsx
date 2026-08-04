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
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: StudentProfile;
  onOpenProfile: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenProfile,
  soundEnabled,
  setSoundEnabled,
}) => {
  const selectedAvatar = AVATARS.find(a => a.id === profile.avatar) || AVATARS[0];

  const tabs = [
    { id: 'tutor', label: 'معلم هوشمند', icon: Bot, badge: 'AI' },
    { id: 'scan', label: 'اسکن عکس مسئله', icon: Camera, badge: 'ویژه' },
    { id: 'games', label: 'تمرین‌های تعاملی', icon: Gamepad2, badge: 'بازی' },
    { id: 'curriculum', label: 'فصل‌های کتاب', icon: BookOpen },
    { id: 'progress', label: 'نمودار پیشرفت', icon: BarChart2 },
  ];

  const handleTabClick = (tabId: string) => {
    playSound('click', soundEnabled);
    setActiveTab(tabId);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFF9E5]/90 backdrop-blur-md pb-2 pt-3 px-3 sm:px-6">
      {/* Top Header Card for Kid Profile & Stats */}
      <div className="max-w-7xl mx-auto bg-white p-3.5 sm:p-4 rounded-3xl shadow-[0_8px_0_0_#E0E0E0] border-2 border-slate-100 flex flex-wrap items-center justify-between gap-3">
        {/* App Title & Mascot */}
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 sm:w-14 sm:h-14 bg-[#FF6B6B] rounded-2xl flex items-center justify-center text-3xl shadow-xs border-2 border-white transform hover:rotate-6 transition-transform">
            🦉
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#2D3436] tracking-tight flex items-center gap-2">
              <span>آموزگار هوشمند من</span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFEAA7] text-[#D35400] border border-[#FDCB6E]">
                پایه سوم
              </span>
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block font-medium">ریاضی سوم ابتدایی - دستیار یادگیری گام به گام</p>
          </div>
        </div>

        {/* Profile & Rewards Stats */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-2xl border-2 text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
              soundEnabled 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100' 
                : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
            }`}
            title={soundEnabled ? 'صدا فعال است' : 'صدا غیرفعال است'}
            aria-label="تنظیم صدا"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Streak */}
          <div className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FFF3F0] border-2 border-[#FAB1A0] rounded-full text-[#D35400] text-sm font-bold">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-400 animate-bounce" />
            <span>{profile.streakDays} روز</span>
          </div>

          {/* Stars Pill */}
          <div className="bg-[#FFEAA7] px-4 py-2 rounded-full border-2 border-[#FDCB6E] flex items-center gap-1.5 text-[#D35400] font-bold text-sm shadow-xs">
            <span className="text-lg">⭐</span>
            <span>{profile.stars} امتیاز</span>
          </div>

          {/* Level */}
          <div className="hidden md:flex items-center gap-1 px-3 py-2 bg-purple-50 border-2 border-purple-200 rounded-full text-purple-700 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>سطح {profile.level}</span>
          </div>

          {/* Avatar Button */}
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              onOpenProfile();
            }}
            className="flex items-center gap-2.5 pl-3 pr-1.5 py-1.5 bg-[#E1F5FE] border-2 border-[#74B9FF] rounded-full hover:bg-sky-100 transition-all cursor-pointer shadow-xs"
          >
            <div className="w-9 h-9 bg-[#74B9FF] rounded-full border-2 border-white shadow-xs flex items-center justify-center text-lg">
              {selectedAvatar.icon}
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800 text-xs max-w-[90px] truncate">{profile.name}</p>
              <p className="text-[10px] text-sky-700 font-bold">پروفایل من</p>
            </div>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <nav className="mt-3 flex justify-center">
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
  );
};
