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
    <div className="fixed inset-0 z-50 bg-[#2D3436]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 dir-rtl animate-fadeIn box-border">
      <div className="bg-white border-4 border-[#A29BFE] rounded-[2rem] p-4 sm:p-6 shadow-2xl w-full max-w-full sm:max-w-md max-h-[90vh] overflow-y-auto space-y-4 sm:space-y-6 relative box-border">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-16 h-16 rounded-2xl bg-[#FF6B6B] border-2 border-white flex items-center justify-center text-3xl mx-auto shadow-xs text-white">
            🎨
          </div>
          <h3 className="font-bold text-[#2D3436] text-xl">پروفایل و آواتار من</h3>
          <p className="text-xs text-slate-500">نام و کارتونی که دوست داری رو انتخاب کن!</p>
        </div>

        {/* Student Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">نام یا لقب شما:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#F0F2F5] border-none rounded-2xl px-4 py-3.5 text-sm font-bold text-[#2D3436] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] transition-all text-center"
          />
        </div>

        {/* Avatar Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">انتخاب شخصیت کارتونی:</label>
          <div className="grid grid-cols-4 gap-3">
            {AVATARS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setAvatar(item.id);
                  playSound('pop', soundEnabled);
                }}
                className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  avatar === item.id
                    ? 'bg-[#FFEAA7] border-[#FDCB6E] shadow-xs scale-105'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-3xl">{item.icon}</span>
                <span className="text-[10px] font-bold text-slate-700 truncate w-full">{item.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white font-bold py-4 rounded-2xl shadow-[0_4px_0_0_#4834D4] hover:translate-y-0.5 active:shadow-none text-base cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          <span>ذخیره تغییرات</span>
        </button>
      </div>
    </div>
  );
};
