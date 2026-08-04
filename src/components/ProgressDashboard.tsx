import React from 'react';
import { StudentProfile } from '../types';
import { BADGES, CHAPTERS, AVATARS } from '../data/curriculum';
import { playSound } from '../utils/sound';
import confetti from 'canvas-confetti';
import { 
  ResponsiveContainer, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Trophy, 
  Star, 
  Award, 
  Flame, 
  CheckCircle2, 
  BarChart3, 
  TrendingUp, 
  Sparkles,
  Lock,
  Unlock
} from 'lucide-react';

interface ProgressDashboardProps {
  profile: StudentProfile;
  soundEnabled: boolean;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ profile, soundEnabled }) => {
  const avatarObj = AVATARS.find(a => a.id === profile.avatar) || AVATARS[0];

  // Radar Data for chapter mastery
  const radarData = CHAPTERS.map(ch => ({
    subject: ch.title,
    mastery: profile.chapterMastery[ch.id] || 40,
    fullMark: 100,
  }));

  // History Line Chart Data
  const lineData = profile.history.length > 0 
    ? profile.history.map((h, i) => ({
        name: `تمرین ${i + 1}`,
        percent: Math.round((h.score / (h.total || 1)) * 100),
      }))
    : [
        { name: 'روز ۱', percent: 60 },
        { name: 'روز ۲', percent: 75 },
        { name: 'روز ۳', percent: 90 },
        { name: 'امروز', percent: 100 },
      ];

  const handleBadgeClick = (badgeTitle: string, isUnlocked: boolean) => {
    if (isUnlocked) {
      playSound('badge', soundEnabled);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } else {
      playSound('wrong', soundEnabled);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 dir-rtl">
      {/* Student Stats Summary Header */}
      <div className="bg-white border-4 border-[#FFEAA7] rounded-[2rem] p-6 shadow-[0_8px_0_0_#E0E0E0] text-[#2D3436] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-[2rem] bg-[#E1F5FE] border-4 border-[#74B9FF] flex items-center justify-center text-4xl shadow-xs">
            {avatarObj.icon}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3436]">{profile.name}</h2>
            <p className="text-sm font-medium text-slate-500">دانش‌آموز پایه سوم ابتدایی</p>
            <div className="flex items-center gap-2 pt-1">
              <span className="bg-[#6C5CE7] text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                سطح {profile.level} ریاضی‌دان
              </span>
              <span className="bg-[#FFEAA7] text-[#D35400] px-3 py-1 rounded-full text-xs font-bold border border-[#FDCB6E]">
                {profile.solvedCount} مسئله حل‌شده
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
          <div className="bg-[#FFF9E5] p-3.5 rounded-2xl text-center border-2 border-[#FFEAA7]">
            <Star className="w-6 h-6 text-amber-500 fill-amber-400 mx-auto" />
            <span className="text-xl font-bold block text-[#2D3436] mt-1">{profile.stars}</span>
            <span className="text-[10px] text-slate-500 font-bold">امتیاز کل</span>
          </div>

          <div className="bg-[#FFF3F0] p-3.5 rounded-2xl text-center border-2 border-[#FAB1A0]">
            <Flame className="w-6 h-6 text-orange-500 fill-orange-400 mx-auto" />
            <span className="text-xl font-bold block text-[#2D3436] mt-1">{profile.streakDays}</span>
            <span className="text-[10px] text-slate-500 font-bold">روزهای متوالی</span>
          </div>

          <div className="bg-[#F0F3FF] p-3.5 rounded-2xl text-center border-2 border-[#A29BFE]">
            <Award className="w-6 h-6 text-[#6C5CE7] mx-auto" />
            <span className="text-xl font-bold block text-[#2D3436] mt-1">{profile.unlockedBadges.length}</span>
            <span className="text-[10px] text-slate-500 font-bold">مدال افتخار</span>
          </div>
        </div>
      </div>

      {/* Visual Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart: Chapter Mastery */}
        <div className="bg-white border-4 border-[#55E6C1] rounded-[2rem] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#2D3436] text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <span>میزان تسلط بر فصول ۸‌گانه</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">درصد آمادگی</span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#2D3436', fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="تسلط دانش‌آموز" dataKey="mastery" stroke="#00b894" fill="#55E6C1" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart: Accuracy Trend */}
        <div className="bg-white border-4 border-[#74B9FF] rounded-[2rem] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#2D3436] text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-500" />
              <span>روند نمرات و موفقیت در تمرین‌ها</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">درصد پاسخ درست</span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="percent" stroke="#0984e3" strokeWidth={3} dot={{ r: 6, fill: '#0984e3' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Badges & Achievements Section */}
      <div className="bg-white border-4 border-[#FAB1A0] rounded-[2rem] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
          <h3 className="font-bold text-[#2D3436] text-xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>مدال‌های افتخار و پاداش‌ها</span>
          </h3>
          <span className="text-xs font-bold text-[#D35400] bg-[#FFEAA7] border border-[#FDCB6E] px-3 py-1 rounded-full">
            {profile.unlockedBadges.length} از {BADGES.length} آزاد شده
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {BADGES.map((badge) => {
            const isUnlocked = profile.unlockedBadges.includes(badge.id);

            return (
              <button
                key={badge.id}
                onClick={() => handleBadgeClick(badge.title, isUnlocked)}
                className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer space-y-2 relative overflow-hidden ${
                  isUnlocked
                    ? 'bg-[#FFEAA7]/30 border-[#FDCB6E] hover:scale-105 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="text-4xl transform transition-transform group-hover:scale-110">
                  {badge.icon}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2D3436]">{badge.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-tight mt-1">{badge.description}</p>
                </div>

                <div className="pt-1">
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <Unlock className="w-3 h-3" />
                      کسب شده
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                      <Lock className="w-3 h-3" />
                      قفل است
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
