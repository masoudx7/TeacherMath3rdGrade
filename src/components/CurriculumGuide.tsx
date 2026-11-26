import React, { useState } from 'react';
import { CHAPTERS, CHAPTER_LESSONS } from '../data/curriculum';
import { ChapterInfo, ChapterId, Lesson, QuizQuestion, LessonExample } from '../types';
import { playSound } from '../utils/sound';
import { addMistakeInstant } from '../utils/mistakeTracker';
import { speakPersianText, stopPersianSpeech } from '../utils/speech';
import { 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Lightbulb, 
  Gamepad2, 
  AlertTriangle, 
  Volume2, 
  X, 
  Check, 
  Award,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  PlayCircle,
  Crown,
  Lock
} from 'lucide-react';

interface CurriculumGuideProps {
  soundEnabled: boolean;
  onSelectChapterForQuiz: (chapterId: string) => void;
  onSelectChapterForGame?: (chapterId: ChapterId) => void;
  onAddStars?: (stars: number) => void;
  onIncrementSolved?: () => void;
  onRecordChapterAttempt?: (chapterId: ChapterId, score: number, total: number) => void;
  isVip?: boolean;
  onOpenSubscription?: () => void;
}

export const CurriculumGuide: React.FC<CurriculumGuideProps> = ({
  soundEnabled,
  onSelectChapterForQuiz,
  onSelectChapterForGame,
  onAddStars,
  onIncrementSolved,
  onRecordChapterAttempt,
  isVip = false,
  onOpenSubscription,
}) => {
  const [selectedLessonChapter, setSelectedLessonChapter] = useState<ChapterInfo | null>(null);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Question interaction state inside lesson viewer
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [activeTabSection, setActiveTabSection] = useState<'all' | 'lesson' | 'examples' | 'exercises'>('all');

  const handleOpenLessons = (chapter: ChapterInfo, lessonIdx = 0) => {
    playSound('click', soundEnabled);
    setSelectedLessonChapter(chapter);
    setSelectedLessonIndex(lessonIdx);
    setSelectedAnswers({});
    setShowExplanations({});
    setShowHints({});
    setActiveTabSection('all');
  };

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

  const handleSelectAnswer = (q: QuizQuestion, optIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [q.id]: optIdx }));
    setShowExplanations(prev => ({ ...prev, [q.id]: true }));

    const chapterId = (selectedLessonChapter?.id || q.chapterId || 'patterns') as ChapterId;

    if (optIdx === q.correctAnswerIndex) {
      playSound('correct', soundEnabled);
      if (onAddStars) onAddStars(1);
      onIncrementSolved?.();
      onRecordChapterAttempt?.(chapterId, 1, 1);
    } else {
      playSound('wrong', soundEnabled);
      onRecordChapterAttempt?.(chapterId, 0, 1);
      addMistakeInstant(
        chapterId,
        q.question,
        q.options[optIdx] || '',
        q.options[q.correctAnswerIndex] || '',
        q.explanation || 'پاسخ نادرست در تمرین درس‌نامه؛ نیاز به مرور مجدد دارد.'
      );
    }
  };

  const handleGoToGame = (chapterId: ChapterId) => {
    playSound('click', soundEnabled);
    setSelectedLessonChapter(null);
    if (onSelectChapterForGame) {
      onSelectChapterForGame(chapterId);
    } else {
      onSelectChapterForQuiz(chapterId);
    }
  };

  const handleGoToQuiz = (chapterId: string) => {
    playSound('click', soundEnabled);
    setSelectedLessonChapter(null);
    onSelectChapterForQuiz(chapterId);
  };

  const activeLessons: Lesson[] = selectedLessonChapter 
    ? (CHAPTER_LESSONS[selectedLessonChapter.id as ChapterId] || []) 
    : [];

  const currentLesson: Lesson | undefined = activeLessons[selectedLessonIndex];

  return (
    <div className="w-full max-w-full overflow-x-hidden px-2 sm:px-4 max-w-6xl mx-auto space-y-6 dir-rtl box-border">
      {/* Title Header */}
      <div className="clay-card p-6 space-y-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-amber-100/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold border border-amber-200/70">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>کتاب درسی رسمی ریاضی سوم دبستان (۸ فصل کامل)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#26354D]">درس‌نامه‌ها، مثال‌های حل‌شده و دست‌ورزی تعاملی</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            آموزش مفهومی هر فصل با تصاویر و فرمول‌های طلایی، مثال‌های روزمره و اتصال مستقیم به ۱۰ بازی تعاملی
          </p>
        </div>
        <div className="w-14 h-14 clay-btn-primary rounded-2xl flex items-center justify-center text-3xl shrink-0">
          📖
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CHAPTERS.map((chapter: ChapterInfo) => {
          const lessonList = CHAPTER_LESSONS[chapter.id as ChapterId] || [];
          const lessonCount = lessonList.length;
          const isChapterLocked = chapter.chapterNumber > 2 && !isVip;

          return (
            <div
              key={chapter.id}
              className={`clay-card p-5 sm:p-6 transition-all space-y-4 flex flex-col justify-between hover:-translate-y-0.5 ${
                isChapterLocked ? 'bg-gradient-to-b from-white to-amber-50/40' : ''
              }`}
            >
              <div className="space-y-3.5">
                {/* Top Badge & Number */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-200/70">
                      فصل {chapter.chapterNumber}
                    </span>
                    {chapter.chapterNumber <= 2 ? (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        رایگان
                      </span>
                    ) : isChapterLocked ? (
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-700" />
                        <span>ویژه طلایی</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-600 fill-amber-400" />
                        <span>طلایی فعال</span>
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-full hidden sm:inline">
                      {lessonCount} درس‌نامه
                    </span>
                  </div>
                  <span className="text-2xl">{chapter.gameIcon || '📐'}</span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#2D3436] mb-1">{chapter.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">{chapter.description}</p>
                </div>

                {/* Topics Bullet points */}
                <div className="clay-inset p-3.5 space-y-2">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    مباحث کلیدی این فصل:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {chapter.topics.map((topic, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-[#26354D] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Game Connection Banner */}
                {chapter.gameTitle && (
                  <div 
                    onClick={() => {
                      if (isChapterLocked) {
                        playSound('wrong', soundEnabled);
                        if (onOpenSubscription) onOpenSubscription();
                      } else {
                        handleGoToGame(chapter.id);
                      }
                    }}
                    className="clay-soft p-3 flex items-center justify-between gap-3 cursor-pointer transition-all group hover:bg-amber-50/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 clay-btn-warm rounded-xl flex items-center justify-center text-lg group-hover:scale-105 transition-transform shrink-0">
                        <Gamepad2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#26354D]">
                          بازی تعاملی: {chapter.gameTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium line-clamp-1">
                          {chapter.gameDescription || 'دست‌ورزی و تمرین زنده مفاهیم ریاضی'}
                        </div>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-amber-700 group-hover:-translate-x-1 transition-transform shrink-0" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isChapterLocked ? (
                <div className="pt-2 border-t border-amber-100/80">
                  <button
                    onClick={() => {
                      playSound('pop', soundEnabled);
                      if (onOpenSubscription) onOpenSubscription();
                    }}
                    className="w-full clay-btn-warm font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Crown className="w-4 h-4 fill-[#26354D]" />
                    <span>بازگشایی فصل {chapter.chapterNumber} با اشتراک طلایی</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-amber-100/80">
                  <button
                    onClick={() => handleOpenLessons(chapter)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-bold py-2.5 px-2 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    title="مشاهده تدریس، فرمول، مثال‌ها و تمرین‌ها"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>درس‌نامه و مثال‌ها</span>
                  </button>

                  <button
                    onClick={() => handleGoToGame(chapter.id)}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold py-2.5 px-2 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    title="ورود مستقیم به بازی و دست‌ورزی تعاملی این فصل"
                  >
                    <Gamepad2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>بازی و دست‌ورزی</span>
                  </button>

                  <button
                    onClick={() => handleGoToQuiz(chapter.id)}
                    className="clay-btn-primary font-bold py-2.5 px-2 rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    title="شرکت در آزمون ۴ گزینه‌ای با نمره و ستاره"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>آزمون تستی</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Lesson & Visual Models Modal */}
      {selectedLessonChapter && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="clay-card max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#2D3F5B] to-[#22324A] text-[#FFFBF2] p-4 sm:p-5 flex items-center justify-between gap-4 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-white/15 text-amber-200 text-xs font-bold px-3 py-0.5 rounded-full">
                    فصل {selectedLessonChapter.chapterNumber}
                  </span>
                  <h3 className="text-base sm:text-xl font-extrabold">{selectedLessonChapter.title}</h3>
                </div>
                <p className="text-xs text-slate-200 font-medium">درس‌نامه‌ها، مدل‌های مفهومی، مثال‌های حل‌شده و تمرین‌های پله‌پله</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGoToGame(selectedLessonChapter.id)}
                  className="hidden sm:inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>بازی تعاملی فصل</span>
                </button>

                <button
                  onClick={() => setSelectedLessonChapter(null)}
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Subnav: Lessons tabs */}
            {activeLessons.length > 1 && (
              <div className="bg-purple-50 border-b border-purple-200 p-2 flex items-center gap-2 overflow-x-auto shrink-0">
                {activeLessons.map((l, idx) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      playSound('click', soundEnabled);
                      setSelectedLessonIndex(idx);
                      setSelectedAnswers({});
                      setShowExplanations({});
                      setShowHints({});
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedLessonIndex === idx
                        ? 'bg-[#6C5CE7] text-white shadow-xs'
                        : 'bg-white text-purple-900 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    <span>{l.visualExplanation.emoji}</span>
                    <span>درس {l.lessonNumber}: {l.title}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
              {currentLesson ? (
                <>
                  {/* Lesson Title & Speech Audio */}
                  <div className="flex items-start justify-between gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{currentLesson.visualExplanation.emoji}</span>
                        <h4 className="text-base sm:text-lg font-black text-slate-800">
                          {currentLesson.title}
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {currentLesson.shortSummary}
                      </p>
                      {currentLesson.explanationText && (
                        <p className="text-xs text-slate-500 leading-relaxed font-normal pt-1">
                          {currentLesson.explanationText}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleSpeak(
                        currentLesson.id, 
                        `${currentLesson.title}. ${currentLesson.shortSummary}. ${currentLesson.explanationText || ''}. قانون طلایی: ${currentLesson.visualExplanation.formulaOrRule}`
                      )}
                      className={`p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        speakingId === currentLesson.id
                          ? 'clay-btn-primary'
                          : 'clay-soft text-[#26354D] hover:bg-white'
                      }`}
                      title="خواندن صوتی متن درس"
                    >
                      <Volume2 className={`w-5 h-5 ${speakingId === currentLesson.id ? 'text-white' : 'text-amber-600'}`} />
                    </button>
                  </div>

                  {/* Section 1: Visual Model & Golden Rule */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-5 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2 text-amber-900 font-black text-xs sm:text-sm">
                      <span className="text-2xl">{currentLesson.visualExplanation.emoji}</span>
                      <span>مدل تصویری و مفهومی: {currentLesson.visualExplanation.diagramTitle}</span>
                    </div>

                    <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 border border-amber-200/70 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                      {currentLesson.visualExplanation.description}
                    </div>

                    <div className="bg-[#FFEAA7] text-[#D35400] font-black text-xs sm:text-sm p-3.5 rounded-xl border border-[#FDCB6E] flex items-center gap-2">
                      <span className="shrink-0">📌 قانون طلایی:</span>
                      <span className="leading-relaxed">{currentLesson.visualExplanation.formulaOrRule}</span>
                    </div>
                  </div>

                  {/* Section 2: Worked Examples (مثال‌های حل‌شده) */}
                  {currentLesson.examples && currentLesson.examples.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-xl">📝</span>
                          <span>مثال‌های حل‌شده و گام‌به‌گام ({currentLesson.examples.length} مثال ملموس):</span>
                        </h5>
                      </div>

                      <div className="grid grid-cols-1 gap-3.5">
                        {currentLesson.examples.map((ex: LessonExample, exIdx: number) => (
                          <div
                            key={exIdx}
                            className="bg-blue-50/60 border-2 border-blue-200/80 rounded-2xl p-4 sm:p-5 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-blue-950">
                                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs shrink-0">
                                  {exIdx + 1}
                                </span>
                                <span>{ex.title}</span>
                              </div>

                              <button
                                onClick={() => handleSpeak(
                                  `ex_${currentLesson.id}_${exIdx}`,
                                  `مسئله: ${ex.problem}. پاسخ: ${ex.solution}. نکته: ${ex.keyTakeaway || ''}`
                                )}
                                className="p-1.5 bg-white hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-all cursor-pointer shrink-0"
                                title="خواندن صوتی مثال"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Problem */}
                            <div className="bg-white p-3 rounded-xl border border-blue-100 text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                              ❓ مسئله: {ex.problem}
                            </div>

                            {/* Visual Cue if present */}
                            {ex.visualCue && (
                              <div className="bg-indigo-100/70 text-indigo-900 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-indigo-200">
                                💡 مسیر حل: {ex.visualCue}
                              </div>
                            )}

                            {/* Solution */}
                            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/70">
                              <strong className="text-emerald-800 font-bold block mb-1">✅ پاسخ تشریحی:</strong>
                              {ex.solution}
                            </div>

                            {/* Key Takeaway */}
                            {ex.keyTakeaway && (
                              <div className="text-xs text-blue-900 font-semibold bg-blue-100/80 px-3 py-1.5 rounded-lg">
                                🎯 نکته کلیدی: {ex.keyTakeaway}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 3: Common Pitfalls & Mistakes */}
                  {currentLesson.commonMistakes && currentLesson.commonMistakes.length > 0 && (
                    <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 space-y-2">
                      <span className="text-xs sm:text-sm font-black text-rose-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        اشتباهات رایج و تله‌های یادگیری (مواظب این موارد باش!):
                      </span>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-rose-900 font-medium list-disc list-inside leading-relaxed">
                        {currentLesson.commonMistakes.map((m, idx) => (
                          <li key={idx}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Section 4: Tiered Practice Questions (Easy, Medium, Hard) */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h5 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span>تمرین‌های تعاملی این درس (حل کن و ستاره بگیر):</span>
                      </h5>
                      <span className="text-xs text-slate-500 font-medium">
                        هر پاسخ درست = +۱ ستاره 🌟
                      </span>
                    </div>

                    {([
                      ...currentLesson.easyQuestions,
                      ...currentLesson.mediumQuestions,
                      ...currentLesson.hardQuestions
                    ]).map((q: QuizQuestion) => {
                      const selected = selectedAnswers[q.id];
                      const isAnswered = selected !== undefined;
                      const isCorrect = selected === q.correctAnswerIndex;

                      const difficultyBadge = q.difficulty === 'easy'
                        ? { text: 'سطح آسان 🟢', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
                        : q.difficulty === 'medium'
                        ? { text: 'سطح متوسط 🟡', color: 'bg-amber-100 text-amber-800 border-amber-300' }
                        : { text: 'سطح چالشی 🔴', color: 'bg-rose-100 text-rose-800 border-rose-300' };

                      return (
                        <div
                          key={q.id}
                          className="bg-slate-50 border-2 border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${difficultyBadge.color}`}>
                              {difficultyBadge.text}
                            </span>

                            {q.hint && (
                              <button
                                onClick={() => setShowHints(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Lightbulb className="w-3.5 h-3.5" />
                                <span>{showHints[q.id] ? 'بستن راهنما' : 'راهنمای حل 💡'}</span>
                              </button>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                            {q.question}
                          </p>

                          {/* Hint Box */}
                          {showHints[q.id] && q.hint && (
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 font-medium">
                              💡 <strong>راهنما:</strong> {q.hint}
                            </div>
                          )}

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, optIdx) => {
                              let btnStyle = 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100';

                              if (isAnswered) {
                                if (optIdx === q.correctAnswerIndex) {
                                  btnStyle = 'bg-emerald-500 border-emerald-600 text-white font-bold';
                                } else if (selected === optIdx) {
                                  btnStyle = 'bg-rose-500 border-rose-600 text-white font-bold';
                                } else {
                                  btnStyle = 'bg-white border-slate-200 text-slate-400 opacity-60';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => !isAnswered && handleSelectAnswer(q, optIdx)}
                                  disabled={isAnswered}
                                  className={`p-3 rounded-xl border-2 text-xs font-bold text-right transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                                >
                                  <span>{opt}</span>
                                  {isAnswered && optIdx === q.correctAnswerIndex && (
                                    <Check className="w-4 h-4" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          {isAnswered && (
                            <div className={`p-3 rounded-xl text-xs font-medium ${
                              isCorrect ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                            }`}>
                              <strong>{isCorrect ? '✅ آفرین! درست پاسخ دادی (+۱ ستاره): ' : '❌ اشتباه شد: '}</strong>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-slate-500 text-sm">
                  درس‌نامه در حال بارگذاری است...
                </div>
              )}
            </div>

            {/* Modal Footer with Direct Game & Quiz Access */}
            <div className="bg-slate-100 p-3 sm:p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setSelectedLessonChapter(null)}
                className="px-4 py-2.5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 transition-all cursor-pointer"
              >
                بستن درس‌نامه
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGoToGame(selectedLessonChapter.id)}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Gamepad2 className="w-4 h-4 text-slate-950" />
                  <span>بازی تعاملی فصل 🎮</span>
                </button>

                <button
                  onClick={() => handleGoToQuiz(selectedLessonChapter.id)}
                  className="px-4 py-2.5 bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-[#FFEAA7]" />
                  <span>آزمون ۴ گزینه‌ای 🏆</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
