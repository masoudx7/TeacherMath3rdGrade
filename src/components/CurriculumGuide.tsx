import React from 'react';
import { CHAPTERS } from '../data/curriculum';
import { ChapterInfo } from '../types';
import { playSound } from '../utils/sound';
import { BookOpen, CheckCircle2, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';

interface CurriculumGuideProps {
  soundEnabled: boolean;
  onSelectChapterForQuiz: (chapterId: string) => void;
}

export const CurriculumGuide: React.FC<CurriculumGuideProps> = ({
  soundEnabled,
  onSelectChapterForQuiz,
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 dir-rtl">
      {/* Title */}
      <div className="bg-white rounded-[2rem] border-4 border-[#6C5CE7] p-6 shadow-sm space-y-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-[#FFEAA7] text-[#D35400] px-3 py-1 rounded-full text-xs font-bold border border-[#FDCB6E]">
            <BookOpen className="w-4 h-4 text-[#D35400]" />
            <span>کتاب درسی رسمی آموزش و پرورش</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#2D3436]">سرفصل‌های کامل کتاب درسی ریاضی سوم دبستان</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            مرور نکات کلیدی، مفاهیم اصلی و تمرین‌های استاندارد هر ۸ فصل کتاب
          </p>
        </div>
        <div className="w-14 h-14 bg-[#6C5CE7] rounded-2xl flex items-center justify-center text-3xl text-white shadow-xs shrink-0">
          📖
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CHAPTERS.map((chapter: ChapterInfo) => (
          <div
            key={chapter.id}
            className="bg-white border-4 border-[#FFEAA7] hover:border-[#FDCB6E] rounded-[2rem] p-6 shadow-[0_6px_0_0_#E0E0E0] transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFEAA7] text-[#D35400] border border-[#FDCB6E]">
                  فصل {chapter.chapterNumber}
                </span>
                <span className="text-3xl">📚</span>
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

            <button
              onClick={() => {
                playSound('click', soundEnabled);
                onSelectChapterForQuiz(chapter.id);
              }}
              className="w-full bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_4px_0_0_#4834D4] hover:translate-y-0.5 active:shadow-none"
            >
              <span>تمرین و آزمون هوشمند این فصل</span>
              <Sparkles className="w-4 h-4 text-[#FFEAA7]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
