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
        <div className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:max-w-md z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-4 sm:p-5 shadow-2xl border-4 border-amber-200 animate-bounce-short dir-rtl">
          <div className="flex items-start justify-between gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner">
              👋
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-100 mb-1">
                <Bell className="w-4 h-4 animate-bounce" />
                <span>دلمون برات تنگ شده بود، {studentName}!</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                {daysAbsent >= 2
                  ? `بیش از ${daysAbsent} روز بود که تمرین ریاضی نداشتی! آماده‌ای با چند تا سوال راحت ستاره بگیری؟ ⭐`
                  : 'وقت یک تمرین سریع ریاضی و بازی شاده!'}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setShowInactivityToast(false);
                    setShowSettingsModal(true);
                  }}
                  className="px-3 py-1.5 bg-white text-amber-900 font-black rounded-xl text-xs hover:bg-amber-50 transition-all cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>تنظیم زمان یادآور रोजाना</span>
                </button>

                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setShowInactivityToast(false);
                  }}
                  className="px-3 py-1.5 bg-amber-700/60 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  باشه، بزنیم بریم! 🚀
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowInactivityToast(false)}
              className="text-amber-200 hover:text-white transition-colors cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Settings Button in Footer or Header */}
      <button
        onClick={() => {
          playSound('click', soundEnabled);
          setShowSettingsModal(true);
        }}
        className="fixed bottom-20 left-4 z-40 w-11 h-11 bg-white border-2 border-amber-300 rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center text-amber-600 hover:scale-105 transition-all cursor-pointer group"
        title="تنظیم زمان یادآوری تمرین ریاضی"
      >
        <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        {reminderEnabled && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
        )}
      </button>

      {/* Reminder Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in dir-rtl">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border-4 border-amber-300 relative">
            <button
              onClick={() => {
                playSound('click', soundEnabled);
                setShowSettingsModal(false);
              }}
              className="absolute top-4 left-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-amber-100 border-4 border-amber-300 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-600 text-3xl shadow-xs">
                ⏰
              </div>
              <h3 className="text-xl font-black text-slate-800">تنظیم زمان یادآور تمرین</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                برای حفظ پیوستگی یادگیری، ساعت دلخواه تمرین روزانه ریاضی را مشخص کنید.
              </p>
            </div>

            <div className="space-y-4">
              {/* Toggle Enable */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ساعت یادآوری روزانه:
                </label>
                <div className="relative flex items-center">
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    disabled={!reminderEnabled}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-800 text-center text-lg focus:border-amber-500 focus:bg-white focus:outline-hidden disabled:opacity-40"
                  />
                  <Clock className="w-5 h-5 text-slate-400 absolute right-3 pointer-events-none" />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs font-semibold text-amber-900 leading-relaxed">
                💡 در صورت عدم مراجعه دانش‌آموز بیش از ۲ روز، پیام انگیزش‌بخش دوستانه در ساعت انتخاب‌شده ({reminderTime}) نمایش داده خواهد شد.
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleSaveSettings}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:translate-y-0.5 text-amber-950 font-black rounded-2xl shadow-[0_4px_0_0_#d97706] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                {isSavedNotice ? (
                  <>
                    <Check className="w-5 h-5 text-amber-950" />
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
