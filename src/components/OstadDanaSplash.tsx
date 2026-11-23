import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import ostadDanaEmblem from '../assets/images/ostad_dana_emblem_1795466544643.jpg';
import { playSound } from '../utils/sound';

interface OstadDanaSplashProps {
  onEnter: () => void;
  soundEnabled: boolean;
  studentName?: string;
}

export const OstadDanaSplash: React.FC<OstadDanaSplashProps> = ({
  onEnter,
  soundEnabled,
  studentName,
}) => {
  const [imgError, setImgError] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleEnter = () => {
    if (isLeaving) return;
    playSound('success', soundEnabled);
    setIsLeaving(true);
    setTimeout(() => {
      onEnter();
    }, 200);
  };

  const hasCustomName = Boolean(studentName && studentName !== 'دانش‌آموز مهمان');

  return (
    <div
      className={`min-h-[100dvh] w-full bg-[#FBF6EC] text-[#26354D] flex flex-col items-center justify-between px-5 py-8 sm:py-12 relative overflow-hidden select-none dir-rtl transition-all duration-200 ease-out ${
        isLeaving ? 'opacity-0 scale-[1.03]' : 'opacity-100 scale-100'
      }`}
    >
      {/* Warm sunlight soft radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 42%, rgba(251, 191, 36, 0.22) 0%, rgba(253, 186, 116, 0.08) 38%, rgba(251, 246, 236, 0) 70%)',
        }}
      />

      {/* Top quiet kicker */}
      <header className="relative z-10 w-full max-w-xl flex items-center justify-center pt-1">
        <p className="text-xs sm:text-sm font-bold text-amber-900/65 tracking-tight flex items-center gap-2">
          <span>ریاضی سوم ابتدایی</span>
          <span aria-hidden="true" className="text-amber-500">·</span>
          <span>آموزگار هوشمند</span>
        </p>
      </header>

      {/* Main Focal Anchor: Soft Neomorphic Ostad Dana Logo Medallion */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-lg my-auto py-4">
        <button
          type="button"
          onClick={handleEnter}
          aria-label="ورود به صفحه استاد دانا"
          className="group relative flex items-center justify-center p-6 sm:p-8 rounded-full cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 transition-transform duration-200 ease-out hover:-translate-y-1 active:scale-[0.97]"
        >
          {/* Outer slow rotating Persian geometric compass ring */}
          <svg
            aria-hidden="true"
            viewBox="0 0 320 320"
            className="absolute inset-0 w-full h-full text-amber-500/40 animate-spin-slow motion-reduce:animate-none pointer-events-none"
          >
            <circle
              cx="160"
              cy="160"
              r="150"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="8 8"
            />
          </svg>

          {/* Soft Tactile Cardinal Math Symbols */}
          <span
            aria-hidden="true"
            className="absolute top-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-amber-600 text-xs font-extrabold flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(120,82,40,0.22),inset_0_1px_0_#fff] border border-amber-100 pointer-events-none"
          >
            +
          </span>
          <span
            aria-hidden="true"
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-amber-600 text-xs font-extrabold flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(120,82,40,0.22),inset_0_1px_0_#fff] border border-amber-100 pointer-events-none"
          >
            ÷
          </span>
          <span
            aria-hidden="true"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white text-[#26354D] text-xs font-extrabold flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(120,82,40,0.22),inset_0_1px_0_#fff] border border-amber-100 pointer-events-none"
          >
            ×
          </span>
          <span
            aria-hidden="true"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white text-[#26354D] text-xs font-extrabold flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(120,82,40,0.22),inset_0_1px_0_#fff] border border-amber-100 pointer-events-none"
          >
            −
          </span>

          {/* Central Soft Clay Medallion Seal */}
          <div className="relative w-56 h-56 sm:w-68 sm:h-68 rounded-full bg-gradient-to-b from-white to-[#FFF8EB] p-2.5 shadow-[16px_20px_42px_rgba(166,132,88,0.24),-12px_-12px_32px_rgba(255,255,255,0.92),inset_0_2px_4px_rgba(255,255,255,0.9)] border border-amber-100/90 group-hover:shadow-[18px_24px_48px_rgba(217,119,6,0.24),-12px_-12px_34px_rgba(255,255,255,0.95)] transition-shadow duration-200">
            <div className="w-full h-full rounded-full border-2 border-amber-400/50 overflow-hidden bg-[#FFF9E5] flex items-center justify-center shadow-inner">
              {!imgError ? (
                <img
                  src={ostadDanaEmblem}
                  alt="لوگو استاد دانا - معلم ریاضی سوم ابتدایی"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover scale-[1.05] group-hover:scale-[1.09] transition-transform duration-300 ease-out"
                />
              ) : (
                <svg viewBox="0 0 120 120" className="w-36 h-36" aria-hidden="true">
                  <polygon
                    points="60,8 74,26 97,23 94,46 112,60 94,74 97,97 74,94 60,112 46,94 23,97 26,74 8,60 26,46 23,23 46,26"
                    fill="#FEF3C7"
                    stroke="#26354D"
                    strokeWidth="3"
                  />
                  <circle cx="60" cy="60" r="24" fill="#26354D" />
                  <circle cx="51" cy="56" r="7" fill="#FFF9E5" stroke="#F59E0B" strokeWidth="2" />
                  <circle cx="69" cy="56" r="7" fill="#FFF9E5" stroke="#F59E0B" strokeWidth="2" />
                  <circle cx="51" cy="56" r="2.5" fill="#26354D" />
                  <circle cx="69" cy="56" r="2.5" fill="#26354D" />
                  <polygon points="60,61 56,67 64,67" fill="#F59E0B" />
                </svg>
              )}
            </div>
          </div>
        </button>

        {/* Brand Wordmark & Prompt */}
        <div className="mt-5 sm:mt-6 flex flex-col items-center text-center gap-2.5">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#26354D] tracking-tight text-balance">
            استاد دانا
          </h1>
          <p className="text-sm sm:text-base font-medium text-amber-950/65 max-w-xs sm:max-w-sm leading-relaxed">
            {hasCustomName
              ? `سلام ${studentName} عزیز! روی نشان استاد دانا بزن تا وارد کلاس بشی`
              : 'روی نشان استاد دانا بزن تا کلاس ریاضی رو شروع کنیم'}
          </p>
        </div>

        {/* Soft Clay Primary CTA */}
        <button
          type="button"
          onClick={handleEnter}
          className="mt-6 clay-btn-primary inline-flex items-center justify-center gap-2.5 px-8 py-3.5 min-h-[50px] rounded-2xl font-bold text-base cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
        >
          <span>ورود به صفحه استاد دانا</span>
          <ArrowLeft className="w-5 h-5 shrink-0" />
        </button>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="relative z-10 w-full max-w-xl text-center pb-1">
        <p className="text-xs font-medium text-amber-900/55">
          آموزش مفهومی فصل به فصل ریاضی سوم دبستان
        </p>
      </footer>
    </div>
  );
};
