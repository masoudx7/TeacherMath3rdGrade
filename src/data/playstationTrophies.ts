export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'ultra_rare';

export interface Trophy {
  id: string;
  title: string;
  description: string;
  tier: Tier;
  rarity: Rarity;
  percentUnlock: number;
  condition: {
    type: 'solved' | 'streak' | 'mastery' | 'composite';
    threshold: number | Record<string, number>;
  };
  icon: string;
}

export const TROPHIES: Trophy[] = [
  // --- Bronze Trophies (10) ---
  { id: 't_b1', title: 'قدم اول', description: '۱۰ مسئله حل کن', tier: 'bronze', rarity: 'common', percentUnlock: 90, condition: { type: 'solved', threshold: 10 }, icon: '🥉' },
  { id: 't_b2', title: 'عادت‌ساز', description: '۳ روز پیاپی', tier: 'bronze', rarity: 'common', percentUnlock: 85, condition: { type: 'streak', threshold: 3 }, icon: '🔥' },
  { id: 't_b3', title: 'شروع تسلط', description: 'رسیدن به ۵۰٪ تسلط در ۱ فصل', tier: 'bronze', rarity: 'uncommon', percentUnlock: 75, condition: { type: 'mastery', threshold: 0.5 }, icon: '📚' },
  { id: 't_b4', title: 'شمارشگر دقیق', description: '۲۰ مسئله حل کن', tier: 'bronze', rarity: 'common', percentUnlock: 80, condition: { type: 'solved', threshold: 20 }, icon: '🔢' },
  { id: 't_b5', title: 'پنج‌ضلعی', description: '۵ روز پیاپی', tier: 'bronze', rarity: 'common', percentUnlock: 70, condition: { type: 'streak', threshold: 5 }, icon: '⭐' },
  { id: 't_b6', title: 'جمع‌بندی اول', description: '۳۰ مسئله حل کن', tier: 'bronze', rarity: 'uncommon', percentUnlock: 65, condition: { type: 'solved', threshold: 30 }, icon: '➕' },
  { id: 't_b7', title: 'ساعت‌شناس', description: 'حل تمرین‌های زمان و ساعت', tier: 'bronze', rarity: 'common', percentUnlock: 72, condition: { type: 'solved', threshold: 15 }, icon: '⏰' },
  { id: 't_b8', title: 'کسر کوچک', description: 'آشنایی با مفهوم کسر', tier: 'bronze', rarity: 'common', percentUnlock: 68, condition: { type: 'solved', threshold: 25 }, icon: '🍕' },
  { id: 't_b9', title: 'ضرب‌آموز', description: 'شروع جدول ضرب', tier: 'bronze', rarity: 'common', percentUnlock: 60, condition: { type: 'solved', threshold: 40 }, icon: '✖️' },
  { id: 't_b10', title: 'تلاش‌گر', description: '۴۵ مسئله حل کن', tier: 'bronze', rarity: 'uncommon', percentUnlock: 55, condition: { type: 'solved', threshold: 45 }, icon: '🎯' },

  // --- Silver Trophies (10) ---
  { id: 't_s1', title: 'شاگرد ساعی', description: '۵۰ مسئله حل کن', tier: 'silver', rarity: 'uncommon', percentUnlock: 50, condition: { type: 'solved', threshold: 50 }, icon: '🥈' },
  { id: 't_s2', title: 'هفته‌ساز', description: '۷ روز پیاپی', tier: 'silver', rarity: 'uncommon', percentUnlock: 40, condition: { type: 'streak', threshold: 7 }, icon: '🗓️' },
  { id: 't_s3', title: 'مسلط متوسط', description: 'رسیدن به ۸۰٪ تسلط در ۱ فصل', tier: 'silver', rarity: 'rare', percentUnlock: 30, condition: { type: 'mastery', threshold: 0.8 }, icon: '🎖️' },
  { id: 't_s4', title: 'ضرب‌دان', description: '۷۵ مسئله حل کن', tier: 'silver', rarity: 'uncommon', percentUnlock: 35, condition: { type: 'solved', threshold: 75 }, icon: '🧮' },
  { id: 't_s5', title: 'مداومت طلایی', description: '۱۰ روز پیاپی', tier: 'silver', rarity: 'rare', percentUnlock: 25, condition: { type: 'streak', threshold: 10 }, icon: '⚡' },
  { id: 't_s6', title: 'هندسه‌دان', description: '۱۰۰ مسئله حل کن', tier: 'silver', rarity: 'rare', percentUnlock: 22, condition: { type: 'solved', threshold: 100 }, icon: '📐' },
  { id: 't_s7', title: 'دو فصل مسلط', description: 'تسلط ۸۰٪ در ۲ فصل مختلف', tier: 'silver', rarity: 'rare', percentUnlock: 20, condition: { type: 'mastery', threshold: 2 }, icon: '📖' },
  { id: 't_s8', title: 'پرتلاش', description: '۱۲0 مسئله حل کن', tier: 'silver', rarity: 'rare', percentUnlock: 18, condition: { type: 'solved', threshold: 120 }, icon: '🏅' },
  { id: 't_s9', title: 'پویش دو هفته‌ای', description: '۱۴ روز پیاپی', tier: 'silver', rarity: 'rare', percentUnlock: 16, condition: { type: 'streak', threshold: 14 }, icon: '🔥' },
  { id: 't_s10', title: 'آمارگر کوچک', description: '۱۴۰ مسئله حل کن', tier: 'silver', rarity: 'rare', percentUnlock: 15, condition: { type: 'solved', threshold: 140 }, icon: '📊' },

  // --- Gold Trophies (7) ---
  { id: 't_g1', title: 'استاد حل‌مسئله', description: '۱۵۰ مسئله حل کن', tier: 'gold', rarity: 'rare', percentUnlock: 15, condition: { type: 'solved', threshold: 150 }, icon: '🥇' },
  { id: 't_g2', title: 'ماه طلایی', description: '۳۰ روز پیاپی', tier: 'gold', rarity: 'rare', percentUnlock: 10, condition: { type: 'streak', threshold: 30 }, icon: '🌙' },
  { id: 't_g3', title: 'کارشناس ریاضی', description: 'تسلط ۸۰٪ در ۳ فصل مختلف', tier: 'gold', rarity: 'rare', percentUnlock: 8, condition: { type: 'mastery', threshold: 3 }, icon: '🎓' },
  { id: 't_g4', title: 'نابغه ضرب و تقسیم', description: '۲۵۰ مسئله حل کن', tier: 'gold', rarity: 'rare', percentUnlock: 6, condition: { type: 'solved', threshold: 250 }, icon: '👑' },
  { id: 't_g5', title: 'استمرار فصل', description: '۴۵ روز پیاپی', tier: 'gold', rarity: 'ultra_rare', percentUnlock: 4, condition: { type: 'streak', threshold: 45 }, icon: '🌟' },
  { id: 't_g6', title: 'ریاضی‌دان برتر', description: '۳۵۰ مسئله حل کن', tier: 'gold', rarity: 'ultra_rare', percentUnlock: 3, condition: { type: 'solved', threshold: 350 }, icon: '💎' },
  { id: 't_g7', title: 'پنج فصل مسلط', description: 'تسلط ۸۰٪ در ۵ فصل مختلف', tier: 'gold', rarity: 'ultra_rare', percentUnlock: 2.5, condition: { type: 'mastery', threshold: 5 }, icon: '🏛️' },

  // --- Platinum Trophies (3) ---
  { id: 't_p1', title: 'افسانه ریاضی', description: '۵۰۰ مسئله حل کن', tier: 'platinum', rarity: 'ultra_rare', percentUnlock: 2, condition: { type: 'solved', threshold: 500 }, icon: '🏆' },
  { id: 't_p2', title: 'بنیان‌گذار دانا', description: '۹۰ روز پیاپی', tier: 'platinum', rarity: 'ultra_rare', percentUnlock: 1, condition: { type: 'streak', threshold: 90 }, icon: '⚡' },
  { id: 't_p3', title: 'پلاتین استاد دانا', description: 'تسلط کامل و ۸۰٪ بر هر ۸ فصل کتاب', tier: 'platinum', rarity: 'ultra_rare', percentUnlock: 0.5, condition: { type: 'mastery', threshold: 8 }, icon: '👑' },
];

export const BADGES = TROPHIES;
