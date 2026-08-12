export type ChapterId = 
  | 'patterns'
  | 'place_value'
  | 'fractions'
  | 'multiplication_division'
  | 'perimeter_area'
  | 'regrouping'
  | 'statistics'
  | 'advanced_multiplication';

export interface ChapterInfo {
  id: ChapterId;
  title: string;
  chapterNumber: number;
  iconName: string;
  color: string;
  description: string;
  topics: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  imageUrl?: string;
  timestamp: string;
  stepByStep?: string[];
  practiceQuestion?: QuizQuestion;
  audioText?: string;
}

export interface QuizQuestion {
  id: string;
  chapterId: ChapterId;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint: string;
  visualType?: 'fraction' | 'grid' | 'clock' | 'blocks' | 'multiplication';
  visualData?: any;
}

export interface StudentProfile {
  phoneNumber?: string;
  isLoggedIn?: boolean;
  name: string;
  avatar: string;
  stars: number;
  xp: number;
  level: number;
  streakDays: number;
  solvedCount: number;
  scannedImagesCount: number;
  unlockedBadges: string[];
  chapterMastery: Record<ChapterId, number>; // 0 to 100 percentage
  history: {
    date: string;
    chapterId: ChapterId;
    score: number;
    total: number;
  }[];
}

export type TimeFrame = 'weekly' | 'monthly' | 'yearly';

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  phoneNumber?: string;
  stars: number;
  level: number;
  solvedCount: number;
  weeklyStars: number;
  monthlyStars: number;
  yearlyStars: number;
  rank?: number;
  unlockedBadges: string[];
  chapterMastery: Record<string, number>;
  lastActive: string;
}

export type BadgeCategory = 'daily' | 'weekly' | 'monthly';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  requiredStars?: number;
  requiredSolved?: number;
  requiredScanned?: number;
  requiredStreak?: number;
  requiredLevel?: number;
}
