import React, { useState, useEffect } from 'react';
import { MultiplicationGame } from './MultiplicationGame';
import { FractionVisualizer } from './FractionVisualizer';
import { PlaceValueBuilder } from './PlaceValueBuilder';
import { ClockTool } from './ClockTool';
import { AreaPerimeterGrid } from './AreaPerimeterGrid';
import { PatternMachineGame } from './PatternMachineGame';
import { RegroupingGame } from './RegroupingGame';
import { StatisticsGame } from './StatisticsGame';
import { AdvancedMultiplicationGame } from './AdvancedMultiplicationGame';
import { AIQuizGenerator } from './AIQuizGenerator';
import { ChapterId } from '../../types';
import { playSound } from '../../utils/sound';
import { Grid, PieChart, Calculator, Clock, Square, Sparkles, Shapes, PlusCircle, BarChart3, Zap, Crown, Lock } from 'lucide-react';

interface GamesHubProps {
  soundEnabled: boolean;
  targetChapterId?: ChapterId;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
  onRecordHistory: (chapterId: ChapterId, score: number, total: number) => void;
  isVip?: boolean;
  onOpenSubscription?: () => void;
}

type ActiveGame = 
  | 'pattern' 
  | 'place_value' 
  | 'fraction' 
  | 'multiplication' 
  | 'perimeter' 
  | 'regrouping' 
  | 'statistics' 
  | 'advanced_multiplication' 
  | 'clock' 
  | 'ai_quiz';

