import React, { useEffect } from 'react';
import { Sparkles, Trophy, Star, Award, CheckCircle2, Heart, ArrowLeft, Volume2 } from 'lucide-react';
import { playSound } from '../utils/sound';

export interface CelebrationData {
  type: 'badge' | 'quiz_perfect' | 'level_up' | 'welcome_streak';
  title: string;
  subtitle: string;
  icon?: string;
  starsEarned?: number;
}

interface SuccessCelebrationModalProps {
  data: CelebrationData | null;
  onClose: () => void;
  soundEnabled: boolean;
}

export const SuccessCelebrationModal: React.FC<SuccessCelebrationModalProps> = ({
  data,
  onClose,
  soundEnabled,
}) => {
  useEffect(() => {
    if (data) {
      if (data.type === 'badge' || data.type === 'level_up') {
        playSound('fanfare', soundEnabled);
      } else {
        playSound('victory', soundEnabled);
      }
    }
  }, [data, soundEnabled]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in dir-rtl">
      {/* Confetti Particle Background Simulation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 text-4xl animate-bounce">🎉</div>
        <div className="absolute top-20 right-1/4 text-4xl animate-pulse">⭐</div>
        <div className="absolute bottom-20 left-10 text-4xl animate-bounce">✨</div>
        <div className="absolute top-1/3 right-10 text-4xl animate-pulse">🎈</div>
        <div className="absolute bottom-1/3 right-1/3 text-4xl animate-bounce">🌟</div>
      </div>

      <div className="bg-white w-full max-w-sm sm:max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 relative text-center transform animate-scale-up z-10 overflow-hidden">
        {/* Glowing aura background */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Big Animated Icon */}
        <div className="relative mb-5 inline-block">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-300 rounded-3xl border-4 border-white shadow-xl flex items-center justify-center text-5xl sm:text-6xl mx-auto transform hover:rotate-6 transition-transform">
            {data.icon || (data.type === 'badge' ? '🏅' : data.type === 'level_up' ? '👑' : '⭐')}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-2 rounded-full border-2 border-white shadow-md">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
        </div>

        {/* Titles */}
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
          {data.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed mb-6 px-2">
          {data.subtitle}
        </p>

        {/* Stars Earned Badge */}
        {data.starsEarned && data.starsEarned > 0 && (
          <div className="inline-flex items-center gap-2 bg-amber-100 border-2 border-amber-300 text-amber-900 px-4 py-2 rounded-2xl font-black text-sm mb-6 shadow-xs animate-pulse">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            <span>+{data.starsEarned} ستاره طلایی جدید!</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => {
            playSound('star', soundEnabled);
            onClose();
          }}
          className="w-full py-4 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-amber-950 font-black rounded-2xl shadow-[0_5px_0_0_#d97706] transition-all cursor-pointer flex items-center justify-center gap-2 text-base active:translate-y-1"
        >
          <span>عالی بود، ادامه بده! 🚀</span>
        </button>

        <div className="mt-4 flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400">
          <Volume2 className="w-3.5 h-3.5 text-amber-500" />
          <span>صدای تشویق پیروزی پخش شد</span>
        </div>
      </div>
    </div>
  );
};
