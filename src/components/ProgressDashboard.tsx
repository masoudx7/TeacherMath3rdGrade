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
  const [activeBadgeCategory, setActiveBadgeCategory] = React.useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
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

  const getBadgeProgress = (badge: (typeof BADGES)[0]) => {
    let current = 0;
    let target = 1;
    let unit = '';

    if (badge.requiredStars !== undefined) {
      current = profile.stars;
      target = badge.requiredStars;
      unit = 'ستاره';
    } else if (badge.requiredSolved !== undefined) {
      current = profile.solvedCount;
      target = badge.requiredSolved;
      unit = 'مسئله';
    } else if (badge.requiredScanned !== undefined) {
      current = profile.scannedImagesCount;
      target = badge.requiredScanned;
      unit = 'عکس';
    } else if (badge.requiredStreak !== undefined) {
      current = profile.streakDays;
      target = badge.requiredStreak;
      unit = 'روز';
    } else if (badge.requiredLevel !== undefined) {
      current = profile.level;
      target = badge.requiredLevel;
      unit = 'سطح';
    }

    const percent = Math.min(100, Math.round((current / target) * 100));
    return { current, target, unit, percent };
  };

  const filteredBadges = activeBadgeCategory === 'all' 
    ? BADGES 
    : BADGES.filter(b => b.category === activeBadgeCategory);

  return (
    <div className="w-full max-w-full overflow-x-hidden px-2 sm:px-4 max-w-6xl mx-auto space-y-6 dir-rtl box-border">
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
      <div className="bg-white border-4 border-[#FAB1A0] rounded-[2rem] p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-[#2D3436] text-xl flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              <span>مدال‌های افتخار و چالش‌های انگیزشی</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">مدال‌های روزانه، هفتگی و ماهانه را با تمرین مداوم فتح کن!</p>
          </div>
          <span className="text-xs font-bold text-[#D35400] bg-[#FFEAA7] border border-[#FDCB6E] px-4 py-1.5 rounded-full shadow-xs shrink-0">
            {profile.unlockedBadges.length} از {BADGES.length} مدال به دست آمده
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'همه مدال‌ها 🎖️' },
            { id: 'daily', label: '☀️ چالش‌های روزانه' },
            { id: 'weekly', label: '📅 چالش‌های هفتگی' },
            { id: 'monthly', label: '👑 چالش‌های ماهانه' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveBadgeCategory(tab.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeBadgeCategory === tab.id
                  ? 'bg-[#6C5CE7] text-white shadow-[0_3px_0_0_#4834D4]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge) => {
            const isUnlocked = profile.unlockedBadges.includes(badge.id);
            const { current, target, unit, percent } = getBadgeProgress(badge);

            const categoryBadgeText = 
              badge.category === 'daily' ? '☀️ روزانه' :
              badge.category === 'weekly' ? '📅 هفتگی' : '👑 ماهانه';

            const categoryBadgeBg = 
              badge.category === 'daily' ? 'bg-amber-100 text-amber-800 border-amber-300' :
              badge.category === 'weekly' ? 'bg-sky-100 text-sky-800 border-sky-300' : 'bg-purple-100 text-purple-800 border-purple-300';

            return (
              <div
                key={badge.id}
                onClick={() => handleBadgeClick(badge.title, isUnlocked)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-[#FFF9E5] to-white border-[#FDCB6E] shadow-sm hover:scale-[1.02]'
                    : 'bg-slate-50/80 border-slate-200 opacity-90 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl shrink-0 p-2 bg-white rounded-2xl border border-slate-100 shadow-xs">
                      {badge.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#2D3436]">{badge.title}</h4>
                      <p className="text-xs text-slate-500 leading-tight mt-1">{badge.description}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${categoryBadgeBg}`}>
                    {categoryBadgeText}
                  </span>
                </div>

                {/* Progress Bar & Status */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    {isUnlocked ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                        دریافت شده! 🎉
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        پیشرفت: {current} از {target} {unit}
                      </span>
                    )}
                    <span className="text-slate-600 font-bold">{percent}%</span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isUnlocked 
                          ? 'bg-emerald-500' 
                          : 'bg-gradient-to-r from-amber-400 to-orange-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
