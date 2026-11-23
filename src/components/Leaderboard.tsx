import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Flame, Calendar, RefreshCw, Eye, Sparkles, Shield, Award, ChevronLeft } from 'lucide-react';
import { LeaderboardUser, StudentProfile, TimeFrame } from '../types';
import { PublicReportCardModal } from './PublicReportCardModal';
import { playSound } from '../utils/sound';

interface LeaderboardProps {
  currentProfile: StudentProfile;
  soundEnabled: boolean;
}

const AVATARS: Record<string, string> = {
  fox: '🦊',
  bear: '🐻',
  owl: '🦉',
  rabbit: '🐰',
  lion: '🦁',
  panda: '🐼',
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentProfile, soundEnabled }) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>('weekly');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  const fetchLeaderboard = async (tf: TimeFrame) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?timeframe=${tf}`);
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(timeframe);
  }, [timeframe]);

  const handleSyncMyReportCard = async () => {
    setSyncing(true);
    playSound('click', soundEnabled);

    try {
      const userId = currentProfile.phoneNumber || `user_${currentProfile.name.replace(/\s+/g, '_')}`;

      const res = await fetch('/api/leaderboard/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: currentProfile.name,
          avatar: currentProfile.avatar,
          phoneNumber: currentProfile.phoneNumber,
          stars: currentProfile.stars,
          level: currentProfile.level,
          solvedCount: currentProfile.solvedCount,
          unlockedBadges: currentProfile.unlockedBadges,
          chapterMastery: currentProfile.chapterMastery,
        }),
      });

      if (res.ok) {
        playSound('star', soundEnabled);
        setSyncSuccessMessage('کارنامه شما با موفقیت در جدول برترین‌ها به‌روزرسانی شد! ⭐');
        setTimeout(() => setSyncSuccessMessage(null), 4000);
        fetchLeaderboard(timeframe);
      }
    } catch (err) {
      console.error('Error syncing profile:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleUserClick = (user: LeaderboardUser) => {
    playSound('pop', soundEnabled);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const top1 = users[0];
  const top2 = users[1];
  const top3 = users[2];
  const restUsers = users.slice(3);

  const getTimeframeStars = (user: LeaderboardUser) => {
    if (timeframe === 'weekly') return user.weeklyStars;
    if (timeframe === 'monthly') return user.monthlyStars;
    return user.yearlyStars;
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden px-2 sm:px-4 max-w-4xl mx-auto space-y-6 pb-12 dir-rtl box-border">
      {/* Header Banner */}
      <div className="clay-card p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-amber-200/35 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right">
            <div className="inline-flex items-center gap-2 bg-amber-100/80 px-3.5 py-1 rounded-full text-xs font-bold mb-3 border border-amber-200/80 text-amber-900">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>رقابت کشوری ریاضی سوم دبستان</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#26354D] mb-2">جدول برترین‌های ریاضی</h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md">
              امتیازات و کارنامه قهرمانان ریاضی پایه سوم! روی نام هر دانش‌آموز کلیک کنید تا کارنامه‌اش را ببینید.
            </p>
          </div>

          <button
            onClick={handleSyncMyReportCard}
            disabled={syncing}
            className="clay-btn-warm px-5 py-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs sm:text-sm shrink-0 whitespace-nowrap"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            <span>ثبت و به‌روزرسانی کارنامه من</span>
          </button>
        </div>

        {syncSuccessMessage && (
          <div className="mt-4 p-3 bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-2xl text-center shadow-sm">
            {syncSuccessMessage}
          </div>
        )}
      </div>

      {/* Timeframe Selector Tabs */}
      <div className="clay-inset flex p-1.5 rounded-2xl gap-1.5">
        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setTimeframe('weekly');
          }}
          className={`flex-1 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
            timeframe === 'weekly'
              ? 'clay-btn-warm shadow-sm'
              : 'text-[#26354D]/75 hover:bg-white/70'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-600" />
          <span>بهترین‌های هفته 🌟</span>
        </button>

        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setTimeframe('monthly');
          }}
          className={`flex-1 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
            timeframe === 'monthly'
              ? 'clay-btn-primary'
              : 'text-[#26354D]/75 hover:bg-white/70'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>بهترین‌های ماه 📅</span>
        </button>

        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setTimeframe('yearly');
          }}
          className={`flex-1 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
            timeframe === 'yearly'
              ? 'clay-btn-primary'
              : 'text-[#26354D]/75 hover:bg-white/70'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-300" />
          <span>بهترین‌ها در همه زمان‌ها 🏆</span>
        </button>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-bold flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
          <span>در حال دریافت جدول قهرمانان...</span>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-5 items-end pt-7 pb-2">
            {/* RANK 2 - SILVER */}
            {top2 ? (
              <div
                onClick={() => handleUserClick(top2)}
                className="clay-soft p-3 sm:p-5 text-center hover:-translate-y-1 transition-all cursor-pointer relative"
              >
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-200 text-[#26354D] text-[11px] font-bold px-3 py-1 rounded-full border border-white shadow-xs whitespace-nowrap">
                  مقام دوم 🥈
                </div>
                <div className="text-4xl sm:text-5xl my-3">{AVATARS[top2.avatar] || '🦊'}</div>
                <h3 className="font-bold text-xs sm:text-base text-[#26354D] truncate">{top2.name}</h3>
                <div className="inline-flex items-center gap-1 bg-amber-100/80 text-amber-900 px-2.5 py-0.5 rounded-full text-[11px] font-bold mt-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{getTimeframeStars(top2)} ستاره</span>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>دیدن کارنامه</span>
                </div>
              </div>
            ) : <div />}

            {/* RANK 1 - GOLD */}
            {top1 ? (
              <div
                onClick={() => handleUserClick(top1)}
                className="clay-card bg-gradient-to-b from-[#FFFDF7] to-[#FEF3C7]/70 p-4 sm:p-6 text-center hover:-translate-y-1.5 transition-all cursor-pointer relative -mt-6 z-10"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-400 text-[#26354D] text-xs font-extrabold px-4 py-1 rounded-full border border-white shadow-sm flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>قهرمان اول 🥇</span>
                </div>
                <div className="text-5xl sm:text-6xl my-3">{AVATARS[top1.avatar] || '🦊'}</div>
                <h3 className="font-extrabold text-sm sm:text-lg text-[#26354D] truncate">{top1.name}</h3>
                <div className="inline-flex items-center gap-1 bg-amber-300/80 text-[#26354D] px-3 py-1 rounded-full text-xs font-bold mt-2">
                  <Star className="w-4 h-4 fill-amber-700 text-amber-700" />
                  <span>{getTimeframeStars(top1)} ستاره</span>
                </div>
                <div className="mt-2.5 text-[11px] text-amber-900 font-semibold flex items-center justify-center gap-1 bg-amber-200/50 px-2 py-0.5 rounded-lg">
                  <Eye className="w-3.5 h-3.5" />
                  <span>مشاهده کارنامه عمومی</span>
                </div>
              </div>
            ) : <div />}

            {/* RANK 3 - BRONZE */}
            {top3 ? (
              <div
                onClick={() => handleUserClick(top3)}
                className="clay-soft bg-gradient-to-b from-[#FFFDF7] to-[#FFEDD5]/60 p-3 sm:p-5 text-center hover:-translate-y-1 transition-all cursor-pointer relative"
              >
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white shadow-xs whitespace-nowrap">
                  مقام سوم 🥉
                </div>
                <div className="text-4xl sm:text-5xl my-3">{AVATARS[top3.avatar] || '🦊'}</div>
                <h3 className="font-bold text-xs sm:text-base text-[#26354D] truncate">{top3.name}</h3>
                <div className="inline-flex items-center gap-1 bg-amber-100/80 text-amber-900 px-2.5 py-0.5 rounded-full text-[11px] font-bold mt-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{getTimeframeStars(top3)} ستاره</span>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>دیدن کارنامه</span>
                </div>
              </div>
            ) : <div />}
          </div>

          {/* Full Rankings List Table */}
          <div className="clay-card p-4 sm:p-6 space-y-3">
            <h3 className="text-sm sm:text-base font-black text-slate-800 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-purple-600" />
                <span>لیست کامل رتبه‌بندی دانش‌آموزان</span>
              </span>
              <span className="text-xs font-bold text-slate-400">روی هر فرد کلیک کنید</span>
            </h3>

            <div className="divide-y divide-slate-100">
              {users.map((user) => {
                const isMe = currentProfile.phoneNumber && user.phoneNumber === currentProfile.phoneNumber;
                return (
                  <div
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer hover:bg-slate-50 ${
                      isMe ? 'bg-amber-50 border-2 border-amber-300 font-bold shadow-xs' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                        user.rank === 1 ? 'bg-amber-400 text-amber-950' :
                        user.rank === 2 ? 'bg-slate-300 text-slate-800' :
                        user.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        #{user.rank}
                      </span>

                      <div className="text-2xl">{AVATARS[user.avatar] || '🦊'}</div>

                      <div>
                        <div className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2">
                          <span>{user.name}</span>
                          {isMe && (
                            <span className="bg-amber-400 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-black">
                              شما
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-2 mt-0.5">
                          <span>سطح {user.level}</span>
                          <span>•</span>
                          <span>{user.solvedCount} مسئله حل‌شده</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-left dir-ltr">
                        <div className="inline-flex items-center gap-1 font-black text-xs sm:text-sm text-amber-600">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span>{getTimeframeStars(user)}</span>
                        </div>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-slate-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Public Report Card Modal */}
      <PublicReportCardModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        soundEnabled={soundEnabled}
      />
    </div>
  );
};
