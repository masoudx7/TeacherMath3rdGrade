import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  HelpCircle,
  MessageCircleQuestion,
  RefreshCw,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  DailyExerciseAttempt,
  DailyExerciseItem,
  DailyHabitState,
  getLocalDateKey,
  getSyncDailyExercises,
  getYesterdayDateKey,
  loadDailyExercises,
  replaceDailyExerciseAtSlot,
  saveDailyHabitState,
} from '../utils/dailyExercises';
import { addMistakeInstant } from '../utils/mistakeTracker';
import { ChapterId } from '../types';
import { playSound } from '../utils/sound';

interface DailyPracticeSectionProps {
  soundEnabled: boolean;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
  onAskOstadDana: (questionText: string) => void;
  onDailyHabitCompleted?: (newHabitStreak: number) => void;
  onRecordChapterAttempt?: (chapterId: ChapterId, score: number, total: number) => void;
}

const SLOT_ORDINAL_LABELS = ['تمرین اول', 'تمرین دوم', 'تمرین سوم'];
const OPTION_LETTERS = ['۱', '۲', '۳', '۴'];

export const DailyPracticeSection: React.FC<DailyPracticeSectionProps> = ({
  soundEnabled,
  onAddStars,
  onIncrementSolved,
  onAskOstadDana,
  onDailyHabitCompleted,
  onRecordChapterAttempt,
}) => {
  const [todayKey, setTodayKey] = useState<string>(() => getLocalDateKey());
  const [exercises, setExercises] = useState<DailyExerciseItem[]>(() => {
    return getSyncDailyExercises(getLocalDateKey()).items;
  });
  const [habitState, setHabitState] = useState<DailyHabitState>(() => {
    return getSyncDailyExercises(getLocalDateKey()).state;
  });

  // Auto-open the first unsolved exercise when collapsed state is expanded
  const [activeSlot, setActiveSlot] = useState<number | null>(() => {
    const sync = getSyncDailyExercises(getLocalDateKey());
    const firstUnsolved = sync.items.findIndex(
      (item) => !sync.state.attempts[item.question.id]?.isSolved
    );
    return firstUnsolved >= 0 ? firstUnsolved : 0;
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [showHintForId, setShowHintForId] = useState<Record<string, boolean>>({});
  const [feedbackNotice, setFeedbackNotice] = useState<{
    questionId: string;
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [mistakeReminder, setMistakeReminder] = useState<{
    slotIndex: number;
    targetQuestionId: string;
    missedQuestion: string;
    chosenAnswer: string;
    correctAnswer: string;
    explanation: string;
  } | null>(null);

  const refreshDailyExercises = useCallback(async (targetDateKey: string) => {
    const loaded = await loadDailyExercises(targetDateKey);
    setExercises(loaded.items);
    setHabitState(loaded.state);
    const firstUnsolved = loaded.items.findIndex(
      (item) => !loaded.state.attempts[item.question.id]?.isSolved
    );
    setActiveSlot((prev) => (prev !== null && prev < loaded.items.length ? prev : firstUnsolved >= 0 ? firstUnsolved : 0));
  }, []);

  // Load full offline bank (including up to 5,000 IndexedDB questions) on mount and when bank updates
  useEffect(() => {
    refreshDailyExercises(todayKey);
    const handleBankUpdate = () => refreshDailyExercises(todayKey);
    window.addEventListener('offline-bank-updated', handleBankUpdate);
    return () => window.removeEventListener('offline-bank-updated', handleBankUpdate);
  }, [todayKey, refreshDailyExercises]);

  // Detect midnight rollover if app stays open across days
  useEffect(() => {
    const interval = setInterval(() => {
      const currentKey = getLocalDateKey();
      if (currentKey !== todayKey) {
        setTodayKey(currentKey);
        setFeedbackNotice(null);
        setMistakeReminder(null);
        setShowHintForId({});
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [todayKey]);

  const solvedCount = exercises.filter(
    (item) => habitState.attempts[item.question.id]?.isSolved
  ).length;
  const allCompleted = exercises.length === 3 && solvedCount === 3;

  const formattedPersianDate = new Intl.DateTimeFormat('fa-IR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const handleSelectOption = async (item: DailyExerciseItem, optionIndex: number) => {
    if (isSwapping) return;

    const q = item.question;
    const existingAttempt: DailyExerciseAttempt = habitState.attempts[q.id] || {
      questionId: q.id,
      selectedIndex: null,
      wrongIndices: [],
      isSolved: false,
      solvedFirstTry: false,
    };

    if (existingAttempt.isSolved) return;

    const isCorrect = optionIndex === q.correctAnswerIndex;

    if (isCorrect) {
      const solvedFirstTry = existingAttempt.wrongIndices.length === 0 && !showHintForId[q.id];
      const earnedStars = solvedFirstTry ? 3 : 2;

      const updatedAttempt: DailyExerciseAttempt = {
        ...existingAttempt,
        selectedIndex: optionIndex,
        isSolved: true,
        solvedFirstTry,
        completedAt: new Date().toISOString(),
      };

      const nextAttempts: Record<string, DailyExerciseAttempt> = {
        ...habitState.attempts,
        [q.id]: updatedAttempt,
      };

      const nextSolvedCount = exercises.filter(
        (ex) => nextAttempts[ex.question.id]?.isSolved
      ).length;
      const justFinishedAllThree =
        exercises.length === 3 && nextSolvedCount === 3 && !habitState.bonusAwarded;

      let nextStreak = habitState.habitStreakDays;
      let nextLastCompleted = habitState.lastCompletedHabitDate;
      if (justFinishedAllThree) {
        const yesterdayKey = getYesterdayDateKey();
        if (habitState.lastCompletedHabitDate === todayKey) {
          nextStreak = Math.max(1, habitState.habitStreakDays);
        } else if (habitState.lastCompletedHabitDate === yesterdayKey) {
          nextStreak = (habitState.habitStreakDays || 0) + 1;
        } else {
          nextStreak = 1;
        }
        nextLastCompleted = todayKey;
      }

      const nextState: DailyHabitState = {
        ...habitState,
        attempts: nextAttempts,
        bonusAwarded: habitState.bonusAwarded || justFinishedAllThree,
        habitStreakDays: nextStreak,
        lastCompletedHabitDate: nextLastCompleted,
      };

      setHabitState(nextState);
      saveDailyHabitState(nextState);
      setMistakeReminder((prev) => (prev?.slotIndex === item.slotIndex ? null : prev));

      onAddStars(earnedStars);
      onIncrementSolved();
      onRecordChapterAttempt?.(q.chapterId, 1, 1);

      if (justFinishedAllThree) {
        playSound('victory', soundEnabled);
        confetti({ particleCount: 75, spread: 75, origin: { y: 0.4 } });
        onAddStars(5); // +5 daily habit completion bonus
        onDailyHabitCompleted?.(nextStreak);
      } else {
        playSound('star', soundEnabled);
      }

      setFeedbackNotice({
        questionId: q.id,
        isCorrect: true,
        message: justFinishedAllThree
          ? `فوق‌العاده بود! هر ۳ تمرین امروز حل شد (+${earnedStars} ستاره + ۵ ستاره پاداش عادت روزانه)`
          : `آفرین! پاسخ درست بود (+${earnedStars} ستاره)`,
      });
    } else {
      playSound('wrong', soundEnabled);
      onRecordChapterAttempt?.(q.chapterId, 0, 1);

      const chosenAnswer = q.options[optionIndex] || '';
      const correctAnswer = q.options[q.correctAnswerIndex] || '';
      const explanationText =
        q.explanation || 'پاسخ درست را با دقت مرور کن و تمرین جدید را امتحان کن.';

      // Log into MistakeNotebook so the student can also review this mistake later
      addMistakeInstant(q.chapterId, q.question, chosenAnswer, correctAnswer, explanationText);

      setIsSwapping(true);
      try {
        const swapped = await replaceDailyExerciseAtSlot(todayKey, item.slotIndex, q);
        setExercises(swapped.items);
        setHabitState(swapped.state);
        setShowHintForId((prev) => {
          const next = { ...prev };
          delete next[q.id];
          return next;
        });
        setFeedbackNotice(null);
        setMistakeReminder({
          slotIndex: item.slotIndex,
          targetQuestionId: swapped.newQuestion.id,
          missedQuestion: q.question,
          chosenAnswer,
          correctAnswer,
          explanation: explanationText,
        });
      } finally {
        setIsSwapping(false);
      }
    }
  };

  const activeExercise =
    activeSlot !== null && exercises[activeSlot] ? exercises[activeSlot] : null;
  const activeAttempt = activeExercise
    ? habitState.attempts[activeExercise.question.id]
    : undefined;

  const handleMoveToNextUnsolved = () => {
    playSound('click', soundEnabled);
    const nextUnsolvedIndex = exercises.findIndex(
      (item, idx) =>
        idx !== activeSlot && !habitState.attempts[item.question.id]?.isSolved
    );
    if (nextUnsolvedIndex >= 0) {
      setActiveSlot(nextUnsolvedIndex);
      setFeedbackNotice(null);
      setMistakeReminder(null);
    } else if (activeSlot !== null) {
      setActiveSlot((activeSlot + 1) % exercises.length);
      setFeedbackNotice(null);
      setMistakeReminder(null);
    }
  };

  if (exercises.length === 0) return null;

  return (
    <section
      aria-label="تمرین‌های کوتاه روزانه"
      className="clay-card max-w-4xl w-full mx-auto p-3.5 sm:p-5 space-y-3.5 dir-rtl shrink-0"
    >
      {/* Header Row: Title, Clean Unboxed Date/Progress Metadata & Collapse Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl clay-btn-warm flex items-center justify-center shrink-0">
            <BookOpenCheck className="w-5 h-5 text-[#26354D]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-extrabold text-[#26354D] truncate">
                ۳ تمرین کوتاه امروز
              </h2>
              <span className="text-xs text-amber-900/55 font-medium hidden sm:inline" aria-hidden="true">
                ·
              </span>
              <span className="text-xs font-semibold text-amber-900/70 hidden sm:inline">
                {formattedPersianDate}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-600 font-semibold mt-0.5 tabular-nums">
              <span>{solvedCount} از ۳ انجام شد</span>
              <span aria-hidden="true" className="text-amber-900/30">·</span>
              <span className="inline-flex items-center gap-1 text-orange-700">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400 shrink-0" />
                <span>
                  {habitState.habitStreakDays > 0
                    ? `${habitState.habitStreakDays} روز عادت پیوسته`
                    : 'شروع عادت مطالعه امروز'}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* 3-Step Daily Progress Bar */}
          <div className="flex items-center gap-1" aria-label={`پیشرفت روزانه: ${solvedCount} از ۳`}>
            {exercises.map((item, idx) => {
              const solved = Boolean(habitState.attempts[item.question.id]?.isSolved);
              return (
                <span
                  key={item.question.id}
                  className={`h-2 w-6 sm:w-8 rounded-full transition-colors duration-200 ${
                    solved ? 'bg-emerald-500' : idx === activeSlot && !isCollapsed ? 'bg-amber-400' : 'bg-amber-200/75'
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              playSound('click', soundEnabled);
              setIsCollapsed((prev) => !prev);
            }}
            className="clay-soft px-3 py-1.5 rounded-xl text-xs font-bold text-[#26354D] hover:bg-white flex items-center gap-1 cursor-pointer whitespace-nowrap min-h-[36px]"
          >
            <span>{isCollapsed ? 'نمایش تمرین‌ها' : 'جمع‌کردن'}</span>
            {isCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Body */}
      {!isCollapsed && (
        <div className="space-y-3">
          {/* 3 Distinct Daily Exercise Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {exercises.map((item, idx) => {
              const attempt = habitState.attempts[item.question.id];
              const isSolved = Boolean(attempt?.isSolved);
              const isSelected = activeSlot === idx;

              return (
                <button
                  key={item.question.id}
                  type="button"
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setActiveSlot(idx);
                    setFeedbackNotice(null);
                    setMistakeReminder((prev) => (prev?.slotIndex === idx ? prev : null));
                  }}
                  className={`text-right p-3 sm:p-3.5 rounded-2xl transition-all duration-150 cursor-pointer flex flex-col justify-between gap-2 min-h-[88px] ${
                    isSelected
                      ? 'bg-[#FFFDF8] ring-2 ring-amber-400 shadow-[0_10px_24px_-12px_rgba(217,119,6,0.3)]'
                      : isSolved
                      ? 'bg-emerald-50/75 border border-emerald-200/80 hover:bg-emerald-50'
                      : 'clay-soft hover:bg-white'
                  }`}
                >
                  {/* Clean Unboxed Metadata Line */}
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span className="text-[11px] font-bold text-amber-900/75 truncate">
                      {SLOT_ORDINAL_LABELS[idx]} · {item.chapterTitle} · {item.difficultyLabel}
                    </span>
                    {isSolved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 shrink-0 whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>حل شد</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700 shrink-0 whitespace-nowrap">
                        {isSelected ? 'در حال حل' : 'شروع'}
                      </span>
                    )}
                  </div>

                  {/* Short Question Preview */}
                  <p className="text-xs sm:text-[13px] font-bold text-[#26354D] leading-snug line-clamp-2 w-full">
                    {item.question.question}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Exercise Interactive Workspace */}
          {activeExercise && (
            <div className="clay-inset p-4 sm:p-5 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-amber-900/80 flex items-center gap-1.5">
                  <span>{SLOT_ORDINAL_LABELS[activeExercise.slotIndex]}</span>
                  <span aria-hidden="true">·</span>
                  <span>فصل {activeExercise.chapterTitle}</span>
                  <span aria-hidden="true">·</span>
                  <span>سطح {activeExercise.difficultyLabel}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click', soundEnabled);
                      setShowHintForId((prev) => ({
                        ...prev,
                        [activeExercise.question.id]: !prev[activeExercise.question.id],
                      }));
                    }}
                    className="clay-soft px-3 py-1.5 rounded-xl text-xs font-bold text-[#26354D] hover:bg-white flex items-center gap-1 cursor-pointer whitespace-nowrap min-h-[36px]"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>راهنمایی</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playSound('click', soundEnabled);
                      onAskOstadDana(
                        `لطفاً این تمرین روزانه را قدم‌به‌قدم به من توضیح بده: «${activeExercise.question.question}»`
                      );
                    }}
                    className="clay-soft px-3 py-1.5 rounded-xl text-xs font-bold text-[#26354D] hover:bg-amber-50 flex items-center gap-1 cursor-pointer whitespace-nowrap min-h-[36px]"
                  >
                    <MessageCircleQuestion className="w-3.5 h-3.5 text-amber-700" />
                    <span>از استاد دانا بپرس</span>
                  </button>
                </div>
              </div>

              {/* Gentle Mistake Reminder ("گوشزد") when previous question was missed and swapped */}
              {mistakeReminder &&
                mistakeReminder.slotIndex === activeExercise.slotIndex &&
                mistakeReminder.targetQuestionId === activeExercise.question.id && (
                  <div
                    role="alert"
                    className="bg-rose-50/90 border border-rose-200/90 rounded-2xl p-3.5 space-y-2 text-xs sm:text-[13px]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 font-extrabold text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>گوشزد استاد دانا: پاسخ قبلی درست نبود!</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMistakeReminder(null)}
                        aria-label="بستن گوشزد"
                        className="p-1 rounded-lg text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1 text-rose-950/85 font-medium leading-relaxed">
                      <p className="text-[11px] sm:text-xs text-rose-900/75">
                        سوال قبلی: «{mistakeReminder.missedQuestion}»
                      </p>
                      <p className="text-xs font-bold">
                        <span className="text-rose-700">انتخاب تو: {mistakeReminder.chosenAnswer}</span>
                        <span aria-hidden="true" className="mx-2 text-rose-300">·</span>
                        <span className="text-emerald-700">پاسخ درست: {mistakeReminder.correctAnswer}</span>
                      </p>
                      <p className="text-xs text-[#26354D] font-semibold">
                        💡 {mistakeReminder.explanation}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-800 pt-0.5">
                      <RefreshCw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>یک سوال تازه جایگزین شد؛ حالا این تمرین جدید را حل کن!</span>
                    </div>
                  </div>
                )}

              {/* Full Question Prompt */}
              <p className="text-sm sm:text-base font-extrabold text-[#26354D] leading-relaxed">
                {activeExercise.question.question}
              </p>

              {/* Optional Hint Callout */}
              {showHintForId[activeExercise.question.id] && activeExercise.question.hint && (
                <div className="bg-[#FFF9E5] border border-amber-200/80 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-amber-950 leading-relaxed">
                  💡 راهنمایی: {activeExercise.question.hint}
                </div>
              )}

              {/* 4 Answer Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeExercise.question.options.map((opt, optIdx) => {
                  const isSolved = Boolean(activeAttempt?.isSolved);
                  const isCorrectOption = optIdx === activeExercise.question.correctAnswerIndex;
                  const wasWronglyPicked = activeAttempt?.wrongIndices.includes(optIdx);

                  let optionStyle =
                    'clay-soft text-[#26354D] hover:bg-white hover:-translate-y-0.5';
                  if (isSolved && isCorrectOption) {
                    optionStyle =
                      'bg-emerald-50 border border-emerald-300 text-emerald-950 shadow-xs';
                  } else if (wasWronglyPicked) {
                    optionStyle =
                      'bg-rose-50/75 border border-rose-200 text-rose-700/75 opacity-75';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isSolved || wasWronglyPicked || isSwapping}
                      onClick={() => handleSelectOption(activeExercise, optIdx)}
                      className={`p-3 rounded-2xl text-right text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-between gap-2 min-h-[46px] ${optionStyle} ${
                        isSolved || wasWronglyPicked || isSwapping ? 'cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 tabular-nums ${
                            isSolved && isCorrectOption
                              ? 'bg-emerald-600 text-white'
                              : wasWronglyPicked
                              ? 'bg-rose-200 text-rose-800'
                              : 'bg-amber-100/80 text-amber-950'
                          }`}
                        >
                          {OPTION_LETTERS[optIdx] || optIdx + 1}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </div>

                      {isSolved && isCorrectOption && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Explanation */}
              {activeAttempt?.isSolved ? (
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {feedbackNotice?.questionId === activeExercise.question.id
                          ? feedbackNotice.message
                          : 'آفرین! این تمرین امروز با موفقیت حل شده است'}
                      </span>
                    </div>
                    <p className="text-emerald-950/85 font-medium leading-relaxed">
                      {activeExercise.question.explanation}
                    </p>
                  </div>

                  {!allCompleted && (
                    <button
                      type="button"
                      onClick={handleMoveToNextUnsolved}
                      className="clay-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap min-h-[40px]"
                    >
                      <span>تمرین بعدی</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                feedbackNotice &&
                feedbackNotice.questionId === activeExercise.question.id &&
                !feedbackNotice.isCorrect && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-amber-900">
                    {feedbackNotice.message}
                  </div>
                )
              )}
            </div>
          )}

          {/* Daily Habit Completed Summary Banner */}
          {allCompleted && (
            <div className="bg-gradient-to-l from-[#FEF3C7] via-[#FDE68A]/80 to-[#FFEDD5] border border-amber-200 rounded-2xl p-3.5 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#26354D]">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  عادت مطالعه امروز تکمیل شد! فردا ۳ تمرین تازه و متفاوت منتظر توست.
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-900 shrink-0 whitespace-nowrap tabular-nums">
                <Star className="w-4 h-4 fill-amber-500 text-amber-600" />
                <span>پاداش روزانه دریافت شد</span>
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
