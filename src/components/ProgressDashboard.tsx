import React, { useMemo, useState } from 'react';
import { ChapterId, StudentProfile } from '../types';
import { BADGES } from '../data/playstationTrophies';
import { CHAPTERS, AVATARS } from '../data/curriculum';
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
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  Trophy, 
  Star, 
  Award, 
  Flame, 
  BarChart3, 
  TrendingUp, 
  Lock,
  Unlock,
  CalendarDays
} from 'lucide-react';

interface ProgressDashboardProps {
  profile: StudentProfile;
  soundEnabled: boolean;
}

const CHAPTER_LINE_COLORS: Record<ChapterId, string> = {
  patterns: '#D97706',
  place_value: '#0284C7',
  fractions: '#059669',
  multiplication_division: '#7C3AED',
  perimeter_area: '#E11D48',
  regrouping: '#0D9488',
  statistics: '#EA580C',
  advanced_multiplication: '#4F46E5',
};

function toNormalizedDateToken(input: string): string {
  const latin = String(input || '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .trim();
  if (latin.includes('/')) {
    return latin
      .split('/')
      .map((part) => String(parseInt(part, 10) || part))
      .join('/');
  }
  return latin.slice(0, 10);
}

interface WeeklyChartPoint {
  dayLabel: string;
  fullDateLabel: string;
  patterns: number | null;
  place_value: number | null;
  fractions: number | null;
  multiplication_division: number | null;
  perimeter_area: number | null;
  regrouping: number | null;
  statistics: number | null;
  advanced_multiplication: number | null;
}

const WeeklyChapterTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const fullDateLabel = payload[0]?.payload?.fullDateLabel || label;

  return (
    <div className="bg-[#FFFDF8] border border-amber-200/90 rounded-2xl shadow-lg p-3 text-right dir-rtl min-w-[190px] space-y-1.5">
      <div className="text-xs font-extrabold text-[#26354D] border-b border-amber-100 pb-1.5 flex items-center justify-between gap-3">
        <span>{label}</span>
        <span className="text-[11px] font-semibold text-amber-900/70 tabular-nums">{fullDateLabel}</span>
      </div>
      <div className="space-y-1">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-[#26354D] truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="truncate">{entry.name}</span>
            </span>
            <span className="font-extrabold text-[#26354D] tabular-nums shrink-0">
              {entry.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ profile, soundEnabled }) => {
  const [activeBadgeCategory, setActiveBadgeCategory] = useState<'all' | 'platinum' | 'gold' | 'silver' | 'bronze'>('all');
  const [selectedWeeklyChapter, setSelectedWeeklyChapter] = useState<'all' | ChapterId>('all');
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

  // Weekly Per-Chapter Progress Data (Last 7 Calendar Days)
  const { weeklyChartData, hasRealHistoryInWeek, hasWeeklyChartData, weeklyAttemptsCount, topChapterTitle } = useMemo(() => {
    const historyEntries = Array.isArray(profile.history) ? profile.history : [];
    const now = new Date();
    const weekdayFmt = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' });
    const fullDateFmt = new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long' });

    let realCount = 0;
    const points: WeeklyChartPoint[] = [];

    for (let offset = 6; offset >= 0; offset--) {
      const dayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
      const localIso = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
      const faDateToken = toNormalizedDateToken(dayDate.toLocaleDateString('fa-IR'));
      const utcIsoToken = dayDate.toISOString().slice(0, 10);

      const dayLabel = offset === 0 ? 'امروز' : offset === 1 ? 'دیروز' : weekdayFmt.format(dayDate);
      const fullDateLabel = fullDateFmt.format(dayDate);

      const row: WeeklyChartPoint = {
        dayLabel,
        fullDateLabel,
        patterns: null,
        place_value: null,
        fractions: null,
        multiplication_division: null,
        perimeter_area: null,
        regrouping: null,
        statistics: null,
        advanced_multiplication: null,
      };

      const dayHistory = historyEntries.filter((entry) => {
        const entryToken = toNormalizedDateToken(entry.date);
        return entryToken === faDateToken || entryToken === localIso || entryToken === utcIsoToken;
      });

      realCount += dayHistory.length;

      CHAPTERS.forEach((ch) => {
        const chEntries = dayHistory.filter((entry) => entry.chapterId === ch.id);
        if (chEntries.length > 0) {
          const sumScore = chEntries.reduce((acc, cur) => acc + (cur.score || 0), 0);
          const sumTotal = chEntries.reduce((acc, cur) => acc + (cur.total || 1), 0);
          row[ch.id] = Math.min(100, Math.max(0, Math.round((sumScore / Math.max(1, sumTotal)) * 100)));
        }
      });

      points.push(row);
    }

    let anyMastery = false;
    // If the student has no recorded quizzes in the last 7 days yet, anchor a gentle 7-day trajectory from chapterMastery
    if (realCount === 0) {
      CHAPTERS.forEach((ch, chIdx) => {
        const currentMastery = profile.chapterMastery?.[ch.id] || 0;
        if (currentMastery > 0) {
          anyMastery = true;
          const startVal = Math.max(15, currentMastery - 18 - (chIdx % 3) * 4);
          points.forEach((pt, dayIdx) => {
            const ratio = dayIdx / 6;
            const wave = dayIdx > 0 && dayIdx < 6 ? ((dayIdx + chIdx) % 2 === 0 ? 3 : -2) : 0;
            pt[ch.id] = Math.min(100, Math.max(10, Math.round(startVal + (currentMastery - startVal) * ratio + wave)));
          });
        }
      });
    } else {
      // Anchor today's point with current mastery for chapters that already have progress but weren't played today
      const todayPoint = points[points.length - 1];
      CHAPTERS.forEach((ch) => {
        if ((profile.chapterMastery?.[ch.id] || 0) > 0) {
          anyMastery = true;
        }
        if (todayPoint[ch.id] === null && (profile.chapterMastery?.[ch.id] || 0) > 0) {
          todayPoint[ch.id] = Math.round(profile.chapterMastery[ch.id]);
        }
      });
    }

    let bestChapterTitle = 'ثبت‌نشده';
    let bestMastery = 0;
    CHAPTERS.forEach((ch) => {
      const val = profile.chapterMastery?.[ch.id] || 0;
      if (val > bestMastery) {
        bestMastery = val;
        bestChapterTitle = ch.title;
      }
    });

    return {
      weeklyChartData: points,
      hasRealHistoryInWeek: realCount > 0,
      hasWeeklyChartData: realCount > 0 || anyMastery,
      weeklyAttemptsCount: realCount,
      topChapterTitle: bestChapterTitle,
    };
  }, [profile.history, profile.chapterMastery]);

  const visibleWeeklyChapters = useMemo(() => {
    if (selectedWeeklyChapter === 'all') {
      return CHAPTERS;
    }
    return CHAPTERS.filter((ch) => ch.id === selectedWeeklyChapter);
  }, [selectedWeeklyChapter]);

  const handleBadgeClick = (badgeTitle: string, isUnlocked: boolean) => {
    if (isUnlocked) {
      playSound('victory', soundEnabled);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } else {
      playSound('wrong', soundEnabled);
    }
  };

  const getBadgeProgress = (badge: any) => {
    let current = 0;
    let target = 1;
    let unit = '';

    const { type, threshold } = badge.condition || { type: 'solved', threshold: 10 };

    if (type === 'solved') {
      current = profile.solvedCount;
      target = threshold as number;
      unit = 'مسئله';
    } else if (type === 'streak') {
      current = profile.streakDays;
      target = threshold as number;
      unit = 'روز پیاپی';
    } else if (type === 'mastery') {
      const numThreshold = threshold as number;
      const masteryVals = Object.values(profile.chapterMastery || {}) as number[];
      if (numThreshold <= 1) {
        const maxMastery = Math.max(0, ...masteryVals) * 100;
        current = Math.round(maxMastery);
        target = Math.round(numThreshold * 100);
        unit = '٪ تسلط';
      } else {
        const achievedCount = masteryVals.filter(m => m >= 0.8).length;
        current = achievedCount;
        target = numThreshold;
        unit = 'فصل مسلط';
      }
    } else {
      current = profile.solvedCount;
      target = 10;
      unit = 'مسئله';
    }

    const percent = Math.min(100, Math.max(0, Math.round((current / target) * 100)));
    return { current, target, unit, percent };
  };

  const filteredBadges = activeBadgeCategory === 'all' 
    ? BADGES 
    : BADGES.filter((b: any) => b.tier === activeBadgeCategory);

  return (
    <div className="w-full max-w-full overflow-x-hidden px-2 sm:px-4 max-w-6xl mx-auto space-y-6 dir-rtl box-border">
      {/* Student Stats Summary Header */}
      <div className="clay-card p-6 text-[#26354D] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-[1.75rem] bg-[#FFF3D6] border border-amber-200/80 shadow-[0_8px_20px_-8px_rgba(120,82,40,0.22),inset_0_2px_0_#fff] flex items-center justify-center text-4xl">
            {avatarObj.icon}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26354D]">{profile.name}</h2>
            <p className="text-sm font-medium text-slate-500">دانش‌آموز پایه سوم ابتدایی</p>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="clay-btn-primary px-3 py-1 rounded-full text-xs font-bold">
                سطح {profile.level} ریاضی‌دان
              </span>
              <span className="bg-amber-100/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold border border-amber-200/70">
                {profile.solvedCount} مسئله حل‌شده
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
          <div className="clay-inset p-3.5 text-center">
            <Star className="w-6 h-6 text-amber-500 fill-amber-400 mx-auto" />
            <span className="text-xl font-extrabold block text-[#26354D] mt-1 tabular-nums">{profile.stars}</span>
            <span className="text-[11px] text-slate-500 font-bold">امتیاز کل</span>
          </div>

          <div className="clay-inset p-3.5 text-center">
            <Flame className="w-6 h-6 text-orange-500 fill-orange-400 mx-auto" />
            <span className="text-xl font-extrabold block text-[#26354D] mt-1 tabular-nums">{profile.streakDays}</span>
            <span className="text-[11px] text-slate-500 font-bold">روزهای متوالی</span>
          </div>

          <div className="clay-inset p-3.5 text-center">
            <Award className="w-6 h-6 text-amber-600 mx-auto" />
            <span className="text-xl font-extrabold block text-[#26354D] mt-1 tabular-nums">{profile.unlockedBadges.length}</span>
            <span className="text-[11px] text-slate-500 font-bold">مدال افتخار</span>
          </div>
        </div>
      </div>

      {/* Visual Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart: Chapter Mastery */}
        <div className="clay-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#26354D] text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <span>میزان تسلط بر فصول ۸‌گانه</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">درصد آمادگی</span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#26354D', fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="تسلط دانش‌آموز" dataKey="mastery" stroke="#00b894" fill="#55E6C1" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart: Accuracy Trend */}
        <div className="clay-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#26354D] text-lg flex items-center gap-2">
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

      {/* Weekly Chapter-by-Chapter Progress Line Chart (Recharts) */}
      <div className="clay-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-extrabold text-[#26354D] text-lg sm:text-xl flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-600 shrink-0" />
              <span>نمودار هفتگی پیشرفت در هر فصل</span>
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-semibold tabular-nums">
              <span>۷ روز اخیر</span>
              <span aria-hidden="true" className="text-amber-900/30">·</span>
              <span>
                {hasRealHistoryInWeek
                  ? `${weeklyAttemptsCount} تمرین ثبت‌شده این هفته`
                  : 'برآورد بر اساس تسلط فعلی فصول'}
              </span>
              <span aria-hidden="true" className="text-amber-900/30">·</span>
              <span className="text-emerald-700 font-bold">فصل برتر: {topChapterTitle}</span>
            </div>
          </div>
        </div>

        {/* Interactive Chapter Filter Toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => {
              playSound('click', soundEnabled);
              setSelectedWeeklyChapter('all');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
              selectedWeeklyChapter === 'all'
                ? 'clay-btn-primary'
                : 'clay-soft text-[#26354D] hover:bg-white'
            }`}
          >
            همه فصل‌ها ({CHAPTERS.length})
          </button>

          {CHAPTERS.map((ch) => {
            const isActive = selectedWeeklyChapter === ch.id;
            const color = CHAPTER_LINE_COLORS[ch.id];
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  playSound('click', soundEnabled);
                  setSelectedWeeklyChapter(isActive ? 'all' : ch.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#FFFDF8] ring-2 ring-amber-400 text-[#26354D] shadow-sm'
                    : 'clay-soft text-slate-600 hover:text-[#26354D] hover:bg-white'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span>{ch.title}</span>
              </button>
            );
          })}
        </div>

        {/* Recharts Responsive Weekly Line Chart */}
        <div className="clay-inset p-3 sm:p-4">
          {!hasWeeklyChartData ? (
            <div className="h-60 flex flex-col items-center justify-center text-center px-4 space-y-2">
              <CalendarDays className="w-8 h-8 text-amber-500" />
              <p className="text-sm font-extrabold text-[#26354D]">
                هنوز تمرینی در این هفته ثبت نشده است
              </p>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                با حل «۳ تمرین کوتاه امروز» یا شرکت در آزمون هر فصل، نمودار خطی روند پیشرفت هفتگی در همان فصل اینجا رسم می‌شود.
              </p>
            </div>
          ) : (
            <div className="h-72 sm:h-80 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyChartData} margin={{ top: 16, right: 20, left: -12, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#E5DDD0" />
                  <XAxis
                    dataKey="dayLabel"
                    tick={{ fill: '#26354D', fontSize: 12, fontWeight: 700 }}
                    axisLine={{ stroke: '#D6CBB8' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#D6CBB8' }}
                    tickLine={false}
                  />
                  <Tooltip content={<WeeklyChapterTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', fontWeight: 700, paddingTop: '10px', direction: 'rtl' }}
                  />
                  {visibleWeeklyChapters.map((ch) => (
                    <Line
                      key={ch.id}
                      type="monotone"
                      dataKey={ch.id}
                      name={ch.title}
                      stroke={CHAPTER_LINE_COLORS[ch.id]}
                      strokeWidth={selectedWeeklyChapter === ch.id ? 3.5 : 2.5}
                      dot={{ r: selectedWeeklyChapter === ch.id ? 5 : 4, strokeWidth: 2, fill: '#FFFDF8' }}
                      activeDot={{ r: 6.5 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Badges & Achievements Section */}
      <div className="clay-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-100/80 pb-4">
          <div>
            <h3 className="font-bold text-[#26354D] text-xl flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              <span>کاپ‌ها و مدال‌های افتخار ریاضی</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">مجموعه کاپ‌ها و دستاوردهای ارزشمند ریاضی پایه سوم دبستان</p>
          </div>
          <span className="text-xs font-bold text-amber-900 bg-amber-100/80 border border-amber-200/70 px-4 py-1.5 rounded-full shrink-0 tabular-nums">
            {profile.unlockedBadges.length} از {BADGES.length} کاپ فتح شده
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: `همه کاپ‌ها (${BADGES.length} عدد)` },
            { id: 'platinum', label: 'پلاتینیوم (اسطوره‌ای)' },
            { id: 'gold', label: 'طلا (بسیار سخت)' },
            { id: 'silver', label: 'نقره (پیشرفته)' },
            { id: 'bronze', label: 'برنز (مبتدی)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveBadgeCategory(tab.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeBadgeCategory === tab.id
                  ? 'clay-btn-primary'
                  : 'clay-soft text-slate-600 hover:text-[#26354D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge: any) => {
            const isUnlocked = profile.unlockedBadges.includes(badge.id);
            const { current, target, unit, percent } = getBadgeProgress(badge);

            const tierText = 
              badge.tier === 'platinum' ? '🏆 پلاتینیوم (۳۰۰ امتیاز)' :
              badge.tier === 'gold' ? '🥇 طلا (۹۰ امتیاز)' :
              badge.tier === 'silver' ? '🥈 نقره (۴۵ امتیاز)' : '🥉 برنز (۱۵ امتیاز)';

            const tierBg = 
              badge.tier === 'platinum' ? 'bg-indigo-100 text-indigo-900 border-indigo-300' :
              badge.tier === 'gold' ? 'bg-amber-100 text-amber-900 border-amber-300' :
              badge.tier === 'silver' ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-orange-100 text-orange-900 border-orange-300';

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
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${tierBg}`}>
                    {tierText}
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
