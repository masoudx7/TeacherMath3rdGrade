import React, { useMemo, useState } from 'react';
import { ChapterId, StudentProfile } from '../types';
import { BADGES, BADGE_GROUP_LABELS, TIER_META, Trophy as HonorBadge } from '../data/playstationTrophies';
import { getTrophyProgress } from '../utils/trophyEngine';
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
  Star, 
  Award, 
  Flame, 
  BarChart3, 
  TrendingUp, 
  Lock,
  Unlock,
  CalendarDays,
  Sparkles,
  ArrowLeft,
  X,
  Pin,
  PartyPopper,
  Compass
} from 'lucide-react';

interface ProgressDashboardProps {
  profile: StudentProfile;
  soundEnabled: boolean;
  onFeatureBadge?: (badgeId: string) => void;
  onNavigateToPractice?: (chapterId?: ChapterId) => void;
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

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  profile,
  soundEnabled,
  onFeatureBadge,
  onNavigateToPractice,
}) => {
  const [activeBadgeCategory, setActiveBadgeCategory] = useState<'all' | 'platinum' | 'gold' | 'silver' | 'bronze'>('all');
  const [badgeStatusFilter, setBadgeStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedBadge, setSelectedBadge] = useState<HonorBadge | null>(null);
  const [selectedWeeklyChapter, setSelectedWeeklyChapter] = useState<'all' | ChapterId>('all');
  const avatarObj = AVATARS.find(a => a.id === profile.avatar) || AVATARS[0];
  const unlockedSet = useMemo(() => new Set(profile.unlockedBadges || []), [profile.unlockedBadges]);

  const featuredBadge = useMemo(() => {
    if (profile.featuredBadgeId && unlockedSet.has(profile.featuredBadgeId)) {
      return BADGES.find((b) => b.id === profile.featuredBadgeId) || null;
    }
    const unlockedList = BADGES.filter((b) => unlockedSet.has(b.id));
    return unlockedList.length > 0 ? unlockedList[unlockedList.length - 1] : null;
  }, [profile.featuredBadgeId, unlockedSet]);

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

  const handleOpenBadge = (badge: HonorBadge, isUnlocked: boolean) => {
    setSelectedBadge(badge);
    if (isUnlocked) {
      playSound('victory', soundEnabled);
      confetti({ particleCount: 55, spread: 65, origin: { y: 0.6 } });
    } else {
      playSound('click', soundEnabled);
    }
  };

  const badgeCountsByTier = useMemo(() => {
    const counts = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    BADGES.forEach((b) => {
      if (unlockedSet.has(b.id)) {
        counts[b.tier] += 1;
      }
    });
    return counts;
  }, [unlockedSet]);

  const closestLockedBadge = useMemo(() => {
    let best: { badge: HonorBadge; percent: number; current: number; target: number; unit: string } | null = null;
    BADGES.forEach((b) => {
      if (unlockedSet.has(b.id)) return;
      const prog = getTrophyProgress(b, profile);
      if (!best || prog.percent > best.percent) {
        best = { badge: b, ...prog };
      }
    });
    return best;
  }, [profile, unlockedSet]);

  const filteredBadges = useMemo(() => {
    return BADGES.filter((b) => {
      if (activeBadgeCategory !== 'all' && b.tier !== activeBadgeCategory) return false;
      const isUnlocked = unlockedSet.has(b.id);
      if (badgeStatusFilter === 'unlocked' && !isUnlocked) return false;
      if (badgeStatusFilter === 'locked' && isUnlocked) return false;
      return true;
    }).sort((a, b) => {
      const aUnlocked = unlockedSet.has(a.id) ? 1 : 0;
      const bUnlocked = unlockedSet.has(b.id) ? 1 : 0;
      if (aUnlocked !== bUnlocked) return bUnlocked - aUnlocked;
      return getTrophyProgress(b, profile).percent - getTrophyProgress(a, profile).percent;
    });
  }, [activeBadgeCategory, badgeStatusFilter, unlockedSet, profile]);

  return (
    <div className="w-full max-w-full overflow-x-hidden px-2 sm:px-4 max-w-6xl mx-auto space-y-6 dir-rtl box-border">
      {/* Student Stats Summary Header */}
      <div className="clay-card p-6 text-[#26354D] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-[1.75rem] bg-[#FFF3D6] border border-amber-200/80 shadow-[0_8px_20px_-8px_rgba(120,82,40,0.22),inset_0_2px_0_#fff] flex items-center justify-center text-4xl">
              {avatarObj.icon}
            </div>
            {featuredBadge && (
              <button
                type="button"
                onClick={() => handleOpenBadge(featuredBadge, true)}
                title={`نشان برگزیده: ${featuredBadge.title}`}
                className="absolute -bottom-1.5 -left-1.5 w-9 h-9 rounded-2xl bg-[#FFFDF8] border border-amber-300 shadow-md flex items-center justify-center text-lg hover:scale-110 transition-transform cursor-pointer"
              >
                {featuredBadge.icon}
              </button>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26354D]">{profile.name}</h2>
              {featuredBadge && (
                <span className="text-xs font-bold text-amber-800">
                  · {featuredBadge.title}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-500">دانش‌آموز پایه سوم ابتدایی</p>
            <div className="flex items-center gap-2 pt-1 text-xs font-bold text-[#26354D] tabular-nums flex-wrap">
              <span className="clay-btn-primary px-3 py-1 rounded-xl">
                سطح {profile.level} ریاضی‌دان
              </span>
              <span className="text-slate-600 px-1">
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
            <span className="text-[11px] text-slate-500 font-bold">نشان افتخار</span>
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

      {/* Honor Badges Showcase Section (نشان‌های افتخار) */}
      <div className="clay-card p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-100/80 pb-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-[#26354D] text-xl flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-600 shrink-0" />
              <span>گنجینه نشان‌های افتخار ریاضی</span>
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-semibold tabular-nums">
              <span className="text-[#26354D] font-bold">
                {profile.unlockedBadges.length} از {BADGES.length} نشان گرفته شده
              </span>
              <span aria-hidden="true" className="text-amber-900/30">·</span>
              <span>برنزی: {badgeCountsByTier.bronze}</span>
              <span aria-hidden="true" className="text-amber-900/30">·</span>
              <span>نقره‌ای: {badgeCountsByTier.silver}</span>
              <span aria-hidden="true" className="text-amber-900/30">·</span>
              <span>طلایی: {badgeCountsByTier.gold}</span>
              <span aria-hidden="true" className="text-amber-900/30">·</span>
              <span>الماس: {badgeCountsByTier.platinum}</span>
            </div>
          </div>

          {/* Status Segmented Toggle */}
          <div className="flex items-center gap-1 p-1 clay-inset rounded-2xl shrink-0">
            {[
              { id: 'all', label: `همه (${BADGES.length})` },
              { id: 'unlocked', label: `گرفته‌شده (${profile.unlockedBadges.length})` },
              { id: 'locked', label: `مانده (${Math.max(0, BADGES.length - profile.unlockedBadges.length)})` },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  playSound('click', soundEnabled);
                  setBadgeStatusFilter(st.id as 'all' | 'unlocked' | 'locked');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[34px] tabular-nums ${
                  badgeStatusFilter === st.id
                    ? 'clay-btn-primary'
                    : 'text-slate-600 hover:text-[#26354D]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Closest Next Honor Badge Spotlight */}
        {closestLockedBadge && (
          <div className="clay-inset p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#FFFDF8] border border-amber-200 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                {closestLockedBadge.badge.icon}
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  <Compass className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>نزدیک‌ترین نشان به تو</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{closestLockedBadge.percent}% انجام شده</span>
                </div>
                <p className="text-sm font-extrabold text-[#26354D] truncate">
                  {closestLockedBadge.badge.title} — {closestLockedBadge.badge.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenBadge(closestLockedBadge.badge, false)}
              className="clay-btn-warm px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] flex items-center justify-center gap-1.5"
            >
              <span>راهنمای دریافت</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Interactive Tier Filter Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: `همه نشان‌ها (${BADGES.length})` },
            { id: 'bronze', label: 'نشان‌های برنزی' },
            { id: 'silver', label: 'نشان‌های نقره‌ای' },
            { id: 'gold', label: 'نشان‌های طلایی' },
            { id: 'platinum', label: 'نشان‌های الماس' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playSound('click', soundEnabled);
                setActiveBadgeCategory(tab.id as 'all' | 'platinum' | 'gold' | 'silver' | 'bronze');
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
                activeBadgeCategory === tab.id
                  ? 'clay-btn-primary'
                  : 'clay-soft text-slate-600 hover:text-[#26354D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Interactive Badges Grid */}
        {filteredBadges.length === 0 ? (
          <div className="clay-inset p-8 text-center space-y-2">
            <Award className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-extrabold text-[#26354D]">
              در این دسته هنوز نشانی پیدا نشد
            </p>
            <p className="text-xs text-slate-500">
              فیلتر وضعیت را روی «همه» بگذار یا با حل تمرین‌های جدید اولین نشان این بخش را بگیر.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge) => {
              const isUnlocked = unlockedSet.has(badge.id);
              const { current, target, unit, percent } = getTrophyProgress(badge, profile);
              const tierMeta = TIER_META[badge.tier];
              const isFeatured = featuredBadge?.id === badge.id && isUnlocked;

              return (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => handleOpenBadge(badge, isUnlocked)}
                  className={`text-right p-4 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    isUnlocked
                      ? `${tierMeta.cardTint} shadow-sm hover:-translate-y-0.5`
                      : 'bg-slate-50/85 border-slate-200/80 hover:bg-white hover:border-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div
                      className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl shrink-0 transition-transform ${
                        isUnlocked
                          ? `${tierMeta.emblemBg} shadow-xs`
                          : 'bg-white border-slate-200 opacity-70 grayscale'
                      }`}
                    >
                      {badge.icon}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 truncate">
                        <span className={isUnlocked ? tierMeta.accentText : 'text-slate-500'}>
                          {tierMeta.label}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{BADGE_GROUP_LABELS[badge.category]}</span>
                        {isFeatured && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-700 font-extrabold">برگزیده</span>
                          </>
                        )}
                      </div>
                      <h4 className="font-extrabold text-sm text-[#26354D] truncate">{badge.title}</h4>
                      <p className="text-xs text-slate-600 leading-snug line-clamp-2">{badge.description}</p>
                    </div>
                  </div>

                  {/* Progress Bar & Interactive Hint Footer */}
                  <div className="space-y-1.5 pt-2 border-t border-amber-900/10 w-full">
                    <div className="flex items-center justify-between text-[11px] font-bold tabular-nums">
                      {isUnlocked ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <Unlock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>دریافت شده (+{badge.bonusStars} ستاره)</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{current} از {target} {unit}</span>
                        </span>
                      )}
                      <span className="text-[#26354D] font-extrabold">
                        {isUnlocked ? '۱۰۰٪' : `${percent}٪`}
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isUnlocked ? 'bg-emerald-500' : tierMeta.barClass
                        }`}
                        style={{ width: `${isUnlocked ? 100 : percent}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Badge Inspector Modal */}
      {selectedBadge && (() => {
        const isUnlocked = unlockedSet.has(selectedBadge.id);
        const prog = getTrophyProgress(selectedBadge, profile);
        const tierMeta = TIER_META[selectedBadge.tier];
        const isFeatured = featuredBadge?.id === selectedBadge.id && isUnlocked;

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs dir-rtl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="badge-modal-title"
          >
            <div className="clay-card w-full max-w-md p-6 relative space-y-5 animate-scale-up">
              <button
                type="button"
                onClick={() => {
                  playSound('click', soundEnabled);
                  setSelectedBadge(null);
                }}
                aria-label="بستن جزئیات نشان"
                className="absolute top-4 left-4 w-9 h-9 rounded-xl clay-soft hover:bg-white flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center space-y-2.5 pt-2">
                <div
                  className={`w-24 h-24 rounded-3xl border-2 flex items-center justify-center text-5xl shadow-sm ${
                    isUnlocked
                      ? tierMeta.emblemBg
                      : 'bg-slate-100 border-slate-200 grayscale opacity-75'
                  }`}
                >
                  {selectedBadge.icon}
                </div>

                <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <span className={tierMeta.accentText}>{tierMeta.label}</span>
                  <span aria-hidden="true">·</span>
                  <span>{tierMeta.rankTitle}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">پاداش: +{selectedBadge.bonusStars} ستاره</span>
                </div>

                <h3 id="badge-modal-title" className="text-xl font-extrabold text-[#26354D]">
                  {selectedBadge.title}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  {selectedBadge.description}
                </p>
              </div>

              {/* Progress Box */}
              <div className="clay-inset p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold tabular-nums">
                  <span className={isUnlocked ? 'text-emerald-700' : 'text-[#26354D]'}>
                    {isUnlocked ? 'این نشان با موفقیت باز شده است' : `پیشرفت فعلی: ${prog.current} از ${prog.target} ${prog.unit}`}
                  </span>
                  <span className="font-extrabold text-[#26354D]">
                    {isUnlocked ? '۱۰۰٪' : `${prog.percent}٪`}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUnlocked ? 'bg-emerald-500' : tierMeta.barClass
                    }`}
                    style={{ width: `${isUnlocked ? 100 : prog.percent}%` }}
                  />
                </div>
              </div>

              {/* Teacher Guidance or Encouragement */}
              <div
                className={`rounded-2xl p-3.5 text-xs sm:text-sm font-semibold leading-relaxed border ${
                  isUnlocked
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                    : 'bg-[#FFF9E5] border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-1.5 font-extrabold mb-1">
                  <Sparkles className={`w-4 h-4 shrink-0 ${isUnlocked ? 'text-emerald-600' : 'text-amber-600'}`} />
                  <span>{isUnlocked ? 'پیام تبریک استاد دانا' : 'چطور این نشان را بگیرم؟'}</span>
                </div>
                <p>{isUnlocked ? selectedBadge.encouragement : selectedBadge.howToEarn}</p>
              </div>

              {/* Interactive Modal Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                {isUnlocked ? (
                  <>
                    {onFeatureBadge && (
                      <button
                        type="button"
                        onClick={() => {
                          playSound('star', soundEnabled);
                          onFeatureBadge(selectedBadge.id);
                        }}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] ${
                          isFeatured ? 'clay-btn-warm' : 'clay-btn-primary'
                        }`}
                      >
                        <Pin className="w-4 h-4 shrink-0" />
                        <span>{isFeatured ? 'نشان برگزیده توست' : 'نمایش کنار اسم من'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        playSound('fanfare', soundEnabled);
                        confetti({ particleCount: 80, spread: 75, origin: { y: 0.55 } });
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl clay-soft hover:bg-white text-[#26354D] text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]"
                    >
                      <PartyPopper className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>جشن دوباره!</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click', soundEnabled);
                      const targetChapter = selectedBadge.chapterId;
                      setSelectedBadge(null);
                      onNavigateToPractice?.(
                        targetChapter || (selectedBadge.category === 'practice' ? 'patterns' : undefined)
                      );
                    }}
                    className="w-full py-3 px-4 rounded-xl clay-btn-primary text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <span>همین الان برای این نشان تمرین کن</span>
                    <ArrowLeft className="w-4 h-4 shrink-0" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
