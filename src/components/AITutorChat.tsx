import React, { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { ChatMessage } from '../types';
import { playSound } from '../utils/sound';
import { generateFallbackTutorResponse } from '../utils/tutorFallback';
import { getAllQuestions, saveQuestionLocally, syncQuestionsToCloud } from '../utils/questionManager';
import { 
  Send, 
  User, 
  RefreshCw, 
  Lightbulb, 
  Star, 
  Copy,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Smile,
  X,
  Crown,
  Zap
} from 'lucide-react';
import { StudentProfile } from '../types';
import { checkAiQuota, consumeAiQuota } from '../utils/subscriptionManager';

interface AITutorChatProps {
  soundEnabled: boolean;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onOpenSubscription: () => void;
}

interface QuestionCategory {
  id: string;
  name: string;
  icon: string;
  questions: string[];
}

const STORAGE_KEY = 'ostad_dana_chat_history_v2';
const MAX_LOCALSTORAGE_MESSAGES = 100;
const MAX_HISTORY_MESSAGES = 20;

export const AITutorChat: React.FC<AITutorChatProps> = ({ 
  soundEnabled, 
  onAddStars, 
  onIncrementSolved,
  profile,
  onUpdateProfile,
  onOpenSubscription
}) => {
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);
  const [totalQ, setTotalQ] = useState(0);
  const aiQuota = checkAiQuota(profile);

  useEffect(() => {
    getAllQuestions().then(data => {
      const cats = data.base.map((c: any) => ({
        id: c.id, name: c.name, icon: c.icon,
        questions: c.questions.map((q: any) => q.text)
      }));
      if (data.aiGenerated.length > 0) {
        cats.unshift({ id: 'my_ai', name: `سوالات من (${data.aiGenerated.length})`, icon: '💾', questions: data.aiGenerated.map((q: any) => q.text) });
      }
      setDynamicCategories(cats);
      setTotalQ(data.total);
    });
  }, []);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'welcome',
        sender: 'tutor',
        text: 'سلام قهرمان ریاضی! 🌟 من «استاد دانا» هستم، معلم صبور و مهربان ریاضی سوم دبستان. هر سوال یا تمرینی که داری بپرس تا با هم مثل آب خوردن حلش کنیم! 😊🦉',
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [suggestionOffset, setSuggestionOffset] = useState<number>(0);

  // Quick Quiz states
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizCategory, setQuizCategory] = useState<string>('all');
  const [quizQuestions, setQuizQuestions] = useState<string[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizUserAnswer, setQuizUserAnswer] = useState('');
  const [quizAnswersList, setQuizAnswersList] = useState<{ question: string; answer: string }[]>([]);
  const [quizStep, setQuizStep] = useState<'selecting' | 'active' | 'results'>('selecting');
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  const handleSaveQuestion = async (text: string) => {
    playSound('click', soundEnabled);
    const qId = 'ai_q_' + Date.now();
    const newItem = {
      id: qId,
      text: text.slice(0, 150),
      difficulty: 'medium' as const,
      tags: ['هوش مصنوعی', 'گفتگو']
    };
    try {
      await saveQuestionLocally(newItem);
      const savedProf = localStorage.getItem('math_tutor_3rd_profile_v3');
      if (savedProf) {
        const parsed = JSON.parse(savedProf);
        if (parsed.isLoggedIn && parsed.phoneNumber) {
          await syncQuestionsToCloud(parsed.phoneNumber);
        }
      }
      setSaveNotification('سوال با موفقیت در بانک سوالات شما ذخیره شد! ✅');
      setTimeout(() => setSaveNotification(null), 3500);
    } catch (e) {
      console.error(e);
      setSaveNotification('خطا در ذخیره سوال.');
      setTimeout(() => setSaveNotification(null), 3000);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, loading]);

  // Persist messages to LocalStorage
  useEffect(() => {
    try {
      const messagesToSave = messages.length > MAX_LOCALSTORAGE_MESSAGES 
        ? messages.slice(-MAX_LOCALSTORAGE_MESSAGES)
        : messages;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToSave));
    } catch (e) {
      try {
        const reducedMessages = messages.slice(-50);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedMessages));
      } catch (e2) {
        console.error('خطا در ذخیره تاریخچه:', e2);
      }
    }
  }, [messages]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    const initialMsgs: ChatMessage[] = [
      {
        id: Date.now().toString(),
        sender: 'tutor',
        text: 'گفتگوی جدید شروع شد! 🌟 هر مسئله یا سوالی از کتاب ریاضی سوم داری، بپرس تا با شکل و جدول با هم یاد بگیریم.',
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(initialMsgs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMsgs));
    } catch (e) {}
  };

  const activeCategory = dynamicCategories.find(c => c.id === selectedCatId) || dynamicCategories[0] || { id: 'all', name: 'همه مباحث', icon: '🌟', questions: [] };
  
  const getDisplayedQuestions = () => {
    const list = activeCategory.questions;
    const len = list.length;
    const count = Math.min(4, len);
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const idx = (suggestionOffset + i) % len;
      result.push(list[idx]);
    }
    return result;
  };

  const handleShuffleSuggestions = () => {
    playSound('pop', soundEnabled);
    setSuggestionOffset(prev => prev + 2);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    // بررسی سهمیه هوش مصنوعی
    const quota = checkAiQuota(profile);
    if (!quota.allowed) {
      playSound('wrong', soundEnabled);
      const limitMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'tutor',
        text: 'عزیزم! سهمیه ۳ سوال رایگان امروزت تمام شده است. 🌟 برای حل نامحدود تکالیف و پرسیدن همه سوالات با استاد دانا، می‌تونی اشتراک طلایی تهیه کنی یا بسته ۵۰ سوالی بگیری! 🦉💎',
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, limitMsg]);
      onOpenSubscription();
      return;
    }

    playSound('click', soundEnabled);
    setInput('');

    // ثبت کسر سهمیه
    const updatedProf = consumeAiQuota(profile);
    onUpdateProfile(updatedProf);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const historyForApi = messages.slice(-MAX_HISTORY_MESSAGES).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      let replyText = '';

      try {
        const res = await fetch('/api/tutor/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: query, 
            history: historyForApi,
            userId: profile.phoneNumber || 'guest_student'
          }),
        });

        if (res.status === 402) {
          const data = await res.json().catch(() => ({}));
          if (data.code === 'QUOTA_EXCEEDED') {
            playSound('wrong', soundEnabled);
            const limitMsg: ChatMessage = {
              id: Date.now().toString(),
              sender: 'tutor',
              text: 'عزیزم! سهمیه سوالات رایگان امروز روی سرور تمام شده است. 🌟 برای ادامه پرسش و پاسخ نامحدود با استاد دانا، می‌تونی اشتراک طلایی تهیه کنی یا بسته سوال اضافه بگیری! 🦉💎',
              timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, limitMsg]);
            onOpenSubscription();
            setLoading(false);
            return;
          }
        }

        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.text) {
            replyText = data.text;
          }
        }
      } catch (e) {
        // Fallback handled below
      }

      if (!replyText) {
        replyText = generateFallbackTutorResponse(query);
      }

      const tutorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'tutor',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, tutorMsg]);
      playSound('star', soundEnabled);
      onAddStars(1);
      onIncrementSolved();

    } catch (err: any) {
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'tutor',
        text: generateFallbackTutorResponse(query),
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (catId: string) => {
    playSound('click', soundEnabled);
    const cat = dynamicCategories.find(c => c.id === catId) || dynamicCategories[0];
    if (!cat || !cat.questions || cat.questions.length === 0) return;
    const shuffled = [...cat.questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    setQuizCategory(catId);
    setQuizQuestions(selected);
    setCurrentQuizIndex(0);
    setQuizUserAnswer('');
    setQuizAnswersList([]);
    setQuizStep('active');
  };

  const handleNextQuizQuestion = () => {
    if (!quizUserAnswer.trim()) return;
    playSound('click', soundEnabled);
    const updatedList = [...quizAnswersList, { question: quizQuestions[currentQuizIndex], answer: quizUserAnswer.trim() }];
    setQuizAnswersList(updatedList);
    setQuizUserAnswer('');

    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizStep('results');
      playSound('star', soundEnabled);
      onAddStars(5);
      onIncrementSolved();
    }
  };

  // Function to render text and graphical SVG inside chat bubbles
  const renderMessageBody = (text: string) => {
    const svgRegex = /(<svg[\s\S]*?<\/svg>)/g;
    const parts = text.split(svgRegex);

    return parts.map((part, index) => {
      const trimmed = part.trim();
      if (trimmed.startsWith('<svg') && trimmed.endsWith('</svg>')) {
        const cleanSvg = DOMPurify.sanitize(trimmed, { 
          USE_PROFILES: { svg: true, svgFilters: true } 
        });
        return (
          <div key={index} className="my-3 flex justify-center bg-white/90 p-3 rounded-2xl border-2 border-purple-200 shadow-xs overflow-x-auto">
            <div dangerouslySetInnerHTML={{ __html: cleanSvg }} />
          </div>
        );
      }
      return <span key={index} className="whitespace-pre-line">{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-100px)] sm:h-[calc(100dvh-110px)] max-w-5xl mx-auto space-y-2 dir-rtl">
      {/* Sleek Thin Header Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-[#A29BFE] p-2 sm:p-3 shadow-xs flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FF6B6B] border-2 border-white flex items-center justify-center text-xl shadow-xs shrink-0 animate-bounce">
            🦉
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <h2 className="font-black text-[#2D3436] text-sm sm:text-base truncate">
              استاد دانا
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              آنلاین
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* AI Quota Indicator */}
          {aiQuota.isVip ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black shadow-xs">
              <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
              <span className="hidden sm:inline">طلایی (نامحدود)</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                playSound('pop', soundEnabled);
                onOpenSubscription();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black transition-all cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>{aiQuota.remainingDaily} از ۳ رایگان</span>
            </button>
          )}

          {/* Toggle Suggested Questions Panel */}
          <button
            onClick={() => setIsSuggestionsOpen(!isSuggestionsOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
              isSuggestionsOpen 
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs' 
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>پیشنهاد سوال</span>
            {isSuggestionsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* New Chat Button */}
          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl text-xs font-black bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer flex items-center gap-1"
            title="گفتگوی جدید"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden md:inline">جدید</span>
          </button>
        </div>
      </div>

      {saveNotification && (
        <div className="bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-2xl shadow-md text-center animate-in fade-in flex items-center justify-center gap-2">
          <span>{saveNotification}</span>
        </div>
      )}

      {/* Collapsible Suggestion Panel */}
      {isSuggestionsOpen && (
        <div className="bg-white/95 border-2 border-amber-200 rounded-2xl p-3 shadow-md space-y-3 shrink-0 transition-all animate-in fade-in duration-150">
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {dynamicCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setSelectedCatId(cat.id);
                    setSuggestionOffset(0);
                  }}
                  className={`text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                    selectedCatId === cat.id
                      ? 'bg-amber-500 text-amber-950 border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleShuffleSuggestions}
              className="text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-xl border border-indigo-200 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تازه کردن 🎲</span>
            </button>
          </div>

          {/* Touchable Large Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {getDisplayedQuestions().map((q, idx) => (
              <button
                key={`${selectedCatId}-${suggestionOffset}-${idx}`}
                onClick={() => {
                  handleSendMessage(q);
                  setIsSuggestionsOpen(false);
                }}
                disabled={loading}
                className="text-xs sm:text-sm bg-amber-50 hover:bg-amber-400 text-amber-950 font-bold px-3.5 py-2 rounded-xl border border-amber-300 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Messages Viewport (Takes Full Remaining Space) */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-white/90 border-2 sm:border-3 border-[#A29BFE] rounded-2xl sm:rounded-3xl p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-sm overscroll-contain font-sans"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`flex items-start gap-2 sm:gap-3 max-w-[96%] sm:max-w-[88%] ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}>
              {/* Avatar */}
              <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center text-sm sm:text-lg shrink-0 shadow-2xs border-2 ${
                msg.sender === 'user' 
                  ? 'bg-[#74B9FF] border-white text-white' 
                  : 'bg-[#FF6B6B] border-white text-white animate-bounce'
              }`}>
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /> : '🦉'}
              </div>

              {/* Message Bubble */}
              <div className={`p-3 sm:p-4 text-xs sm:text-[15px] leading-relaxed shadow-2xs ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-br from-[#6C5CE7] to-[#5843E0] text-white rounded-2xl rounded-tr-none shadow-[0_2px_0_0_#4834D4] font-semibold'
                  : 'bg-white text-[#2D3436] border-2 border-[#D8D4FD] rounded-2xl rounded-tl-none font-normal'
              }`}>
                {/* Body Text & SVG Rendering */}
                <div className="dir-rtl leading-relaxed font-sans">
                  {renderMessageBody(msg.text)}
                </div>

                {msg.sender === 'tutor' && <button onClick={() => saveQuestionLocally({ id: `ai_${Date.now()}`, text: msg.text.substring(0,80), difficulty: 'medium', tags: ['ai'], isAiGenerated: true })} className="mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300">💾 ذخیره سوال</button>}

                {/* Footer Controls for AI Message */}
                {msg.sender === 'tutor' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-400">
                    <span className="font-bold text-slate-400">{msg.timestamp}</span>

                    <div className="flex items-center gap-1">
                      {/* Save Question Button */}
                      <button
                        onClick={() => handleSaveQuestion(msg.text)}
                        className="px-2 py-1 rounded-lg font-bold hover:bg-emerald-50 text-emerald-700 border border-emerald-200 transition-all cursor-pointer flex items-center gap-1 text-[10px]"
                        title="ذخیره این سوال در بانک سوالات من"
                      >
                        <span>💾</span>
                        <span>ذخیره سوال</span>
                      </button>

                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        title="کپی پاسخ"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-[#FF6B6B] border-2 border-white text-white flex items-center justify-center text-sm sm:text-base animate-bounce shadow-2xs shrink-0">
              🦉
            </div>
            <div className="bg-white border-2 border-[#D8D4FD] rounded-2xl rounded-tl-none p-2.5 sm:p-3.5 shadow-2xs flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#6C5CE7] animate-ping"></span>
                <span className="w-2 h-2 rounded-full bg-[#A29BFE] animate-ping delay-100"></span>
                <span className="w-2 h-2 rounded-full bg-[#FF7675] animate-ping delay-200"></span>
              </div>
              <span className="text-xs font-bold text-[#6C5CE7]">استاد دانا در حال فکر کردن و طراحی شکل است... 💭📐</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sleek Input Controls Bar */}
      <div className="bg-white p-2 sm:p-3 border-2 sm:border-3 border-[#A29BFE] rounded-2xl sm:rounded-3xl shadow-sm shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-1.5 sm:gap-2"
        >
          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="سؤال، تمرین یا هر مبحث ریاضی که می‌خواهی بپرس..."
            className="flex-1 min-w-0 bg-[#F4F5FA] border border-slate-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-[#2D3436] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] transition-all dir-rtl min-h-[40px] sm:min-h-[44px]"
            disabled={loading}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-[#6C5CE7] hover:bg-[#5843E0] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black px-3.5 sm:px-5 py-2 sm:py-3 rounded-xl shadow-[0_2px_0_0_#4834D4] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:shadow-none min-h-[40px] sm:min-h-[44px]"
          >
            <span className="text-xs sm:text-sm">بپرس</span>
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-180" />
          </button>
        </form>
      </div>

      {/* Quick Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-indigo-300 w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 dir-rtl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <h3 className="font-black text-lg text-indigo-900">آزمون سریع ریاضی سوم</h3>
              </div>
              <button
                onClick={() => setShowQuizModal(false)}
                className="p-1 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quizStep === 'selecting' && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-600">
                  لطفاً مبحث مورد نظر خود را برای آزمون ۵ سوالی انتخاب کنید:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {dynamicCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleStartQuiz(cat.id)}
                      className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-500 hover:text-white text-indigo-900 border-2 border-indigo-200 transition-all font-bold text-xs flex items-center gap-2 cursor-pointer shadow-2xs group"
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizStep === 'active' && quizQuestions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl">
                  <span>سوال {currentQuizIndex + 1} از {quizQuestions.length}</span>
                  <span>🏆 آزمون هوشمند</span>
                </div>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-sm font-black text-amber-950">
                  {quizQuestions[currentQuizIndex]}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">پاسخ خود را بنویسید:</label>
                  <input
                    type="text"
                    value={quizUserAnswer}
                    onChange={(e) => setQuizUserAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNextQuizQuestion();
                    }}
                    placeholder="جواب خود را اینجا بنویسید..."
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuizQuestion}
                    disabled={!quizUserAnswer.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-black px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:shadow-none"
                  >
                    {currentQuizIndex + 1 === quizQuestions.length ? 'پایان و مشاهده نتیجه 🎉' : 'سوال بعدی ⬅️'}
                  </button>
                </div>
              </div>
            )}

            {quizStep === 'results' && (
              <div className="space-y-5 text-center py-4">
                <div className="w-16 h-16 bg-amber-100 border-4 border-amber-300 rounded-full flex items-center justify-center text-3xl mx-auto animate-bounce">
                  🏆
                </div>
                <div>
                  <h4 className="text-xl font-black text-indigo-950">آزمون به پایان رسید!</h4>
                  <p className="text-sm font-medium text-slate-600 mt-1">
                    آفرین قهرمان! شما به ۵ سوال از مبحث مورد نظر پاسخ دادید و ۵ ستاره پاداش گرفتید! ⭐
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 max-h-48 overflow-y-auto space-y-2 text-right">
                  {quizAnswersList.map((item, idx) => (
                    <div key={idx} className="text-xs border-b border-slate-200 pb-2">
                      <p className="font-bold text-indigo-900">{idx + 1}. {item.question}</p>
                      <p className="text-emerald-700 font-medium mt-0.5">پاسخ شما: {item.answer}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-center pt-2">
                  <button
                    onClick={() => setQuizStep('selecting')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer text-xs"
                  >
                    انتخاب مبحث دیگر 🔄
                  </button>
                  <button
                    onClick={() => setShowQuizModal(false)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer text-xs"
                  >
                    بازگشت به گفتگو 🌟
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
