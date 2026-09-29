import React, { useState, useEffect } from 'react';
import { getAllQuestions, deleteLocalAIQuestion, syncQuestionsToCloud, QuestionCategory, QuestionItem } from '../utils/questionManager';
import { StudentProfile } from '../types';
import { playSound } from '../utils/sound';
import { BookOpen, Sparkles, Trash2, Cloud, Database, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

interface MyQuestionsViewProps {
  profile: StudentProfile;
  soundEnabled: boolean;
}

export const MyQuestionsView: React.FC<MyQuestionsViewProps> = ({ profile, soundEnabled }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [totalCount, setTotalCount] = useState<number>(0);
  const [baseCategories, setBaseCategories] = useState<QuestionCategory[]>([]);
  const [aiQuestions, setAiQuestions] = useState<QuestionItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllQuestions(profile.isLoggedIn ? profile.phoneNumber : undefined);
      setBaseCategories(data.base);
      setAiQuestions(data.aiGenerated);
      setTotalCount(data.total);
    } catch (e) {
      console.error('Error loading questions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile.phoneNumber, profile.isLoggedIn]);

  const handleDeleteAiQuestion = async (id: string) => {
    playSound('click', soundEnabled);
    await deleteLocalAIQuestion(id);
    await loadData();
  };

  const handleSync = async () => {
    if (!profile.isLoggedIn || !profile.phoneNumber) {
      playSound('pop', soundEnabled);
      setSyncMessage('لطفاً ابتدا با شماره موبایل وارد شوید تا سینک ابری انجام شود.');
      return;
    }
    playSound('click', soundEnabled);
    setSyncing(true);
    setSyncMessage('در حال همگام‌سازی با سرور...');
    try {
      const success = await syncQuestionsToCloud(profile.phoneNumber);
      if (success) {
        playSound('star', soundEnabled);
        setSyncMessage('همگام‌سازی با موفقیت انجام شد! ✅');
        await loadData();
      } else {
        setSyncMessage('خطا در همگام‌سازی. لطفاً دوباره تلاش کنید.');
      }
    } catch (e) {
      setSyncMessage('خطا در ارتباط با سرور ابری.');
    } finally {
      setSyncing(false);
    }
  };

  const filteredBase = selectedCategory === 'all' 
    ? baseCategories 
    : baseCategories.filter(c => c.id === selectedCategory);

  return (
    <div className="w-full max-w-full overflow-x-hidden px-2 sm:px-4 max-w-6xl mx-auto space-y-6 dir-rtl box-border animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-2 text-center md:text-right">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xs">
            <span>📚</span>
            <span>بانک جامع سوالات ریاضی سوم</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">مدیریت و بانک سوالات هوشمند</h2>
          <p className="text-indigo-100 text-xs sm:text-sm font-medium">
            مجموعه ۲۰۰ سوال پایه آفلاین + سوالات هوش مصنوعی ذخیره شده شما
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-md">
          <div className="text-center">
            <span className="block text-2xl sm:text-3xl font-black text-amber-300">{totalCount}</span>
            <span className="text-[11px] text-indigo-100 font-bold">کل سوالات بانک</span>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <div className="text-center">
            <span className="block text-2xl sm:text-3xl font-black text-emerald-300">{aiQuestions.length}</span>
            <span className="text-[11px] text-indigo-100 font-bold">سوالات هوش مصنوعی</span>
          </div>
        </div>
      </div>

      {/* Status & Sync Bar */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800">وضعیت ذخیره‌سازی محلی (IndexedDB)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-xs text-slate-500">سوالات پایه و هوش مصنوعی روی دستگاه شما به‌صورت آفلاین امن ذخیره شده‌اند.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {profile.isLoggedIn ? (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <Cloud className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'در حال سینک...' : 'همگام‌سازی ابری (KV) ☁️'}</span>
            </button>
          ) : (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>برای سینک ابری وارد حساب کاربری شوید</span>
            </div>
          )}
        </div>
      </div>

      {syncMessage && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-3 rounded-xl text-xs font-bold text-center animate-in fade-in">
          {syncMessage}
        </div>
      )}

      {/* AI Generated Saved Questions Section */}
      <div className="bg-white border-2 border-indigo-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-black text-base text-indigo-950">سوالات ذخیره شده توسط هوش مصنوعی ({aiQuestions.length})</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">ذخیره شده در مرورگر شما</span>
        </div>

        {aiQuestions.length === 0 ? (
          <div className="text-center py-10 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <span className="text-3xl">🤖</span>
            <p className="text-sm font-bold text-slate-700">هنوز سوالی از هوش مصنوعی ذخیره نکرده‌اید!</p>
            <p className="text-xs text-slate-400">هنگام گفتگو با استاد دانا، روی دکمه «ذخیره این سوال 💾» کلیک کنید تا اینجا ثبت شود.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiQuestions.map((q) => (
              <div key={q.id} className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-4 flex items-start justify-between gap-3 shadow-2xs">
                <div className="space-y-1.5 min-w-0">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900 text-[10px] font-black">
                    هوش مصنوعی 🧠
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">{q.text}</p>
                  {q.tags && q.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {q.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] bg-white text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-200 font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteAiQuestion(q.id)}
                  className="p-2 text-rose-500 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="حذف سوال"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Base Questions Bank Section */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b pb-3 gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-base text-slate-900">بانک سوالات پایه (۲۰۰ سوال استاندارد کتاب سوم)</h3>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              همه فصل‌ها
            </button>
            {baseCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  selectedCategory === cat.id ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-bold">در حال بارگذاری ۲۰۰ سوال پایه... ⏳</div>
        ) : (
          <div className="space-y-6">
            {filteredBase.map(cat => (
              <div key={cat.id} className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <span className="text-xl">{cat.icon}</span>
                  <h4 className="font-black text-sm text-slate-800">{cat.name} ({cat.questions.length} سوال)</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {cat.questions.map((q) => (
                    <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-start justify-between gap-2 shadow-2xs">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black ${
                          q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-800' :
                          q.difficulty === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {q.difficulty === 'easy' ? 'آسان 🟢' : q.difficulty === 'medium' ? 'متوسط 🟡' : 'سخت 🔴'}
                        </span>
                        <p className="text-xs font-bold text-slate-800">{q.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
