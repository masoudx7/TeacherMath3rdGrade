import React, { useState, useEffect } from 'react';
import { Flag, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { IssueType, ReportAnswerRequest } from '../types';

interface ReportButtonProps {
  sessionId?: string;
  messageId: string;
  question: string;
  aiResponse: string;
  userId?: string;
}

const ISSUE_OPTIONS: { type: IssueType; label: string; icon: string; desc: string }[] = [
  {
    type: 'wrong_calculation',
    label: 'محاسبه اشتباه',
    icon: '🧮',
    desc: 'عدد حاصل یا جواب نهایی نادرست است'
  },
  {
    type: 'wrong_method',
    label: 'روش حل اشتباه',
    icon: '📐',
    desc: 'فرمول یا روش توضیح داده شده مطابق کتاب سوم نیست'
  },
  {
    type: 'irrelevant',
    label: 'نامربوط به سوال',
    icon: '❓',
    desc: 'پاسخ به سوال دیگری داده شده یا کامل نیست'
  },
  {
    type: 'inappropriate',
    label: 'نامناسب برای کودک',
    icon: '🛡️',
    desc: 'لحن، کلمات یا محتوا برای دانش‌آموز ۹ ساله مناسب نیست'
  }
];

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes anti-spam cooldown per message

export const ReportButton: React.FC<ReportButtonProps> = ({
  sessionId = 'default_session',
  messageId,
  question,
  aiResponse,
  userId = 'guest_student'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [issueType, setIssueType] = useState<IssueType>('wrong_calculation');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isCooldownActive, setIsCooldownActive] = useState(false);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState<number>(0);

  // Check 5-minute cooldown status on mount and when messageId changes
  useEffect(() => {
    const checkCooldown = () => {
      try {
        const storedTime = localStorage.getItem(`report_cooldown_${messageId}`);
        if (storedTime) {
          const timestamp = parseInt(storedTime, 10);
          const elapsed = Date.now() - timestamp;
          if (elapsed < COOLDOWN_MS) {
            setIsCooldownActive(true);
            setCooldownTimeLeft(Math.ceil((COOLDOWN_MS - elapsed) / 1000));
            return true;
          } else {
            localStorage.removeItem(`report_cooldown_${messageId}`);
          }
        }
      } catch (e) {
        // ignore
      }
      setIsCooldownActive(false);
      setCooldownTimeLeft(0);
      return false;
    };

    checkCooldown();
    const interval = setInterval(() => {
      checkCooldown();
    }, 1000);

    return () => clearInterval(interval);
  }, [messageId]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isCooldownActive) return;

    setLoading(true);

    const payload: ReportAnswerRequest = {
      sessionId,
      messageId,
      question: question || 'سوال کاربر مشخص نشده',
      aiResponse: aiResponse || 'پاسخ هوش مصنوعی مشخص نشده',
      issueType,
      explanation: explanation.trim().slice(0, 500),
      userId,
      timestamp: Date.now()
    };

    try {
      const res = await fetch('/api/report-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Set cooldown timestamp for this message ID
        try {
          localStorage.setItem(`report_cooldown_${messageId}`, Date.now().toString());
        } catch (e) {}

        setIsCooldownActive(true);
        setIsOpen(false);
        setExplanation('');
        showToast('گزارش شما با موفقیت ثبت شد و بررسی خواهد شد. متشکریم! 🙏', 'success');
      } else {
        showToast(data.error || 'خطا در ارسال گزارش. لطفاً دوباره تلاش کنید.', 'error');
      }
    } catch (err: any) {
      showToast('خطا در ارتباط با سرور. لطفاً اینترنت خود را بررسی کنید.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Flag Icon Button */}
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          disabled={isCooldownActive}
          className={`p-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
            isCooldownActive
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-70'
              : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-200'
          }`}
          title={
            isCooldownActive
              ? `گزارش قبلاً ثبت شده است (امکان ارسال مجدد تا ${Math.floor(cooldownTimeLeft / 60)}:${(cooldownTimeLeft % 60).toString().padStart(2, '0')})`
              : 'گزارش پاسخ اشتباه استاد دانا'
          }
        >
          <Flag className={`w-3.5 h-3.5 ${isCooldownActive ? 'text-slate-400' : 'text-slate-400 hover:text-rose-600'}`} />
          <span className="hidden sm:inline">
            {isCooldownActive ? 'گزارش شد' : 'گزارش خطای پاسخ'}
          </span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-11/12 dir-rtl">
          <div
            className={`p-3.5 rounded-2xl shadow-xl border-2 flex items-center gap-2.5 text-xs font-black animate-in fade-in slide-in-from-bottom-4 duration-300 ${
              toastType === 'success'
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-rose-600 text-white border-rose-400'
            }`}
          >
            {toastType === 'success' ? (
              <Check className="w-5 h-5 shrink-0 bg-white/20 rounded-full p-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 bg-white/20 rounded-full p-0.5" />
            )}
            <span className="leading-relaxed flex-1">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Report Form Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 dir-rtl">
          <div className="clay-card w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-rose-100 border border-rose-300 rounded-2xl flex items-center justify-center text-rose-600 font-bold">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900">گزارش پاسخ اشتباه</h3>
                  <p className="text-[11px] text-slate-500 font-medium">به بهبود کیفیت آموزش استاد دانا کمک کنید</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Question Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1">
                <span className="text-[11px] font-bold text-slate-500">متن سوال شما:</span>
                <p className="text-xs font-bold text-slate-800 truncate line-clamp-2 dir-rtl">
                  {question}
                </p>
              </div>

              {/* Issue Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  نوع اشکال پاسخ را انتخاب کنید:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ISSUE_OPTIONS.map((opt) => (
                    <label
                      key={opt.type}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-2.5 ${
                        issueType === opt.type
                          ? 'border-rose-500 bg-rose-50/80 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="issueType"
                        value={opt.type}
                        checked={issueType === opt.type}
                        onChange={() => setIssueType(opt.type)}
                        className="mt-1 accent-rose-600"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-xs font-black text-slate-900">
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">
                          {opt.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Explanation Textarea */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <label htmlFor="explanation">توضیحات تکمیلی (اختیاری):</label>
                  <span className="text-[10px] text-slate-400 font-medium">{explanation.length} / 500</span>
                </div>
                <textarea
                  id="explanation"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value.slice(0, 500))}
                  placeholder="مثال: استاد دانا ضرب ۷ در ۸ را ۵۴ نوشته در حالی که جواب درست ۵۶ است..."
                  rows={3}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-all dir-rtl"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>در حال ثبت...</span>
                    </>
                  ) : (
                    <>
                      <Flag className="w-4 h-4" />
                      <span>ارسال گزارش</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
