import React, { useState } from 'react';
import { CHAPTERS, CHAPTER_LESSONS } from '../data/curriculum';
import { ChapterInfo, ChapterId, Lesson, QuizQuestion } from '../types';
import { playSound } from '../utils/sound';
import { speakPersianText, stopPersianSpeech } from '../utils/speech';
import { 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Lightbulb, 
  Eye, 
  AlertTriangle, 
  Volume2, 
  X, 
  Check, 
  HelpCircle,
  Award,
  ChevronLeft
} from 'lucide-react';

interface CurriculumGuideProps {
  soundEnabled: boolean;
  onSelectChapterForQuiz: (chapterId: string) => void;
  onAddStars?: (stars: number) => void;
}

export const CurriculumGuide: React.FC<CurriculumGuideProps> = ({
  soundEnabled,
  onSelectChapterForQuiz,
  onAddStars,
}) => {
  const [selectedLessonChapter, setSelectedLessonChapter] = useState<ChapterInfo | null>(null);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Question interaction state inside lesson viewer
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});

  const handleOpenLessons = (chapter: ChapterInfo) => {
    playSound('click', soundEnabled);
    setSelectedLessonChapter(chapter);
    setSelectedLessonIndex(0);
    setSelectedAnswers({});
    setShowExplanations({});
    setShowHints({});
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

  const handleSelectAnswer = (qId: string, optIdx: number, correctIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIdx }));
    setShowExplanations(prev => ({ ...prev, [qId]: true }));

    if (optIdx === correctIdx) {
      playSound('correct', soundEnabled);
      if (onAddStars) onAddStars(1);
    } else {
      playSound('wrong', soundEnabled);
    }
  };

  const activeLessons: Lesson[] = selectedLessonChapter 
    ? (CHAPTER_LESSONS[selectedLessonChapter.id as ChapterId] || []) 
    : [];

  const currentLesson: Lesson | undefined = activeLessons[selectedLessonIndex];

  return (
    <div className="max-w-6xl mx-auto space-y-6 dir-rtl">
      {/* Title Header */}
      <div className="bg-white rounded-[2rem] border-4 border-[#6C5CE7] p-6 shadow-sm space-y-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-[#FFEAA7] text-[#D35400] px-3 py-1 rounded-full text-xs font-bold border border-[#FDCB6E]">
            <BookOpen className="w-4 h-4 text-[#D35400]" />
            <span>کتاب درسی رسمی آموزش و پرورش</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#2D3436]">سرفصل‌های کامل کتاب درسی ریاضی سوم دبستان</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            مرور نکات کلیدی، تدریس تصویری مفاهیم و تمرین‌های تفکیکی آسان تا چالشی
          </p>
        </div>
        <div className="w-14 h-14 bg-[#6C5CE7] rounded-2xl flex items-center justify-center text-3xl text-white shadow-xs shrink-0">
          📖
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CHAPTERS.map((chapter: ChapterInfo) => {
          const lessonCount = (CHAPTER_LESSONS[chapter.id as ChapterId] || []).length;

          return (
            <div
              key={chapter.id}
              className="bg-white border-4 border-[#FFEAA7] hover:border-[#FDCB6E] rounded-[2rem] p-6 shadow-[0_6px_0_0_#E0E0E0] transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFEAA7] text-[#D35400] border border-[#FDCB6E]">
                    فصل {chapter.chapterNumber}
                  </span>
                  <span className="text-2xl font-bold text-slate-400 text-xs bg-slate-100 px-2.5 py-1 rounded-full">
                    {lessonCount > 0 ? `${lessonCount} درس‌نامه تعاملی` : 'کامل'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#2D3436]">{chapter.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{chapter.description}</p>

                {/* Topics Bullet points */}
                <div className="bg-[#FFF9E5] border-2 border-[#FFEAA7] rounded-2xl p-3.5 space-y-2">
                  <span className="text-xs font-bold text-[#D35400] block flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    موضوعات اصلی این فصل:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {chapter.topics.map((topic, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleOpenLessons(chapter)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>درس‌نامه و تدریس تصویری</span>
                </button>

                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    onSelectChapterForQuiz(chapter.id);
                  }}
                  className="bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_3px_0_0_#4834D4] hover:translate-y-0.5 active:shadow-none"
                >
                  <Sparkles className="w-4 h-4 text-[#FFEAA7]" />
                  <span>آزمون و بازی این فصل</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Lesson & Visual Models Modal */}
      {selectedLessonChapter && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-[2rem] border-4 border-[#6C5CE7] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#6C5CE7] text-white p-4 sm:p-6 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    فصل {selectedLessonChapter.chapterNumber}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold">{selectedLessonChapter.title}</h3>
                </div>
                <p className="text-xs text-purple-100 font-medium">درس‌نامه‌ها، مدل‌های تصویری و تمرین‌های پله‌پله</p>
              </div>

              <button
                onClick={() => setSelectedLessonChapter(null)}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subnav: Lessons tabs */}
            {activeLessons.length > 1 && (
              <div className="bg-purple-50 border-b border-purple-200 p-2 flex items-center gap-2 overflow-x-auto">
                {activeLessons.map((l, idx) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      playSound('click', soundEnabled);
                      setSelectedLessonIndex(idx);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedLessonIndex === idx
                        ? 'bg-[#6C5CE7] text-white shadow-xs'
                        : 'bg-white text-purple-900 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    درس {l.lessonNumber}: {l.title}
                  </button>
                ))}
              </div>
            )}

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
              {currentLesson ? (
                <>
                  {/* Lesson Title & Speech Audio */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span>{currentLesson.visualExplanation.emoji}</span>
                        <span>{currentLesson.title}</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {currentLesson.shortSummary}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSpeak(currentLesson.id, `${currentLesson.title}. ${currentLesson.shortSummary}. فرمول یا قاعده: ${currentLesson.visualExplanation.formulaOrRule}`)}
                      className={`p-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        speakingId === currentLesson.id
                          ? 'bg-[#6C5CE7] text-white animate-pulse'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                      }`}
                      title="خواندن صوتی متن درس"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Visual Model Card */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-5 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                      <span className="text-2xl">{currentLesson.visualExplanation.emoji}</span>
                      <span>مدل تصویری و مفهومی: {currentLesson.visualExplanation.diagramTitle}</span>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 border border-amber-200/70 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {currentLesson.visualExplanation.description}
                    </div>

                    <div className="bg-[#FFEAA7] text-[#D35400] font-black text-xs sm:text-sm p-3 rounded-xl border border-[#FDCB6E] flex items-center gap-2">
                      <span>📌 قانون طلایی:</span>
                      <span>{currentLesson.visualExplanation.formulaOrRule}</span>
                    </div>
                  </div>

                  {/* Common Pitfalls & Mistakes */}
                  {currentLesson.commonMistakes.length > 0 && (
                    <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 space-y-2">
                      <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        اشتباهات رایج دانش‌آموزان (مراقب این تله‌ها باش!):
                      </span>
                      <ul className="space-y-1 text-xs text-rose-900 font-medium list-disc list-inside">
                        {currentLesson.commonMistakes.map((m, idx) => (
                          <li key={idx}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tiered Practice Questions (Easy, Medium, Hard) */}
                  <div className="space-y-4">
                    <h5 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      تمرین‌های پله‌پله این درس (سطح‌بندی شده):
                    </h5>

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
                                <span>{showHints[q.id] ? 'بستن راهنما' : 'راهنمای حل'}</span>
                              </button>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                            {q.question}
                          </p>

                          {/* Hint Box */}
                          {showHints[q.id] && q.hint && (
                            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs text-amber-900 font-medium">
                              💡 {q.hint}
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
                                  onClick={() => !isAnswered && handleSelectAnswer(q.id, optIdx, q.correctAnswerIndex)}
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
                              <strong>{isCorrect ? '✅ آفرین درست بود! ' : '❌ اشتباه شد! '}</strong>
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

            {/* Modal Footer */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedLessonChapter(null)}
                className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 transition-all cursor-pointer"
              >
                بستن درس‌نامه
              </button>

              <button
                onClick={() => {
                  const cId = selectedLessonChapter.id;
                  setSelectedLessonChapter(null);
                  playSound('click', soundEnabled);
                  onSelectChapterForQuiz(cId);
                }}
                className="px-5 py-2.5 bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <span>شروع آزمون جامع این فصل</span>
                <Sparkles className="w-4 h-4 text-[#FFEAA7]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
