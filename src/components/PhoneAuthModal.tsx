import React, { useState, useEffect, useRef } from 'react';
import { Phone, Lock, ArrowRight, CheckCircle2, ShieldCheck, Smartphone, Sparkles, RefreshCw, X, User } from 'lucide-react';
import { playSound } from '../utils/sound';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (phoneNumber: string, name?: string) => void;
  soundEnabled: boolean;
  currentPhoneNumber?: string;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  soundEnabled,
  currentPhoneNumber,
  isLoggedIn,
  onLogout,
}) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [studentName, setStudentName] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Countdown timer for resending OTP
  useEffect(() => {
    if (timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  if (!isOpen) return null;

  // Format Persian/Arabic digits to English digits
  const toEnglishDigits = (str: string) => {
    return str
      .replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString())
      .replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString());
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = toEnglishDigits(phoneNumber).trim().replace(/[^\d]/g, '');
    if (!cleanPhone) {
      setError('لطفاً شماره موبایل خود را وارد کنید.');
      return;
    }

    if (!/^09\d{9}$/.test(cleanPhone)) {
      setError('شماره موبایل معتبر نیست. نمونه معتبر: 09123456789');
      return;
    }

    setLoading(true);
    playSound('click', soundEnabled);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleanPhone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطا در ارسال کد تایید');
      }

      setPhoneNumber(cleanPhone);
      setDemoCode(data.demoCode || '1234');
      setStep('otp');
      setTimerSeconds(60);
      setOtpDigits(['', '', '', '']);
      playSound('star', soundEnabled);

      // Focus first OTP field
      setTimeout(() => {
        otpRefs[0].current?.focus();
      }, 150);
    } catch (err: any) {
      setError(err.message || 'خطا در برقراری ارتباط با سرور');
      playSound('wrong', soundEnabled);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = toEnglishDigits(value).replace(/[^\d]/g, '');
    if (!cleanValue) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    if (cleanValue.length > 1) {
      const chars = cleanValue.slice(0, 4).split('');
      const newDigits = [...otpDigits];
      chars.forEach((ch, i) => {
        if (index + i < 4) {
          newDigits[index + i] = ch;
        }
      });
      setOtpDigits(newDigits);
      const focusIndex = Math.min(index + chars.length, 3);
      otpRefs[focusIndex].current?.focus();
      return;
    }

    const lastDigit = cleanValue[cleanValue.length - 1];
    const newDigits = [...otpDigits];
    newDigits[index] = lastDigit;
    setOtpDigits(newDigits);

    // Auto move to next input (left to right)
    if (index < 3 && lastDigit) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = toEnglishDigits(e.clipboardData.getData('text')).replace(/[^\d]/g, '');
    if (pastedText) {
      const chars = pastedText.slice(0, 4).split('');
      const newDigits = ['', '', '', ''];
      chars.forEach((ch, idx) => {
        if (idx < 4) newDigits[idx] = ch;
      });
      setOtpDigits(newDigits);
      const focusIndex = Math.min(chars.length, 3);
      otpRefs[focusIndex].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleAutoFillDemoCode = () => {
    if (!demoCode || demoCode.length < 4) return;
    playSound('pop', soundEnabled);
    const chars = demoCode.slice(0, 4).split('');
    setOtpDigits(chars);
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 4) {
      setError('لطفاً کد تایید ۴ رقمی را کامل وارد کنید.');
      return;
    }

    setLoading(true);
    playSound('click', soundEnabled);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          code: enteredCode,
          studentName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'کد تایید اشتباه یا منقضی شده است.');
      }

      playSound('correct', soundEnabled);
      onLoginSuccess(phoneNumber, studentName);
      onClose();
    } catch (err: any) {
      setError(err.message || 'کد تایید اشتباه است.');
      playSound('wrong', soundEnabled);
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, show User Info & Logout View
  if (isLoggedIn && currentPhoneNumber) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in dir-rtl">
        <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-200 relative text-center">
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              onClose();
            }}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-20 h-20 bg-emerald-100 border-4 border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-sm">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <h3 className="text-xl font-black text-slate-800 mb-2">ورود فعال با شماره موبایل</h3>
          <p className="text-sm font-semibold text-slate-500 mb-6">
            شما با شماره <span className="font-bold text-emerald-700 dir-ltr inline-block bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">{currentPhoneNumber}</span> به سیستم متصل هستید.
          </p>

          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#6C5CE7] hover:bg-[#5A4AD1] text-white font-bold rounded-2xl shadow-[0_4px_0_0_#4834D4] transition-all cursor-pointer text-sm"
            >
              ادامه با همین حساب
            </button>

            {onLogout && (
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  onLogout();
                  onClose();
                }}
                className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-2xl border-2 border-rose-200 transition-all cursor-pointer text-sm"
              >
                خروج از حساب کاربری
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in dir-rtl">
      <div className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-[#FFEAA7] relative">
        {/* Close button */}
        <button
          onClick={() => {
            playSound('click', soundEnabled);
            onClose();
          }}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#FFEAA7] border-4 border-[#FDCB6E] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs text-3xl">
            📱
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#2D3436]">ورود با شماره موبایل</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
            ذخیره پیشرفت و کارنامه در حساب شخصی دانش‌آموز
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border-2 border-rose-200 text-rose-700 rounded-2xl text-xs sm:text-sm font-bold text-center animate-shake">
            {error}
          </div>
        )}

        {/* STEP 1: Enter Phone Number */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                شماره موبایل (والدین یا دانش‌آموز)
              </label>
              <div className="relative flex items-center">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="09123456789"
                  maxLength={11}
                  dir="ltr"
                  className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-800 text-base focus:border-[#6C5CE7] focus:bg-white focus:outline-hidden transition-all text-center tracking-widest placeholder:tracking-normal placeholder:font-normal"
                />
                <Smartphone className="w-5 h-5 text-slate-400 absolute right-3" />
                <span className="absolute left-3 text-xs font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded-lg">
                  🇮🇷 +98
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1.5 mr-1">
                کد تایید ۴ رقمی به این شماره پیامک می‌شود.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#6C5CE7] hover:bg-[#5A4AD1] active:translate-y-0.5 text-white font-bold rounded-2xl shadow-[0_4px_0_0_#4834D4] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>در حال ارسال پیامک...</span>
                </>
              ) : (
                <>
                  <span>دریافت کد تایید</span>
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP Code */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-3">
                کد ارسال‌شده به شماره <span className="font-bold text-[#6C5CE7] inline-block" dir="ltr">{phoneNumber}</span> را وارد کنید:
              </p>

              {/* Demo OTP Notice Box */}
              {demoCode && (
                <div className="mb-4 p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-900 text-xs sm:text-sm font-bold flex items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>کد تایید تست: <strong className="text-base text-amber-700 tracking-wider font-mono" dir="ltr">{demoCode}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillDemoCode}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    جای‌گذاری خودکار
                  </button>
                </div>
              )}

              {/* 4 Digit Input Grid (Strict Left-to-Right LTR) */}
              <div className="flex justify-center gap-2.5 sm:gap-3 my-3" dir="ltr">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    dir="ltr"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black bg-slate-50 border-2 border-slate-300 rounded-2xl focus:border-[#6C5CE7] focus:bg-white focus:outline-hidden transition-all shadow-xs"
                  />
                ))}
              </div>
            </div>

            {/* Student Name Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                نام دانش‌آموز (اختیاری)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="مثال: علی یا زهرای عزیز"
                  className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-semibold text-xs sm:text-sm focus:border-[#6C5CE7] focus:bg-white focus:outline-hidden"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3" />
              </div>
            </div>

            {/* Verify Action Button */}
            <button
              type="submit"
              disabled={loading || otpDigits.join('').length < 4}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:translate-y-0.5 text-white font-bold rounded-2xl shadow-[0_4px_0_0_#059669] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>در حال بررسی...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>تایید و ورود به برنامه</span>
                </>
              )}
            </button>

            {/* Resend Code or Change Number */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-1">
              <button
                type="button"
                onClick={() => {
                  playSound('click', soundEnabled);
                  setStep('phone');
                  setError(null);
                }}
                className="text-[#6C5CE7] hover:underline cursor-pointer"
              >
                تغییر شماره موبایل
              </button>

              {timerSeconds > 0 ? (
                <span className="text-slate-400 font-mono">
                  ارسال مجدد ({timerSeconds} ثانیه)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handlePhoneSubmit}
                  className="text-amber-600 hover:underline cursor-pointer"
                >
                  ارسال مجدد کد پیامکی
                </button>
              )}
            </div>
          </form>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>مطابق با استاندارد امنیت کافه بازار و حفظ حریم خصوصی کاربران</span>
        </div>
      </div>
    </div>
  );
};
