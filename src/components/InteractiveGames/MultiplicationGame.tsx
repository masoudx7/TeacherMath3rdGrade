import React, { useState, useEffect } from 'react';
import { playSound } from '../../utils/sound';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, RotateCcw, CheckCircle2, XCircle, Flame } from 'lucide-react';

interface MultiplicationGameProps {
  soundEnabled: boolean;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
}

export const MultiplicationGame: React.FC<MultiplicationGameProps> = ({
  soundEnabled,
  onAddStars,
  onIncrementSolved,
}) => {
  const [selectedTable, setSelectedTable] = useState<number>(6); // Table 1 to 10 or 0 for random
  const [numA, setNumA] = useState<number>(6);
  const [numB, setNumB] = useState<number>(7);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);

  const generateQuestion = (tableNum = selectedTable) => {
    const a = tableNum === 0 ? Math.floor(Math.random() * 9) + 2 : tableNum;
    const b = Math.floor(Math.random() * 9) + 2;
    const correctAns = a * b;

    // Generate 3 distractors close to correct answer
    const distractors = new Set<number>();
    distractors.add(correctAns);
    while (distractors.size < 4) {
      const offset = (Math.floor(Math.random() * 5) - 2) * (tableNum || 2);
      const val = correctAns + (offset === 0 ? 3 : offset);
      if (val > 0 && val !== correctAns) {
        distractors.add(val);
      } else {
        distractors.add(correctAns + distractors.size * 2);
      }
    }

    const shuffled = Array.from(distractors).sort(() => Math.random() - 0.5);
    setNumA(a);
    setNumB(b);
    setOptions(shuffled);
    setFeedback(null);
    setSelectedAns(null);
  };

  useEffect(() => {
    generateQuestion(selectedTable);
  }, [selectedTable]);

  const handleSelectAnswer = (ans: number) => {
    if (feedback !== null) return;
    setSelectedAns(ans);
    const correct = ans === numA * numB;

    if (correct) {
      setFeedback('correct');
      playSound('correct', soundEnabled);
      setScore(prev => prev + 10);
      setCombo(prev => prev + 1);
      onAddStars(1);
      onIncrementSolved();

      if ((combo + 1) % 5 === 0) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        playSound('badge', soundEnabled);
      }

      setTimeout(() => {
        generateQuestion();
      }, 1000);
    } else {
      setFeedback('wrong');
      playSound('wrong', soundEnabled);
      setCombo(0);
      setTimeout(() => {
        setFeedback(null);
        setSelectedAns(null);
      }, 1200);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md max-w-3xl mx-auto space-y-4 sm:space-y-6 dir-rtl">
      {/* Game Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b-2 border-slate-100 pb-3 sm:pb-4">
        <div>
          <h3 className="font-black text-slate-800 text-base sm:text-xl flex items-center gap-2">
            <span>مسابقه هوشمند جدول ضرب ✖️</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500">پایه سوم ابتدایی - تسلط بر ضرب ۱ تا ۱۰</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-1 rounded-xl text-xs sm:text-sm">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
            <span>امتیاز: {score}</span>
          </div>

          <div className="flex items-center gap-1 bg-orange-100 text-orange-900 border border-orange-300 font-bold px-2.5 py-1 rounded-xl text-xs sm:text-sm">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 fill-orange-500" />
            <span>کومبو: {combo}</span>
          </div>
        </div>
      </div>

      {/* Table Selection Tabs */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-600">انتخاب پایه ضرب:</label>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSelectedTable(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[36px] ${
              selectedTable === 0
                ? 'bg-amber-400 text-slate-900 border-2 border-amber-500 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            مخلوط (همه) 🎲
          </button>
          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => setSelectedTable(num)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                selectedTable === num
                  ? 'bg-purple-600 text-white border-2 border-purple-700 shadow-xs'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              ضرب {num}
            </button>
          ))}
        </div>
      </div>

      {/* Main Flashcard Display */}
      <div className="bg-gradient-to-tr from-purple-500 via-indigo-600 to-sky-500 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white text-center shadow-lg relative overflow-hidden space-y-4 sm:space-y-6">
        <div className="text-xs sm:text-sm font-bold opacity-90">حاصل ضرب زیر کدام است؟</div>

        <div className="flex items-center justify-center gap-2 sm:gap-4 text-3xl sm:text-6xl font-black tracking-wider">
          <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-white/30">{numA}</span>
          <span className="text-amber-300">×</span>
          <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-white/30">{numB}</span>
          <span className="text-amber-300">=</span>
          <span className="text-yellow-300 animate-pulse">؟</span>
        </div>

        {/* Visual Array representation for 3rd graders */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20 max-w-md mx-auto overflow-hidden">
          <div className="text-[11px] sm:text-xs font-bold mb-1.5 text-amber-200">نمایش تصویری ({numA} دسته {numB} تایی):</div>
          <div className="flex flex-wrap justify-center gap-1">
            {Array.from({ length: Math.min(numA, 10) }).map((_, groupIdx) => (
              <div key={groupIdx} className="bg-white/20 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-white/30 flex gap-0.5">
                {Array.from({ length: Math.min(numB, 10) }).map((_, dotIdx) => (
                  <span key={dotIdx} className="text-[10px] sm:text-xs">⭐</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {options.map((opt, idx) => {
          let btnStyle = 'bg-slate-50 hover:bg-amber-100 text-slate-800 border-2 border-slate-200 hover:border-amber-400';
          if (selectedAns === opt) {
            if (feedback === 'correct') {
              btnStyle = 'bg-emerald-500 text-white border-2 border-emerald-600 scale-105 shadow-md';
            } else if (feedback === 'wrong') {
              btnStyle = 'bg-rose-500 text-white border-2 border-rose-600 animate-shake';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectAnswer(opt)}
              disabled={feedback !== null}
              className={`py-3 sm:py-4 px-4 sm:px-6 rounded-2xl font-black text-xl sm:text-2xl transition-all cursor-pointer shadow-xs min-h-[52px] ${btnStyle}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};