export const GamesHub: React.FC<GamesHubProps> = ({
  soundEnabled,
  targetChapterId,
  onAddStars,
  onIncrementSolved,
  onRecordHistory,
  isVip = false,
  onOpenSubscription,
}) => {
  const [activeGame, setActiveGame] = useState<ActiveGame>(() => {
    if (targetChapterId === 'patterns') return 'pattern';
    if (targetChapterId === 'place_value') return 'place_value';
    if (targetChapterId === 'fractions') return 'fraction';
    if (targetChapterId === 'multiplication_division') return 'multiplication';
    if (targetChapterId === 'perimeter_area') return 'perimeter';
    if (targetChapterId === 'regrouping') return 'regrouping';
    if (targetChapterId === 'statistics') return 'statistics';
    if (targetChapterId === 'advanced_multiplication') return 'advanced_multiplication';
    if (targetChapterId) return 'ai_quiz';
    return 'pattern';
  });

  useEffect(() => {
    if (targetChapterId === 'patterns') setActiveGame('pattern');
    else if (targetChapterId === 'place_value') setActiveGame('place_value');
    else if (targetChapterId === 'fractions') setActiveGame('fraction');
    else if (targetChapterId === 'multiplication_division') setActiveGame('multiplication');
    else if (targetChapterId === 'perimeter_area') setActiveGame('perimeter');
    else if (targetChapterId === 'regrouping') setActiveGame('regrouping');
    else if (targetChapterId === 'statistics') setActiveGame('statistics');
    else if (targetChapterId === 'advanced_multiplication') setActiveGame('advanced_multiplication');
    else if (targetChapterId) setActiveGame('ai_quiz');
  }, [targetChapterId]);

  const games = [
    { id: 'pattern', title: 'فصل ۱ (الگو)', icon: Shapes, color: 'from-amber-400 to-orange-500', desc: 'الگویابی و ماشین' },
    { id: 'place_value', title: 'فصل ۲ (ارزش مکانی)', icon: Calculator, color: 'from-blue-500 to-cyan-600', desc: 'اعداد ۴ رقمی و پول' },
    { id: 'fraction', title: 'فصل ۳ (کسرها)', icon: PieChart, color: 'from-emerald-500 to-teal-600', desc: 'ساخت و مقایسه کسر' },
    { id: 'multiplication', title: 'فصل ۴ (جدول ضرب)', icon: Grid, color: 'from-purple-500 to-indigo-600', desc: 'ضرب ۱ تا ۱۰' },
    { id: 'perimeter', title: 'فصل ۵ (محیط/مساحت)', icon: Square, color: 'from-[#FF7675] to-rose-600', desc: 'اندازه‌گیری سطح' },
    { id: 'regrouping', title: 'فصل ۶ (جمع/تفریق)', icon: PlusCircle, color: 'from-cyan-500 to-blue-600', desc: 'جمع و تفریق ۴ رقمی' },
    { id: 'statistics', title: 'فصل ۷ (آمار/احتمال)', icon: BarChart3, color: 'from-violet-500 to-purple-600', desc: 'چوب‌خط و چرخنده' },
    { id: 'advanced_multiplication', title: 'فصل ۸ (ضرب بزرگ)', icon: Zap, color: 'from-yellow-400 to-amber-600', desc: 'ضرب ۱۰،۱۰۰ و ۲رقمی' },
    { id: 'clock', title: 'ساعت‌خوانی', icon: Clock, color: 'from-rose-400 to-pink-500', desc: 'عقربه‌های زمان' },
    { id: 'ai_quiz', title: 'آزمون هوشمند', icon: Sparkles, color: 'from-amber-400 to-yellow-500 text-slate-900', desc: 'آزمون با آموزگار' },
  ];

  const isGameLocked = (gameId: string) => {
    if (['place_value', 'fraction', 'multiplication', 'perimeter', 'regrouping', 'statistics', 'advanced_multiplication'].includes(gameId)) {
      return !isVip;
    }
    return false;
  };

  const handleGameSelect = (gameId: ActiveGame) => {
    if (isGameLocked(gameId)) {
      playSound('wrong', soundEnabled);
      if (onOpenSubscription) onOpenSubscription();
      return;
    }
    playSound('click', soundEnabled);
    setActiveGame(gameId);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 dir-rtl">
      {/* Game Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-2.5">
        {games.map((game) => {
          const Icon = game.icon;
          const isActive = activeGame === game.id;
          const locked = isGameLocked(game.id);

          return (
            <button
              key={game.id}
              onClick={() => handleGameSelect(game.id as ActiveGame)}
              className={`p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer text-right flex flex-col justify-between space-y-1.5 min-h-[90px] relative ${
                isActive
                  ? 'bg-[#6C5CE7] text-white border-2 border-[#4834D4] shadow-[0_3px_0_0_#4834D4] scale-102'
                  : locked
                  ? 'bg-amber-50/40 hover:bg-amber-100/50 text-[#2D3436] border-2 border-amber-200/80 shadow-xs'
                  : 'bg-white hover:bg-[#FFF9E5] text-[#2D3436] border-2 border-slate-200/80 hover:border-[#A29BFE] shadow-xs'
              }`}
            >
              {locked && (
                <div className="absolute -top-1.5 -left-1.5 bg-amber-500 text-white rounded-full p-1 shadow-xs z-10" title="ویژه اشتراک طلایی">
                  <Lock className="w-2.5 h-2.5" />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr ${game.color} flex items-center justify-center text-white shadow-xs shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {isActive && <span className="w-2 h-2 rounded-full bg-[#FFEAA7] border border-[#FDCB6E]"></span>}
                {locked && <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1 rounded-sm">VIP</span>}
              </div>
              <div>
                <h4 className="font-black text-[11px] sm:text-xs leading-snug truncate">{game.title}</h4>
                <p className={`text-[9px] sm:text-[10px] font-medium truncate mt-0.5 ${isActive ? 'text-purple-100' : 'text-slate-400'}`}>{game.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Render Selected Active Game */}
      <div className="animate-fadeIn">
        {activeGame === 'pattern' && (
          <PatternMachineGame
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
        {activeGame === 'fraction' && (
          <FractionVisualizer
            soundEnabled={soundEnabled}
            onAddStars={onAddStars}
            onIncrementSolved={onIncrementSolved}
          />
        )}
        {activeGame === 'multiplication' && (
          <MultiplicationGame
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
        {activeGame === 'regrouping' && (
          <RegroupingGame
            soundEnabled={soundEnabled}
            onAddStars={onAddStars}
            onIncrementSolved={onIncrementSolved}
          />
        )}
        {activeGame === 'statistics' && (
          <StatisticsGame
            soundEnabled={soundEnabled}
            onAddStars={onAddStars}
            onIncrementSolved={onIncrementSolved}
          />
        )}
        {activeGame === 'advanced_multiplication' && (
          <AdvancedMultiplicationGame
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
        {activeGame === 'ai_quiz' && (
          <AIQuizGenerator
            soundEnabled={soundEnabled}
            initialChapterId={targetChapterId || 'patterns'}
            onAddStars={onAddStars}
            onIncrementSolved={onIncrementSolved}
            onRecordHistory={onRecordHistory}
          />
        )}
      </div>
    </div>
  );
};
