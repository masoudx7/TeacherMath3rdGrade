import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { playSound } from '../utils/sound';
import { generateFallbackTutorResponse } from '../utils/tutorFallback';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  RefreshCw, 
  Lightbulb, 
  CheckCircle2, 
  Star, 
  Mic, 
  MicOff,
  Copy,
  Check
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
      'زاویه راست، تند و باز چه فرقی دارن؟ 📐',
      'ساعت ۱۷:۳۰ دقیقه یعنی ساعت چند؟ ⏰',
      'چطور دو کسر با مخرج برابر رو مقایسه کنم؟ ⚖️',
      'تقسیم ۱۲ بر ۳ رو با شکل نشون بده ➗',
      'ماشین ورودی و خروجی چطور کار میکنه؟ ⚙️',
      'نمودار ستونی و جدول داده‌ها چیه؟ 📊',
      'خواص صفر و یک در ضرب چیه؟ 0️⃣',
      'چطور ضرب ۴ × ۳۰ رو ذهنی حساب کنم؟ 🧠',
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
      'ضرب در ۱۰ و ۱۰۰ چطور سریع انجام میشه؟ 🚀',
      'روش ساخت مستطیل برای ضرب چیه؟ 🧱',
      'معنای عبارت ۵ دسته‌ی ۴ تایی چیه؟ 🖐️',
      'چطور حاصل ضرب ۷ × ۶ رو با رسم شکل پیدا کنم؟ 🎨'
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
      'چطور کسر یک دوم را روی شکل و خط‌کش بکشم؟ 📏',
      'تفاوت متوازی‌الاضلاع و ذوزنقه چیست؟ 🔷',
      'زاویه تند یعنی زاویه کمتر از چند درجه؟ 📐',
      'مساحت مستطیل ۴ در ۸ سانتی‌متر چقدره؟ ⬛',
      'کسرهای مساوی یعنی چی؟ ⚖️'
    ]
  },
  {
    id: 'money_numbers',
    name: 'پول و اعداد ۴ رقمی',
    icon: '💰',
    questions: [
      'تفاوت ریال و تومان چیه؟ 💰',
      'عدد ۵۴۳۲ چند تا هزارتایی و صدتایی داره؟ 🔢',
      'چطور با اسکناس‌های ۱۰۰۰ و ۵۰۰۰ تومانی خرید کنیم؟ 💵',
      'جمع ۴ رقمی با تکنیک انتقال و فرآیندی چطوریه؟ 🧮',
      'تقریب زدن اعداد به نزدیک‌ترین دهتایی و صدتایی 🎯',
      'حروف‌نویسی عدد ۹۸۰۴ چطوریه؟ ✍️',
      'بزرگ‌ترین و کوچک‌ترین عدد ۴ رقمی بدون تکرار 🔢',
      'باقی‌مانده پول از خرید ۲۰,۰۰0 تومانی چطور حساب میشه؟ 👛'
    ]
  },
  {
    id: 'time_patterns',
    name: 'ساعت، زمان و الگو',
    icon: '⏰',
    questions: [
      'ساعت ۱۵:۴۵ دقیقه به وقت بعدازظهر چنده؟ ⏰',
      'نیم ساعت و ربع ساعت چند دقیقه میشه؟ ⏱️',
      'الگوی ۶، ۱۲، ۱۸، ۲۴ چجوری ادامه پیدا میکنه؟ 📈',
      'الگوی کاهشی ۵۰، ۴۵، ۴۰ رو ادامه بده 📉',
      'عقربه ساعت‌شمار و دقیقه‌شمار زاویه باز می‌سازن؟ 📐',
      'جدول داده‌ها و نمودار دایره‌ای یا ستونی 📊',
      'احتمال آمدن رو یا پشت در پرتاب سکه 🎲',
      'شمارش چندتا چندتا روی محور اعداد 📏'
    ]
  }
];

