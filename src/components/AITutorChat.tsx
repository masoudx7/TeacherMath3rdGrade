import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { playSound } from '../utils/sound';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Volume2, 
  VolumeX, 
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

const PRESET_QUESTIONS = [
  'جدول ضرب ۶ را با مثال یاد بده ✖️',
  'چطور محیط و مساحت مستطیل رو حساب کنم؟ 📐',
  'کسر سه چهارم یعنی چی؟ 🍕',
  'تفاوت ریال و تومان چیه؟ 💰',
  'الگوی ۵، ۱۰، ۱۵ چجوری جلو میره؟ 🔢',
  'جمع ۴ رقمی با جدول ارزش مکانی چطوری انجام میشه؟ 🧮'
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
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  // Text to speech readout
  const handleSpeak = (msgId: string, textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      alert('قابلیت خواندن صوتی در این مرورگر فعال نیست.');
      return;
    }

    if (isSpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean text emojis for smoother TTS
    const cleanedText = textToSpeak.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'fa-IR';
    utterance.rate = 0.9; // Slightly slower for kids

    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);

    setIsSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

      const res = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, history: historyForApi }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطا در شبکه');
      }

      const tutorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'tutor',
        text: data.text,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, tutorMsg]);
      playSound('star', soundEnabled);
      onAddStars(1);
      onIncrementSolved();

    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'tutor',
        text: 'اوپس! مشکلی در برقراری ارتباط با معلم پیش اومد. 😅 لطفا دوباره تکرار کن عزیزم.',
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
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

      {/* Preset Suggested Questions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1 pr-1 shrink-0">
          <Lightbulb className="w-4 h-4 text-[#D35400]" />
          پیشنهادها:
        </span>
        {PRESET_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={loading}
            className="text-[11px] sm:text-xs bg-[#FFF3F0] hover:bg-[#FF7675] text-[#D35400] hover:text-white font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-[#FAB1A0] sm:border-2 whitespace-nowrap transition-all shadow-xs cursor-pointer disabled:opacity-50 min-h-[34px]"
          >
            {q}
          </button>
        ))}
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

                      {/* Read Aloud */}
                      <button
                        onClick={() => handleSpeak(msg.id, msg.text)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer min-h-[32px] ${
                          isSpeakingId === msg.id
                            ? 'bg-rose-100 text-rose-700 animate-pulse'
                            : 'bg-[#FFEAA7] text-[#D35400] hover:bg-[#FDCB6E] border border-[#FDCB6E]'
                        }`}
                      >
                        {isSpeakingId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#D35400]" />}
                        <span>{isSpeakingId === msg.id ? 'توقف' : 'بخوان'}</span>
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
