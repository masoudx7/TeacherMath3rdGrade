import React, { useState } from 'react';
import { playSound } from '../../utils/sound';
import confetti from 'canvas-confetti';
import { PieChart, CheckCircle2, RotateCcw } from 'lucide-react';

interface FractionVisualizerProps {
  soundEnabled: boolean;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
}

export const FractionVisualizer: React.FC<FractionVisualizerProps> = ({
  soundEnabled,
  onAddStars,
  onIncrementSolved,
}) => {
  const [denominator, setDenominator] = useState<number>(4);
  const [numerator, setNumerator] = useState<number>(3);
  const [targetNum, setTargetNum] = useState<number>(2);
  const [targetDen, setTargetDen] = useState<number>(4);
  const [message, setMessage] = useState<string | null>(null);

  const handleSliceClick = (index: number) => {
    playSound('pop', soundEnabled);
    if (index < numerator) {
      setNumerator(prev => Math.max(0, prev - 1));
    } else {
      setNumerator(prev => Math.min(denominator, prev + 1));
    }
  };

  const handleCheckMatch = () => {
    if (numerator === targetNum && denominator === targetDen) {
      playSound('correct', soundEnabled);
      confetti({ particleCount: 40, spread: 50 });
      setMessage('آفرین! کسر ساخته شده دقیقا با کسر هدف برابر است! ⭐🎉');
      onAddStars(1);
      onIncrementSolved();
      // Generate new target
      setTimeout(() => {
        const newDen = [2, 3, 4, 6, 8][Math.floor(Math.random() * 5)];
        const newNum = Math.floor(Math.random() * (newDen - 1)) + 1;
        setTargetDen(newDen);
        setTargetNum(newNum);
        setDenominator(newDen);
        setNumerator(0);
        setMessage(null);
      }, 1500);
    } else {
      playSound('wrong', soundEnabled);
      setMessage(`دقت کن! کسر هدف ${targetNum}/${targetDen} است اما تو ${numerator}/${denominator} ساختی.`);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-md max-w-3xl mx-auto space-y-6 dir-rtl">
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
        <div>
          <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
            <span>آموزش تصویری کسرها 🍕</span>
          </h3>
          <p className="text-xs text-slate-500">پایه سوم ابتدایی - صورت (تعداد رنگ‌شده) و مخرج (کل قسمت‌ها)</p>
        </div>

        <div className="bg-amber-100 border border-amber-300 text-amber-900 font-bold px-4 py-2 rounded-2xl text-sm">
          کسر هدف: <span className="text-xl font-black text-amber-600">{targetNum} / {targetDen}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600">تعداد کل قسمت‌ها (مخرج کسر):</label>
          <div className="flex items-center gap-2">
            {[2, 3, 4, 6, 8].map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDenominator(d);
                  setNumerator(Math.min(numerator, d));
                  playSound('click', soundEnabled);
                }}
                className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  denominator === d
                    ? 'bg-emerald-500 text-white border-2 border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                {d} قسمتی
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600">تعداد قسمت‌های رنگ‌شده (صورت کسر):</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setNumerator(prev => Math.max(0, prev - 1));
                playSound('click', soundEnabled);
              }}
              className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-black rounded-xl border border-rose-300 cursor-pointer"
            >
              -
            </button>
            <span className="flex-1 text-center font-black text-xl text-slate-800 bg-white py-1.5 rounded-xl border border-slate-300">
              {numerator}
            </span>
            <button
              onClick={() => {
                setNumerator(prev => Math.min(denominator, prev + 1));
                playSound('click', soundEnabled);
              }}
              className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-black rounded-xl border border-emerald-300 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Visual Pizza / Pie Chart Representation */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-6">
        {/* SVG Pizza Graphic */}
        <div className="relative w-52 h-52">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {Array.from({ length: denominator }).map((_, idx) => {
              const startAngle = (idx * 360) / denominator;
              const endAngle = ((idx + 1) * 360) / denominator;
              const isFilled = idx < numerator;

              const x1 = 50 + 45 * Math.cos((Math.PI * startAngle) / 180);
              const y1 = 50 + 45 * Math.sin((Math.PI * startAngle) / 180);
              const x2 = 50 + 45 * Math.cos((Math.PI * endAngle) / 180);
              const y2 = 50 + 45 * Math.sin((Math.PI * endAngle) / 180);
              const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

              const pathData = `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

              return (
                <path
                  key={idx}
                  d={pathData}
                  fill={isFilled ? '#f59e0b' : '#f3f4f6'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  onClick={() => handleSliceClick(idx)}
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                />
              );
            })}
          </svg>
        </div>

        {/* Fraction Notation Display */}
        <div className="flex flex-col items-center justify-center bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 min-w-[180px]">
          <span className="text-xs font-bold text-slate-500 mb-2">نمایش ریاضی کسر شما:</span>
          <div className="flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-amber-700">{numerator}</span>
            <div className="w-16 h-1.5 bg-amber-600 rounded-full my-1"></div>
            <span className="text-4xl font-black text-amber-900">{denominator}</span>
          </div>
          <span className="text-xs font-bold text-amber-800 mt-3">
            ({numerator} از {denominator} قسمت)
          </span>
        </div>
      </div>

      {/* Check Match Button & Feedback */}
      <div className="space-y-3">
        <button
          onClick={handleCheckMatch}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl border-b-4 border-emerald-700 text-base shadow-md cursor-pointer transition-all active:translate-y-1 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>بررسی کسر ساخته‌شده با کسر هدف</span>
        </button>

        {message && (
          <div className="bg-amber-100 border-2 border-amber-300 text-amber-900 p-3 rounded-2xl text-center font-bold text-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};
