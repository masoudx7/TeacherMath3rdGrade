import React from 'react';
import { Award, Star, Trophy, CheckCircle, X, Shield, Sparkles } from 'lucide-react';
import { LeaderboardUser } from '../types';
import { CHAPTERS, BADGES } from '../data/curriculum';
import { playSound } from '../utils/sound';

interface PublicReportCardModalProps {
  user: LeaderboardUser | null;
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
}

const AVATARS: Record<string, string> = {
  fox: '🦊',
  bear: '🐻',
  owl: '🦉',
  rabbit: '🐰',
  lion: '🦁',
  panda: '🐼',
};

export const PublicReportCardModal: React.FC<PublicReportCardModalProps> = ({
  user,
  isOpen,
  onClose,
  soundEnabled,
}) => {
  if (!isOpen || !user) return null;

  const userAvatarEmoji = AVATARS[user.avatar] || '🦊';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in dir-rtl">
      <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-amber-300 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            playSound('click', soundEnabled);
            onClose();
          }}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Banner Header */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-2xl p-4 sm:p-6 text-white text-center relative overflow-hidden shadow-md mb-6">
          <div className="absolute top-2 right-2 text-amber-200 opacity-30">
            <Sparkles className="w-16 h-16" />
          </div>

          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl border-2 border-white/40 flex items-center justify-center text-4xl mx-auto mb-3 shadow-inner">
            {userAvatarEmoji}
          </div>

          <h2 className="text-2xl font-black">{user.name}</h2>
          <div className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-bold mt-2 border border-white/30">
            <Shield className="w-4 h-4 text-amber-200" />
            <span>سطح {user.level} • ریاضی پایه سوم دبستان</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-center">
            <Star className="w-6 h-6 text-amber-500 mx-auto mb-1 fill-amber-400" />
            <div className="text-xl font-black text-amber-900">{user.stars}</div>
            <div className="text-[11px] font-bold text-amber-700">کل ستاره‌ها</div>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3 text-center">
            <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <div className="text-xl font-black text-emerald-900">{user.solvedCount}</div>
            <div className="text-[11px] font-bold text-emerald-700">مسئله حل‌شده</div>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-3 text-center">
            <Trophy className="w-6 h-6 text-purple-500 mx-auto mb-1" />
            <div className="text-xl font-black text-purple-900">
              {user.rank ? `#${user.rank}` : '-'}
            </div>
            <div className="text-[11px] font-bold text-purple-700">رتبه جدول</div>
          </div>
        </div>

        {/* Chapter Progress List */}
        <div className="mb-6">
          <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>میزان تسلط بر فصل‌های کتاب ریاضی</span>
          </h3>

          <div className="space-y-2.5">
            {CHAPTERS.map((ch) => {
              const score = user.chapterMastery?.[ch.id] || 0;
              return (
                <div key={ch.id} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700">{ch.chapterNumber}. {ch.title}</span>
                    <span className="text-amber-600 font-mono">{score}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, Math.min(100, score))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges Earned */}
        <div>
          <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" />
            <span>نشان‌ها و مدال‌های کسب‌شده ({user.unlockedBadges?.length || 0})</span>
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {BADGES.map((badge) => {
              const isUnlocked = user.unlockedBadges?.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                    isUnlocked
                      ? 'bg-purple-50 border-purple-200 text-purple-900'
                      : 'bg-slate-50 border-slate-200 opacity-40 grayscale'
                  }`}
                >
                  <span className="text-2xl shrink-0">{badge.icon}</span>
                  <div>
                    <div className="text-xs font-bold">{badge.title}</div>
                    <div className="text-[10px] text-slate-500">{badge.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
