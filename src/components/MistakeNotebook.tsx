import React, { useState, useEffect } from 'react';
import { MistakeRecord, ChapterId } from '../types';
import { CHAPTERS } from '../data/curriculum';
import { playSound } from '../utils/sound';
import { speakPersianText, stopPersianSpeech } from '../utils/speech';
import { 
  BookMarked, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  AlertCircle, 
  Volume2, 
  HelpCircle, 
  Filter,
  Check,
  Award,
  ChevronDown,
  Trash2
} from 'lucide-react';

interface MistakeNotebookProps {
  soundEnabled: boolean;
  onAddStars: (stars: number) => void;
  userId?: string;
}

export const MISTAKES_STORAGE_KEY = 'math_tutor_user_mistakes_v1';

// Pre-seeded initial sample mistakes for standard 3rd grade if empty
const DEFAULT_INITIAL_MISTAKES: MistakeRecord[] = [
  {
    id: 'mstk-seed-1',
    chapterId: 'fractions',
    question: 'کدام کسر بزرگ‌تر است؟ ۱/۴ یا ۳/۴؟',
    wrongAnswer: '۱/۴',
    correctAnswer: '۳/۴',
    explanation: 'وقتی مخرج‌ها مساوی باشند (۴)، کسری که صورتش بزرگ‌تر است مقدار بیشتری از کل شکل را نشان می‌دهد.',
    timestamp: Date.now() - 3600000 * 2,
    resolved: false,
    attempts: 1,
    retryCount: 0
  },
  {
    id: 'mstk-seed-2',
    chapterId: 'multiplication_division',
    question: 'حاصل ضرب ۷ × ۶ کدام است؟',
    wrongAnswer: '۳۶',
    correctAnswer: '۴۲',
    explanation: '۷ دسته ۶ تایی برابر با ۴۲ است. ۳۶ حاصل ۶ × ۶ است.',
    timestamp: Date.now() - 3600000 * 24,
    resolved: false,
    attempts: 1,
    retryCount: 0
  }
];

