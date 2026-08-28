import React, { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { ChatMessage } from '../types';
import { playSound } from '../utils/sound';
import { speakPersianText, stopPersianSpeech } from '../utils/speech';
import { generateFallbackTutorResponse } from '../utils/tutorFallback';
import { 
  Send, 
  User, 
  RefreshCw, 
  Lightbulb, 
  Star, 
  Mic, 
  MicOff,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Smile
} from 'lucide-react';

interface AITutorChatProps {
  soundEnabled: boolean;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
}

interface QuestionCategory {
  id: string;
  name: string;
  icon: string;
  questions: string[];
}

const QUESTION_CATEGORIES: QuestionCategory[] = [
  {
    id: 'all',
    name: 'همه مباحث',
    icon: '🌟',
    questions: [
      'جدول ضرب ۶ را با مثال یاد بده ✖️',
      'چطور محیط و مساحت مستطیل رو حساب کنم؟ 📐',
      'کسر سه چهارم یعنی چی؟ 🍕',
      'تفاوت ریال و تومان چیه؟ 💰',
      'الگوی ۵، ۱۰، ۱۵ چجوری جلو میره؟ 🔢',
      'جمع ۴ رقمی با جدول ارزش مکانی چطوری انجام میشه؟ 🧮',
      'ساعت ۱۷:۳۰ دقیقه یعنی ساعت چند؟ ⏰',
      'تقسیم ۱۲ بر ۳ رو با شکل نشون بده ➗',
      'مساحت مربع ۵ سانتی‌متری چقدر میشه؟ ⬛'
    ]
  },
  {
    id: 'multiplication',
    name: 'ضرب و تقسیم',
    icon: '✖️',
    questions: [
      'جدول ضرب ۷ و ۸ رو چطور زود حفظ بشم؟ ✖️',
      'خاصیت جابجایی در ضرب یعنی چی؟ 🔄',
      'تقسیم ۲۰ بر ۴ یعنی چی؟ ➗',
      'فرق ضرب و جمع تکراری چیه؟ ➕',
      'ضرب در ۱۰ و ۱۰۰ چطور سریع انجام میشه؟ 🚀'
    ]
  },
  {
    id: 'fractions_geometry',
    name: 'کسر و هندسه',
    icon: '🍕',
    questions: [
      'کسر دو سوم بزرگتره یا دو پنجم؟ 🍕',
      'محیط مثلث متساوی‌الاضلاع با ضلع ۶ چقدره؟ 📐',
      'تفاوت محیط و مساحت چیه؟ 🖼️',
      'زاویه تند و باز چه فرقی دارن؟ 📐',
      'کسرهای مساوی یعنی چی؟ ⚖️'
    ]
  },
  {
    id: 'money_numbers',
    name: 'پول و ۴رقمی',
    icon: '💰',
    questions: [
      'تفاوت ریال و تومان چیه؟ 💰',
      'عدد ۵۴۳۲ چند تا هزارتایی و صدتایی داره؟ 🔢',
      'جمع ۴ رقمی با تکنیک انتقال چطوریه؟ 🧮',
      'تقریب زدن اعداد به نزدیک‌ترین دهتایی 🎯'
    ]
  },
  {
    id: 'time_patterns',
    name: 'ساعت و الگو',
    icon: '⏰',
    questions: [
      'ساعت ۱۵:۴۵ دقیقه به وقت بعدازظهر چنده؟ ⏰',
      'نیم ساعت و ربع ساعت چند دقیقه میشه؟ ⏱️',
      'الگوی ۶، ۱۲، ۱۸، ۲۴ رو ادامه بده 📈',
      'شانس آمدن رنگ قرمز در چرخنده 🎡'
    ]
  }
];

const STORAGE_KEY = 'ostad_dana_chat_history_v2';
const MAX_LOCALSTORAGE_MESSAGES = 100;
const MAX_HISTORY_MESSAGES = 20;

export const AITutorChat: React.FC<AITutorChatProps> = ({ soundEnabled, onAddStars, onIncrementSolved }) => {
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
        text: 'سلام قهرمان ریاضی! 🌟🖐️ من «استاد دانا» هستم، معلم صبور و مهربان ریاضی سوم دبستان. هر سوال، تمرین یا مبحثی که برات سخته بپرس تا با شکل و مثال‌های پیتزایی و شکلاتی با هم حلش کنیم! 😊🍕\n\nبیا این کسر سه چهارم رو با هم ببینیم:\n<svg width="140" height="140" viewBox="0 0 120 120" style="margin: 0 auto; display: block;"><circle cx="60" cy="60" r="50" fill="white" stroke="#333" stroke-width="2"/><path d="M60,60 L60,10 A50,50 0 0,1 110,60 L60,60 Z" fill="#FF6B6B"/><path d="M60,60 L110,60 A50,50 0 0,1 60,110 L60,60 Z" fill="#FF6B6B"/><path d="M60,60 L60,110 A50,50 0 0,1 10,60 L60,60 Z" fill="#FF6B6B"/><path d="M60,60 L10,60 A50,50 0 0,1 60,10 L60,60 Z" fill="#FFEAA7"/><line x1="60" y1="10" x2="60" y2="110" stroke="#333" stroke-width="1.5"/><line x1="10" y1="60" x2="110" y2="60" stroke="#333" stroke-width="1.5"/></svg>',
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [suggestionOffset, setSuggestionOffset] = useState<number>(0);

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

  // Voice recognition (Web Speech API)
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
      if (isFirefox) {
        alert('🎤 ورودی صوتی در Firefox پشتیبانی نمی‌شود.\n\nلطفاً از Chrome یا Safari استفاده کنید.');
      } else {
        alert('🎤 مرورگر شما از ورودی صوتی پشتیبانی نمی‌کند.\n\nلطفاً از Chrome یا Safari استفاده کنید.');
      }
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fa-IR';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'no-speech') {
          alert('صدایی شنیده نشد. لطفاً دوباره تلاش کنید.');
        } else if (event.error === 'audio-capture') {
          alert('میکروفون یافت نشد. لطفاً میکروفون را بررسی کنید.');
        } else if (event.error === 'not-allowed') {
          alert('دسترسی به میکروفون رد شد. لطفاً در تنظیمات مرورگر اجازه دهید.');
        }
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
        }
      };
      
      recognition.start();
    } catch (e) {
      setIsListening(false);
      alert('خطا در راه‌اندازی ورودی صوتی. لطفاً دوباره تلاش کنید.');
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playSound('pop', soundEnabled);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakText = (id: string, text: string) => {
    if (speakingId === id) {
      stopPersianSpeech();
      setSpeakingId(null);
      return;
    }

    setSpeakingId(id);
    // Strip out SVG code for text-to-speech
    const cleanText = text.replace(/<svg[\s\S]*?<\/svg>/g, ' [شکل هندسی یا آموزشی] ');
    speakPersianText(
      cleanText,
      undefined,
      () => setSpeakingId(null),
      () => setSpeakingId(null)
    );
  };

  const handleClearChat = () => {
    playSound('pop', soundEnabled);
    stopPersianSpeech();
    setSpeakingId(null);
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

  const activeCategory = QUESTION_CATEGORIES.find(c => c.id === selectedCatId) || QUESTION_CATEGORIES[0];
  
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

    playSound('click', soundEnabled);
    setInput('');
    stopPersianSpeech();
    setSpeakingId(null);

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
          body: JSON.stringify({ prompt: query, history: historyForApi }),
        });

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
    <div className="flex flex-col h-[calc(100dvh-130px)] sm:h-[calc(100dvh-140px)] min-h-[480px] max-w-5xl mx-auto space-y-2 dir-rtl">
      {/* Sleek Compact Header Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-[#A29BFE] p-2.5 sm:p-3.5 shadow-xs flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#FF6B6B] border-2 border-white flex items-center justify-center text-xl sm:text-2xl shadow-xs shrink-0">
            🦉
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-black text-[#2D3436] text-xs sm:text-base truncate">
                استاد دانا (معلم هوشمند ریاضی)
              </h2>
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded-full font-bold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                آنلاین
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
              تدریس مفهومی با شکل SVG، مثال‌های ملموس و جدول
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Toggle Suggested Questions */}
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black border transition-all cursor-pointer flex items-center gap-1 ${
              showSuggestions 
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs' 
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="نمایش یا بستن سوالات آماده برای فضای بیشتر"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">سوالات آماده</span>
            {showSuggestions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* New Chat / Clear History Button */}
          <button
            onClick={handleClearChat}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer flex items-center gap-1"
            title="پاک کردن تاریخچه و شروع گفتگوی جدید"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">گفتگوی جدید</span>
          </button>
        </div>
      </div>

      {/* Collapsible Slim Suggestions Bar */}
      {showSuggestions && (
        <div className="bg-white/95 border-2 border-amber-200/80 rounded-2xl p-2 shadow-2xs space-y-1.5 shrink-0 transition-all animate-in fade-in duration-150">
          {/* Categories Horizontal Scroll */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {QUESTION_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setSelectedCatId(cat.id);
                    setSuggestionOffset(0);
                  }}
                  className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 border ${
                    selectedCatId === cat.id
                      ? 'bg-amber-500 text-amber-950 border-amber-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleShuffleSuggestions}
              className="text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-lg border border-indigo-200 transition-all cursor-pointer flex items-center gap-1 shrink-0"
              title="تغییر نمونه سوالات"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">تازه کردن 🎲</span>
            </button>
          </div>

          {/* Quick Question Chips Carousel (Single Compact Row) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {getDisplayedQuestions().map((q, idx) => (
              <button
                key={`${selectedCatId}-${suggestionOffset}-${idx}`}
                onClick={() => handleSendMessage(q)}
                disabled={loading}
                className="text-[10px] sm:text-xs bg-amber-50/80 hover:bg-amber-400 text-amber-900 font-bold px-2.5 py-1 rounded-xl border border-amber-200 hover:border-amber-400 whitespace-nowrap transition-all shadow-2xs cursor-pointer disabled:opacity-50 shrink-0"
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
                  : 'bg-[#FF6B6B] border-white text-white'
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

                {/* Footer Controls for AI Message */}
                {msg.sender === 'tutor' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-400">
                    <span className="font-bold text-slate-400">{msg.timestamp}</span>

                    <div className="flex items-center gap-1">
                      {/* Audio Read-aloud button */}
                      <button
                        onClick={() => handleSpeakText(msg.id, msg.text)}
                        className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          speakingId === msg.id
                            ? 'bg-[#6C5CE7] text-white animate-pulse'
                            : 'hover:bg-purple-50 text-[#6C5CE7] border border-purple-200'
                        }`}
                        title="خواندن صوتی متن"
                      >
                        {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{speakingId === msg.id ? 'توقف صوت' : 'پخش صوتی'}</span>
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
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-2.5 sm:p-3 rounded-xl border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] ${
              isListening 
                ? 'bg-rose-500 border-rose-600 text-white animate-pulse' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title={isListening ? 'در حال شنیدن صدای شما (فارسی)...' : 'پرسیدن با صدا (میکروفون)'}
          >
            {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-[#6C5CE7]" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'در حال شنیدن صدای شما... صحبت کنید 🎤' : 'سؤال، تمرین یا هر مبحث ریاضی که می‌خواهی بپرس...'}
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
    </div>
  );
};
