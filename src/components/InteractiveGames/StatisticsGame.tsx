import React, { useState } from 'react';
import { playSound } from '../../utils/sound';
import { Trophy, Flame, CheckCircle2, BarChart2, PieChart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StatisticsGameProps {
  soundEnabled: boolean;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
}

type Mode = 'tally' | 'barchart' | 'probability';

export const StatisticsGame: React.FC<StatisticsGameProps> = ({
  soundEnabled,
  onAddStars,
  onIncrementSolved,
}) => {
  const [mode, setMode] = useState<Mode>('tally');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // 1. Tally Questions (چوب‌خط)
  const tallyQuestions = [
    {
      title: 'تعداد میوه‌های خریده شده',
      tallyVisual: '卌 卌 |||', // 5 + 5 + 3 = 13
      tallyText: 'دسته‌های ۵ تایی چوب‌خط + ۳ چوب‌خط منفرد',
      question: 'تعداد کل چوب‌خط‌ها چقدر است؟',
      correct: 13,
      options: [12, 13, 14, 15],
      hint: 'هر دسته کامل چوب‌خط برابر با ۵ است. دسته‌ها را ۵تا ۵تا بشمار!'
    },
    {
      title: 'تعداد کتاب‌های مطالعه شده',
      tallyVisual: '卌 卌 卌 |', // 5 + 5 + 5 + 1 = 16
      tallyText: '۳ دسته ۵ تایی چوب‌خط + ۱ چوب‌خط منفرد',
      question: 'این چوب‌خط نشان‌دهنده چه عددی است؟',
      correct: 16,
      options: [15, 16, 17, 18],
      hint: '۳ تا دسته ۵ تایی می‌شود ۱۵. ۱ واحد هم اضافه شده است.'
    }
  ];

  // 2. Bar Chart Questions (نمودار ستونی)
  const barChartQuestions = [
    {
      title: 'نمودار علاقه دانش‌آموزان به ورزش‌ها',
      maxVal: 10,
      bars: [
        { name: 'فوتبال', count: 8, color: 'bg-blue-500 border-blue-600', textColor: 'text-blue-200' },
        { name: 'والیبال', count: 5, color: 'bg-amber-400 border-amber-500', textColor: 'text-amber-200' },
        { name: 'شنا', count: 7, color: 'bg-cyan-400 border-cyan-500', textColor: 'text-cyan-200' },
        { name: 'بسکتبال', count: 4, color: 'bg-rose-500 border-rose-600', textColor: 'text-rose-200' }
      ],
      question: 'کدام ورزش بیشترین طرفدار را دارد و چند نفر هستند؟',
      correct: 'فوتبال - ۸ نفر',
      options: ['فوتبال - ۸ نفر', 'شنا - ۷ نفر', 'والیبال - ۵ نفر', 'بسکتبال - ۴ نفر'],
      explanation: 'بلندترین ستون مربوط به فوتبال با ارتفاع ۸ واحد است.'
    },
    {
      title: 'نمودار تعداد گل‌های فروخته شده در گل‌فروشی',
      maxVal: 16,
      bars: [
        { name: 'رز', count: 12, color: 'bg-rose-500 border-rose-600', textColor: 'text-rose-200' },
        { name: 'مریم', count: 9, color: 'bg-emerald-500 border-emerald-600', textColor: 'text-emerald-200' },
        { name: 'لاله', count: 15, color: 'bg-purple-500 border-purple-600', textColor: 'text-purple-200' }
      ],
      question: 'تعداد کل گل‌های لاله چند تا از گل‌های مریم بیشتر است؟',
      correct: '۶ تا',
      options: ['۳ تا', '۶ تا', '۵ تا', '۹ تا'],
      explanation: 'لاله ۱۵ تا و مریم ۹ تا است: ۱۵ - ۹ = ۶ تا بیشتر.'
    },
    {
      title: 'نمودار میوه‌های چیده شده از باغ',
      maxVal: 15,
      bars: [
        { name: 'سیب', count: 10, color: 'bg-red-500 border-red-600', textColor: 'text-red-200' },
        { name: 'پرتقال', count: 14, color: 'bg-orange-500 border-orange-600', textColor: 'text-orange-200' },
        { name: 'موز', count: 6, color: 'bg-amber-400 border-amber-500', textColor: 'text-amber-200' },
        { name: 'انار', count: 12, color: 'bg-pink-600 border-pink-700', textColor: 'text-pink-200' }
      ],
      question: 'کدام میوه کمترین تعداد چیده شده را دارد؟',
      correct: 'موز - ۶ تا',
      options: ['سیب - ۱۰ تا', 'پرتقال - ۱۴ تا', 'موز - ۶ تا', 'انار - ۱۲ تا'],
      explanation: 'کوتاه‌ترین ستون مربوط به موز با ۶ عدد است.'
    }
  ];

  // 3. Probability Spinner Questions (چرخنده شانس و احتمال)
  const probabilityQuestions = [
    {
      title: 'چرخنده شانس دو رنگ',
      slices: [
        { color: 'قرمز', count: 5, hex: '#ef4444', bg: 'bg-red-500' },
        { color: 'آبی', count: 1, hex: '#3b82f6', bg: 'bg-blue-500' }
      ],
      question: 'اگر چرخنده شانس را بچرخانیم، شانس ایستادن روی کدام رنگ "بیشتر" است؟',
      correct: 'قرمز',
      options: ['قرمز', 'آبی', 'هر دو برابرند', 'غیرممکن است'],
      explanation: 'چون بخش قرمز ۵ قسمت از ۶ قسمت را تشکیل داده، شانس ایستادن روی قرمز بسیار بیشتر است.'
    },
    {
      title: 'چرخنده شانس ۴ تکه',
      slices: [
        { color: 'سبز', count: 2, hex: '#10b981', bg: 'bg-emerald-500' },
        { color: 'زرد', count: 2, hex: '#f59e0b', bg: 'bg-amber-500' }
      ],
      question: 'احتمال ایستادن چرخنده روی رنگ‌های سبز و زرد چگونه است؟',
      correct: 'برابر است',
      options: ['سبز بیشتر است', 'زرد بیشتر است', 'برابر است', 'غیرممکن است'],
      explanation: 'چون ۲ بخش سبز و ۲ بخش زرد وجود دارد (تعداد برابر)، احتمال ایستادن روی هر دو یکسان است.'
    },
    {
      title: 'چرخنده تک رنگ',
      slices: [
        { color: 'سبز', count: 4, hex: '#10b981', bg: 'bg-emerald-500' }
      ],
      question: 'احتمال ایستادن چرخنده روی رنگ "بنفش" چگونه است؟',
      correct: 'غیرممکن',
      options: ['حتماً', 'احتمال زیاد', 'غیرممکن', 'ممکن'],
      explanation: 'چون هیچ بخش بنفشی روی چرخنده وجود ندارد، ایستادن روی بنفش کاملاً غیرممکن است!'
    }
  ];

  const [tallyIdx, setTallyIdx] = useState(0);
  const [chartIdx, setChartIdx] = useState(0);
  const [probIdx, setProbIdx] = useState(0);

  const currentTally = tallyQuestions[tallyIdx];
  const currentChart = barChartQuestions[chartIdx];
  const currentProb = probabilityQuestions[probIdx];

  const handleAnswer = (ans: number | string) => {
    if (feedback !== null) return;
    setSelectedAns(ans);

    let isCorrect = false;
    if (mode === 'tally') isCorrect = Number(ans) === currentTally.correct;
    else if (mode === 'barchart') isCorrect = String(ans) === currentChart.correct;
    else isCorrect = String(ans) === currentProb.correct;

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
        if (mode === 'tally') setTallyIdx(prev => (prev + 1) % tallyQuestions.length);
        else if (mode === 'barchart') setChartIdx(prev => (prev + 1) % barChartQuestions.length);
        else setProbIdx(prev => (prev + 1) % probabilityQuestions.length);
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
            <span>آمار و احتمال (فصل ۷) 📊🎲</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500">چوب‌خط، رسم و خواندن نمودار ستونی و چرخنده احتمال</p>
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
            setMode('tally');
            setFeedback(null);
            setSelectedAns(null);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[38px] ${
            mode === 'tally'
              ? 'bg-purple-600 text-white border-2 border-purple-700 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ۱. شمارش با چوب‌خط 🧮
        </button>

        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setMode('barchart');
            setFeedback(null);
            setSelectedAns(null);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[38px] ${
            mode === 'barchart'
              ? 'bg-indigo-600 text-white border-2 border-indigo-700 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ۲. نمودار ستونی 📊
        </button>

        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setMode('probability');
            setFeedback(null);
            setSelectedAns(null);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[38px] ${
            mode === 'probability'
              ? 'bg-amber-600 text-white border-2 border-amber-700 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ۳. چرخنده شانس و احتمال 🎲
        </button>
      </div>

      {/* MODE 1: Tally */}
      {mode === 'tally' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white text-center shadow-md space-y-4">
            <h4 className="text-sm sm:text-base font-bold text-amber-200">{currentTally.title}</h4>

            {/* Tally Visual Display */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 max-w-sm mx-auto border border-white/30 space-y-2">
              <div className="text-3xl sm:text-5xl font-black tracking-widest text-yellow-300">
                {currentTally.tallyVisual}
              </div>
              <div className="text-xs text-purple-200 font-medium">{currentTally.tallyText}</div>
            </div>

            <p className="text-xs sm:text-sm font-bold text-white bg-black/20 p-2 rounded-xl border border-white/20">
              {currentTally.question}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {currentTally.options.map((opt, idx) => {
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
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-center text-xs sm:text-sm font-bold text-emerald-800 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>آفرین! تعداد چوب‌خط‌ها درست محاسبه شد.</span>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Bar Chart */}
      {mode === 'barchart' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-tr from-indigo-700 via-blue-700 to-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white text-center shadow-lg space-y-4">
            <h4 className="text-sm sm:text-base font-black text-amber-300">{currentChart.title}</h4>

            {/* Visual Bar Chart Box */}
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-3 sm:p-5 max-w-lg mx-auto border border-white/20 shadow-inner space-y-2">
              
              {/* Y-Axis Grid + Bars Area */}
              <div className="relative h-48 sm:h-56 flex items-end justify-between px-2 sm:px-6 pt-6 pb-2 border-b-2 border-white/40">
                {/* Horizontal Grid lines */}
                <div className="absolute inset-x-0 top-0 border-b border-white/10 text-[10px] text-slate-400 text-left pl-1">
                  {currentChart.maxVal.toLocaleString('fa-IR')}
                </div>
                <div className="absolute inset-x-0 top-1/4 border-b border-white/10 text-[10px] text-slate-400 text-left pl-1">
                  {Math.round(currentChart.maxVal * 0.75).toLocaleString('fa-IR')}
                </div>
                <div className="absolute inset-x-0 top-2/4 border-b border-white/10 text-[10px] text-slate-400 text-left pl-1">
                  {Math.round(currentChart.maxVal * 0.5).toLocaleString('fa-IR')}
                </div>
                <div className="absolute inset-x-0 top-3/4 border-b border-white/10 text-[10px] text-slate-400 text-left pl-1">
                  {Math.round(currentChart.maxVal * 0.25).toLocaleString('fa-IR')}
                </div>

                {/* Bars */}
                {currentChart.bars.map((bar, idx) => {
                  const heightPercent = Math.min(100, Math.max(8, (bar.count / currentChart.maxVal) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center h-full justify-end flex-1 max-w-[80px] px-1 relative z-10 group">
                      {/* Count Badge at top of bar */}
                      <span className="text-xs sm:text-sm font-black text-amber-300 bg-black/50 px-2 py-0.5 rounded-md border border-white/20 mb-1 shadow-sm">
                        {bar.count.toLocaleString('fa-IR')}
                      </span>
                      
                      {/* The Bar Element */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl border-t-2 border-x-2 transition-all duration-700 shadow-lg ${bar.color} group-hover:brightness-110`}
                      ></div>
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Labels */}
              <div className="flex justify-between px-2 sm:px-6 pt-1">
                {currentChart.bars.map((bar, idx) => (
                  <div key={idx} className="flex-1 max-w-[80px] text-center px-0.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-200 block truncate">
                      {bar.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs sm:text-sm font-bold text-white bg-black/30 p-2.5 rounded-xl border border-white/20 shadow-sm">
              {currentChart.question}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {currentChart.options.map((opt, idx) => {
              const isSelected = selectedAns === opt;
              let btnClass = 'bg-slate-50 hover:bg-indigo-100 text-slate-800 border-2 border-slate-200';
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
              <span>پاسخ صحیح است! {currentChart.explanation}</span>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: Probability Spinner */}
      {mode === 'probability' && (() => {
        const totalCount = currentProb.slices.reduce((acc, s) => acc + s.count, 0) || 1;
        let currentDeg = 0;
        const gradientStops = currentProb.slices.map(s => {
          const startDeg = currentDeg;
          const sliceDeg = (s.count / totalCount) * 360;
          currentDeg += sliceDeg;
          return `${s.hex} ${startDeg}deg ${currentDeg}deg`;
        }).join(', ');
        const conicBg = `conic-gradient(${gradientStops})`;

        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-tr from-amber-600 via-orange-600 to-rose-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white text-center shadow-lg space-y-4">
              <span className="text-xs sm:text-sm font-black bg-white/20 px-3 py-1 rounded-full border border-white/30">
                {currentProb.title}
              </span>

              {/* Spinner Graphic */}
              <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 max-w-sm mx-auto border border-white/20 space-y-3">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto">
                  {/* Pointer arrow at top */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 text-amber-300 font-black text-xl drop-shadow-md">
                    ▼
                  </div>

                  {/* The Wheel Circle */}
                  <div
                    style={{ background: conicBg }}
                    className="w-full h-full rounded-full border-4 border-amber-300 shadow-xl relative overflow-hidden flex items-center justify-center"
                  >
                    {/* Center Pin */}
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-700 shadow-md z-10 flex items-center justify-center font-bold text-slate-800 text-xs">
                      ★
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  {currentProb.slices.map((sp, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-xs font-bold text-white">
                      <span className={`w-3 h-3 rounded-full ${sp.bg}`}></span>
                      <span>{sp.color}: {sp.count.toLocaleString('fa-IR')} بخش</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm font-bold text-white bg-black/30 p-2.5 rounded-xl border border-white/20 shadow-sm">
                {currentProb.question}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {currentProb.options.map((opt, idx) => {
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
                    className={`py-3 sm:py-4 px-4 rounded-2xl font-black text-base sm:text-xl transition-all cursor-pointer shadow-xs min-h-[50px] ${btnClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {feedback === 'correct' && (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-center text-xs sm:text-sm font-bold text-emerald-800 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>درست پاسخ دادی! {currentProb.explanation}</span>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
