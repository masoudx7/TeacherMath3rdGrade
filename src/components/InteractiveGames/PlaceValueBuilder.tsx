import React, { useState } from 'react';
import { playSound } from '../../utils/sound';
import { Calculator, Plus, Minus, Coins } from 'lucide-react';

interface PlaceValueBuilderProps {
  soundEnabled: boolean;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
}

export const PlaceValueBuilder: React.FC<PlaceValueBuilderProps> = ({
  soundEnabled,
  onAddStars,
}) => {
  const [thousands, setThousands] = useState<number>(3);
  const [hundreds, setHundreds] = useState<number>(4);
  const [tens, setTens] = useState<number>(2);
  const [ones, setOnes] = useState<number>(5);

  const totalNumber = thousands * 1000 + hundreds * 100 + tens * 10 + ones;
  const tomanValue = totalNumber;
  const rialValue = totalNumber * 10;

  const handleUpdate = (type: 'thousands' | 'hundreds' | 'tens' | 'ones', delta: number) => {
    playSound('click', soundEnabled);
    if (type === 'thousands') setThousands(prev => Math.max(0, Math.min(9, prev + delta)));
    if (type === 'hundreds') setHundreds(prev => Math.max(0, Math.min(9, prev + delta)));
    if (type === 'tens') setTens(prev => Math.max(0, Math.min(9, prev + delta)));
    if (type === 'ones') setOnes(prev => Math.max(0, Math.min(9, prev + delta)));
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-md max-w-3xl mx-auto space-y-6 dir-rtl">
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
        <div>
          <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
            <span>جدول ارزش مکانی و واحد پول 🧮</span>
          </h3>
          <p className="text-xs text-slate-500">پایه سوم ابتدایی - ساخت عدد ۴ رقمی با مکعب‌های هزارتایی تا یکی‌ها</p>
        </div>
      </div>

      {/* Number Display Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-6 text-center shadow-lg space-y-3">
        <span className="text-xs font-bold opacity-80">عدد ساخته شده:</span>
        <div className="text-5xl font-black tracking-widest text-amber-300">
          {thousands > 0 ? thousands : ''}{hundreds}{tens}{ones}
        </div>
        <div className="text-sm font-bold opacity-90">
          گسترده‌نویسی: {thousands * 1000} + {hundreds * 100} + {tens * 10} + {ones}
        </div>
      </div>

      {/* Place Value Table Controls */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
        {/* Thousands */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 space-y-2">
          <span className="text-xs font-black text-blue-900 block">هزارتایی</span>
          <div className="text-2xl font-black text-blue-700">{thousands}</div>
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => handleUpdate('thousands', -1)}
              className="w-8 h-8 rounded-xl bg-blue-200 hover:bg-blue-300 text-blue-900 font-black cursor-pointer"
            >
              -
            </button>
            <button
              onClick={() => handleUpdate('thousands', 1)}
              className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black cursor-pointer"
            >
              +
            </button>
          </div>
          <span className="text-[10px] text-blue-600 font-bold block">{thousands * 1000}</span>
        </div>

        {/* Hundreds */}
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3 space-y-2">
          <span className="text-xs font-black text-emerald-900 block">صدتایی</span>
          <div className="text-2xl font-black text-emerald-700">{hundreds}</div>
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => handleUpdate('hundreds', -1)}
              className="w-8 h-8 rounded-xl bg-emerald-200 hover:bg-emerald-300 text-emerald-900 font-black cursor-pointer"
            >
              -
            </button>
            <button
              onClick={() => handleUpdate('hundreds', 1)}
              className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black cursor-pointer"
            >
              +
            </button>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block">{hundreds * 100}</span>
        </div>

        {/* Tens */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 space-y-2">
          <span className="text-xs font-black text-amber-900 block">ده‌تایی</span>
          <div className="text-2xl font-black text-amber-700">{tens}</div>
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => handleUpdate('tens', -1)}
              className="w-8 h-8 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-black cursor-pointer"
            >
              -
            </button>
            <button
              onClick={() => handleUpdate('tens', 1)}
              className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black cursor-pointer"
            >
              +
            </button>
          </div>
          <span className="text-[10px] text-amber-600 font-bold block">{tens * 10}</span>
        </div>

        {/* Ones */}
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-3 space-y-2">
          <span className="text-xs font-black text-rose-900 block">یکی</span>
          <div className="text-2xl font-black text-rose-700">{ones}</div>
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => handleUpdate('ones', -1)}
              className="w-8 h-8 rounded-xl bg-rose-200 hover:bg-rose-300 text-rose-900 font-black cursor-pointer"
            >
              -
            </button>
            <button
              onClick={() => handleUpdate('ones', 1)}
              className="w-8 h-8 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black cursor-pointer"
            >
              +
            </button>
          </div>
          <span className="text-[10px] text-rose-600 font-bold block">{ones}</span>
        </div>
      </div>

      {/* Currency Converter Section */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Coins className="w-8 h-8 text-amber-600" />
          <div>
            <h4 className="font-black text-slate-800 text-sm">تبدیل واحد پول (تومان ↔ ریال)</h4>
            <p className="text-xs text-slate-500">هر ۱ تومان برابر با ۱۰ ریال است</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-xl border border-amber-300 font-black text-amber-900 text-sm">
            {tomanValue.toLocaleString('fa-IR')} تومان
          </div>
          <span className="font-bold text-slate-400">=</span>
          <div className="bg-white px-4 py-2 rounded-xl border border-amber-300 font-black text-amber-900 text-sm">
            {rialValue.toLocaleString('fa-IR')} ریال
          </div>
        </div>
      </div>
    </div>
  );
};
