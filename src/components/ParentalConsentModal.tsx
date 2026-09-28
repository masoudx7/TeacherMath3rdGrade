import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Trash2, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  FileText,
  ChevronDown,
  ChevronUp,
  Heart,
  Info,
  Sparkles,
  ExternalLink,
  Smartphone,
  MicOff,
  UserCheck
} from 'lucide-react';
import { PRIVACY_POLICY_DATA } from '../data/privacyPolicy';
import { playSound } from '../utils/sound';

export interface ParentalConsentModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onConsentAccepted?: () => void;
  isMandatoryGate?: boolean;
  phoneNumber?: string;
  studentName?: string;
  onDataWiped?: () => void;
  soundEnabled: boolean;
}

export const ParentalConsentModal: React.FC<ParentalConsentModalProps> = ({
  isOpen,
  onClose,
  onConsentAccepted,
  isMandatoryGate = false,
  phoneNumber,
  studentName,
  onDataWiped,
  soundEnabled,
}) => {
  // وضعیت‌های چک‌باکس‌های الزامی رضایت‌نامه
  const [isParentConfirmed, setIsParentConfirmed] = useState(false);
  const [isPolicyConfirmed, setIsPolicyConfirmed] = useState(false);
  const [showFullPolicy, setShowFullPolicy] = useState(false);

  // گیت احراز هویت والد برای حالت تنظیمات غیرضروری (Parent Report)
  const [isUnlocked, setIsUnlocked] = useState(!isMandatoryGate);
  const [challenge, setChallenge] = useState<{ n1: number; n2: number; ans: number }>({ n1: 24, n2: 35, ans: 59 });
  const [userAnswer, setUserAnswer] = useState('');
  const [challengeError, setChallengeError] = useState<string | null>(null);

  // وضعیت‌های تنظیمات اختیاری
  const [allowCloudBackup, setAllowCloudBackup] = useState(true);
  const [allowLeaderboard, setAllowLeaderboard] = useState(true);
  const [isWiping, setIsWiping] = useState(false);
  const [wipeSuccess, setWipeSuccess] = useState(false);

  const generateNewChallenge = () => {
    const n1 = Math.floor(Math.random() * 25) + 15;
    const n2 = Math.floor(Math.random() * 30) + 20;
    setChallenge({ n1, n2, ans: n1 + n2 });
    setUserAnswer('');
    setChallengeError(null);
  };

  useEffect(() => {
    if (isOpen) {
      if (!isMandatoryGate) {
        setIsUnlocked(false);
        generateNewChallenge();
      } else {
        setIsUnlocked(true);
      }
      setWipeSuccess(false);
    }
  }, [isOpen, isMandatoryGate]);

  if (!isOpen) return null;

  // تأیید گیت ریاضی در حالت تنظیمات والدین
  const handleVerifyParentChallenge = (e: React.FormEvent) => {
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

  // تأیید رضایت الزامی ولی و باز کردن برنامه
  const handleConfirmConsent = () => {
    if (!isParentConfirmed || !isPolicyConfirmed) return;

    playSound('star', soundEnabled);
    if (onConsentAccepted) {
      onConsentAccepted();
    }
    if (onClose) {
      onClose();
    }
  };

  // پاک‌سازی کامل داده‌ها (Right to Erasure)
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

      localStorage.removeItem('math_tutor_3rd_profile_v3');
      localStorage.removeItem('ostad_dana_chat_history_v2');
      localStorage.removeItem('ostad_mistakes_v1');

      setWipeSuccess(true);
      playSound('star', soundEnabled);
      setTimeout(() => {
        onDataWiped?.();
        onClose?.();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('خطا در پاک‌سازی اطلاعات');
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center p-3 sm:p-5 dir-rtl overflow-y-auto ${
        isMandatoryGate 
          ? 'z-[100] bg-slate-950/85 backdrop-blur-md' 
          : 'z-50 bg-slate-900/60 backdrop-blur-xs'
      }`}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-amber-400 relative my-auto">
        {/* دکمه بستن فقط در حالت غیراجباری فعال است */}
        {!isMandatoryGate && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            title="بستن"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* هدر مدال با نشان حریم خصوصی کودکان */}
        <div className="flex items-start sm:items-center gap-3.5 mb-5 border-b border-amber-100 pb-4">
          <div className="w-13 h-13 bg-linear-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-200">
                {isMandatoryGate ? 'ورود نخست • تأیید ولی الزامی است' : 'تنظیمات اولیا و حریم خصوصی'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 mt-1">
              {isMandatoryGate 
                ? 'رضایت ولی و سیاست حفظ حریم خصوصی کودکان' 
                : 'بخش ویژه اولیا و حریم خصوصی کودکان'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              سامانه هوشمند آموزش ریاضی سوم ابتدایی • منطبق بر اصول حفاظت از اطلاعات کودکان
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* حالت ۱: گیت احراز هویت والد برای بخش تنظیمات (نه گیت اجباری) */}
        {/* ======================================================== */}
        {!isUnlocked && !isMandatoryGate ? (
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

            <form onSubmit={handleVerifyParentChallenge} className="max-w-xs mx-auto space-y-3">
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
          /* ======================================================== */
          /* محتوای اصلی شفافیت و فرم رضایت ولی */
          /* ======================================================== */
          <div className="space-y-5 animate-fade-in">
            {/* پیام خوش‌آمدگویی و صمیمانه برای والد */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm text-amber-950 flex items-start gap-3">
              <Heart className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black">والد گرامی، سلام و درود!</span>
                <p className="mt-1 text-slate-700 leading-relaxed font-medium">
                  این سامانه برای یادگیری شاداب و مفهومی ریاضی پایه سوم فرزند شما ساخته شده است. برای امنیت خاطر شما، تمام تدابیر حفاظتی طبق استانداردهای بین‌المللی حقوق کودکان (مانند COPPA) در این برنامه لحاظ شده است.
                </p>
              </div>
            </div>

            {/* کارت‌های شفاف و تفکیک‌شده: چه چیزی ذخیره می‌شود و چه چیزی نمی‌شود */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* چه چیزهایی ذخیره می‌شود */}
              <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>چه داده‌هایی ذخیره می‌شوند؟</span>
                </div>
                <ul className="text-[12px] sm:text-xs text-emerald-950 space-y-1.5 leading-relaxed font-medium">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>پیشرفت تحصیلی:</strong> ستاره‌ها، امتیازها، مدال‌ها و درصد یادگیری هر فصل ریاضی.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>دفترچه اشتباهات:</strong> سوالاتی که کودک اشتباه پاسخ داده تا معلم هوشمند دوباره با او تمرین کند.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>شماره موبایل ولی (اختیاری):</strong> فقط در صورت ورود با پیامک OTP جهت حفظ ستاره‌ها در تعویض گوشی.</span>
                  </li>
                </ul>
              </div>

              {/* چه چیزهایی هرگز ذخیره نمی‌شوند (خط قرمز ما) */}
              <div className="bg-rose-50/70 border-2 border-rose-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-black text-sm">
                  <MicOff className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>چه چیزهایی هرگز ذخیره نمی‌شوند؟</span>
                </div>
                <ul className="text-[12px] sm:text-xs text-rose-950 space-y-1.5 leading-relaxed font-medium">
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    <span><strong>صدای کودک:</strong> فایل‌های صوتی ضبط یا بایگانی نمی‌شوند؛ تبدیل گفتار آنی انجام و فوراً حذف می‌شود.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    <span><strong>موقعیت مکانی و هویت:</strong> هیچ‌گونه دسترسی GPS، کدملی، شناسنامه یا نشانی گرفته نمی‌شود.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    <span><strong>تبلیغات:</strong> برنامه ۱۰۰٪ بدون تبلیغات تجاری یا ردیاب‌های بازرگانی است.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* کارت حق فراموشی و حذف حساب */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                    حق فراموشی و حذف دائمی اطلاعات (Right to Erasure)
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    شما در هر زمان می‌توانید با یک کلیک در بخش کارنامه والدین، کل سوابق فرزندتان را به طور کامل پاک کنید.
                  </p>
                </div>
              </div>
            </div>

            {/* آکاردئون / لینک به متن کامل سیاست حفظ حریم خصوصی */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setShowFullPolicy(!showFullPolicy)}
                className="w-full p-3.5 text-right flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  مشاهده متن کامل اصول ۴‌گانه حریم خصوصی کودکان (کلیک کنید)
                </span>
                {showFullPolicy ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showFullPolicy && (
                <div className="p-4 border-t border-slate-200 bg-slate-50/60 space-y-3.5 max-h-60 overflow-y-auto">
                  {PRIVACY_POLICY_DATA.map((sec) => (
                    <div key={sec.id} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{sec.icon}</span>
                        <h5 className="text-xs font-bold text-slate-800">{sec.title}</h5>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">{sec.summary}</p>
                      <ul className="list-disc list-inside text-[10px] text-slate-500 space-y-0.5 pr-2">
                        {sec.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* در حالت تنظیمات والدین: دکمه حذف سوابق */}
            {!isMandatoryGate && (
              <div className="border border-rose-200 bg-rose-50/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-right">
                  <AlertTriangle className="w-7 h-7 text-rose-600 shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-rose-900">
                      پاک‌سازی فوری همه اطلاعات فرزندم
                    </h4>
                    <p className="text-[11px] sm:text-xs text-rose-700">
                      تمامی ستاره‌ها، امتیازها و حساب کاربری برای همیشه پاک خواهد شد.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleWipeData}
                  disabled={isWiping}
                  className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {isWiping ? 'در حال پاک‌سازی...' : 'حذف همه داده‌ها'}
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* بخش چک‌باکس‌های اجباری و دکمه تایید نهایی برای گیت ورود */}
            {/* ======================================================== */}
            {isMandatoryGate && (
              <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm">
                <h4 className="text-xs sm:text-sm font-black text-amber-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-700" />
                  تأییدیه قانونی ولی دانش‌آموز (الزامی برای ادامه)
                </h4>

                {/* چک‌باکس اول: اثبات هویت ولی */}
                <label className="flex items-start gap-3 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={isParentConfirmed}
                    onChange={(e) => setIsParentConfirmed(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded-md border-2 border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer shrink-0 accent-amber-500"
                  />
                  <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-amber-900 transition-colors leading-relaxed">
                    من ولی یا سرپرست قانونی دانش‌آموز هستم و با استفاده فرزندم از این برنامه آموزشی موافقم.
                  </span>
                </label>

                {/* چک‌باکس دوم: پذیرش سیاست حریم خصوصی */}
                <label className="flex items-start gap-3 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={isPolicyConfirmed}
                    onChange={(e) => setIsPolicyConfirmed(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded-md border-2 border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer shrink-0 accent-amber-500"
                  />
                  <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-amber-900 transition-colors leading-relaxed">
                    سیاست حفظ حریم خصوصی کودکان و شرایط استفاده را مطالعه کرده و می‌پذیرم.
                  </span>
                </label>

                {/* دکمه تایید نهایی که فقط با فعال بودن هر دو چک‌باکس فعال می‌شود */}
                <button
                  type="button"
                  onClick={handleConfirmConsent}
                  disabled={!isParentConfirmed || !isPolicyConfirmed}
                  className={`w-full py-3 px-6 rounded-2xl font-black text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isParentConfirmed && isPolicyConfirmed
                      ? 'bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-200 cursor-pointer transform hover:scale-[1.01]'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>تأیید رضایت ولی و ورود به آموزگار هوشمند ✨</span>
                </button>

                {(!isParentConfirmed || !isPolicyConfirmed) && (
                  <p className="text-[11px] text-center text-amber-800/80 font-bold">
                    لطفاً هر دو گزینه بالا را برای ورود به برنامه علامت بزنید.
                  </p>
                )}
              </div>
            )}

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
