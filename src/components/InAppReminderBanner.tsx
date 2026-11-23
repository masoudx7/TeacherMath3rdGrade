import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, X, Clock, Calendar, Check } from 'lucide-react';
import { playSound } from '../utils/sound';

interface InAppReminderProps {
  studentName: string;
  soundEnabled: boolean;
}

const LAST_VISIT_KEY = 'math_app_last_visit_timestamp';
const REMINDER_SETTINGS_KEY = 'math_app_reminder_settings';

export const InAppReminderBanner: React.FC<InAppReminderProps> = ({ studentName, soundEnabled }) => {
  const [showInactivityToast, setShowInactivityToast] = useState(false);
  const [daysAbsent, setDaysAbsent] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [reminderTime, setReminderTime] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(REMINDER_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.time || '18:00';
      }
    } catch (e) {
      console.error(e);
    }
    return '18:00'; // Default 6:00 PM
  });

  const [reminderEnabled, setReminderEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(REMINDER_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.enabled !== undefined ? parsed.enabled : true;
      }
    } catch (e) {
      console.error(e);
    }
    return true;
  });

  const [isSavedNotice, setIsSavedNotice] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const lastVisitStr = localStorage.getItem(LAST_VISIT_KEY);

    if (lastVisitStr) {
      const lastVisit = parseInt(lastVisitStr, 10);
      const diffMs = now - lastVisit;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // If user hasn't visited for 2 or more days
      if (diffDays >= 2) {
        setDaysAbsent(diffDays);
        setShowInactivityToast(true);
      }
    }

    // Update last visit timestamp for current session
    localStorage.setItem(LAST_VISIT_KEY, now.toString());
  }, []);

  const handleSaveSettings = () => {
    try {
      localStorage.setItem(
        REMINDER_SETTINGS_KEY,
        JSON.stringify({ time: reminderTime, enabled: reminderEnabled })
      );
      setIsSavedNotice(true);
      playSound('star', soundEnabled);
      setTimeout(() => {
        setIsSavedNotice(false);
        setShowSettingsModal(false);
      }, 1200);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Toast Notification if user was absent >= 2 days */}
      {showInactivityToast && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:max-w-md z-50 clay-card bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#FDBA74] text-[#26354D] p-4 sm:p-5 shadow-2xl dir-rtl">
          <div className="flex items-start justify-between gap-3">
            <div className="w-12 h-12 bg-white/75 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-xs">
              👋
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-950 mb-1">
                <Bell className="w-4 h-4 text-amber-700" />
                <span>دلمون برات تنگ شده بود، {studentName}!</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#26354D] leading-relaxed">
                {daysAbsent >= 2
                  ? `بیش از ${daysAbsent} روز بود که تمرین ریاضی نداشتی! آماده‌ای با چند تا سوال راحت ستاره بگیری؟ ⭐`
                  : 'وقت یک تمرین سریع ریاضی و بازی شاده!'}
              </p>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setShowInactivityToast(false);
                    setShowSettingsModal(true);
                  }}
                  className="px-3 py-1.5 bg-white text-[#26354D] font-bold rounded-xl text-xs hover:bg-amber-50 transition-all cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>تنظیم زمان یادآور روزانه</span>
                </button>

                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setShowInactivityToast(false);
                  }}
                  className="clay-btn-primary px-3 py-1.5 font-bold rounded-xl text-xs cursor-pointer"
                >
                  باشه، بزنیم بریم! 🚀
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowInactivityToast(false)}
              className="text-amber-900/70 hover:text-[#26354D] transition-colors cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Settings Button */}
      <button
        onClick={() => {
          playSound('click', soundEnabled);
          setShowSettingsModal(true);
        }}
        className="fixed bottom-20 left-4 z-40 w-11 h-11 clay-soft hover:bg-white rounded-2xl flex items-center justify-center text-amber-600 hover:scale-105 transition-all cursor-pointer group"
        title="تنظیم زمان یادآوری تمرین ریاضی"
      >
        <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        {reminderEnabled && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
        )}
      </button>

      {/* Reminder Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#26354D]/55 backdrop-blur-xs animate-fade-in dir-rtl">
          <div className="clay-card w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => {
                playSound('click', soundEnabled);
                setShowSettingsModal(false);
              }}
              className="absolute top-4 left-4 w-9 h-9 rounded-full clay-soft hover:bg-white flex items-center justify-center text-slate-600 font-bold transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-16 h-16 clay-btn-warm rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">
                ⏰
              </div>
              <h3 className="text-xl font-extrabold text-[#26354D]">تنظیم زمان یادآور تمرین</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                برای حفظ پیوستگی یادگیری، ساعت دلخواه تمرین روزانه ریاضی را مشخص کنید.
              </p>
            </div>

            <div className="space-y-4">
              {/* Toggle Enable */}
              <div className="clay-inset flex items-center justify-between p-3.5 rounded-2xl">
                <span className="text-xs font-bold text-[#26354D] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-600" />
                  <span>فعال‌سازی یادآور دوست‌داشتنی</span>
                </span>
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 rounded-lg cursor-pointer"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-xs font-bold text-[#26354D] mb-1.5">
                  ساعت یادآوری روزانه:
                </label>
                <div className="relative flex items-center">
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    disabled={!reminderEnabled}
                    className="clay-inset w-full px-4 py-3 rounded-2xl font-extrabold text-[#26354D] text-center text-lg focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:opacity-40"
                  />
                  <Clock className="w-5 h-5 text-slate-400 absolute right-3 pointer-events-none" />
                </div>
              </div>

              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-xs font-semibold text-amber-900 leading-relaxed">
                💡 در صورت عدم مراجعه دانش‌آموز بیش از ۲ روز، پیام انگیزش‌بخش دوستانه در ساعت انتخاب‌شده ({reminderTime}) نمایش داده خواهد شد.
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleSaveSettings}
                className="clay-btn-warm w-full py-3.5 rounded-2xl cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                {isSavedNotice ? (
                  <>
                    <Check className="w-5 h-5 text-[#26354D]" />
                    <span>تنظیمات ذخیره شد!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>ذخیره ساعت یادآوری</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
