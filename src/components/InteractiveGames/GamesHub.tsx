import React, { useState } from 'react';
import { MultiplicationGame } from './MultiplicationGame';
import { FractionVisualizer } from './FractionVisualizer';
import { PlaceValueBuilder } from './PlaceValueBuilder';
import { ClockTool } from './ClockTool';
import { AreaPerimeterGrid } from './AreaPerimeterGrid';
import { AIQuizGenerator } from './AIQuizGenerator';
import { ChapterId } from '../../types';
import { playSound } from '../../utils/sound';
import { Grid, PieChart, Calculator, Clock, Square, Sparkles } from 'lucide-react';

interface GamesHubProps {
  soundEnabled: boolean;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
  onRecordHistory: (chapterId: ChapterId, score: number, total: number) => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({
  soundEnabled,
  onAddStars,
  onIncrementSolved,
  onRecordHistory,
}) => {
  const [activeGame, setActiveGame] = useState<'multiplication' | 'fraction' | 'place_value' | 'clock' | 'perimeter' | 'ai_quiz'>('multiplication');

  const games = [
    { id: 'multiplication', title: 'جدول ضرب', icon: Grid, color: 'from-purple-500 to-indigo-600', desc: 'مسابقه سریع ضرب ۱ تا ۱۰' },
    { id: 'fraction', title: 'کسرهای پیتزایی', icon: PieChart, color: 'from-emerald-500 to-teal-600', desc: 'ساخت و مقایسه تصویری کسرها' },
    { id: 'place_value', title: 'ارزش مکانی', icon: Calculator, color: 'from-blue-500 to-cyan-600', desc: 'اعداد ۴ رقمی و تومان/ریال' },
    { id: 'clock', title: 'ساعت‌خوانی', icon: Clock, color: 'from-rose-500 to-pink-600', desc: 'عقربه‌های ساعت و دقیقه' },
    { id: 'perimeter', title: 'محیط و مساحت', icon: Square, color: 'from-amber-500 to-orange-600', desc: 'شبکه مربعی دور تا دور و سطح' },
    { id: 'ai_quiz', title: 'آزمون هوشمند AI', icon: Sparkles, color: 'from-amber-400 to-yellow-500 text-slate-900', desc: 'تولید سوال با معلم AI' },
  ];

  const handleGameSelect = (gameId: any) => {
    playSound('click', soundEnabled);
    setActiveGame(gameId);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 dir-rtl">
      {/* Game Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {games.map((game) => {
          const Icon = game.icon;
          const isActive = activeGame === game.id;
          return (
            <button
              key={game.id}
              onClick={() => handleGameSelect(game.id)}
              className={`p-4 rounded-[2rem] transition-all cursor-pointer text-right flex flex-col justify-between space-y-3 ${
                isActive
                  ? 'bg-[#6C5CE7] text-white border-4 border-[#4834D4] shadow-[0_4px_0_0_#4834D4] scale-102'
                  : 'bg-white hover:bg-[#FFF9E5] text-[#2D3436] border-4 border-slate-200/80 hover:border-[#A29BFE] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-2xl bg-gradient-to-tr ${game.color} flex items-center justify-center text-white shadow-xs`}>
                  <Icon className="w-4 h-4" />
                </div>
                {isActive && <span className="w-2.5 h-2.5 rounded-full bg-[#FFEAA7] border border-[#FDCB6E]"></span>}
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base leading-snug">{game.title}</h4>
                <p className={`text-[11px] font-medium truncate mt-0.5 ${isActive ? 'text-purple-100' : 'text-slate-400'}`}>{game.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Render Selected Active Game */}
      <div className="animate-fadeIn">
        {activeGame === 'multiplication' && (
          <MultiplicationGame
            soundEnabled={soundEnabled}
            onAddStars={onAddStars}
            onIncrementSolved={onIncrementSolved}
          />
        )}
        {activeGame === 'fraction' && (
          <FractionVisualizer
            soundEnabled={soundEnabled}
            onAddStars={onAddStars}
            onIncrementSolved={onIncrementSolved}
          />
        )}
        {activeGame === 'place_value' && (
          <PlaceValueBuilder
            soundEnabled={soundEnabled}
            onAddStars={onAddStars}
            onIncrementSolved={onIncrementSolved}
          />
        )}
        {activeGame === 'clock' && (
          <ClockTool
            soundEnabled={soundEnabled}
            onAddStars={onAddStars}
            onIncrementSolved={onIncrementSolved}
          />
        )}
        {activeGame === 'perimeter' && (
          <AreaPerimeterGrid
            soundEnabled={soundEnabled}
            onAddStars={onAddStars}
            onIncrementSolved={onIncrementSolved}
          />
        )}
        {activeGame === 'ai_quiz' && (
          <AIQuizGenerator
            soundEnabled={soundEnabled}
            onAddStars={onAddStars}
            onIncrementSolved={onIncrementSolved}
            onRecordHistory={onRecordHistory}
          />
        )}
      </div>
    </div>
  );
};
