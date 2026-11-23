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
    <div className="w-full bg-gradient-to-br from-[#FDE68A] via-[#FCD34D] to-[#FDBA74] rounded-[1.75rem] p-4 sm:p-5 text-[#26354D] border border-amber-200/80 shadow-[0_14px_32px_-12px_rgba(217,119,6,0.28),inset_0_2px_0_rgba(255,255,255,0.65)] flex flex-col sm:flex-row items-center justify-between gap-4 dir-rtl">
      <div className="flex items-center gap-3.5 text-center sm:text-right">
        <div className="w-13 h-13 bg-white/85 rounded-2xl shadow-[0_8px_18px_-6px_rgba(120,82,40,0.25),inset_0_1px_0_#fff] flex items-center justify-center text-2xl shrink-0">
          🎁
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <h3 className="font-extrabold text-lg sm:text-xl text-[#26354D]">جایزه روزانه ورود به کلاس</h3>
            <span className="bg-white/85 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              رایگان
            </span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950/75 font-medium">
            {isClaimedToday 
              ? 'امروز جایزه‌ات رو گرفتی! فردا هم بیا و جایزه بگیر قهرمان!' 
              : 'جایزه ورود امروزت آماده‌ست! کلیک کن و ۲۵ ستاره طلایی جایزه بگیر!'}
          </p>
        </div>
      </div>

      <button
        onClick={handleClaim}
        disabled={isClaimedToday}
        className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shrink-0 ${
          isClaimedToday
            ? 'bg-white/45 text-amber-950/60 cursor-not-allowed border border-white/60'
            : 'clay-btn-primary cursor-pointer'
        }`}
      >
        {isClaimedToday ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span>دریافت شده امروز</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>دریافت ۲۵ ستاره جایزه</span>
          </>
        )}
      </button>
    </div>
  );
};
