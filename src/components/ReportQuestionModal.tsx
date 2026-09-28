import React, { useState } from 'react';
import { Flag, X, AlertCircle, CheckCircle2, Send, ShieldAlert } from 'lucide-react';
import { playSound } from '../utils/sound';

export interface ReportQuestionModalProps {
  isOpen: boolean;
  questionId: string;
  questionText?: string;
  onClose: () => void;
  onFlagged?: (questionId: string) => void;
  soundEnabled?: boolean;
}

const COMMON_REASONS = [
  'گزینه درست در بین پاسخ‌ها وجود ندارد',
  'متن سوال یا صورت مسئله اشتباه یا نامفهوم است',
  'پاسخ تشریحی یا راهنمایی غلط است',
  'سطح دشواری سوال مناسب پایه سوم ابتدایی نیست',
  'تصویر یا اشکال هندسی با سوال همخوانی ندارد',
];

export const ReportQuestionModal: React.FC<ReportQuestionModalProps> = ({
  isOpen,
  questionId,
  questionText,
  onClose,
  onFlagged,
  soundEnabled = true,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(COMMON_REASONS[0]);
  const [customComment, setCustomComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const fullReason = customComment.trim()
      ? `${selectedReason}: ${customComment.trim()}`
      : selectedReason;

    try {
      const res = await fetch(`/api/questions/${encodeURIComponent(questionId)}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: fullReason }),
      });

      if (!res.ok) {
        throw new Error('خطا در ثبت گزارش سوال');
      }

      setIsSuccess(true);
      playSound('correct', soundEnabled);

      setTimeout(() => {
        onFlagged?.(questionId);
        onClose();
        setIsSuccess(false);
        setCustomComment('');
      }, 1600);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('متأسفانه در ثبت گزارش مشکلی رخ داد. لطفاً دوباره تلاش کنید.');
      playSound('wrong', soundEnabled);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in dir-rtl">
      <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-rose-200 relative">
        {/* دکمه بستن */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          title="انصراف"
        >
          <X className="w-5 h-5" />
        </button>

        {/* هدر */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-rose-100">
          <div className="w-11 h-11 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-800">
              گزارش اشکال در سوال ریاضی 🚩
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              کمک به بهبود کیفیت و دقت سوالات پایه سوم ابتدایی
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-3 animate-fade-in">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-emerald-900">
              با تشکر از دقت نظر شما! 🙏✨
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              این سوال بلافاصله قرنطینه و از چرخه آزمون دانش‌آموزان خارج شد تا توسط تیم کارشناسی بازبینی گردد.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {questionText && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-700 font-medium max-h-24 overflow-y-auto">
                <span className="font-bold text-slate-500 block mb-1">صورت سوال:</span>
                {questionText}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-700 block">
                علت گزارش را انتخاب فرمایید:
              </label>
              <div className="space-y-1.5">
                {COMMON_REASONS.map((r, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      selectedReason === r
                        ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      checked={selectedReason === r}
                      onChange={() => setSelectedReason(r)}
                      className="text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-500"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* توضیحات تکمیلی اختیاری */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">
                توضیحات تکمیلی (اختیاری):
              </label>
              <textarea
                value={customComment}
                onChange={(e) => setCustomComment(e.target.value)}
                placeholder="مثلاً: جواب صحیح عدد ۲۴ می‌شود اما در گزینه‌ها نیست..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-rose-500 focus:outline-none leading-relaxed"
              />
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'در حال ارسال...' : 'ثبت و حذف سوال'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
