import React, { useState } from 'react';
import { StudentProfile, ChapterId } from '../types';
import { CHAPTERS } from '../data/curriculum';
import { playSound } from '../utils/sound';
import { ParentalConsentModal } from './ParentalConsentModal';
import { BADGES } from '../data/playstationTrophies';
import { 
  Users, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Share2, 
  Printer, 
  Copy, 
  Sparkles, 
  BookOpen, 
  Star,
  Flame,
  Check,
  ShieldCheck,
  Target,
  HeartHandshake,
  Lightbulb,
  GraduationCap
} from 'lucide-react';

interface ParentReportProps {
  profile: StudentProfile;
  soundEnabled: boolean;
  onDataWiped?: () => void;
}

export const ParentReport: React.FC<ParentReportProps> = ({ profile, soundEnabled, onDataWiped }) => {
  const [copied, setCopied] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Compute stats
  const masteryValues: number[] = Object.values(profile.chapterMastery || {});
  const totalMastery = masteryValues.length > 0
    ? Math.round(masteryValues.reduce((acc: number, curr: number) => acc + (curr || 0), 0) / masteryValues.length)
    : 0;

  const strongChapters: string[] = [];
  const weakChapters: string[] = [];

  CHAPTERS.forEach(c => {
    const mastery = profile.chapterMastery[c.id as ChapterId] || 0;
    if (mastery >= 70) {
      strongChapters.push(c.title);
    } else if (mastery < 40) {
      weakChapters.push(c.title);
    }
  });

  const getAssessmentLabel = (percent: number) => {
    if (percent >= 85) return { text: 'بسیار عالی و مسلط', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
    if (percent >= 65) return { text: 'خوب و رضایت‌بخش', color: 'text-blue-700 bg-blue-100 border-blue-300' };
    if (percent >= 40) return { text: 'متوسط و نیازمند تکرار', color: 'text-amber-700 bg-amber-100 border-amber-300' };
    return { text: 'نیازمند تمرین بیشتر', color: 'text-rose-700 bg-rose-100 border-rose-300' };
  };

  const overallAssessment = getAssessmentLabel(totalMastery);

  // Unlocked badges objects
  const unlockedBadgesList = BADGES.filter(b => profile.unlockedBadges?.includes(b.id));

  // Share text for SMS/WhatsApp
  const shareText = `📊 گزارش تحصیلی پیشرفته ریاضی سوم دبستان
نام دانش‌آموز: ${profile.name}
🌟 سطح مهارت: سطح ${profile.level} (امتیاز تسلط کل: ${totalMastery}٪)
⭐ مجموع ستاره‌ها: ${profile.stars}
📝 مسائل حل شده: ${profile.solvedCount} تمرین
🔥 استمرار یادگیری: ${profile.streakDays} روز متوالی

✅ نقاط قوت: ${strongChapters.length > 0 ? strongChapters.join('، ') : 'در حال ارزیابی'}
⚠️ نیازمند مرور: ${weakChapters.length > 0 ? weakChapters.join('، ') : 'تمامی مباحث در سطح مطلوب'}

💡 پیام مشاور: فرزند شما با استمرار روزانه می‌تواند به قهرمان ریاضی تبدیل شود. تشویق و همراهی شما بهترین محرک است!
تهیه شده در سامانه آموزگار هوشمند ریاضی سوم ابتدایی 🦉✨`;

  const handleCopyReport = () => {
    playSound('click', soundEnabled);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    playSound('click', soundEnabled);
    window.print();
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden px-2 sm:px-4 max-w-5xl mx-auto space-y-6 dir-rtl box-border print:p-0 print:m-0">
      {/* Header Banner */}
      <div className="clay-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:border print:rounded-none">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-100/80 text-amber-900 px-3.5 py-1 rounded-full text-xs font-bold border border-amber-200/70">
            <Users className="w-4 h-4 text-amber-700" />
            <span>گزارش جامع تحلیلی اولیا و مشاوران تحصیلی</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26354D] tracking-tight">
            کارنامه رشد و تحلیل عملکرد دانش‌آموز
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl leading-relaxed">
            این گزارش بر اساس فعالیت‌های آموزشی، تمرین‌های حل‌شده و تسلط بر فصل‌های کتاب ریاضی سوم «{profile.name}» به صورت هوشمند آماده شده است.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 print:hidden shrink-0 flex-wrap">
          <button
            onClick={() => setIsPrivacyModalOpen(true)}
            className="clay-soft flex items-center gap-1.5 hover:bg-amber-50 text-amber-900 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>حریم خصوصی اولیا</span>
          </button>
          <button
            onClick={handleCopyReport}
            className="clay-btn-primary flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'متن گزارش کپی شد!' : 'کپی متن گزارش برای اولیا'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="clay-soft flex items-center gap-1.5 hover:bg-white text-[#26354D] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ / PDF</span>
          </button>
        </div>
      </div>

      {/* Parental Consent & Privacy Modal */}
      <ParentalConsentModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        phoneNumber={profile.phoneNumber}
        studentName={profile.name}
        onDataWiped={onDataWiped}
        soundEnabled={soundEnabled}
      />

      {/* Student Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="clay-soft p-4 space-y-1">
          <span className="text-xs text-slate-500 font-bold block">مجموع ستاره‌های افتخار</span>
          <div className="flex items-center gap-1.5 text-amber-500">
            <span className="text-2xl font-extrabold tabular-nums">{profile.stars}</span>
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
        </div>

        <div className="clay-soft p-4 space-y-1">
          <span className="text-xs text-slate-500 font-bold block">مسائل حل شده</span>
          <div className="flex items-center gap-1.5 text-blue-600">
            <span className="text-2xl font-black">{profile.solvedCount}</span>
            <span className="text-xs text-slate-400 font-bold">تمرین</span>
          </div>
        </div>

        <div className="clay-soft p-4 space-y-1">
          <span className="text-xs text-slate-500 font-bold block">استمرار یادگیری روزانه</span>
          <div className="flex items-center gap-1.5 text-orange-500">
            <span className="text-2xl font-extrabold tabular-nums">{profile.streakDays}</span>
            <Flame className="w-5 h-5 fill-orange-400" />
          </div>
        </div>

        <div className="clay-soft p-4 space-y-1">
          <span className="text-xs text-slate-500 font-bold block">شاخص تسلط کل</span>
          <div className="flex items-center gap-1.5 text-emerald-600">
            <span className="text-2xl font-extrabold tabular-nums">{totalMastery}٪</span>
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Pedagogical Insights Box */}
      <div className="clay-card bg-gradient-to-br from-[#FFFDF7] to-[#FEF3C7]/45 p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-lg font-extrabold text-[#26354D] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            تحلیل هوشمند و توصیه‌های تربیتی برای والدین
          </h3>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${overallAssessment.color}`}>
            وضعیت کلی: {overallAssessment.text}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          {/* Strengths */}
          <div className="clay-soft p-4 space-y-2">
            <span className="font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              نقاط قوت و تسلط بالا:
            </span>
            {strongChapters.length > 0 ? (
              <p className="text-slate-700 leading-relaxed font-medium">
                دانش‌آموز در مباحث <strong className="text-emerald-800">{strongChapters.join('، ')}</strong> درک مفهومی بسیار خوبی از خود نشان داده است. این نقاط قوت مایه دلگرمی است!
              </p>
            ) : (
              <p className="text-slate-500">با انجام آزمون‌های فصول، مباحث تسلط شناسایی و ثبت خواهد شد.</p>
            )}
          </div>

          {/* Weaknesses / Review Recommendations */}
          <div className="clay-soft p-4 space-y-2">
            <span className="font-bold text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              پیشنهاد مرور و تقویت:
            </span>
            {weakChapters.length > 0 ? (
              <p className="text-slate-700 leading-relaxed font-medium">
                توصیه می‌شود در مباحث <strong className="text-amber-800">{weakChapters.join('، ')}</strong> تمرینات درس‌نامه و دفترچه اشتباهات با آرامش در منزل مرور شود.
              </p>
            ) : (
              <p className="text-slate-700">تمامی مباحث فعال در حد تعادل و رضایت‌بخش هستند. تشویق به استمرار روزانه!</p>
            )}
          </div>
        </div>
      </div>

      {/* Practical Action Plan for Parents (New Feature) */}
      <div className="clay-card p-6 space-y-4">
        <h3 className="text-lg font-extrabold text-[#26354D] flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-amber-600" />
          برنامه عملی پیشنهادی برای والدین در منزل (این هفته)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs sm:text-sm">
          <div className="clay-inset rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#26354D]">
              <span className="w-6 h-6 rounded-full bg-[#26354D] text-[#FFFDF7] flex items-center justify-center text-xs">۱</span>
              <span>۱۰ دقیقه تمرین روزانه</span>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed">
              هر روز یک سوال چالش‌برانگیز با کمک «استاد دانا» حل کنید تا استمرار یادگیری حفظ شود.
            </p>
          </div>

          <div className="clay-inset rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#26354D]">
              <span className="w-6 h-6 rounded-full bg-[#26354D] text-[#FFFDF7] flex items-center justify-center text-xs">۲</span>
              <span>استفاده از ابزار ملموس</span>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed">
              برای درک بهتر کسرها و ضرب‌ها، از وسایل خانه (پیتزا، شکلات، تیله) استفاده کنید.
            </p>
          </div>

          <div className="clay-inset rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#26354D]">
              <span className="w-6 h-6 rounded-full bg-[#26354D] text-[#FFFDF7] flex items-center justify-center text-xs">۳</span>
              <span>تشویق و تقویت مثبت</span>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed">
              به جای سرزنش اشتباهات، از «دفترچه اشتباهات» برای یادگیری از خطاهای ریاضی استفاده کنید.
            </p>
          </div>
        </div>
      </div>

      {/* Unlocked Badges Showcase for Parents */}
      <div className="clay-card p-6 space-y-4">
        <h3 className="text-lg font-extrabold text-[#26354D] flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          مدال‌ها و دستاوردهای کسب‌شده توسط دانش‌آموز ({unlockedBadgesList.length} مدال)
        </h3>
        {unlockedBadgesList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {unlockedBadgesList.map(b => (
              <div key={b.id} className="clay-soft flex items-center gap-3 p-3 bg-amber-50/70 rounded-2xl">
                <span className="text-3xl shrink-0">{b.icon}</span>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-amber-950 truncate">{b.title}</h4>
                  <p className="text-[11px] text-amber-800 truncate">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-medium">هنوز مدالی باز نشده است. با حل تمرین‌های بیشتر، اولین مدال‌ها را کسب کنید! 🌟</p>
        )}
      </div>

      {/* Chapters Mastery Progress List */}
      <div className="clay-card p-6 space-y-5">
        <h3 className="text-lg font-extrabold text-[#26354D] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-600" />
          میزان تسلط تفکیکی بر فصول ۸ گانه ریاضی سوم
        </h3>

        <div className="space-y-4">
          {CHAPTERS.map(chapter => {
            const mastery = profile.chapterMastery[chapter.id as ChapterId] || 0;
            const status = getAssessmentLabel(mastery);

            return (
              <div key={chapter.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-black">
                      {chapter.chapterNumber}
                    </span>
                    <span>{chapter.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.color}`}>
                      {status.text}
                    </span>
                    <span className="font-black text-slate-800 text-xs w-9 text-left">{mastery}٪</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      mastery >= 70
                        ? 'bg-emerald-500'
                        : mastery >= 40
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                    style={{ width: `${Math.max(5, mastery)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
