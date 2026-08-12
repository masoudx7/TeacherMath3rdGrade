import React, { useState } from 'react';
import { playSound } from '../../utils/sound';
import { Trophy, Flame, CheckCircle2, Zap, Grid, Calculator } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdvancedMultiplicationGameProps {
  soundEnabled: boolean;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
}

type Mode = 'multiply_zeros' | 'two_by_one' | 'estimation';

export const AdvancedMultiplicationGame: React.FC<AdvancedMultiplicationGameProps> = ({
  soundEnabled,
  onAddStars,
  onIncrementSolved,
}) => {
  const [mode, setMode] = useState<Mode>('multiply_zeros');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // 1. Multiply by 10, 100, 1000
  const zeroQuestions = [
    {
      num1: 6,
      num2: 100,
      correct: 600,
      options: [60, 600, 6000, 660],
      rule: 'عدد را ضرب در ۱ کرده و به تعداد صفرها (۲ صفر) جلوی آن قرار می‌دهیم: ۶ × ۱ = ۶ -> ۶۰۰.'
    },
    {
      num1: 4,
      num2: 1000,
      correct: 4000,
      options: [400, 4000, 40000, 40],
      rule: 'ضرب در هزار: ۳ صفر جلوی عدد قرار می‌گیرد (۴۰۰۰).'
    },
    {
      num1: 25,
      num2: 10,
      correct: 250,
      options: [250, 2500, 205, 520],
      rule: 'ضرب در ۱۰: یک صفر جلوی عدد ۲۵ قرار می‌گیرد (۲۵۰).'
    }
  ];

  // 2. Multiply 2-digit by 1-digit (ضرب دو رقم در یک رقم)
  const twoByOneQuestions = [
    {
      num1: 23,
      num2: 4,
      correct: 92,
      options: [82, 92, 102, 88],
      stepText: 'گسترده‌نویسی: ۲۳ می‌شود (۲۰ + ۳). حالا ۴ × ۲۰ = ۸۰ و ۴ × ۳ = ۱۲. مجموع: ۸۰ + ۱۲ = ۹۲.',
      hint: 'ابتدا ۴ را در ۳ (یکی‌ها) و سپس ۴ را در ۲۰ (ده‌تایی‌ها) ضرب کن.'
    },
    {
      num1: 35,
      num2: 3,
      correct: 105,
      options: [95, 105, 115, 100],
      stepText: '۳ × ۳۰ = ۹۰ و ۳ × ۵ = ۱۵. مجموع: ۹۰ + ۱۵ = ۱۰۵.',
      hint: 'ده‌تایی‌ها (۳۰) و یکی‌ها (۵) را جداگانه ضرب کن.'
    },
    {
      num1: 42,
      num2: 5,
      correct: 210,
      options: [200, 210, 220, 205],
      stepText: '۵ × ۴۰ = ۲۰۰ و ۵ × ۲ = ۱۰. مجموع: ۲۰۰ + ۱۰ = ۲۱۰.',
      hint: '۵ ضرب در ۴۰ می‌شود ۲۰۰، ۵ ضرب در ۲ می‌شود ۱۰.'
    }
  ];

  // 3. Estimation & Word Problems (تخمین و مسائل)
  const estimationQuestions = [
    {
      text: 'اگر قیمت هر دفتر ۴۸ تومان باشد، قیمت تقریبی ۴ جلد دفتر حدوداً چقدر است؟ (با گرد کردن به ۵۰)',
      correct: '۲۰۰ تومان',
      options: ['۱۵۰ تومان', '۲۰۰ تومان', '۲۵۰ تومان', '۱۸۰ تومان'],
      explanation: 'عدد ۴۸ تقریباً ۵۰ است. حاصل ۵۰ × ۴ برابر است با ۲۰۰ تومان.'
    },
    {
      text: 'یک کارتن حاوی ۶ جعبه مداد رنگی است و در هر جعبه ۱۲ مداد وجود دارد. تعداد کل مدادها چند تاست؟',
      correct: '۷۲ مداد',
      options: ['۶۰ مداد', '۷۲ مداد', '۸۲ مداد', '۶۶ مداد'],
      explanation: 'ضرب ۶ در ۱۲: ۶ × ۱۰ = ۶۰ و ۶ × ۲ = ۱۲. مجموع ۶۰ + ۱۲ = ۷۲ مداد.'
    }
  ];

  const [zeroIdx, setZeroIdx] = useState(0);
  const [twoByOneIdx, setTwoByOneIdx] = useState(0);
  const [estIdx, setEstIdx] = useState(0);

  const currentZero = zeroQuestions[zeroIdx];
  const currentTwo = twoByOneQuestions[twoByOneIdx];
  const currentEst = estimationQuestions[estIdx];

  const handleAnswer = (ans: number | string) => {
    if (feedback !== null) return;
    setSelectedAns(ans);

    let isCorrect = false;
    if (mode === 'multiply_zeros') isCorrect = Number(ans) === currentZero.correct;
    else if (mode === 'two_by_one') isCorrect = Number(ans) === currentTwo.correct;
    else isCorrect = String(ans) === currentEst.correct;

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
        if (mode === 'multiply_zeros') setZeroIdx(prev => (prev + 1) % zeroQuestions.length);
        else if (mode === 'two_by_one') setTwoByOneIdx(prev => (prev + 1) % twoByOneQuestions.length);
        else setEstIdx(prev => (prev + 1) % estimationQuestions.length);
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
            <span>ضرب اعداد بزرگ‌تر (فصل ۸) ⚡✖️</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500">ضرب در ۱۰، ۱۰۰، ۱۰۰۰ و ضرب دو رقم در یک رقم</p>
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

      {/* Mode Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setMode('multiply_zeros');
            setFeedback(null);
            setSelectedAns(null);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[38px] ${
            mode === 'multiply_zeros'
              ? 'bg-amber-500 text-slate-900 border-2 border-amber-600 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ۱. ضرب در ۱۰ و ۱۰۰ و ۱۰۰۰ 🚀
        </button>

        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setMode('two_by_one');
            setFeedback(null);
            setSelectedAns(null);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[38px] ${
            mode === 'two_by_one'
              ? 'bg-purple-600 text-white border-2 border-purple-700 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ۲. ضرب دو رقم در یک رقم ✖️
        </button>

        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setMode('estimation');
            setFeedback(null);
            setSelectedAns(null);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[38px] ${
            mode === 'estimation'
              ? 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ۳. تخمین و مسائل ضرب 🧠
        </button>
      </div>

      {/* MODE 1: Multiply by Zeros */}
      {mode === 'multiply_zeros' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-tr from-amber-500 via-yellow-500 to-orange-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-slate-900 text-center shadow-md space-y-4">
            <span className="text-xs sm:text-sm font-bold bg-black/10 px-3 py-1 rounded-full border border-black/20">
              تکنیک سریع صفرها در ضرب
            </span>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 max-w-xs mx-auto border border-amber-300 text-3xl sm:text-5xl font-black tracking-widest text-slate-900 dir-ltr shadow-inner">
              {currentZero.num1} × {currentZero.num2} = ؟
            </div>

            <p className="text-xs font-bold text-slate-800">به تعداد صفرهای ۱۰، ۱۰۰ و ۱۰۰۰ دقت کن!</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {currentZero.options.map((opt, idx) => {
              const isSelected = selectedAns === opt;
              let btnClass = 'bg-slate-50 hover:bg-amber-100 text-slate-800 border-2 border-slate-200';
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
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-center text-xs sm:text-sm font-bold text-emerald-800 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>عالی بود! {currentZero.rule}</span>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Two-digit by One-digit */}
      {mode === 'two_by_one' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white text-center shadow-md space-y-4">
            <span className="text-xs sm:text-sm font-bold bg-white/20 px-3 py-1 rounded-full border border-white/30">
              ضرب دو رقم در یک رقم
            </span>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 max-w-xs mx-auto border border-white/30 text-3xl sm:text-5xl font-black tracking-widest text-amber-200 dir-ltr">
              {currentTwo.num1} × {currentTwo.num2} = ؟
            </div>

            <p className="text-xs text-purple-200 font-medium">{currentTwo.hint}</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {currentTwo.options.map((opt, idx) => {
              const isSelected = selectedAns === opt;
              let btnClass = 'bg-slate-50 hover:bg-purple-100 text-slate-800 border-2 border-slate-200';
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
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-right text-xs sm:text-sm font-bold text-emerald-800 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>پاسخ صحیح است! {currentTwo.stepText}</span>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: Estimation and Word Problems */}
      {mode === 'estimation' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-md space-y-3">
            <span className="text-xs sm:text-sm font-bold bg-white/20 px-3 py-1 rounded-full border border-white/30 inline-block">
              تخمین و مسائل کلامی فصل ۸
            </span>

            <p className="text-sm sm:text-base font-bold leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/20">
              {currentEst.text}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {currentEst.options.map((opt, idx) => {
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
                  className={`py-3 sm:py-4 px-3 rounded-2xl font-black text-sm sm:text-base transition-all cursor-pointer shadow-xs min-h-[50px] ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {feedback === 'correct' && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-center text-xs sm:text-sm font-bold text-emerald-800 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{currentEst.explanation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
