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
import { checkAiQuota, consumeAiQuota, FREE_DAILY_AI_LIMIT } from '../utils/subscriptionManager';
import { ReportButton } from './ReportButton';
import ostadDanaEmblem from '../assets/images/ostad_dana_emblem_1795466544643.jpg';

interface AITutorChatProps {
  soundEnabled: boolean;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onOpenSubscription: () => void;
  externalPrompt?: { id: string; text: string } | null;
  onExternalPromptConsumed?: () => void;
}

interface QuestionCategory {
  id: string;
  name: string;
  icon: string;
  questions: string[];
}

const STORAGE_KEY = 'ostad_dana_chat_history_v2';
const MAX_LOCALSTORAGE_MESSAGES = 100;
const MAX_HISTORY_MESSAGES = 6;

export const AITutorChat: React.FC<AITutorChatProps> = ({ 
  soundEnabled, 
  onAddStars, 
  onIncrementSolved,
  profile,
  onUpdateProfile,
  onOpenSubscription,
  externalPrompt,
  onExternalPromptConsumed,
}) => {
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);
  const [totalQ, setTotalQ] = useState(0);
  const aiQuota = checkAiQuota(profile);
  const lastHandledPromptIdRef = useRef<string | null>(null);

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
        text: `عزیزم! سهمیه ${FREE_DAILY_AI_LIMIT} سوال رایگان امروزت تمام شده است. 🌟 برای حل نامحدود تکالیف و پرسیدن همه سوالات با استاد دانا، می‌تونی اشتراک طلایی تهیه کنی یا بسته ۵۰ سوالی بگیری! 🦉💎`,
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
          .replace(/<svg[\s\S]*?<\/svg>/gi, '[شکل آموزشی]')
          .trim()
          .slice(0, 400)
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

        if (res.status === 402 || res.status === 429) {
          const data = await res.json().catch(() => ({}));
          if (data.code === 'QUOTA_EXCEEDED' || res.status === 429) {
            playSound('wrong', soundEnabled);
            const limitMsg: ChatMessage = {
              id: Date.now().toString(),
              sender: 'tutor',
              text:
                data.error ||
                'عزیزم! سهمیه سوالات رایگان امروز روی سرور تمام شده است. 🌟 برای ادامه پرسش و پاسخ نامحدود با استاد دانا، می‌تونی اشتراک طلایی تهیه کنی یا بسته سوال اضافه بگیری! 🦉💎',
              timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, limitMsg]);
            if (data.code === 'QUOTA_EXCEEDED') {
              onOpenSubscription();
            }
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

  useEffect(() => {
    if (
      externalPrompt &&
      externalPrompt.id !== lastHandledPromptIdRef.current &&
      externalPrompt.text.trim()
    ) {
      lastHandledPromptIdRef.current = externalPrompt.id;
      handleSendMessage(externalPrompt.text);
      onExternalPromptConsumed?.();
    }
  }, [externalPrompt]);

  return (
    <div className="clay-card flex flex-col h-[540px] sm:h-[600px] min-h-0 max-w-4xl w-full mx-auto overflow-hidden dir-rtl">
      {/* Warm Soft Chat Toolbar */}
      <div className="px-3.5 sm:px-5 py-3 border-b border-amber-100/80 bg-[#FFFDF7] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF9E5] border border-amber-200/80 shadow-[0_6px_14px_-6px_rgba(120,82,40,0.25),inset_0_1px_0_#fff] overflow-hidden shrink-0">
            <img
              src={ostadDanaEmblem}
              alt="استاد دانا"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover scale-105"
            />
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <h2 className="font-extrabold text-[#26354D] text-sm sm:text-base truncate">
              استاد دانا
            </h2>
            <span className="text-xs text-amber-900/55 font-medium hidden sm:inline whitespace-nowrap">
              · آماده پاسخگویی
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {aiQuota.isVip ? (
            <div className="clay-soft flex items-center gap-1 px-3 py-1.5 text-amber-900 text-xs font-bold whitespace-nowrap">
              <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-400 shrink-0" />
              <span className="hidden sm:inline">طلایی</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                playSound('pop', soundEnabled);
                onOpenSubscription();
              }}
              className="clay-soft flex items-center gap-1 px-3 py-1.5 hover:bg-amber-50 text-amber-900 text-xs font-bold transition-all cursor-pointer whitespace-nowrap tabular-nums min-h-[36px]"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{aiQuota.remainingDaily} از {FREE_DAILY_AI_LIMIT} رایگان</span>
            </button>
          )}

          {/* Toggle Suggested Questions Panel */}
          <button
            type="button"
            onClick={() => setIsSuggestionsOpen(!isSuggestionsOpen)}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap min-h-[36px] ${
              isSuggestionsOpen
                ? 'clay-btn-primary'
                : 'clay-soft text-[#26354D] hover:bg-amber-50/70'
            }`}
          >
            <Lightbulb className={`w-3.5 h-3.5 shrink-0 ${isSuggestionsOpen ? 'text-amber-300' : 'text-amber-600'}`} />
            <span>پیشنهاد سوال</span>
            {isSuggestionsOpen ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
          </button>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleClearChat}
            className="clay-soft px-3 py-1.5 rounded-2xl text-xs font-bold hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap min-h-[36px]"
            title="گفتگوی جدید"
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">جدید</span>
          </button>
        </div>
      </div>

      {saveNotification && (
        <div className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 text-center shrink-0">
          {saveNotification}
        </div>
      )}

      {/* Collapsible Suggestion Panel */}
      {isSuggestionsOpen && (
        <div className="bg-[#FAF3E6]/90 border-b border-amber-200/60 p-3.5 sm:px-5 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {dynamicCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setSelectedCatId(cat.id);
                    setSuggestionOffset(0);
                  }}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-2xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCatId === cat.id
                      ? 'clay-btn-primary'
                      : 'clay-soft text-[#26354D] hover:bg-white'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleShuffleSuggestions}
              className="clay-soft text-xs font-bold hover:bg-white text-[#26354D] px-3.5 py-1.5 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              <span>تازه کردن</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {getDisplayedQuestions().map((q, idx) => (
              <button
                key={`${selectedCatId}-${suggestionOffset}-${idx}`}
                type="button"
                onClick={() => {
                  handleSendMessage(q);
                  setIsSuggestionsOpen(false);
                }}
                disabled={loading}
                className="clay-soft text-xs sm:text-sm hover:bg-[#FFF3D6] text-[#26354D] font-bold px-4 py-2 rounded-2xl transition-all cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Soft Recessed Chat Messages Viewport */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3.5 sm:px-6 py-4 sm:py-5 space-y-4 bg-[#FAF4E8]/65 shadow-[inset_0_3px_10px_rgba(120,82,40,0.05)] overscroll-contain font-sans"
      >
        {messages.map((msg, index) => {
          const prevUserMsg = messages
            .slice(0, index)
            .reverse()
            .find(m => m.sender === 'user');
          const promptQuestion = prevUserMsg ? prevUserMsg.text : 'سوال کاربر';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex items-start gap-2.5 max-w-[94%] sm:max-w-[82%] ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}>
                {/* Avatar */}
                {msg.sender === 'user' ? (
                  <div className="w-8 h-8 rounded-2xl bg-white border border-amber-200/70 shadow-[0_6px_14px_-6px_rgba(120,82,40,0.2)] flex items-center justify-center shrink-0 text-[#26354D] mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-2xl bg-[#FFF9E5] border border-amber-200/80 shadow-[0_6px_14px_-6px_rgba(120,82,40,0.24)] overflow-hidden shrink-0 mt-0.5">
                    <img
                      src={ostadDanaEmblem}
                      alt="استاد دانا"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover scale-105"
                    />
                  </div>
                )}

                {/* Soft Clay Message Bubble */}
                <div className={`px-4 py-3 sm:px-5 sm:py-3.5 text-xs sm:text-[15px] leading-7 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-b from-[#314563] to-[#23334B] text-[#FFFBF2] rounded-[1.5rem] rounded-tl-md shadow-[0_10px_22px_-10px_rgba(34,50,74,0.45),inset_0_1px_0_rgba(255,255,255,0.16)] font-medium'
                    : 'bg-white text-[#26354D] border border-amber-100/90 rounded-[1.5rem] rounded-tr-md shadow-[0_10px_24px_-12px_rgba(120,82,40,0.16),inset_0_1px_0_#ffffff] font-normal'
                }`}>
                  {/* Body Text & SVG Rendering */}
                  <div className="dir-rtl leading-7 font-sans">
                    {renderMessageBody(msg.text)}
                  </div>

                  {/* Footer Controls for AI Message */}
                  {msg.sender === 'tutor' && (
                    <div className="mt-2.5 pt-2 border-t border-amber-100/80 flex items-center justify-between gap-2 text-xs text-slate-400">
                      <span className="font-medium text-amber-900/45 tabular-nums">{msg.timestamp}</span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <ReportButton
                          sessionId="ostad_dana_session"
                          messageId={msg.id}
                          question={promptQuestion}
                          aiResponse={msg.text}
                          userId={profile.phoneNumber || 'guest_student'}
                        />

                        <button
                          type="button"
                          onClick={() => handleSaveQuestion(msg.text)}
                          className="px-2.5 py-1 rounded-xl font-bold bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200/70 transition-colors cursor-pointer flex items-center gap-1 text-[11px] whitespace-nowrap"
                          title="ذخیره این سوال در بانک سوالات من"
                        >
                          <span>ذخیره سوال</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="p-1.5 hover:bg-amber-50 rounded-xl text-slate-500 hover:text-[#26354D] transition-colors cursor-pointer"
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
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#FFF9E5] border border-amber-200/80 shadow-[0_6px_14px_-6px_rgba(120,82,40,0.24)] overflow-hidden shrink-0">
              <img
                src={ostadDanaEmblem}
                alt="استاد دانا"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover scale-105"
              />
            </div>
            <div className="bg-white border border-amber-100/90 shadow-[0_8px_20px_-10px_rgba(120,82,40,0.14)] rounded-[1.5rem] rounded-tr-md px-4 py-3 flex items-center gap-2.5">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              </div>
              <span className="text-xs font-bold text-amber-900/75">استاد دانا در حال فکر کردن و طراحی شکل است...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Soft Recessed Input Bar */}
      <div className="bg-[#FFFDF8] px-3 py-2.5 sm:px-4 sm:py-3.5 border-t border-amber-100/80 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="clay-inset flex items-center gap-2 p-1.5 transition-all focus-within:ring-2 focus-within:ring-amber-300/80"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="سؤال، تمرین یا هر مبحث ریاضی که می‌خواهی بپرس..."
            className="flex-1 min-w-0 bg-transparent px-3.5 py-2 text-xs sm:text-sm font-medium text-[#26354D] placeholder-amber-900/40 focus:outline-none dir-rtl min-h-[42px]"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="clay-btn-primary disabled:opacity-45 disabled:shadow-none font-bold px-4 sm:px-5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 min-h-[42px] whitespace-nowrap"
          >
            <span className="text-xs sm:text-sm">بپرس</span>
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-180" />
          </button>
        </form>
      </div>

      {/* Quick Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-[#26354D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="clay-card w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 dir-rtl">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <h3 className="font-extrabold text-lg text-[#26354D]">آزمون سریع ریاضی سوم</h3>
              </div>
              <button
                onClick={() => setShowQuizModal(false)}
                className="p-1.5 rounded-full clay-soft hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quizStep === 'selecting' && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-600">
                  لطفاً مبحث مورد نظر خود را برای آزمون ۵ سوالی انتخاب کنید:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {dynamicCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleStartQuiz(cat.id)}
                      className="clay-soft p-3 hover:bg-amber-50 text-[#26354D] transition-all font-bold text-xs flex items-center gap-2 cursor-pointer group"
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
                <div className="flex items-center justify-between text-xs font-bold text-amber-900 bg-amber-100/70 px-3 py-1.5 rounded-xl">
                  <span>سوال {currentQuizIndex + 1} از {quizQuestions.length}</span>
                  <span>🏆 آزمون هوشمند</span>
                </div>

                <div className="clay-inset rounded-2xl p-4 text-sm font-extrabold text-[#26354D]">
                  {quizQuestions[currentQuizIndex]}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#26354D]">پاسخ خود را بنویسید:</label>
                  <input
                    type="text"
                    value={quizUserAnswer}
                    onChange={(e) => setQuizUserAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNextQuizQuestion();
                    }}
                    placeholder="جواب خود را اینجا بنویسید..."
                    className="clay-inset w-full rounded-xl px-4 py-3 text-sm font-medium text-[#26354D] focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuizQuestion}
                    disabled={!quizUserAnswer.trim()}
                    className="clay-btn-primary disabled:opacity-45 disabled:shadow-none font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    {currentQuizIndex + 1 === quizQuestions.length ? 'پایان و مشاهده نتیجه 🎉' : 'سوال بعدی ⬅️'}
                  </button>
                </div>
              </div>
            )}

            {quizStep === 'results' && (
              <div className="space-y-5 text-center py-4">
                <div className="w-16 h-16 clay-btn-warm rounded-2xl flex items-center justify-center text-3xl mx-auto">
                  🏆
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-[#26354D]">آزمون به پایان رسید!</h4>
                  <p className="text-sm font-medium text-slate-600 mt-1">
                    آفرین قهرمان! شما به ۵ سوال از مبحث مورد نظر پاسخ دادید و ۵ ستاره پاداش گرفتید! ⭐
                  </p>
                </div>

                <div className="clay-inset rounded-2xl p-3 max-h-48 overflow-y-auto space-y-2 text-right">
                  {quizAnswersList.map((item, idx) => (
                    <div key={idx} className="text-xs border-b border-amber-100 pb-2">
                      <p className="font-bold text-[#26354D]">{idx + 1}. {item.question}</p>
                      <p className="text-emerald-700 font-medium mt-0.5">پاسخ شما: {item.answer}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-center pt-2">
                  <button
                    onClick={() => setQuizStep('selecting')}
                    className="clay-soft hover:bg-white text-[#26354D] font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer text-xs"
                  >
                    انتخاب مبحث دیگر 🔄
                  </button>
                  <button
                    onClick={() => setShowQuizModal(false)}
                    className="clay-btn-primary font-bold px-6 py-2.5 rounded-xl cursor-pointer text-xs"
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
