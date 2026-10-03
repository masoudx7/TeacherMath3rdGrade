import React from 'react';
import { Gift, Sparkles, Star, CheckCircle2 } from 'lucide-react';
import { playSound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface DailyRewardWidgetProps {
  lastClaimDate?: string;
  onClaimReward: (rewardStars: number) => void;
  soundEnabled: boolean;
}

export const DailyRewardWidget: React.FC<DailyRewardWidgetProps> = ({
  lastClaimDate,
  onClaimReward,
  soundEnabled,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const isClaimedToday = lastClaimDate === todayStr;

  const handleClaim = () => {
    if (isClaimedToday) return;
    playSound('victory', soundEnabled);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
    onClaimReward(25); // 25 stars daily reward
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-4 sm:p-5 text-white shadow-lg border-4 border-white flex flex-col sm:flex-row items-center justify-between gap-4 dir-rtl">
      <div className="flex items-center gap-3.5 text-center sm:text-right">
        <div className="w-14 h-14 bg-white/20 rounded-2xl border-2 border-white/60 flex items-center justify-center text-3xl shrink-0 animate-bounce">
          🎁
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <h3 className="font-black text-lg sm:text-xl text-white">جایزه روزانه ورود به کلاس</h3>
            <span className="bg-white text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
              رایگان 🌟
            </span>
          </div>
          <p className="text-xs sm:text-sm text-amber-50 font-medium">
            {isClaimedToday 
              ? 'امروز جایزه‌ات رو گرفتی! فردا هم بیا و جایزه بگیر قهرمان! 🚀' 
              : 'جایزه ورود امروزت آماده‌ست! کلیک کن و ۲۵ ستاره طلایی جایزه بگیر! ✨'}
          </p>
        </div>
      </div>

      <button
        onClick={handleClaim}
        disabled={isClaimedToday}
        className={`px-6 py-3.5 rounded-2xl font-black text-sm transition-all shadow-md flex items-center gap-2 shrink-0 ${
          isClaimedToday
            ? 'bg-white/30 text-white/80 cursor-not-allowed border-2 border-white/20'
            : 'bg-white text-amber-900 hover:bg-amber-50 active:scale-95 cursor-pointer border-2 border-white animate-pulse'
        }`}
      >
        {isClaimedToday ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>دریافت شده امروز ✅</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-amber-600 animate-spin" />
            <span>دریافت ۲۵ ستاره جایزه 🎁</span>
          </>
        )}
      </button>
    </div>
  );
};
