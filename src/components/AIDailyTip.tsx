import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Lightbulb, Copy, Check, Quote } from 'lucide-react';
import { playSound } from '../utils/sound';

interface AIDailyTipProps {
  soundEnabled: boolean;
}

const FALLBACK_TIPS = [
  '💡 ترفند ضرب ۱۰: برای ضرب هر عدد در ۱۰، فقط کافیه یک صفر خوشگل جلوش بگذاری! مثلاً ۷ × ۱۰ میشه ۷۰! 🚀',
  '🍕 راز کسرها: صورت کسر عدد بالای خطه یعنی تعداد تیکه‌هایی که خوردیم، مخرج هم عدد پایینه یعنی کل تیکه‌های پیتزا! 🍕',
  '📐 راز محیط و مساحت: محیط یعنی دور تا دور شکل مثل ریسه بادکنک، مساحت یعنی سطح داخل شکل مثل فرش اتاق! 🎨',
  '💰 شورت‌کات تومان و ریال: برای تبدیل ریال به تومان کافیه یک صفر از آخر عدد برداری! مثلا ۵۰۰۰ ریال میشه ۵۰۰ تومان! 👛',
  '⏰ ترفند ساعت بعدازظهر: برای خواندن ساعت‌های بعدازظهر، عدد ساعت رو با ۱۲ جمع کن! مثلا ۴ بعدازظهر میشه ساعت ۱۶! ⏱️',
  '✖️ راز ضرب ۵: حاصل ضرب هر عدد در ۵ همیشه با صفر یا پنج تموم میشه! ۵، ۱۰، ۱۵، ۲۰، ۲۵... ریتمش رو حفظ کن! 🎵',
  '🧮 جمع تکنیکی اعداد ۴ رقمی: همیشه از ستون یکی‌ها شروع کن! اگه جمع از ۹ بیشتر شد، ده تایی رو بفرست واسه همسایه! 🏠',
  '🔷 خواص مربع و مستطیل: هر دو ۴ تا ضلع و ۴ تا زاویه راست دارن، اما مربع همه ضلع‌هاش باهم برابره! 📐',
  '⚙️ ماشین ورودی و خروجی: این ماشین مثل یک غول مهربونه! هر عددی بدی رو طبق دستور ضرب یا جمع می‌کنه و خروجی تحویل می‌ده! 🤖',
  '📊 راز چوب‌خط: تا ۴ تا چوب‌خط رو کنار هم عمودی می‌کشیم، پنجمی رو مورب رویشون می‌کشیم تا شمارش ۵ تا ۵ تا راحت بشه! ✏️'
];

export const AIDailyTip: React.FC<AIDailyTipProps> = ({ soundEnabled }) => {
  const [tip, setTip] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [tipIndex, setTipIndex] = useState<number>(0);

  const fetchNewTip = async (force = false) => {
    setLoading(true);
    try {
      const url = force ? '/api/tutor/daily-tip?refresh=true' : '/api/tutor/daily-tip';
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.tip) {
          setTip(data.tip);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Daily tip fetch error, using fallback:', e);
    }

    // Fallback if network or API unavailable: rotate fallback tips
    const nextIdx = (tipIndex + 1) % FALLBACK_TIPS.length;
    setTipIndex(nextIdx);
    setTip(FALLBACK_TIPS[nextIdx]);
    setLoading(false);
  };

  useEffect(() => {
    fetchNewTip(false);
  }, []);

  const handleRefresh = () => {
    playSound('star', soundEnabled);
    fetchNewTip(true);
  };

  const handleCopy = () => {
    if (!tip) return;
    navigator.clipboard.writeText(tip);
    setCopied(true);
    playSound('click', soundEnabled);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-4 sm:p-5 shadow-lg border-4 border-amber-200 relative overflow-hidden dir-rtl mb-6 transition-all">
      {/* Background glowing decorations */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        
        {/* Left Side: Badge & Tip Content */}
        <div className="flex items-start gap-3 flex-1">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner mt-0.5">
            💡
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-amber-900/40 text-amber-100 text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-300/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin" />
                <span>نکته روز ریاضی با آموزگار</span>
              </span>
              <span className="text-[10px] text-amber-100/80 font-bold hidden sm:inline">
                تولید شده توسط آموزگار هوشمند
              </span>
            </div>

            <div className="text-sm sm:text-base font-extrabold text-white leading-relaxed pt-1">
              {loading ? (
                <div className="flex items-center gap-2 text-amber-100 text-xs sm:text-sm animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>معلم هوشمند در حال آماده‌سازی یک نکته فوق‌العاده جدید...</span>
                </div>
              ) : (
                <p className="animate-fade-in flex items-start gap-1.5">
                  <Quote className="w-4 h-4 text-amber-200 shrink-0 rotate-180 opacity-70 mt-1" />
                  <span>{tip}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t border-white/20 pt-2 sm:pt-0 sm:border-t-0 shrink-0">
          <button
            onClick={handleCopy}
            disabled={loading || !tip}
            className="p-2 sm:px-3 sm:py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 backdrop-blur-xs disabled:opacity-40"
            title="کپی نکته"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span className="hidden sm:inline">کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">کپی</span>
              </>
            )}
          </button>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3.5 py-2 bg-white text-amber-950 font-black rounded-xl text-xs hover:bg-amber-100 active:scale-95 transition-all cursor-pointer shadow-md flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            title="بروزرسانی و دریافت نکته جدید آموزگار"
          >
            <RefreshCw className={`w-4 h-4 text-amber-700 ${loading ? 'animate-spin' : ''}`} />
            <span>نکته جدید از آموزگار 🎲</span>
          </button>
        </div>

      </div>
    </div>
  );
};
