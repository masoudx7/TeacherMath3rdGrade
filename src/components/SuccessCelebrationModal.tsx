import React, { useEffect } from 'react';
import { Sparkles, Trophy, Star, Award, CheckCircle2, Heart, ArrowLeft } from 'lucide-react';
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
      {/* Subtle Celebration Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-75">
        <div className="absolute top-10 left-1/4 text-4xl">🎉</div>
        <div className="absolute top-20 right-1/4 text-4xl">⭐</div>
        <div className="absolute bottom-20 left-10 text-4xl">✨</div>
        <div className="absolute top-1/3 right-10 text-4xl">🎈</div>
        <div className="absolute bottom-1/3 right-1/3 text-4xl">🌟</div>
      </div>

      <div className="clay-card w-full max-w-sm sm:max-w-md p-6 sm:p-8 shadow-2xl relative text-center transform animate-scale-up z-10 overflow-hidden">
        {/* Glowing aura background */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-200/45 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />

        {/* Big Animated Icon */}
        <div className="relative mb-5 inline-block">
          <div className="w-24 h-24 sm:w-28 sm:h-28 clay-btn-warm rounded-[1.75rem] flex items-center justify-center text-5xl sm:text-6xl mx-auto">
            {data.icon || (data.type === 'badge' ? '🏅' : data.type === 'level_up' ? '👑' : '⭐')}
          </div>
        </div>

        {/* Titles */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26354D] mb-2">
          {data.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed mb-6 px-2">
          {data.subtitle}
        </p>

        {/* Stars Earned Badge */}
        {data.starsEarned && data.starsEarned > 0 && (
          <div className="inline-flex items-center gap-2 clay-inset text-amber-900 px-4 py-2 rounded-2xl font-bold text-sm mb-6">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            <span>+{data.starsEarned} ستاره طلایی جدید</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => {
            playSound('star', soundEnabled);
            onClose();
          }}
          className="w-full py-3.5 clay-btn-primary font-bold rounded-2xl cursor-pointer flex items-center justify-center gap-2 text-base"
        >
          <span>عالی بود، ادامه بده!</span>
        </button>
      </div>
    </div>
  );
};
