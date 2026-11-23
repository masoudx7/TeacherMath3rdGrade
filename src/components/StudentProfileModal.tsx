import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { AVATARS } from '../data/curriculum';
import { playSound } from '../utils/sound';
import { X, Check, Sparkles, User, Award } from 'lucide-react';

interface StudentProfileModalProps {
  profile: StudentProfile;
  onSave: (updated: Partial<StudentProfile>) => void;
  onClose: () => void;
  soundEnabled: boolean;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  profile,
  onSave,
  onClose,
  soundEnabled,
}) => {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);

  const handleSave = () => {
    playSound('click', soundEnabled);
    onSave({ name, avatar });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#26354D]/55 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 dir-rtl animate-fadeIn box-border">
      <div className="clay-card p-5 sm:p-6 shadow-2xl w-full max-w-full sm:max-w-md max-h-[90vh] overflow-y-auto space-y-4 sm:space-y-6 relative box-border">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2.5 rounded-full clay-soft hover:bg-white text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1.5">
          <div className="w-16 h-16 rounded-2xl clay-btn-warm flex items-center justify-center text-3xl mx-auto">
            🎨
          </div>
          <h3 className="font-extrabold text-[#26354D] text-xl">پروفایل و آواتار من</h3>
          <p className="text-xs text-slate-500 font-medium">نام و کارتونی که دوست داری رو انتخاب کن!</p>
        </div>

        {/* Student Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#26354D] block">نام یا لقب شما:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="clay-inset w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-[#26354D] focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all text-center"
          />
        </div>

        {/* Avatar Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#26354D] block">انتخاب شخصیت کارتونی:</label>
          <div className="grid grid-cols-4 gap-3">
            {AVATARS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setAvatar(item.id);
                  playSound('pop', soundEnabled);
                }}
                className={`p-3 rounded-2xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  avatar === item.id
                    ? 'clay-btn-warm scale-105'
                    : 'clay-soft hover:bg-white'
                }`}
              >
                <span className="text-3xl">{item.icon}</span>
                <span className="text-[10px] font-bold text-[#26354D] truncate w-full">{item.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="clay-btn-primary w-full font-bold py-4 rounded-2xl text-base cursor-pointer flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          <span>ذخیره تغییرات</span>
        </button>
      </div>
    </div>
  );
};
