import React, { useState } from 'react';
import { StudentProfile, ChapterId } from '../types';
import { CHAPTERS } from '../data/curriculum';
import { playSound } from '../utils/sound';
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
  Check
} from 'lucide-react';

interface ParentReportProps {
  profile: StudentProfile;
  soundEnabled: boolean;
}

export const ParentReport: React.FC<ParentReportProps> = ({ profile, soundEnabled }) => {
  const [copied, setCopied] = useState(false);

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

  // Share text for SMS/WhatsApp
  const shareText = `📊 گزارش تحصیلی ریاضی سوم ابتدایی
نام دانش‌آموز: ${profile.name}
سطح مهارت: سطح ${profile.level} (امتیاز تسلط کل: ${totalMastery}٪)
تعداد ستاره‌ها: ⭐ ${profile.stars}
مسائل حل شده: 📝 ${profile.solvedCount} مسئله
استمرار یادگیری: 🔥 ${profile.streakDays} روز متوالی

نقاط قوت: ${strongChapters.length > 0 ? strongChapters.join('، ') : 'در حال ارزیابی'}
مباحث نیازمند تمرین: ${weakChapters.length > 0 ? weakChapters.join('، ') : 'همه مباحث در سطح مطلوب'}

تهیه شده توسط آموزگار هوشمند ریاضی سوم ابتدایی 🦉✨`;

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
    <div className="max-w-5xl mx-auto space-y-6 dir-rtl print:p-0 print:m-0">
      {/* Header Banner */}
      <div className="bg-white rounded-[2rem] border-4 border-[#6C5CE7] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 px-3.5 py-1 rounded-full text-xs font-bold border border-purple-200">
            <Users className="w-4 h-4 text-purple-700" />
            <span>ویژه والدین، معلمان و مشاوران تحصیلی</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            گزارش تحلیلی و کارنامه جامع رشد دانش‌آموز
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl leading-relaxed">
            این گزارش بر اساس عملکرد واقعی دانش‌آموز «{profile.name}» در حل تمرینات، آزمون‌های فصول و رفع اشتباهات به صورت هوشمند محاسبه شده است.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 print:hidden shrink-0 flex-wrap">
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'متن گزارش کپی شد!' : 'کپی برای اولیا (پیامک / شاد)'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ / ذخیره PDF</span>
          </button>
        </div>
      </div>

      {/* Student Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">مجموع ستاره‌های افتخار</span>
          <div className="flex items-center gap-1.5 text-amber-500">
            <span className="text-2xl font-black">{profile.stars}</span>
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">مسائل حل شده</span>
          <div className="flex items-center gap-1.5 text-blue-600">
            <span className="text-2xl font-black">{profile.solvedCount}</span>
            <span className="text-xs text-slate-400 font-bold">تمرین</span>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">استمرار یادگیری روزانه</span>
          <div className="flex items-center gap-1.5 text-orange-500">
            <span className="text-2xl font-black">{profile.streakDays}</span>
            <Flame className="w-5 h-5 fill-orange-400" />
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">شاخص تسلط کل</span>
          <div className="flex items-center gap-1.5 text-emerald-600">
            <span className="text-2xl font-black">{totalMastery}٪</span>
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Pedagogical Insights Box */}
      <div className="bg-gradient-to-r from-[#6C5CE7]/10 to-indigo-50 border-2 border-[#6C5CE7]/30 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#6C5CE7]" />
            تحلیل آموزشی آموزگار هوشمند
          </h3>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${overallAssessment.color}`}>
            وضعیت کلی: {overallAssessment.text}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          {/* Strengths */}
          <div className="bg-white rounded-2xl p-4 border border-emerald-200 space-y-2">
            <span className="font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              نقاط قوت و تسلط بالا:
            </span>
            {strongChapters.length > 0 ? (
              <p className="text-slate-700 leading-relaxed font-medium">
                دانش‌آموز در مباحث <strong className="text-emerald-800">{strongChapters.join('، ')}</strong> درک مفهومی بسیار خوبی از خود نشان داده است.
              </p>
            ) : (
              <p className="text-slate-500">با انجام آزمون‌های بیشتر، مباحث تسلط شناسایی و ثبت خواهد شد.</p>
            )}
          </div>

          {/* Weaknesses / Review Recommendations */}
          <div className="bg-white rounded-2xl p-4 border border-amber-200 space-y-2">
            <span className="font-bold text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              پیشنهاد مرور و تقویت:
            </span>
            {weakChapters.length > 0 ? (
              <p className="text-slate-700 leading-relaxed font-medium">
                توصیه می‌شود در مباحث <strong className="text-amber-800">{weakChapters.join('، ')}</strong> تمرینات درس‌نامه و دفترچه اشتباهات مجدداً مرور شود.
              </p>
            ) : (
              <p className="text-slate-700">تمامی مباحث فعال در حد تعادل و رضایت‌بخش هستند. تشویق به استمرار روزانه!</p>
            )}
          </div>
        </div>
      </div>

      {/* Chapters Mastery Progress List */}
      <div className="bg-white rounded-[2rem] border-2 border-slate-200/80 p-6 space-y-5 shadow-xs">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
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
