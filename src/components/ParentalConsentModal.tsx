import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  X, 
  AlertTriangle, 
  FileText,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { PRIVACY_POLICY_DATA } from '../data/privacyPolicy';
import { playSound } from '../utils/sound';

interface ParentalConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber?: string;
  studentName?: string;
  onDataWiped?: () => void;
  soundEnabled: boolean;
}

export const ParentalConsentModal: React.FC<ParentalConsentModalProps> = ({
  isOpen,
  onClose,
  phoneNumber,
  studentName,
  onDataWiped,
  soundEnabled,
}) => {
  // مرحله گیت تایید والدین: حل معمای حسابی بزرگسالان برای اثبات حضور والد
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [challenge, setChallenge] = useState<{ n1: number; n2: number; ans: number }>({ n1: 24, n2: 35, ans: 59 });
  const [userAnswer, setUserAnswer] = useState('');
  const [challengeError, setChallengeError] = useState<string | null>(null);

  // وضعیت‌های تنظیمات حریم خصوصی
  const [allowCloudBackup, setAllowCloudBackup] = useState(true);
  const [allowLeaderboard, setAllowLeaderboard] = useState(true);
  const [isWiping, setIsWiping] = useState(false);
  const [wipeSuccess, setWipeSuccess] = useState(false);

  // تولید سوال تصادفی برای گیت والدین
  const generateNewChallenge = () => {
    const n1 = Math.floor(Math.random() * 25) + 15; // 15..39
    const n2 = Math.floor(Math.random() * 30) + 20; // 20..49
    setChallenge({ n1, n2, ans: n1 + n2 });
    setUserAnswer('');
    setChallengeError(null);
  };

  useEffect(() => {
    if (isOpen) {
      setIsUnlocked(false);
      setWipeSuccess(false);
      generateNewChallenge();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyParent = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(userAnswer.trim().replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString()), 10);
    if (parsed === challenge.ans) {
      setIsUnlocked(true);
      playSound('correct', soundEnabled);
      setChallengeError(null);
    } else {
      playSound('wrong', soundEnabled);
      setChallengeError('پاسخ اشتباه است. لطفاً مجدداً محاسبه فرمایید.');
      generateNewChallenge();
    }
  };

  const handleWipeData = async () => {
    if (!window.confirm('آیا از پاک کردن کامل تمام اطلاعات پیشرفت و ستاره‌های فرزندتان اطمینان دارید؟ این عملیات غیرقابل بازگشت است.')) {
      return;
    }

    setIsWiping(true);
    try {
      if (phoneNumber) {
        await fetch('/api/user/data', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber }),
        });
      }

      // پاک کردن کش مرورگر
      localStorage.removeItem('math_tutor_3rd_profile_v3');
      localStorage.removeItem('ostad_dana_chat_history_v2');
      localStorage.removeItem('ostad_mistakes_v1');

      setWipeSuccess(true);
      playSound('star', soundEnabled);
      setTimeout(() => {
        onDataWiped?.();
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('خطا در پاک‌سازی اطلاعات');
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in dir-rtl">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-amber-300 relative">
        {/* دکمه بستن */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title="بستن"
        >
          <X className="w-6 h-6" />
        </button>

        {/* هدر مدال */}
        <div className="flex items-center gap-3 mb-5 border-b border-amber-100 pb-4">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
              بخش ویژه اولیا و حریم خصوصی کودکان
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              سامانه کنترل، نظارت و شفافیت داده‌های دانش‌آموز (مخصوص والدین و سرپرستان)
            </p>
          </div>
        </div>

        {/* گام ۱: گیت احراز حضور والد (Parental Challenge Gate) */}
        {!isUnlocked ? (
          <div className="bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-2xl p-5 text-center my-4">
            <div className="w-12 h-12 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              تأیید حضور والد یا سرپرست قانونی
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-4 max-w-md mx-auto">
              جهت اطمینان از اینکه تنظیمات توسط والد مدیریت می‌شود و نه کودک ۹ ساله، لطفاً حاصل جمع زیر را وارد فرمایید:
            </p>

            <form onSubmit={handleVerifyParent} className="max-w-xs mx-auto space-y-3">
              <div className="bg-white px-4 py-3 rounded-xl border border-amber-200 text-lg font-black text-amber-900 tracking-wider">
                {challenge.n1} + {challenge.n2} = ؟
              </div>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="پاسخ را بنویسید"
                className="w-full text-center py-2.5 px-4 rounded-xl border-2 border-slate-300 focus:border-amber-500 focus:outline-none text-base font-bold"
                autoFocus
              />
              {challengeError && (
                <p className="text-xs text-rose-600 font-bold">{challengeError}</p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer"
              >
                تأیید و ورود به بخش والدین 🔓
              </button>
            </form>
          </div>
        ) : (
          /* گام ۲: پنل شفافیت حریم خصوصی و اختیارات اولیا */
          <div className="space-y-6 animate-fade-in">
            {/* پیام وضعیت */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="text-xs sm:text-sm text-emerald-900">
                <span className="font-bold">هویت والد تأیید شد.</span> شما در حال مشاهده اطلاعات مربوط به{' '}
                <span className="font-bold">{studentName || 'دانش‌آموز'}</span> هستید.
              </div>
            </div>

            {/* سیاست حریم خصوصی به زبان ساده */}
            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                سیاست حفظ حریم خصوصی به زبان ساده (پیمان ما با والدین)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PRIVACY_POLICY_DATA.map((sec) => (
                  <div key={sec.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">{sec.icon}</span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">{sec.title}</h4>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 mb-2 font-medium leading-relaxed">
                      {sec.summary}
                    </p>
                    <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-1">
                      {sec.details.slice(0, 2).map((d, idx) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* کلیدهای کنترل و رضایت والد (Parental Controls) */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-2">
                تنظیمات اشتراک‌گذاری و پشتیبان‌گیری
              </h4>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="text-xs sm:text-sm">
                  <div className="font-bold text-slate-700">پشتیبان‌گیری ابری از ستاره‌ها و پیشرفت</div>
                  <div className="text-[11px] text-slate-500">برای حفظ ستاره‌ها در صورت تعویض گوشی یا تبلت</div>
                </div>
                <input
                  type="checkbox"
                  checked={allowCloudBackup}
                  onChange={(e) => setAllowCloudBackup(e.target.checked)}
                  className="w-5 h-5 text-amber-500 rounded-md focus:ring-amber-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="text-xs sm:text-sm">
                  <div className="font-bold text-slate-700">نمایش نام مستعار در جدول برترین‌های کشوری</div>
                  <div className="text-[11px] text-slate-500">شماره تلفن همیشه پوشانده و محرمانه می‌ماند</div>
                </div>
                <input
                  type="checkbox"
                  checked={allowLeaderboard}
                  onChange={(e) => setAllowLeaderboard(e.target.checked)}
                  className="w-5 h-5 text-amber-500 rounded-md focus:ring-amber-400 cursor-pointer"
                />
              </label>
            </div>

            {/* بخش حق فراموشی و پاک‌سازی داده‌ها (Right to Erasure) */}
            <div className="border border-rose-200 bg-rose-50/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-right">
                <AlertTriangle className="w-7 h-7 text-rose-600 shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-rose-900">
                    حق فراموشی و حذف کامل اطلاعات (Right to Erasure)
                  </h4>
                  <p className="text-[11px] sm:text-xs text-rose-700">
                    تمامی سوابق آموزشی، ستاره‌ها، اشتباهات و حساب کودک برای همیشه پاک خواهد شد.
                  </p>
                </div>
              </div>

              <button
                onClick={handleWipeData}
                disabled={isWiping}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isWiping ? 'در حال پاک‌سازی...' : 'حذف همه اطلاعات فرزندم'}
              </button>
            </div>

            {wipeSuccess && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs sm:text-sm rounded-xl font-bold text-center">
                اطلاعات با موفقیت به صورت کامل پاک‌سازی شد.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
