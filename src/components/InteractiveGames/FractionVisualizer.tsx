import React, { useState, useEffect } from 'react';
import { playSound } from '../../utils/sound';
import confetti from 'canvas-confetti';
import { 
  PieChart, 
  Scale, 
  Navigation2, 
  CheckCircle2, 
  HelpCircle, 
  RefreshCw, 
  Sparkles, 
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { saveMistake } from '../../utils/mistakeStore';

interface FractionVisualizerProps {
  soundEnabled: boolean;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
  onUpdateMastery?: (chapterId: string, percentage: number) => void;
}

type TabMode = 'build' | 'equivalent' | 'number_line';

export const FractionVisualizer: React.FC<FractionVisualizerProps> = ({
  soundEnabled,
  onAddStars,
  onIncrementSolved,
  onUpdateMastery,
}) => {
  const [mode, setMode] = useState<TabMode>('equivalent');

  // حالت ۱ و ۲: کسرها و ترازوی معادل
  const [den1, setDen1] = useState<number>(2);
  const [num1, setNum1] = useState<number>(1);
  const [den2, setDen2] = useState<number>(4);
  const [num2, setNum2] = useState<number>(2);

  // چالش کسر معادل هدف
  const [targetTask, setTargetTask] = useState<{ baseNum: number; baseDen: number; targetDen: number }>({
    baseNum: 1,
    baseDen: 2,
    targetDen: 4,
  });

  const [feedback, setFeedback] = useState<{ status: 'idle' | 'correct' | 'wrong'; message: string }>({
    status: 'idle',
    message: '',
  });

  const [streak, setStreak] = useState<number>(0);

  // تولید یک چالش جدید کسرهای مساوی
  const generateNewChallenge = () => {
    const challenges = [
      { baseNum: 1, baseDen: 2, targetDen: 4 }, // 1/2 = 2/4
      { baseNum: 1, baseDen: 2, targetDen: 6 }, // 1/2 = 3/6
      { baseNum: 1, baseDen: 3, targetDen: 6 }, // 1/3 = 2/6
      { baseNum: 2, baseDen: 3, targetDen: 6 }, // 2/3 = 4/6
      { baseNum: 1, baseDen: 4, targetDen: 8 }, // 1/4 = 2/8
      { baseNum: 3, baseDen: 4, targetDen: 8 }, // 3/4 = 6/8
    ];
    const picked = challenges[Math.floor(Math.random() * challenges.length)];
    setTargetTask(picked);
    setDen1(picked.baseDen);
    setNum1(picked.baseNum);
    setDen2(picked.targetDen);
    setNum2(0); // کودک باید خودش تکه‌ها را برش بزند و رنگ کند
    setFeedback({ status: 'idle', message: '' });
  };

  useEffect(() => {
    generateNewChallenge();
  }, []);

  // بررسی ترازوی تعادل
  const val1 = num1 / den1;
  const val2 = num2 / den2;
  const isBalanced = Math.abs(val1 - val2) < 0.001 && num2 > 0;

  const handleSliceClick = (dishIndex: 1 | 2, sliceIndex: number) => {
    playSound('pop', soundEnabled);
    if (dishIndex === 2) {
      if (sliceIndex < num2) {
        setNum2((prev) => Math.max(0, prev - 1));
      } else {
        setNum2((prev) => Math.min(den2, prev + 1));
      }
    }
  };

  const handleCheckEquivalence = () => {
    const expectedNum2 = (targetTask.baseNum * targetTask.targetDen) / targetTask.baseDen;

    if (num2 === expectedNum2) {
      playSound('correct', soundEnabled);
      confetti({ particleCount: 50, spread: 60 });
      const newStreak = streak + 1;
      setStreak(newStreak);
      setFeedback({
        status: 'correct',
        message: `آفرین قهرمان! 🍕 کسر ${targetTask.baseNum}/${targetTask.baseDen} دقیقاً برابر با ${num2}/${den2} است. هر دو به یک اندازه سیر می‌کنند! ⭐`,
      });
      onAddStars(2);
      onIncrementSolved();

      // افزایش تسلط تا سقف ۱۰۰٪
      if (onUpdateMastery) {
        const masteryScore = Math.min(100, newStreak * 20);
        onUpdateMastery('fractions', masteryScore);
      }

      setTimeout(() => {
        generateNewChallenge();
      }, 2500);
    } else {
      playSound('wrong', soundEnabled);
      setFeedback({
        status: 'wrong',
        message: `کفه ترازو هنوز برابر نشده! در کسر ${num2}/${den2} برش‌ها ریزتر هستند؛ چند برش دیگر باید برداری تا مساحت رنگ‌شده با پیتزای سمت راست مساوی شود؟`,
      });

      // ثبت خطا در دفترچه یادداشت اشتباهات
      saveMistake('current_student', {
        userId: 'current_student',
        question: `کسر مساوی: کسر ${targetTask.baseNum}/${targetTask.baseDen} با چه کسری با مخرج ${targetTask.targetDen} مساوی است؟`,
        userAnswer: `${num2}/${den2}`,
        correctAnswer: `${expectedNum2}/${targetTask.targetDen}`,
      });
    }
  };

  // تابع رسم دایره پیتزا با SVG
  const renderPizzaSvg = (num: number, den: number, isInteractive: boolean, dish: 1 | 2) => {
    const size = 180;
    const center = size / 2;
    const radius = 70;
    const slices = [];

    for (let i = 0; i < den; i++) {
      const startAngle = (i * 2 * Math.PI) / den - Math.PI / 2;
      const endAngle = ((i + 1) * 2 * Math.PI) / den - Math.PI / 2;
      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);
      const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      const isColored = i < num;
      slices.push(
        <path
          key={i}
          d={pathData}
          fill={isColored ? (dish === 1 ? '#F59E0B' : '#10B981') : '#F1F5F9'}
          stroke="#475569"
          strokeWidth="2.5"
          className={`${isInteractive ? 'cursor-pointer hover:opacity-80 transition-transform active:scale-95' : ''}`}
          onClick={() => isInteractive && handleSliceClick(dish, i)}
        />
      );
    }

    return (
      <svg width={size} height={size} className="mx-auto filter drop-shadow-md">
        <circle cx={center} cy={center} r={radius + 4} fill="#FED7AA" stroke="#D97706" strokeWidth="4" />
        {slices}
        <circle cx={center} cy={center} r="6" fill="#78350F" />
      </svg>
    );
  };

  return (
    <div className="bg-white border-4 border-emerald-300 rounded-[2.5rem] p-5 sm:p-7 shadow-xl max-w-4xl mx-auto space-y-6 dir-rtl">
      {/* هدر کارگاه مفهومی */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-emerald-100 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 shadow-inner">
            <PieChart className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-lg sm:text-xl">
              کارگاه کشف کسرهای مساوی و ترازوی پیتزا ⚖️🍕
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              دست‌ورزی و درک عینی برابری کسرها (کتاب ریاضی سوم، فصل ۳)
            </p>
          </div>
        </div>

        {/* نشانگر زنجیره موفقیت */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span className="text-xs font-bold text-emerald-900">زنجیره تسلط:</span>
          <span className="text-base font-black text-emerald-700">{streak}</span>
        </div>
      </div>

      {/* انتخاب حالت کارگاه */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2 max-w-md mx-auto">
        <button
          onClick={() => setMode('equivalent')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            mode === 'equivalent' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          ترازوی کسرهای مساوی ⚖️
        </button>
        <button
          onClick={() => setMode('number_line')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            mode === 'number_line' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          کسر روی محور اعداد 📏
        </button>
      </div>

      {mode === 'equivalent' ? (
        <div className="space-y-6">
          {/* کارت ماموریت */}
          <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <h4 className="text-sm sm:text-base font-black text-amber-900">
                  ماموریت تعادل: پیتزای سبز را طوری رنگ کن که با پیتزای زرد برابر شود!
                </h4>
                <p className="text-xs sm:text-sm text-amber-700 mt-1">
                  پیتزای سمت راست دارای {targetTask.baseDen} تکه است و {targetTask.baseNum} تکه‌اش خورده شده. در پیتزای {targetTask.targetDen} تکه‌ای چند برش باید برداری؟
                </p>
              </div>
            </div>
            <button
              onClick={generateNewChallenge}
              className="px-3 py-2 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>چالش جدید</span>
            </button>
          </div>

          {/* صفحه آزمایشگاه تعاملی (ترازو و دو پیتزا) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/80 p-5 rounded-3xl border border-slate-200">
            {/* پیتزای مبنا (سمت راست) */}
            <div className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-sm text-center space-y-3">
              <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                پیتزای الگو (کسر پایه)
              </span>
              {renderPizzaSvg(num1, den1, false, 1)}
              <div className="text-xl font-black text-amber-600 bg-amber-50 py-2 rounded-xl border border-amber-200">
                {num1} از {den1} ({num1}/{den1})
              </div>
            </div>

            {/* پیتزای قابل تعامل دانش‌آموز (سمت چپ) */}
            <div className="bg-white rounded-2xl p-4 border-2 border-emerald-300 shadow-sm text-center space-y-3">
              <span className="inline-block bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full">
                روی قاچ‌ها بزن تا رنگ شوند (کسر معادل)
              </span>
              {renderPizzaSvg(num2, den2, true, 2)}
              <div className="text-xl font-black text-emerald-600 bg-emerald-50 py-2 rounded-xl border border-emerald-200">
                {num2} از {den2} ({num2}/{den2})
              </div>
            </div>
          </div>

          {/* نماد ترازوی بصری */}
          <div className="flex items-center justify-center gap-3 py-2">
            <Scale className={`w-8 h-8 transition-transform duration-500 ${isBalanced ? 'text-emerald-500 scale-110' : 'text-amber-500 rotate-6'}`} />
            <span className="text-xs sm:text-sm font-bold text-slate-600">
              {isBalanced ? 'ترازو کاملاً تراز و کسرها مساوی هستند! ⚖️✨' : 'ترازو هنوز نامتعادل است. روی قاچ‌ها کلیک کن!'}
            </span>
          </div>

          {/* بازخورد هوشمند */}
          {feedback.message && (
            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm font-bold text-center border-2 transition-all ${
                feedback.status === 'correct'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border-rose-300'
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* دکمه بررسی نتیجه */}
          <button
            onClick={handleCheckEquivalence}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-black text-base shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>بررسی تعادل و تایید کسر مساوی 🚀</span>
          </button>
        </div>
      ) : (
        /* حالت محور اعداد */
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-6 text-center">
          <div className="space-y-1">
            <h4 className="text-base font-black text-slate-800">حرکت کسر روی محور اعداد ۰ تا ۱</h4>
            <p className="text-xs sm:text-sm text-slate-500">
              ببین چطور کسر {num2}/{den2} روی خط‌کش ریاضی قرار می‌گیرد:
            </p>
          </div>

          {/* محور اعداد تعاملی با SVG */}
          <div className="relative py-8">
            <svg width="100%" height="80" className="overflow-visible">
              {/* خط اصلی محور */}
              <line x1="20" y1="40" x2="95%" y2="40" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
              {/* علامت صفر */}
              <circle cx="20" cy="40" r="6" fill="#334155" />
              <text x="20" y="70" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">۰</text>

              {/* علامت یک */}
              <circle cx="95%" cy="40" r="6" fill="#334155" />
              <text x="95%" y="70" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">۱ (واحد کامل)</text>

              {/* نشانگر قورباغه جهنده کسر */}
              <circle
                cx={`${20 + (val2 * 75)}%`}
                cy="40"
                r="12"
                fill="#10B981"
                stroke="#065F46"
                strokeWidth="3"
                className="transition-all duration-300 animate-pulse"
              />
              <text
                x={`${20 + (val2 * 75)}%`}
                y="18"
                textAnchor="middle"
                fontSize="12"
                fontWeight="black"
                fill="#065F46"
              >
                🐸 {num2}/{den2}
              </text>
            </svg>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setNum2((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 bg-rose-100 text-rose-700 rounded-xl font-bold text-xs cursor-pointer hover:bg-rose-200"
            >
              یک گام به عقب ⬅️
            </button>
            <button
              onClick={() => setNum2((prev) => Math.min(den2, prev + 1))}
              className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-xs cursor-pointer hover:bg-emerald-200"
            >
              یک گام به جلو ➡️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
