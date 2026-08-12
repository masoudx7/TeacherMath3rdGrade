import React, { useState } from 'react';
import { playSound } from '../../utils/sound';
import { Trophy, Flame, CheckCircle2, RefreshCw, Calculator, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegroupingGameProps {
  soundEnabled: boolean;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
}

type Mode = 'addition' | 'subtraction' | 'word_problems';

export const RegroupingGame: React.FC<RegroupingGameProps> = ({
  soundEnabled,
  onAddStars,
  onIncrementSolved,
}) => {
  const [mode, setMode] = useState<Mode>('addition');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Questions data
  const additionQuestions = [
    {
      num1: 3458,
      num2: 2367,
      correct: 5825,
      options: [5825, 5715, 5815, 5925],
      hint: 'ابتدا مرتبه یکی‌ها (۸ + ۷ = ۱۵)، ۵ را می‌نویسیم و ۱ ده تایی را منتقل می‌کنیم.',
      breakdown: {
        ones: '۸ + ۷ = ۱۵ (۵ در یکی، ۱ منتقل به ده تایی)',
        tens: '۵ + ۶ + ۱ = ۱۲ (۲ در ده تایی، ۱ منتقل به صدتایی)',
        hundreds: '۴ + ۳ + ۱ = ۸',
        thousands: '۳ + ۲ = ۵'
      }
    },
    {
      num1: 4572,
      num2: 1849,
      correct: 6421,
      options: [6421, 6321, 6411, 6521],
      hint: 'جمع مرتبه‌به‌مرتبه از راست به چپ با انتقال یکی و ده تایی.',
      breakdown: {
        ones: '۲ + ۹ = ۱۱ (۱ در یکی، ۱ منتقل)',
        tens: '۷ + ۴ + ۱ = ۱۲ (۲ در ده تایی، ۱ منتقل)',
        hundreds: '۵ + ۸ + ۱ = ۱۴ (۴ در صدتایی، ۱ منتقل)',
        thousands: '۴ + ۱ + ۱ = ۶'
      }
    },
    {
      num1: 2835,
      num2: 3165,
      correct: 6000,
      options: [6000, 5900, 6100, 5000],
      hint: 'انتقال‌های پیاپی: ۵+۵=۱۰، ۳+۶+۱=۱۰، ۸+۱+۱=۱۰، ۲+۳+۱=۶.',
      breakdown: {
        ones: '۵ + ۵ = ۱۰ (۰ در یکی، ۱ منتقل)',
        tens: '۳ + ۶ + ۱ = ۱۰ (۰ در ده تایی، ۱ منتقل)',
        hundreds: '۸ + ۱ + ۱ = ۱۰ (۰ در صدتایی، ۱ منتقل)',
        thousands: '۲ + ۳ + ۱ = ۶'
      }
    }
  ];

  const subtractionQuestions = [
    {
      num1: 5432,
      num2: 2165,
      correct: 3267,
      options: [3267, 3277, 3367, 3167],
      hint: 'از مرتبه ده تایی قرض بگیرید: ۲ یکی تبدیل به ۱۲ می‌شود.',
      breakdown: {
        ones: '۱۲ - ۵ = ۷ (از ده تایی ۱ واحد قرض گرفتیم)',
        tens: '۱۲ - ۶ = ۶ (از صدتایی ۱ واحد قرض گرفتیم)',
        hundreds: '۳ - ۱ = ۲',
        thousands: '۵ - ۲ = ۳'
      }
    },
    {
      num1: 7000,
      num2: 3425,
      correct: 3575,
      options: [3575, 3675, 3475, 4575],
      hint: 'تفریق با صفرهای متوالی: هزارتایی تبدیل به ۶ شده و یکی‌ها ۱۰ می‌شوند.',
      breakdown: {
        ones: '۱۰ - ۵ = ۵',
        tens: '۹ - ۲ = ۷',
        hundreds: '۹ - ۴ = ۵',
        thousands: '۶ - ۳ = ۳'
      }
    },
    {
      num1: 6240,
      num2: 1825,
      correct: 4415,
      options: [4415, 4315, 4425, 4515],
      hint: 'قرض گرفتن ده تایی برای یکی‌ها: ۰ می‌شود ۱۰ و ۴ می‌شود ۳.',
      breakdown: {
        ones: '۱۰ - ۵ = ۵',
        tens: '۳ - ۲ = ۱',
        hundreds: '۱۲ - ۸ = ۴ (قرض از هزارتایی)',
        thousands: '۵ - ۱ = ۴'
      }
    }
  ];

  const problemQuestions = [
    {
      text: 'رضا ۳۵۰۰ تومان پول داشت. علی به او ۲۴۵۰ تومان دیگر داد. سپس رضا یک کتاب به قیمت ۴۲۰۰ تومان خرید. چقدر پول برای رضا باقی مانده است؟',
      correct: 1750,
      options: [1750, 1850, 1650, 2750],
      explanation: 'ابتدا جمع: ۳۵۰۰ + ۲۴۵۰ = ۵۹۵۰ تومان. سپس تفریق: ۵۹۵۰ - ۴۲۰۰ = ۱۷۵۰ تومان.'
    },
    {
      text: 'در یک کتابخانه ۴۲۸۰ جلد کتاب داستان و ۳۱۵۰ جلد کتاب علمی وجود دارد. مجموع کتاب‌های کتابخانه چقدر است؟',
      correct: 7430,
      options: [7430, 7330, 7530, 7420],
      explanation: 'جمع دو عدد: ۴۲۸۰ + ۳۱۵۰ = ۷۴۳۰ جلد کتاب.'
    }
  ];

  const [addIdx, setAddIdx] = useState(0);
  const [subIdx, setSubIdx] = useState(0);
  const [probIdx, setProbIdx] = useState(0);

  const currentAdd = additionQuestions[addIdx];
  const currentSub = subtractionQuestions[subIdx];
  const currentProb = problemQuestions[probIdx];

  const handleAnswer = (ans: number) => {
    if (feedback !== null) return;
    setSelectedAns(ans);

    let isCorrect = false;
    if (mode === 'addition') isCorrect = ans === currentAdd.correct;
    else if (mode === 'subtraction') isCorrect = ans === currentSub.correct;
    else isCorrect = ans === currentProb.correct;

    if (isCorrect) {
      setFeedback('correct');
      playSound('correct', soundEnabled);
      setScore(s => s + 10);
      setStreak(st => st + 1);
      onAddStars(2);
      onIncrementSolved();

      if ((streak + 1) % 3 === 0) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }

      setTimeout(() => {
        setFeedback(null);
        setSelectedAns(null);
        if (mode === 'addition') setAddIdx(prev => (prev + 1) % additionQuestions.length);
        else if (mode === 'subtraction') setSubIdx(prev => (prev + 1) % subtractionQuestions.length);
        else setProbIdx(prev => (prev + 1) % problemQuestions.length);
      }, 1600);
    } else {
      setFeedback('wrong');
      playSound('wrong', soundEnabled);
      setStreak(0);
      setTimeout(() => {
        setFeedback(null);
        setSelectedAns(null);
      }, 1400);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md max-w-3xl mx-auto space-y-4 sm:space-y-6 dir-rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-100 pb-3 sm:pb-4">
        <div>
          <h3 className="font-black text-slate-800 text-base sm:text-xl flex items-center gap-2">
            <span>جمع و تفریق تکنیکی ۴ رقمی (فصل ۶) ➕➖</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500">انتقال ده تایی و صدتایی در جدول ارزش مکانی و مسائل مالی</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-1 rounded-xl text-xs sm:text-sm">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
            <span>امتیاز: {score}</span>
          </div>
          <div className="flex items-center gap-1 bg-orange-100 text-orange-900 border border-orange-300 font-bold px-2.5 py-1 rounded-xl text-xs sm:text-sm">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 fill-orange-500" />
            <span>پیاپی: {streak}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setMode('addition');
            setFeedback(null);
            setSelectedAns(null);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[38px] ${
            mode === 'addition'
              ? 'bg-blue-600 text-white border-2 border-blue-700 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ۱. جمع با انتقال (تکنیکی) ➕
        </button>

        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setMode('subtraction');
            setFeedback(null);
            setSelectedAns(null);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[38px] ${
            mode === 'subtraction'
              ? 'bg-rose-600 text-white border-2 border-rose-700 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ۲. تفریق با قرض گرفتن ➖
        </button>

        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setMode('word_problems');
            setFeedback(null);
            setSelectedAns(null);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[38px] ${
            mode === 'word_problems'
              ? 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ۳. مسائل کاربردی و مالی 💰
        </button>
      </div>

      {/* MODE 1: Addition */}
      {mode === 'addition' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white text-center shadow-md space-y-4">
            <span className="text-xs sm:text-sm font-bold bg-white/20 px-3 py-1 rounded-full border border-white/30">
              حاصل جمع دو عدد ۴ رقمی زیر کدام است؟
            </span>

            {/* Vertical Math Display */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 max-w-xs mx-auto border border-white/30 space-y-1 text-2xl sm:text-4xl font-black font-mono tracking-widest text-amber-200 dir-ltr">
              <div>{currentAdd.num1.toLocaleString('fa-IR')}</div>
              <div className="flex justify-between items-center border-b-2 border-white/40 pb-1">
                <span>+</span>
                <span>{currentAdd.num2.toLocaleString('fa-IR')}</span>
              </div>
              <div className="text-white pt-1">؟</div>
            </div>

            <p className="text-xs text-blue-100 font-medium">{currentAdd.hint}</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {currentAdd.options.map((opt, idx) => {
              const isSelected = selectedAns === opt;
              let btnClass = 'bg-slate-50 hover:bg-blue-100 text-slate-800 border-2 border-slate-200';
              if (isSelected && feedback === 'correct') {
                btnClass = 'bg-emerald-500 text-white border-2 border-emerald-600 animate-bounce';
              } else if (isSelected && feedback === 'wrong') {
                btnClass = 'bg-rose-500 text-white border-2 border-rose-600 animate-shake';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  disabled={feedback !== null}
                  className={`py-3 sm:py-4 px-4 rounded-2xl font-black text-lg sm:text-2xl transition-all cursor-pointer shadow-xs min-h-[50px] ${btnClass}`}
                >
                  {opt.toLocaleString('fa-IR')}
                </button>
              );
            })}
          </div>

          {feedback === 'correct' && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-right text-xs sm:text-sm font-bold text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>آفرین! پاسخ صحیح است: {currentAdd.correct.toLocaleString('fa-IR')}</span>
              </div>
              <div className="text-[11px] text-emerald-700 pr-6">
                • یکی‌ها: {currentAdd.breakdown.ones}<br />
                • ده تایی‌ها: {currentAdd.breakdown.tens}<br />
                • صدتایی‌ها: {currentAdd.breakdown.hundreds}<br />
                • هزارتایی‌ها: {currentAdd.breakdown.thousands}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Subtraction */}
      {mode === 'subtraction' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-tr from-rose-600 via-pink-600 to-purple-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white text-center shadow-md space-y-4">
            <span className="text-xs sm:text-sm font-bold bg-white/20 px-3 py-1 rounded-full border border-white/30">
              حاصل تفریق تکنیکی با قرض گرفتن کدام است؟
            </span>

            {/* Vertical Math Display */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 max-w-xs mx-auto border border-white/30 space-y-1 text-2xl sm:text-4xl font-black font-mono tracking-widest text-amber-200 dir-ltr">
              <div>{currentSub.num1.toLocaleString('fa-IR')}</div>
              <div className="flex justify-between items-center border-b-2 border-white/40 pb-1">
                <span>-</span>
                <span>{currentSub.num2.toLocaleString('fa-IR')}</span>
              </div>
              <div className="text-white pt-1">؟</div>
            </div>

            <p className="text-xs text-rose-100 font-medium">{currentSub.hint}</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {currentSub.options.map((opt, idx) => {
              const isSelected = selectedAns === opt;
              let btnClass = 'bg-slate-50 hover:bg-rose-100 text-slate-800 border-2 border-slate-200';
              if (isSelected && feedback === 'correct') {
                btnClass = 'bg-emerald-500 text-white border-2 border-emerald-600 animate-bounce';
              } else if (isSelected && feedback === 'wrong') {
                btnClass = 'bg-rose-500 text-white border-2 border-rose-600 animate-shake';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  disabled={feedback !== null}
                  className={`py-3 sm:py-4 px-4 rounded-2xl font-black text-lg sm:text-2xl transition-all cursor-pointer shadow-xs min-h-[50px] ${btnClass}`}
                >
                  {opt.toLocaleString('fa-IR')}
                </button>
              );
            })}
          </div>

          {feedback === 'correct' && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-right text-xs sm:text-sm font-bold text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>عالی بود! پاسخ {currentSub.correct.toLocaleString('fa-IR')} صحیح است.</span>
              </div>
              <div className="text-[11px] text-emerald-700 pr-6">
                • یکی‌ها: {currentSub.breakdown.ones}<br />
                • ده تایی‌ها: {currentSub.breakdown.tens}<br />
                • صدتایی‌ها: {currentSub.breakdown.hundreds}<br />
                • هزارتایی‌ها: {currentSub.breakdown.thousands}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: Word Problems */}
      {mode === 'word_problems' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-md space-y-3">
            <span className="text-xs sm:text-sm font-bold bg-white/20 px-3 py-1 rounded-full border border-white/30 inline-block">
              مسئله کلامی و کاربردی
            </span>

            <p className="text-sm sm:text-base font-bold leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/20">
              {currentProb.text}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {currentProb.options.map((opt, idx) => {
              const isSelected = selectedAns === opt;
              let btnClass = 'bg-slate-50 hover:bg-emerald-100 text-slate-800 border-2 border-slate-200';
              if (isSelected && feedback === 'correct') {
                btnClass = 'bg-emerald-500 text-white border-2 border-emerald-600 animate-bounce';
              } else if (isSelected && feedback === 'wrong') {
                btnClass = 'bg-rose-500 text-white border-2 border-rose-600 animate-shake';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  disabled={feedback !== null}
                  className={`py-3 sm:py-4 px-4 rounded-2xl font-black text-base sm:text-xl transition-all cursor-pointer shadow-xs min-h-[50px] ${btnClass}`}
                >
                  {opt.toLocaleString('fa-IR')} تومان
                </button>
              );
            })}
          </div>

          {feedback === 'correct' && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-center text-xs sm:text-sm font-bold text-emerald-800 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{currentProb.explanation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