export const AITutorChat: React.FC<AITutorChatProps> = ({ soundEnabled, onAddStars, onIncrementSolved }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: 'سلام قهرمان ریاضی پایه سوم! 🖐️🌟 من "استاد دانا" معلم خصوصی تو هستم. هر سوالی از کتاب ریاضی سوم داری یا هر مسئله‌ای رو بلد نیستی ازم بپرس تا قدم به قدم با شکل و مثال‌های بامزه یاد بگیریم! 😊',
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [suggestionOffset, setSuggestionOffset] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Speech Recognition Setup
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('مرورگر شما از ورودی صوتی پشتیبانی نمی‌کند. لطفاً تایپ کنید.');
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
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
        }
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeCategory = QUESTION_CATEGORIES.find(c => c.id === selectedCatId) || QUESTION_CATEGORIES[0];
  
  const getDisplayedQuestions = () => {
    const list = activeCategory.questions;
    const len = list.length;
    const count = Math.min(5, len);
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const idx = (suggestionOffset + i) % len;
      result.push(list[idx]);
    }
    return result;
  };

  const handleShuffleSuggestions = () => {
    playSound('pop', soundEnabled);
    setSuggestionOffset(prev => prev + 3);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    playSound('click', soundEnabled);
    setInput('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const historyForApi = messages.map(m => ({
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
        // Fetch failed (network error or static hosting without backend)
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

  return (
    <div className="flex flex-col h-[calc(100vh-175px)] sm:h-[calc(100vh-140px)] min-h-[460px] sm:min-h-[580px] max-w-5xl mx-auto space-y-2.5 sm:space-y-4">
      {/* Top Banner & Mascot Header */}
      <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 sm:border-4 border-[#A29BFE] p-3 sm:p-5 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#FF6B6B] border-2 border-white flex items-center justify-center text-2xl sm:text-3xl shadow-xs shrink-0">
            🦉
          </div>
          <div>
            <h2 className="font-bold text-[#2D3436] text-sm sm:text-xl flex items-center gap-2">
              <span>استاد دانا (معلم هوشمند)</span>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-ping"></span>
                آماده
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">پاسخگویی به زبان ساده و شیرین با رسم شکل</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-[#FFEAA7] px-4 py-2 rounded-full border-2 border-[#FDCB6E] text-[#D35400] font-bold text-xs shadow-xs">
          <span className="text-base">⭐</span>
          <span>هر سوال = ۱ امتیاز پاداش!</span>
        </div>
      </div>

      {/* Educational Tip Box */}
      <div className="bg-[#E1F5FE] rounded-2xl sm:rounded-[2rem] p-3 sm:p-5 flex items-center gap-3 sm:gap-4 border-2 sm:border-4 border-[#00B0FF] shadow-xs shrink-0">
        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-inner shrink-0">
          💡
        </div>
        <div>
          <h3 className="text-xs sm:text-base font-bold text-[#01579B]">نکته روز معلم دانا</h3>
          <p className="text-[#0277BD] mt-0.5 text-[11px] sm:text-sm leading-relaxed font-medium">
            مسئله‌های بزرگ رو به تیکه‌های کوچیک تبدیل کن! ریاضی مثل حل کردن یک پازل دوست‌داشتنیه. 🧩
          </p>
        </div>
      </div>

      {/* Category Tabs & Shuffle Control Bar */}
      <div className="space-y-2 shrink-0 bg-white/90 p-2 sm:p-3 border-2 border-amber-200 rounded-2xl shadow-xs dir-rtl">
        {/* Category Filter Chips & Shuffle Button */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUESTION_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  playSound('click', soundEnabled);
                  setSelectedCatId(cat.id);
                  setSuggestionOffset(0);
                }}
                className={`text-[10px] sm:text-xs font-black px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 border ${
                  selectedCatId === cat.id
                    ? 'bg-amber-500 text-amber-950 border-amber-600 shadow-xs scale-102'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Shuffle Button */}
          <button
            onClick={handleShuffleSuggestions}
            className="text-[11px] sm:text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-xl border-2 border-purple-300 shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0 hover:scale-105 active:scale-95"
            title="نمایش پیشنهادها و سوالات تازه"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تغییر پیشنهادها 🎲</span>
          </button>
        </div>

        {/* Displayed Suggested Question Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-100">
          <span className="text-xs font-extrabold text-amber-700 whitespace-nowrap flex items-center gap-1 pr-1 shrink-0">
            <Lightbulb className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>سوالات پیشنهادی:</span>
          </span>
          {getDisplayedQuestions().map((q, idx) => (
            <button
              key={`${selectedCatId}-${suggestionOffset}-${idx}`}
              onClick={() => handleSendMessage(q)}
              disabled={loading}
              className="text-[11px] sm:text-xs bg-amber-50 hover:bg-amber-500 text-amber-900 hover:text-white font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-amber-200 hover:border-amber-500 whitespace-nowrap transition-all shadow-2xs cursor-pointer disabled:opacity-50 min-h-[34px] flex items-center gap-1 animate-fade-in"
            >
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="flex-1 overflow-y-auto bg-white/80 border-2 sm:border-4 border-[#A29BFE] rounded-2xl sm:rounded-[2rem] p-3 sm:p-4 space-y-3 sm:space-y-4 shadow-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`flex items-start gap-2 sm:gap-3 max-w-[95%] sm:max-w-[85%] ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}>
              {/* Avatar Icon */}
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-base sm:text-xl shrink-0 shadow-xs border-2 ${
                msg.sender === 'user' 
                  ? 'bg-[#74B9FF] border-white text-white' 
                  : 'bg-[#FF6B6B] border-white text-white'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : '🦉'}
              </div>

              {/* Speech Bubble */}
              <div className={`relative p-3.5 sm:p-5 text-xs sm:text-base leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#6C5CE7] text-white rounded-2xl sm:rounded-[2rem] rounded-tr-none shadow-[0_3px_0_0_#4834D4] font-bold'
                  : 'bg-white text-[#2D3436] border-2 sm:border-4 border-[#A29BFE] rounded-2xl sm:rounded-[2rem] rounded-tl-none font-medium'
              }`}>
                {/* Text Content */}
                <div className="whitespace-pre-line text-xs sm:text-base dir-rtl">
                  {msg.text}
                </div>

                {/* Footer Controls for AI Message */}
                {msg.sender === 'tutor' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400">{msg.timestamp}</span>

                    <div className="flex items-center gap-1.5">
                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 sm:p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                        title="کپی پاسخ"
                      >
                        {copiedId === msg.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
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
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#FF6B6B] border-2 border-white text-white flex items-center justify-center text-base sm:text-xl animate-bounce shadow-xs">
              🦉
            </div>
            <div className="bg-white border-2 sm:border-4 border-[#A29BFE] rounded-2xl sm:rounded-[2rem] rounded-tl-none p-3 sm:p-4 shadow-xs flex items-center gap-2.5">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#6C5CE7] animate-ping"></span>
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#A29BFE] animate-ping delay-100"></span>
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FF7675] animate-ping delay-200"></span>
              </div>
              <span className="text-xs font-bold text-[#6C5CE7]">استاد دانا در حال نوشتن پاسخ... 💭</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Controls */}
      <div className="bg-white p-2 sm:p-3 border-2 sm:border-4 border-[#A29BFE] rounded-2xl sm:rounded-[2rem] shadow-sm shrink-0">
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
            className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer min-w-[44px] min-h-[44px] ${
              isListening 
                ? 'bg-rose-500 border-rose-600 text-white animate-pulse' 
                : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
            title={isListening ? 'در حال شنیدن...' : 'ورودی صوتی (صحبت کن)'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Textarea Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'در حال دریافت صدای شما...' : 'سوالت رو اینجا تایپ کن...'}
            className="flex-1 min-w-0 bg-[#F0F2F5] border-none rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs sm:text-sm font-medium text-[#2D3436] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] transition-all dir-rtl min-h-[44px]"
            disabled={loading}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-[#6C5CE7] hover:bg-[#5b4cc4] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-3.5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl shadow-[0_3px_0_0_#4834D4] hover:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:shadow-none min-h-[44px]"
          >
            <span className="text-xs sm:text-sm">بپرس!</span>
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
