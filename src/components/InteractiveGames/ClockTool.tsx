import React, { useState } from 'react';
import { playSound } from '../../utils/sound';
import confetti from 'canvas-confetti';
import { Clock, CheckCircle2, RotateCcw } from 'lucide-react';

interface ClockToolProps {
  soundEnabled: boolean;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
}

export const ClockTool: React.FC<ClockToolProps> = ({
  soundEnabled,
  onAddStars,
  onIncrementSolved,
}) => {
  const [hours, setHours] = useState<number>(4);
  const [minutes, setMinutes] = useState<number>(30);
  const [targetHour, setTargetHour] = useState<number>(7);
  const [targetMin, setTargetMin] = useState<number>(15);
  const [message, setMessage] = useState<string | null>(null);

  const handleHourChange = (delta: number) => {
    playSound('click', soundEnabled);
    setHours(prev => {
      let next = prev + delta;
      if (next > 12) next = 1;
      if (next < 1) next = 12;
      return next;
    });
  };

  const handleMinuteChange = (delta: number) => {
    playSound('click', soundEnabled);
    setMinutes(prev => {
      let next = prev + delta;
      if (next >= 60) next = 0;
      if (next < 0) next = 55;
      return next;
    });
  };

  const handleCheckClock = () => {
    if (hours === targetHour && minutes === targetMin) {
      playSound('correct', soundEnabled);
      confetti({ particleCount: 40, spread: 50 });
      setMessage('آفرین! عقربه‌ها دقیقاً زمان هدف را نشان می‌دهند! ⭐⏰');
      onAddStars(1);
      onIncrementSolved();
      setTimeout(() => {
        const newH = Math.floor(Math.random() * 12) + 1;
        const newM = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
        setTargetHour(newH);
        setTargetMin(newM);
        setMessage(null);
      }, 1500);
    } else {
      playSound('wrong', soundEnabled);
      setMessage(`دقت کن! زمان هدف ${targetHour}:${targetMin === 0 ? '۰۰' : targetMin} است اما تو ${hours}:${minutes === 0 ? '۰۰' : minutes} ساختی.`);
    }
  };

  // Clock Hand angles
  const minuteAngle = minutes * 6; // 360 / 60
  const hourAngle = (hours % 12) * 30 + minutes * 0.5; // 360 / 12 + offset

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-md max-w-3xl mx-auto space-y-6 dir-rtl">
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
        <div>
          <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
            <span>ساعت و زمان‌خوانی ⏰</span>
          </h3>
          <p className="text-xs text-slate-500">پایه سوم ابتدایی - عقربه ساعت‌شمار و دقیقه‌شمار</p>
        </div>

        <div className="bg-amber-100 border border-amber-300 text-amber-900 font-bold px-4 py-2 rounded-2xl text-sm">
          ساعت هدف: <span className="text-xl font-black text-amber-600">{targetHour}:{targetMin === 0 ? '۰۰' : targetMin}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
        {/* Analog Clock Graphic */}
        <div className="relative w-56 h-56 rounded-full bg-slate-100 border-4 border-slate-800 shadow-lg flex items-center justify-center">
          {/* Clock Numbers 1 to 12 */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
            const angle = (num * 30 - 90) * (Math.PI / 180);
            const x = 50 + 38 * Math.cos(angle);
            const y = 50 + 38 * Math.sin(angle);
            return (
              <span
                key={num}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 font-black text-slate-700 text-base"
              >
                {num}
              </span>
            );
          })}

          {/* Hour Hand (Short, thick, Red) */}
          <div
            style={{ transform: `rotate(${hourAngle}deg)` }}
            className="absolute w-2 h-16 bg-rose-600 rounded-full origin-bottom bottom-1/2 left-[calc(50%-4px)] shadow-xs transition-transform duration-300"
          />

          {/* Minute Hand (Long, thin, Blue) */}
          <div
            style={{ transform: `rotate(${minuteAngle}deg)` }}
            className="absolute w-1.5 h-22 bg-sky-600 rounded-full origin-bottom bottom-1/2 left-[calc(50%-3px)] shadow-xs transition-transform duration-300"
          />

          {/* Center Pin */}
          <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-white z-10"></div>
        </div>

        {/* Digital Clock Display & Controls */}
        <div className="space-y-4 text-center">
          <div className="bg-slate-900 text-emerald-400 font-mono text-4xl font-black px-6 py-3 rounded-2xl border-4 border-slate-700 shadow-md">
            {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Hour controls */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2 space-y-1">
              <span className="text-xs font-bold text-rose-800 block">ساعت‌شمار</span>
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => handleHourChange(-1)}
                  className="px-3 py-1 bg-rose-200 hover:bg-rose-300 text-rose-900 font-black rounded-lg text-sm cursor-pointer"
                >
                  -
                </button>
                <button
                  onClick={() => handleHourChange(1)}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-lg text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Minute controls */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-2 space-y-1">
              <span className="text-xs font-bold text-sky-800 block">دقیقه‌شمار</span>
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => handleMinuteChange(-5)}
                  className="px-3 py-1 bg-sky-200 hover:bg-sky-300 text-sky-900 font-black rounded-lg text-sm cursor-pointer"
                >
                  -۵
                </button>
                <button
                  onClick={() => handleMinuteChange(5)}
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-lg text-sm cursor-pointer"
                >
                  +۵
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleCheckClock}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl border-b-4 border-emerald-700 text-base shadow-md cursor-pointer transition-all active:translate-y-1 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>تایید ساعت تنظیم شده</span>
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
