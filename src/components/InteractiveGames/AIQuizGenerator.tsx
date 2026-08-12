import React, { useState } from 'react';
import { ChapterId, QuizQuestion } from '../../types';
import { CHAPTERS, SAMPLE_QUIZZES } from '../../data/curriculum';
import { playSound } from '../../utils/sound';
import confetti from 'canvas-confetti';
import { Sparkles, HelpCircle, CheckCircle2, XCircle, RefreshCw, Lightbulb, Star } from 'lucide-react';

interface AIQuizGeneratorProps {
  soundEnabled: boolean;
  initialChapterId?: ChapterId;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
  onRecordHistory: (chapterId: ChapterId, score: number, total: number) => void;
}

export const AIQuizGenerator: React.FC<AIQuizGeneratorProps> = ({
  soundEnabled,
  initialChapterId = 'patterns',
  onAddStars,
  onIncrementSolved,
  onRecordHistory,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<ChapterId>(initialChapterId);
  const [questions, setQuestions] = useState<QuizQuestion[]>(SAMPLE_QUIZZES[initialChapterId] || SAMPLE_QUIZZES['patterns'] || []);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  const currentQ = questions[currentIndex];

  const handleGenerateAIQuiz = async (chapterIdToUse = selectedChapter) => {
    playSound('click', soundEnabled);
    setLoading(true);
    setQuizCompleted(false);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setShowHint(false);

    const chInfo = CHAPTERS.find(c => c.id === chapterIdToUse);

    try {
      const res = await fetch('/api/tutor/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: chapterIdToUse,
          chapterTitle: chInfo?.title || chapterIdToUse,
          count: 3,
        }),
      });

      const data = await res.json();
      if (res.ok && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        // Fallback to offline sample
        setQuestions(SAMPLE_QUIZZES[chapterIdToUse] || SAMPLE_QUIZZES['patterns']);
      }
    } catch (err) {
      setQuestions(SAMPLE_QUIZZES[chapterIdToUse] || SAMPLE_QUIZZES['patterns']);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOpt(index);
    setIsAnswered(true);

    const isCorrect = index === currentQ.correctAnswerIndex;
    if (isCorrect) {
      playSound('correct', soundEnabled);
      setScore(prev => prev + 1);
      onAddStars(2);
      onIncrementSolved();
    } else {
      playSound('wrong', soundEnabled);
    }
  };

  const handleNextQuestion = () => {
    playSound('click', soundEnabled);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
      setShowHint(false);
    } else {
      // Quiz completed!
      setQuizCompleted(true);
      playSound('badge', soundEnabled);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      onRecordHistory(selectedChapter, score + (selectedOpt === currentQ.correctAnswerIndex ? 1 : 0), questions.length);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-md max-w-3xl mx-auto space-y-6 dir-rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-100 pb-4">
        <div>
          <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
            <span>آزمون هوشمند فصلی 📝</span>
            <span className="text-xs bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold">
              تولید شده توسط AI
            </span>
          </h3>
          <p className="text-xs text-slate-500">ارزیابی هوشمند یادگیری فصل‌های مختلف کتاب ریاضی پایه سوم</p>
        </div>

        <button
          onClick={() => handleGenerateAIQuiz(selectedChapter)}
          disabled={loading}
          className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-4 py-2 rounded-2xl border-2 border-amber-500 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>تولید سوالات جدید با AI</span>
        </button>
      </div>

      {/* Chapter Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-600">انتخاب فصل کتاب:</label>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CHAPTERS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => {
                setSelectedChapter(ch.id);
                handleGenerateAIQuiz(ch.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedChapter === ch.id
                  ? 'bg-sky-500 text-white border-2 border-sky-600 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              فصل {ch.chapterNumber}: {ch.title}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-700">معلم هوشمند در حال طراح سوالات آزمون این فصل است... 🤖✨</p>
        </div>
      ) : quizCompleted ? (
        /* Completion Screen */
        <div className="bg-gradient-to-tr from-amber-100 via-orange-100 to-amber-50 rounded-3xl p-8 text-center space-y-4 border-2 border-amber-300">
          <div className="w-20 h-20 rounded-full bg-amber-400 border-4 border-white flex items-center justify-center text-4xl mx-auto shadow-md">
            🏆
          </div>
          <h4 className="text-2xl font-black text-slate-900">آفرین قهرمان! آزمون تمام شد! 🎉</h4>
          <p className="text-sm font-bold text-slate-700">
            تو به <span className="text-emerald-700 font-black text-xl">{score}</span> از <span className="text-xl font-black text-slate-900">{questions.length}</span> سوال پاسخ درست دادی!
          </p>
          <div className="pt-2">
            <button
              onClick={() => handleGenerateAIQuiz(selectedChapter)}
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-black px-6 py-3 rounded-2xl border-b-4 border-amber-600 shadow-md cursor-pointer transition-all"
            >
              شروع یک آزمون جدید 🔄
            </button>
          </div>
        </div>
      ) : currentQ ? (
        /* Quiz Question Display */
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>سوال {currentIndex + 1} از {questions.length}</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>پاسخ درست = ۲ ستاره!</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 text-slate-800 text-base sm:text-lg font-bold leading-relaxed shadow-xs">
            {currentQ.question}
          </div>

          {/* Hint Toggle */}
          <div>
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>{showHint ? 'پنهان کردن راهنمایی' : 'راهنمایی کوچک معلم'}</span>
            </button>

            {showHint && (
              <div className="mt-2 bg-amber-100/70 border border-amber-300 text-amber-900 rounded-2xl p-3 text-xs font-bold animate-fadeIn">
                💡 {currentQ.hint}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((optionText, idx) => {
              let btnStyle = 'bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-200';
              if (isAnswered) {
                if (idx === currentQ.correctAnswerIndex) {
                  btnStyle = 'bg-emerald-500 text-white border-2 border-emerald-600 shadow-md';
                } else if (selectedOpt === idx) {
                  btnStyle = 'bg-rose-500 text-white border-2 border-rose-600';
                } else {
                  btnStyle = 'bg-slate-100 text-slate-400 border border-slate-200 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl text-right font-bold text-sm sm:text-base transition-all cursor-pointer shadow-xs flex items-center justify-between ${btnStyle}`}
                >
                  <span>{optionText}</span>
                  {isAnswered && idx === currentQ.correctAnswerIndex && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                  {isAnswered && selectedOpt === idx && idx !== currentQ.correctAnswerIndex && <XCircle className="w-5 h-5 text-white shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation & Next */}
          {isAnswered && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 space-y-3 animate-fadeIn">
              <div className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>توضیح کامل معلم:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {currentQ.explanation}
              </p>

              <button
                onClick={handleNextQuestion}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl border-b-4 border-emerald-800 text-sm shadow-md cursor-pointer transition-all active:translate-y-1"
              >
                {currentIndex + 1 < questions.length ? 'سوال بعدی ⬅️' : 'مشاهده نتیجه آزمون 🏆'}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
