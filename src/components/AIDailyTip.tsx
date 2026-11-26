import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Lightbulb, Copy, Check, Quote } from 'lucide-react';
import { playSound } from '../utils/sound';
import { apiUrl } from '../utils/apiConfig';

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

const DAILY_TIP_STORAGE_KEY = 'ostad_daily_tip_cache_v1';

const getTodayDateKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const AIDailyTip: React.FC<AIDailyTipProps> = ({ soundEnabled }) => {
  const [tip, setTip] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [tipIndex, setTipIndex] = useState<number>(0);

  const fetchNewTip = async (force = false) => {
    const todayKey = getTodayDateKey();

    if (!force) {
      try {
        const cachedRaw = localStorage.getItem(DAILY_TIP_STORAGE_KEY);
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw);
          if (parsed?.date === todayKey && typeof parsed?.tip === 'string' && parsed.tip.trim()) {
            setTip(parsed.tip);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Ignore storage errors
      }
    }

    setLoading(true);
    try {
      const url = apiUrl(force ? '/api/tutor/daily-tip?refresh=true' : '/api/tutor/daily-tip');
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.tip) {
          setTip(data.tip);
          try {
            localStorage.setItem(DAILY_TIP_STORAGE_KEY, JSON.stringify({ date: todayKey, tip: data.tip }));
          } catch {
            // Ignore storage errors
          }
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
    <div className="rounded-[1.75rem] p-4 sm:p-5 bg-gradient-to-br from-[#FDE68A] via-[#FCD34D] to-[#FDBA74] text-[#26354D] border border-amber-200/80 shadow-[0_14px_32px_-12px_rgba(217,119,6,0.28),inset_0_2px_0_rgba(255,255,255,0.65)] relative overflow-hidden dir-rtl mb-4 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-11 h-11 bg-white/80 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-[0_6px_14px_-6px_rgba(120,82,40,0.25),inset_0_1px_0_#fff] mt-0.5">
            💡
          </div>

          <div className="space-y-1 flex-1">
            <p className="text-xs font-extrabold text-amber-950/75 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-800" />
              <span>نکته روز ریاضی با استاد دانا</span>
            </p>

            <div className="text-sm sm:text-base font-bold text-[#26354D] leading-relaxed">
              {loading ? (
                <div className="flex items-center gap-2 text-amber-950/70 text-xs sm:text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال آماده‌سازی نکته جدید...</span>
                </div>
              ) : (
                <p className="flex items-start gap-1.5">
                  <span>{tip}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            disabled={loading || !tip}
            className="px-3 py-2 bg-white/75 hover:bg-white text-[#26354D] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-40"
            title="کپی نکته"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">کپی شد</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">کپی</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="clay-btn-primary px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50 whitespace-nowrap"
            title="دریافت نکته جدید"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${loading ? 'animate-spin' : ''}`} />
            <span>نکته جدید</span>
          </button>
        </div>
      </div>
    </div>
  );
};
