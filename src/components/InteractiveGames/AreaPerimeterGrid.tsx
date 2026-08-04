import React, { useState } from 'react';
import { playSound } from '../../utils/sound';
import { Square, CheckCircle2, RotateCcw } from 'lucide-react';

interface AreaPerimeterGridProps {
  soundEnabled: boolean;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
}

export const AreaPerimeterGrid: React.FC<AreaPerimeterGridProps> = ({
  soundEnabled,
  onAddStars,
}) => {
  const GRID_SIZE = 6;
  const [selectedCells, setSelectedCells] = useState<boolean[][]>(
    Array(GRID_SIZE).fill(false).map(() => Array(GRID_SIZE).fill(false))
  );

  const toggleCell = (r: number, c: number) => {
    playSound('pop', soundEnabled);
    setSelectedCells(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = !next[r][c];
      return next;
    });
  };

  const handleReset = () => {
    playSound('click', soundEnabled);
    setSelectedCells(Array(GRID_SIZE).fill(false).map(() => Array(GRID_SIZE).fill(false)));
  };

  // Calculate Area (count of filled cells)
  let area = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (selectedCells[r][c]) area++;
    }
  }

  // Calculate Perimeter (count of exposed edges of filled cells)
  let perimeter = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (selectedCells[r][c]) {
        // Top edge
        if (r === 0 || !selectedCells[r - 1][c]) perimeter++;
        // Bottom edge
        if (r === GRID_SIZE - 1 || !selectedCells[r + 1][c]) perimeter++;
        // Left edge
        if (c === 0 || !selectedCells[r][c - 1]) perimeter++;
        // Right edge
        if (c === GRID_SIZE - 1 || !selectedCells[r][c + 1]) perimeter++;
      }
    }
  }

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-md max-w-3xl mx-auto space-y-6 dir-rtl">
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
        <div>
          <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
            <span>سازنده محیط و مساحت روی شبکه‌ مربع‌ها 📐</span>
          </h3>
          <p className="text-xs text-slate-500">پایه سوم ابتدایی - مساحت (تعداد مربع‌های داخل) و محیط (خط‌های دور تا دور)</p>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>پاکسازی شبکه</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
        {/* Interactive Grid */}
        <div className="grid grid-cols-6 gap-1 bg-slate-800 p-2 rounded-2xl border-4 border-slate-700 shadow-lg">
          {selectedCells.map((row, r) =>
            row.map((active, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => toggleCell(r, c)}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-slate-700 transition-all cursor-pointer flex items-center justify-center font-bold text-xs ${
                  active
                    ? 'bg-amber-400 text-slate-900 shadow-inner scale-95 border-amber-500'
                    : 'bg-slate-100 hover:bg-amber-100 text-slate-400'
                }`}
              >
                {active ? '🟨' : ''}
              </button>
            ))
          )}
        </div>

        {/* Live Calculation Cards */}
        <div className="space-y-4 min-w-[220px]">
          {/* Area */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center space-y-1 shadow-xs">
            <span className="text-xs font-bold text-amber-900 block">مساحت شکل (سطح داخل):</span>
            <div className="text-3xl font-black text-amber-600">{area}</div>
            <span className="text-xs text-amber-800 font-bold block">مربع واحد</span>
          </div>

          {/* Perimeter */}
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-center space-y-1 shadow-xs">
            <span className="text-xs font-bold text-rose-900 block">محیط شکل (خط دور تا دور):</span>
            <div className="text-3xl font-black text-rose-600">{perimeter}</div>
            <span className="text-xs text-rose-800 font-bold block">واحد طول</span>
          </div>
        </div>
      </div>
    </div>
  );
};
