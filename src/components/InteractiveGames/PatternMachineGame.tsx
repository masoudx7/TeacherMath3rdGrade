import React, { useState } from 'react';
import { playSound } from '../../utils/sound';
import { ArrowLeft, Sparkles, Trophy, Flame, RefreshCw, CheckCircle2, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PatternMachineGameProps {
  soundEnabled: boolean;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
}

type Mode = 'pattern_finder' | 'input_output_machine' | 'geometric_pattern';

export const PatternMachineGame: React.FC<PatternMachineGameProps> = ({
  soundEnabled,
  onAddStars,
  onIncrementSolved,
}) => {
  const [mode, setMode] = useState<Mode>('pattern_finder');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // 1. Pattern Finder Questions Data
  const patternQuestions = [
    {
      sequence: ['۳', '۶', '۹', '❓', '۱۵', '۱۸'],
      options: ['۱۰', '۱۲', '۱۱', '۱۴'],
      correct: '۱۲',
      stepText: 'هر بار ۳ تا اضافه می‌شود (شمارش ۳تا ۳تا)',
      rule: '+۳'
    },
    {
      sequence: ['۵', '۱۰', '۱۵', '۲۰', '❓', '۳۰'],
      options: ['۲۲', '۲۵', '۲۴', '۲۶'],
      correct: '۲۵',
      stepText: 'هر بار ۵ تا اضافه می‌شود (شمارش ۵تا ۵تا)',
      rule: '+۵'
    },
    {
      sequence: ['۴', '۸', '۱۲', '۱۶', '❓', '۲۴'],
      options: ['۱۸', '۲۰', '۱۹', '۲۲'],
      correct: '۲۰',
      stepText: 'هر بار ۴ تا اضافه می‌شود (شمارش ۴تا ۴تا)',
      rule: '+۴'
    },
    {
      sequence: ['۱۰۰', '۲۰۰', '۳۰۰', '❓', '۵۰۰'],
      options: ['۳۵۰', '۴۰۰', '۴۵۰', '۶۰۰'],
      correct: '۴۰۰',
      stepText: 'هر بار ۱۰۰ تا اضافه می‌شود (شمارش ۱۰۰تا ۱۰۰تا)',
      rule: '+۱۰۰'
    },
    {
      sequence: ['۵۰', '۴۵', '۴۰', '❓', '۳۰'],
      options: ['۳۵', '۳۸', '۳۶', '۳۲'],
      correct: '۳۵',
      stepText: 'الگوی کاهشی: هر بار ۵ تا کم می‌شود (-۵)',
      rule: '-۵'
    },
    {
      sequence: ['۲', '۴', '۸', '❓', '۳۲'],
      options: ['۱۰', '۱۲', '۱۶', '۱۴'],
      correct: '۱۶',
      stepText: 'الگوی دوبرابر شدن: هر عدد ضرب در ۲ می‌شود',
      rule: '×۲'
    }
  ];

  // 2. Input/Output Machine Questions
  const machineQuestions = [
    {
      input: 7,
      ruleName: 'افزودن ۴ (➕ ۴)',
      operation: (n: number) => n + 4,
      correctOutput: 11,
      options: [10, 11, 12, 14],
      hint: 'عدد ۷ وارد ماشین می‌شود و ۴ واحد به آن اضافه می‌شود.'
    },
    {
      input: 5,
      ruleName: 'ضرب در ۳ (✖️ ۳)',
      operation: (n: number) => n * 3,
      correctOutput: 15,
      options: [12, 15, 18, 10],
      hint: 'عدد ۵ وارد ماشین می‌شود و ۳ برابر می‌شود.'
    },
    {
      input: 20,
      ruleName: 'کاهش ۶ (➖ ۶)',
      operation: (n: number) => n - 6,
      correctOutput: 14,
      options: [12, 13, 14, 16],
      hint: 'از ۲ cut یا از عدد ۲۰ مقدار ۶ واحد کم کن.'
    },
    {
      input: 8,
      ruleName: 'ضرب در ۲ و اضافه کردن ۱ (✖️۲ + ۱)',
      operation: (n: number) => n * 2 + 1,
      correctOutput: 17,
      options: [15, 16, 17, 18],
      hint: 'اول ۸ ضرب در ۲ می‌شود (۱۶)، بعد ۱ واحد به آن اضافه می‌شود (۱۷).'
    }
  ];

  // 3. Geometric Patterns
  const geoQuestions = [
    {
      title: 'الگوی مربع‌های شطرنجی',
      steps: [
        { label: 'شکل ۱', count: 2, icon: '🟩' },
        { label: 'شکل ۲', count: 4, icon: '🟩' },
        { label: 'شکل ۳', count: 6, icon: '🟩' },
      ],
      questionText: 'در شکل ۴ چند مربع وجود دارد؟',
      correct: 8,
      options: [7, 8, 9, 10],
      explanation: 'هر شکل ۲ مربع بیشتر از شکل قبلی دارد (الگوی ۲، ۴، ۶، ۸...)'
    },
    {
      title: 'الگوی مثلث‌های رنگی',
      steps: [
        { label: 'شکل ۱', count: 1, icon: '🔺' },
        { label: 'شکل ۲', count: 3, icon: '🔺' },
        { label: 'شکل ۳', count: 5, icon: '🔺' },
      ],
      questionText: 'در شکل ۴ چند مثلث وجود دارد؟',
      correct: 7,
      options: [6, 7, 8, 9],
      explanation: 'تعداد مثلث‌ها فرد است و هر بار ۲ تا زیاد می‌شود (۱، ۳، ۵، ۷...)'
    }
  ];

  const [patternIdx, setPatternIdx] = useState(0);
  const [machineIdx, setMachineIdx] = useState(0);
  const [geoIdx, setGeoIdx] = useState(0);

  const currentPattern = patternQuestions[patternIdx];
  const currentMachine = machineQuestions[machineIdx];
  const currentGeo = geoQuestions[geoIdx];

  const handleSelectAnswer = (ans: number | string) => {
    if (feedback !== null) return;
    setSelectedAns(ans);

    let isCorrect = false;
    if (mode === 'pattern_finder') {
      isCorrect = String(ans) === currentPattern.correct;
    } else if (mode === 'input_output_machine') {
      isCorrect = Number(ans) === currentMachine.correctOutput;
    } else if (mode === 'geometric_pattern') {
      isCorrect = Number(ans) === currentGeo.correct;
    }

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
        if (mode === 'pattern_finder') {
          setPatternIdx((prev) => (prev + 1) % patternQuestions.length);
        } else if (mode === 'input_output_machine') {
          setMachineIdx((prev) => (prev + 1) % machineQuestions.length);
        } else {
          setGeoIdx((prev) => (prev + 1) % geoQuestions.length);
        }
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
            <span>الگوها و ماشین ورودی-خروجی (فصل ۱) ⚙️</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500">یادگیری الگوهای عددی، شمارش چندتا چندتا و ماشین ریاضی</p>
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

      {/* Mode Select Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setMode('pattern_finder');
            setFeedback(null);
            setSelectedAns(null);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[38px] ${
            mode === 'pattern_finder'
              ? 'bg-[#FF6B6B] text-white border-2 border-[#EE5253] shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ۱. الگوهای عددی 🔢
        </button>

        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setMode('input_output_machine');
            setFeedback(null);
            setSelectedAns(null);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[38px] ${
            mode === 'input_output_machine'
              ? 'bg-[#6C5CE7] text-white border-2 border-[#5b4cc4] shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ۲. ماشین ورودی - خروجی ⚙️
        </button>

        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setMode('geometric_pattern');
            setFeedback(null);
            setSelectedAns(null);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[38px] ${
            mode === 'geometric_pattern'
              ? 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ۳. الگوهای هندسی 📐
        </button>
      </div>

      {/* MODE 1: Pattern Finder */}
      {mode === 'pattern_finder' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white text-center shadow-md space-y-4">
            <span className="text-xs sm:text-sm font-bold bg-white/20 px-3 py-1 rounded-full border border-white/30">
              عدد مجهول (❓) در این الگوی عددی چند است؟
            </span>

            {/* Sequence Display */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2">
              {currentPattern.sequence.map((num, idx) => {
                const isQuestion = num === '❓';
                return (
                  <div
                    key={idx}
                    className={`w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center font-black text-base sm:text-2xl shadow-xs transition-transform ${
                      isQuestion
                        ? 'bg-yellow-300 text-slate-900 border-yellow-400 scale-110 animate-pulse'
                        : 'bg-white/20 text-white border-white/40 backdrop-blur-xs'
                    }`}
                  >
                    {num}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-amber-100 font-medium">به فاصله بین عددها دقت کن تا قانون الگو رو پیدا کنی!</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {currentPattern.options.map((opt, idx) => {
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
                  onClick={() => handleSelectAnswer(opt)}
                  disabled={feedback !== null}
                  className={`py-3 sm:py-4 px-4 rounded-2xl font-black text-lg sm:text-2xl transition-all cursor-pointer shadow-xs min-h-[50px] ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {feedback === 'correct' && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-center text-xs sm:text-sm font-bold text-emerald-800 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>آفرین! {currentPattern.stepText} (قانون: {currentPattern.rule})</span>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Input Output Machine */}
      {mode === 'input_output_machine' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-md space-y-4 text-center">
            <span className="text-xs sm:text-sm font-bold bg-white/20 px-3 py-1 rounded-full border border-white/30">
              ماشین ریاضی پایه سوم
            </span>

            {/* Visual Machine Graphic */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 py-2">
              {/* Input */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] sm:text-xs font-bold text-indigo-200 mb-1">ورودی</span>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-400 border-2 border-amber-300 text-slate-900 font-black text-xl sm:text-3xl flex items-center justify-center shadow-md">
                  {currentMachine.input}
                </div>
              </div>

              <div className="text-amber-300 text-lg sm:text-2xl font-bold animate-pulse">➡️</div>

              {/* Machine Body */}
              <div className="bg-white/20 backdrop-blur-md border-4 border-white/40 p-3 sm:p-5 rounded-3xl space-y-1 max-w-[200px] shadow-lg">
                <div className="text-2xl sm:text-3xl">⚙️🤖⚙️</div>
                <div className="text-xs sm:text-sm font-black text-amber-300">{currentMachine.ruleName}</div>
              </div>

              <div className="text-amber-300 text-lg sm:text-2xl font-bold animate-pulse">➡️</div>

              {/* Output */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] sm:text-xs font-bold text-pink-200 mb-1">خروجی</span>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-pink-400 border-2 border-pink-300 text-white font-black text-xl sm:text-3xl flex items-center justify-center shadow-md animate-bounce">
                  ❓
                </div>
              </div>
            </div>

            <p className="text-xs text-purple-100 font-medium">{currentMachine.hint}</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {currentMachine.options.map((opt, idx) => {
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
                  onClick={() => handleSelectAnswer(opt)}
                  disabled={feedback !== null}
                  className={`py-3 sm:py-4 px-4 rounded-2xl font-black text-lg sm:text-2xl transition-all cursor-pointer shadow-xs min-h-[50px] ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {feedback === 'correct' && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-center text-xs sm:text-sm font-bold text-emerald-800 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>پاسخ صحیح است! خروجی ماشین عدد {currentMachine.correctOutput} است.</span>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: Geometric Pattern */}
      {mode === 'geometric_pattern' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-tr from-teal-600 via-emerald-600 to-emerald-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-md space-y-4 text-center">
            <h4 className="text-sm sm:text-base font-bold text-amber-200">{currentGeo.title}</h4>

            {/* Pattern Display */}
            <div className="grid grid-cols-3 gap-2 py-2">
              {currentGeo.steps.map((st, idx) => (
                <div key={idx} className="bg-white/15 border border-white/30 rounded-2xl p-2 sm:p-3 space-y-2">
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-100 block">{st.label} ({st.count} تا)</span>
                  <div className="flex flex-wrap justify-center gap-1 min-h-[40px] items-center">
                    {Array.from({ length: st.count }).map((_, i) => (
                      <span key={i} className="text-base sm:text-xl">{st.icon}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs sm:text-sm font-black text-amber-300 bg-black/20 p-2 rounded-xl border border-white/20">
              {currentGeo.questionText}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {currentGeo.options.map((opt, idx) => {
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
                  onClick={() => handleSelectAnswer(opt)}
                  disabled={feedback !== null}
                  className={`py-3 sm:py-4 px-4 rounded-2xl font-black text-lg sm:text-2xl transition-all cursor-pointer shadow-xs min-h-[50px] ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {feedback === 'correct' && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-center text-xs sm:text-sm font-bold text-emerald-800 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>عالی بود! {currentGeo.explanation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
