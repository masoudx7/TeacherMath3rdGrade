import React, { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { ChatMessage } from '../types';
import { playSound } from '../utils/sound';
import { speakPersianText, stopPersianSpeech } from '../utils/speech';
import { generateFallbackTutorResponse } from '../utils/tutorFallback';
import { saveQuestionLocally, syncQuestionsToCloud } from '../utils/questionManager';
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
  Smile,
  X
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
      'مساحت مربع ۵ سانتیمتری چقدر میشه؟ ⬛',
      'عدد ۳۴۵۶ رو باز کن (هزارتایی، صدتایی، دهتایی، یکی) 🔢',
      'کسر یک دوم بزرگتره یا یک سوم؟ 🍕',
      'محیط مثلث با اضلاع ۳، ۴، ۵ چقدره؟ 📐',
      '۲۵۰۰ تومان چند ریاله؟ 💰',
      'الگوی ۲، ۶، ۱۸، ۵۴ چه قانونی داره؟ 🔢',
      'ساعت ۸ و ربع یعنی چند دقیقه گذشته از ۸؟ ⏰'
    ]
  },
  {
    id: 'patterns',
    name: 'الگوها',
    icon: '🔢',
    questions: [
      'الگوی ۵، ۱۰، ۱۵، ۲۰ ادامه بده 🔢',
      'الگوی ۲، ۶، ۱۸، ۵۴ چه قانونی داره؟ 🔄',
      'الگوی هندسی مربع، مثلث، مربع، ... بعدی چیه؟ 🔷',
      'الگوی عددی ۱۰۰، ۹۰، ۸۰، ... ادامه بده 📉',
      'الگوی شکلی دایره، دایره، مثلث، دایره، دایره، ... بعدی چیه؟ ⭕',
      'قانون الگوی ۳، ۷، ۱۱، ۱۵ چیه؟ ➕',
      'الگوی ۱، ۱، ۲، ۳، ۵، ۸ ادامه بده (فیبوناچی ساده) 🌀',
      'الگوی ساعت ۱:۰۰، ۱:۳۰، ۲:۰۰، ... بعدی چنده؟ ⏰',
      'الگوی پول ۱۰۰، ۲۰۰، ۳۰۰ تومان ادامه بده 💰',
      'الگوی معکوس ۲۰، ۱۸، ۱۶، ... ادامه بده 🔙'
    ]
  },
  {
    id: 'four_digit',
    name: 'اعداد ۴ رقمی',
    icon: '🔢',
    questions: [
      'عدد ۳۴۵۶ رو باز کن (هزارتایی، صدتایی، دهتایی، یکی) 🧮',
      'بزرگترین عدد ۴ رقمی بدون تکرار ارقام چیه؟ 🏆',
      'کوچکترین عدد ۴ رقمی چیه؟ 🔽',
      'جمع ۲۳۴۵ + ۱۲۳۴ با جدول ارزش مکانی 📊',
      'تفریق ۵۶۷۸ - ۲۳۴۵ چطور انجام میشه؟ ➖',
      'عدد ۴۰۵۰ چند تا هزارتایی و دهتایی داره؟ 🔍',
      'مقایسه ۳۴۵۶ و ۳۵۴۶: کدوم بزرگتره؟ ⚖️',
      'تقریب ۴۵۶۷ به نزدیکترین هزارتایی 🎯',
      'تقریب ۳۲۱۴ به نزدیکترین صدتایی 🎯',
      'عدد ۷۰۸۹ رو به حروف بنویس ✍️',
      'جمع ۱۲۳۴ + ۵۶۷۸ با انتقال (رقم نقلی) 🧮',
      'تفریق ۸۰۰۰ - ۳۴۵۶ با قرض گرفتن 📝'
    ]
  },
  {
    id: 'fractions',
    name: 'کسر',
    icon: '🍕',
    questions: [
      'کسر سه چهارم یعنی چی؟ با شکل نشون بده 🍕',
      'کسر دو سوم بزرگتره یا دو پنجم؟ ⚖️',
      'کسرهای مساوی یعنی چی؟ با مثال 🔄',
      'جمع یک سوم + یک سوم چقدر میشه؟ ➕',
      'یک دوم پیتزا یعنی چند قسمت از ۴ قسمت؟ 🍕',
      'کسر سه هشتم رو روی شکل نشون بده 🎨',
      'کسر بزرگتر از واحد یعنی چی؟ 📏',
      'تبدیل کسر سه دوم به عدد مخلوط 🔄',
      'مقایسه یک چهارم و یک سوم: کدوم بزرگتره؟ 🤔',
      'سه پنجم ۲۰ تا شکلات چند تاست؟ 🍫',
      'کسر دو ششم رو ساده کن ✂️',
      'جمع یک چهارم + دو چهارم 🍕'
    ]
  },
  {
    id: 'multiplication',
    name: 'ضرب و تقسیم',
    icon: '✖️',
    questions: [
      'جدول ضرب ۷ رو با تکنیک یاد بده ✖️',
      'جدول ضرب ۸ رو چطور زود حفظ بشم؟ 🧠',
      'خاصیت جابجایی در ضرب یعنی چی؟ 🔄',
      'ضرب در ۱۰ و ۱۰۰ چطور سریع انجام میشه؟ 🚀',
      'تقسیم ۲۰ بر ۴ یعنی چی؟ با شکل ➗',
      'فرق ضرب و جمع تکراری چیه؟ ➕',
      'باقیمانده تقسیم ۱۷ بر ۳ چنده؟ 📝',
      'ضرب ۶ × ۷ رو با جمع تکراری نشون بده ➕',
      'تقسیم ۳۵ بر ۵ با شکل نشون بده 🎨',
      'خاصیت صفر در ضرب یعنی چی؟ 0️⃣',
      'ضرب ۹ × ۸ با تکنیک انگشتان 🖐️',
      'تقسیم ۴۸ بر ۶ چطور حل میشه؟ 🧮',
      'مسئله: ۴ بسته مداد ۶ تایی، چند مداد؟ ✏️',
      'مسئله: ۲۴ شکلات بین ۳ نفر تقسیم کن 🍫'
    ]
  },
  {
    id: 'geometry',
    name: 'هندسه',
    icon: '📐',
    questions: [
      'محیط مستطیل با طول ۵ و عرض ۳ چقدره؟ 📏',
      'مساحت مستطیل با طول ۶ و عرض ۴ چقدره؟ 📐',
      'تفاوت محیط و مساحت چیه؟ 🖼️',
      'محیط مثلث متساویالاضلاع با ضلع ۶ چقدره؟ 🔺',
      'مساحت مربع با ضلع ۵ سانتیمتر 🟧',
      'زاویه تند و باز چه فرقی دارن؟ 📐',
      'زاویه راست یعنی چند درجه؟ 📏',
      'تعداد گوشههای پنجضلعی چندتاست؟ ⬠',
      'قطر دایره یعنی چی؟ ⭕',
      'محیط مربع با ضلع ۸ چقدره؟ 🟦',
      'مساحت مثلث با قاعده ۶ و ارتفاع ۴ 🔺',
      'تفاوت مربع و مستطیل چیه؟ 🤔',
      'خط تقارن مربع چندتاست؟ ✂️'
    ]
  },
  {
    id: 'money',
    name: 'پول و ریال/تومان',
    icon: '💰',
    questions: [
      'تفاوت ریال و تومان چیه؟ 💰',
      '۲۵۰۰ تومان چند ریاله؟ 🔄',
      '۵۰۰۰ ریال چند تومان میشه؟ 💵',
      'جمع ۱۵۰۰ تومان + ۲۵۰۰ تومان 💰',
      'اگر ۵۰۰۰ تومان داشته باشم و ۱۸۰۰ تومان خرج کنم 💸',
      'قیمت ۳ بستنی ۱۲۰۰ تومانی چقدره؟ 🍦',
      'تبدیل ۱۰۰۰۰ ریال به تومان 🔄',
      'مقایسه ۳۵۰۰ تومان و ۳۰۰۰۰ ریال ⚖️',
      'باقیمانده پول بعد از خرید ۲ دفتر ۲۰۰۰ تومانی 📒',
      'قیمت نیم کیلو سیب اگر هر کیلو ۸۰۰۰ تومان باشه 🍎'
    ]
  },
  {
    id: 'time',
    name: 'ساعت و زمان',
    icon: '⏰',
    questions: [
      'ساعت ۱۵:۴۵ به وقت بعدازظهر چنده؟ ⏰',
      'نیم ساعت و ربع ساعت چند دقیقه میشه؟ ⏱️',
      'ساعت ۱۷:۳۰ یعنی ساعت چند عصر؟ 🌅',
      'از ساعت ۸ تا ۱۱ چند ساعت گذشته؟ ⏳',
      '۲ ساعت و ۱۵ دقیقه چند دقیقه میشه؟ 🔢',
      'ساعت ۲۰:۰۰ یعنی ساعت چند شب؟ 🌙',
      'اگر الان ساعت ۳ باشه، ۴۵ دقیقه دیگه ساعت چنده؟ ⏰',
      'تبدیل ۹۰ دقیقه به ساعت و دقیقه 🔄',
      'مدت زمان فیلم از ۱۶:۰۰ تا ۱۷:۳۰ 🎬',
      'ساعت ۱۲:۱۵ ظهر یعنی چی؟ ☀️'
    ]
  },
  {
    id: 'statistics',
    name: 'آمار و احتمال',
    icon: '📊',
    questions: [
      'شانس آمدن رنگ قرمز در چرخنده ۴ رنگه چقدره؟ 🎡',
      'میانگین نمرات ۱۸، ۱۶، ۲۰ چقدره؟ 📊',
      'در نمودار ستونی، بلندترین ستون یعنی چی؟ 📈',
      'احتمال آمدن عدد زوج در تاس 🎲',
      'بیشترین تکرار در دادههای ۳، ۵، ۳، ۷، ۳ چیه؟ 🔢',
      'جدول فراوانی نمرات کلاس رو توضیح بده 📋',
      'شانس آمدن شیر یا خط در سکه 🪙',
      'میانگین قد ۳ نفر: ۱۲۰، ۱۳۰، ۱۴۰ سانتیمتر 📏',
      'نمودار تصویری یعنی چی؟ با مثال 🖼️',
      'احتمال انتخاب توپ قرمز از کیسه با ۳ قرمز و ۲ آبی 🔴'
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
        text: 'سلام قهرمان ریاضی! 🌟 من «استاد دانا» هستم، معلم صبور و مهربان ریاضی سوم دبستان. هر سوال یا تمرینی که داری بپرس تا با هم مثل آب خوردن حلش کنیم! 😊🦉',
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

  const handleStartQuiz = (catId: string) => {
    playSound('click', soundEnabled);
    const cat = QUESTION_CATEGORIES.find(c => c.id === catId) || QUESTION_CATEGORIES[0];
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
    <div className="flex flex-col h-[calc(100dvh-130px)] sm:h-[calc(100dvh-140px)] min-h-[480px] max-w-5xl mx-auto space-y-2 dir-rtl">
      {/* Sleek Compact Header Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-[#A29BFE] p-2.5 sm:p-3.5 shadow-xs flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#FF6B6B] border-2 border-white flex items-center justify-center text-xl sm:text-2xl shadow-xs shrink-0 animate-bounce">
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
          {/* Daily Practice Button */}
          <button
            onClick={() => {
              playSound('pop', soundEnabled);
              const allQs = QUESTION_CATEGORIES[0].questions;
              const randomQ = allQs[Math.floor(Math.random() * allQs.length)];
              handleSendMessage(randomQ);
            }}
            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            title="پیشنهاد سوال تصادفی برای تمرین امروز"
          >
            <span>🎯</span>
            <span className="hidden sm:inline">تمرین روزانه</span>
          </button>

          {/* Quick Quiz Button */}
          <button
            onClick={() => {
              playSound('pop', soundEnabled);
              setQuizStep('selecting');
              setShowQuizModal(true);
            }}
            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            title="آزمون سریع ۵ سوالی"
          >
            <span>⚡</span>
            <span className="hidden sm:inline">آزمون سریع</span>
          </button>

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

      {saveNotification && (
        <div className="bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-2xl shadow-md text-center animate-in fade-in flex items-center justify-center gap-2">
          <span>{saveNotification}</span>
        </div>
      )}

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
                  {QUESTION_CATEGORIES.map(cat => (
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