export const MistakeNotebook: React.FC<MistakeNotebookProps> = ({
  soundEnabled,
  onAddStars,
  userId = 'default_user'
}) => {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => {
    try {
      const saved = localStorage.getItem(MISTAKES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_INITIAL_MISTAKES;
  });

  const [filterChapter, setFilterChapter] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [activeRetryId, setActiveRetryId] = useState<string | null>(null);
  const [retryAnswer, setRetryAnswer] = useState<string>('');
  const [retryFeedback, setRetryFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(mistakes));
    } catch (e) {
      console.error(e);
    }
  }, [mistakes]);

  // Sync from server API if user is logged in
  useEffect(() => {
    if (!userId || userId === 'default_user') return;
    fetch(`/api/user/mistakes?userId=${encodeURIComponent(userId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.mistakes && Array.isArray(data.mistakes) && data.mistakes.length > 0) {
          setMistakes(data.mistakes);
        }
      })
      .catch(err => console.warn('Failed to fetch mistakes from server:', err));
  }, [userId]);

  const handleSpeak = (id: string, text: string) => {
    if (speakingId === id) {
      stopPersianSpeech();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(id);
    speakPersianText(
      text,
      undefined,
      () => setSpeakingId(null),
      () => setSpeakingId(null)
    );
  };

  const handleStartRetry = (m: MistakeRecord) => {
    playSound('click', soundEnabled);
    setActiveRetryId(m.id);
    setRetryAnswer('');
    setRetryFeedback(null);
  };

  const handleSubmitRetry = (m: MistakeRecord) => {
    if (!retryAnswer.trim()) return;

    const normalizedUser = retryAnswer.trim().replace(/\s+/g, '');
    const normalizedCorrect = m.correctAnswer.trim().replace(/\s+/g, '');

    const isCorrect = normalizedUser === normalizedCorrect || normalizedUser.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUser);

    if (isCorrect) {
      playSound('correct', soundEnabled);
      setRetryFeedback({
        isCorrect: true,
        message: 'آفرین قهرمان! پاسخ کاملاً درست است. ۳ ستاره پاداش گرفتی! 🌟'
      });
      onAddStars(3);

      // Mark mistake as resolved
      const updated = mistakes.map(item => {
        if (item.id === m.id) {
          return {
            ...item,
            resolved: true,
            retryCount: item.retryCount + 1,
          };
        }
        return item;
      });
      setMistakes(updated);

      // Inform server
      fetch('/api/user/mistakes/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, mistakeId: m.id })
      }).catch(err => console.warn(err));

      setTimeout(() => {
        setActiveRetryId(null);
        setRetryFeedback(null);
      }, 2500);
    } else {
      playSound('wrong', soundEnabled);
      setRetryFeedback({
        isCorrect: false,
        message: 'دوباره دقت کن! به راهنمای حل نگاه کن و دوباره تلاش کن.'
      });
      setMistakes(prev =>
        prev.map(item =>
          item.id === m.id ? { ...item, retryCount: item.retryCount + 1 } : item
        )
      );
    }
  };

  const handleDeleteMistake = (id: string) => {
    playSound('click', soundEnabled);
    setMistakes(prev => prev.filter(m => m.id !== id));
  };

  // Filtered list
  const filteredMistakes = mistakes.filter(m => {
    if (filterChapter !== 'all' && m.chapterId !== filterChapter) return false;
    if (filterStatus === 'unresolved' && m.resolved) return false;
    if (filterStatus === 'resolved' && !m.resolved) return false;
    return true;
  });

  const unresolvedCount = mistakes.filter(m => !m.resolved).length;
  const resolvedCount = mistakes.filter(m => m.resolved).length;

  return (
    <div className="w-full max-w-full overflow-x-hidden px-2 sm:px-4 max-w-5xl mx-auto space-y-6 dir-rtl box-border">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#FF7675] to-[#D63031] text-white rounded-[2rem] p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold">
            <BookMarked className="w-4 h-4 text-white" />
            <span>یادگیری از اشتباهات (Smart Mistake Notebook)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            دفترچه هوشمند اشتباهات من 📝
          </h2>
          <p className="text-xs sm:text-sm text-rose-100 max-w-xl font-medium leading-relaxed">
            اشتباهات بهترین فرصت برای یادگیری هستند! هر مسئله‌ای که در آزمون‌ها یا تکالیف اشتباه پاسخ داده شده اینجا جمع‌آوری می‌شود تا با راهنمای گام‌به‌گام آن‌ها را دوباره حل کنی و ستاره بگیری.
          </p>
        </div>

        {/* Counter Pill Stats */}
        <div className="flex items-center gap-3 z-10">
          <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl p-3 text-center min-w-[90px]">
            <span className="text-2xl font-black block">{unresolvedCount}</span>
            <span className="text-[11px] text-rose-100 font-bold">نیاز به تمرین</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl p-3 text-center min-w-[90px]">
            <span className="text-2xl font-black block text-emerald-300">{resolvedCount}</span>
            <span className="text-[11px] text-emerald-100 font-bold">برطرف شده</span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl p-4 border-2 border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> وضعیت:
          </span>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-[#6C5CE7] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            همه ({mistakes.length})
          </button>
          <button
            onClick={() => setFilterStatus('unresolved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'unresolved'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            نیاز به تمرین ({unresolvedCount})
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'resolved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            برطرف شده ({resolvedCount})
          </button>
        </div>

        {/* Chapter Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">فصل کتاب:</span>
          <select
            value={filterChapter}
            onChange={(e) => setFilterChapter(e.target.value)}
            aria-label="فیلتر بر اساس فصل کتاب"
            className="bg-slate-100 border border-slate-300 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-[#6C5CE7] cursor-pointer"
          >
            <option value="all">همه فصل‌های کتاب (۸ فصل)</option>
            {CHAPTERS.map(c => (
              <option key={c.id} value={c.id}>
                فصل {c.chapterNumber}: {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mistake Cards List */}
      {filteredMistakes.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-slate-200/80 shadow-xs space-y-4">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-xs">
            🎉
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-800">
              {filterStatus === 'unresolved'
                ? 'آفرین! هیچ مسئله حل‌نشده‌ای نداری!'
                : 'هیچ موردی با فیلتر انتخابی یافت نشد.'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              با شرکت در آزمون‌های فصول و چت با معلم هوشمند، هر زمان در مسئله‌ای نیاز به تمرین بیشتر داشته باشی به طور خودکار به این دفترچه اضافه می‌شود.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMistakes.map(m => {
            const chapterInfo = CHAPTERS.find(c => c.id === m.chapterId);
            const isRetrying = activeRetryId === m.id;

            return (
              <div
                key={m.id}
                className={`bg-white rounded-3xl border-2 p-5 sm:p-6 transition-all space-y-4 ${
                  m.resolved
                    ? 'border-emerald-200 bg-emerald-50/20 shadow-xs'
                    : 'border-rose-200 shadow-[0_4px_0_0_#FFEAEA]'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFEAA7] text-[#D35400] border border-[#FDCB6E]">
                      {chapterInfo ? `فصل ${chapterInfo.chapterNumber}: ${chapterInfo.title}` : 'ریاضی سوم'}
                    </span>
                    {m.resolved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        برطرف شده و یاد گرفته شد
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        نیاز به مرور
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Audio read button */}
                    <button
                      onClick={() => handleSpeak(m.id, `${m.question}. پاسخ درست: ${m.correctAnswer}. توضیح: ${m.explanation}`)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        speakingId === m.id
                          ? 'bg-[#6C5CE7] text-white animate-pulse'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="خواندن صوتی متن مسئله و توضیح"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteMistake(m.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      title="حذف از دفترچه"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="bg-[#FFF9E5] border border-[#FFEAA7] rounded-2xl p-4 space-y-2">
                  <span className="text-xs font-bold text-amber-800 block">صورت مسئله:</span>
                  <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
                    {m.question}
                  </p>
                </div>

                {/* Comparison Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 space-y-1">
                    <span className="font-bold text-rose-700 flex items-center gap-1">
                      ❌ پاسخ قبلی شما:
                    </span>
                    <p className="font-bold text-slate-700 text-sm">{m.wrongAnswer || 'نامشخص'}</p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-1">
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      ✅ پاسخ صحیح و منطقی:
                    </span>
                    <p className="font-bold text-emerald-900 text-sm">{m.correctAnswer}</p>
                  </div>
                </div>

                {/* AI Explanation / Diagnosis */}
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 space-y-1.5 text-xs text-indigo-950">
                  <span className="font-bold text-indigo-700 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    تحلیل آموزگار هوشمند (راهنمای یادگیری):
                  </span>
                  <p className="leading-relaxed font-medium">{m.explanation}</p>
                </div>

                {/* Retry Section */}
                <div className="pt-2">
                  {!isRetrying ? (
                    <button
                      onClick={() => handleStartRetry(m)}
                      className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        m.resolved
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                          : 'bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white shadow-[0_3px_0_0_#4834D4] hover:translate-y-0.5'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{m.resolved ? 'حل دوباره برای تثبیت مهارت' : 'حل مجدد و دریافت ۳ ستاره پاداش ⭐'}</span>
                    </button>
                  ) : (
                    <div className="bg-slate-50 border-2 border-[#6C5CE7] rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#6C5CE7] flex items-center gap-1">
                          <RotateCcw className="w-4 h-4" />
                          پاسخ درست را وارد یا انتخاب کن:
                        </span>
                        <button
                          onClick={() => setActiveRetryId(null)}
                          className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                        >
                          انصراف
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={retryAnswer}
                          onChange={(e) => setRetryAnswer(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSubmitRetry(m);
                          }}
                          placeholder="پاسخ خود را اینجا بنویسید..."
                          className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#6C5CE7]"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSubmitRetry(m)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Check className="w-4 h-4" />
                          <span>ثبت پاسخ</span>
                        </button>
                      </div>

                      {/* Retry Feedback Alert */}
                      {retryFeedback && (
                        <div
                          className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                            retryFeedback.isCorrect
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-bounce'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          <span>{retryFeedback.message}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
