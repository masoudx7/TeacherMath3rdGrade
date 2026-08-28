import React, { useState } from 'react';
import { playSound } from '../../utils/sound';
import { Trophy, Flame, RefreshCw, CheckCircle2, ChevronRight, ChevronLeft, Shuffle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PatternMachineGameProps {
  soundEnabled: boolean;
  onAddStars: (count: number) => void;
  onIncrementSolved: () => void;
}

type Mode = 'pattern_finder' | 'input_output_machine' | 'geometric_pattern';

export const PatternMachineGame: React.FC<PatternMachineGameProps> = ({
  soundEnabled,
  onAddStars,
  onIncrementSolved,
}) => {
  const [mode, setMode] = useState<Mode>('geometric_pattern');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // 1. Pattern Finder Questions Data (12 diverse numerical patterns)
  const patternQuestions = [
    {
      sequence: ['۳', '۶', '۹', '❓', '۱۵', '۱۸'],
      options: ['۱۰', '۱۲', '۱۱', '۱۴'],
      correct: '۱۲',
      stepText: 'هر بار ۳ تا اضافه می‌شود (شمارش ۳تا ۳تا)',
      rule: '+۳'
    },
    {
      sequence: ['۵', '۱۰', '۱۵', '۲۰', '❓', '۳۰'],
      options: ['۲۲', '۲۵', '۲۴', '۲۶'],
      correct: '۲۵',
      stepText: 'هر بار ۵ تا اضافه می‌شود (شمارش ۵تا ۵تا)',
      rule: '+۵'
    },
    {
      sequence: ['۴', '۸', '۱۲', '۱۶', '❓', '۲۴'],
      options: ['۱۸', '۲۰', '۱۹', '۲۲'],
      correct: '۲۰',
      stepText: 'هر بار ۴ تا اضافه می‌شود (شمارش ۴تا ۴تا)',
      rule: '+۴'
    },
    {
      sequence: ['۱۰۰', '۲۰۰', '۳۰۰', '❓', '۵۰۰'],
      options: ['۳۵۰', '۴۰۰', '۴۵۰', '۶۰۰'],
      correct: '۴۰۰',
      stepText: 'هر بار ۱۰۰ تا اضافه می‌شود (شمارش ۱۰۰تا ۱۰۰تا)',
      rule: '+۱۰۰'
    },
    {
      sequence: ['۵۰', '۴۵', '۴۰', '❓', '۳۰'],
      options: ['۳۵', '۳۸', '۳۶', '۳۲'],
      correct: '۳۵',
      stepText: 'الگوی کاهشی: هر بار ۵ تا کم می‌شود (-۵)',
      rule: '-۵'
    },
    {
      sequence: ['۲', '۴', '۸', '❓', '۳۲'],
      options: ['۱۰', '۱۲', '۱۶', '۱۴'],
      correct: '۱۶',
      stepText: 'الگوی دوبرابر شدن: هر عدد ضرب در ۲ می‌شود',
      rule: '×۲'
    },
    {
      sequence: ['۷', '۱۴', '۲۱', '۲۸', '❓', '۴۲'],
      options: ['۳۲', '۳۵', '۳۶', '۴۰'],
      correct: '۳۵',
      stepText: 'شمارش ۷تا ۷تا (جدول ضرب ۷): ۲۸ + ۷ = ۳۵',
      rule: '+۷'
    },
    {
      sequence: ['۹', '۱۸', '۲۷', '❓', '۴۵'],
      options: ['۳۴', '۳۵', '۳۶', '۳۸'],
      correct: '۳۶',
      stepText: 'شمارش ۹تا ۹تا (جدول ضرب ۹): ۲۷ + ۹ = ۳۶',
      rule: '+۹'
    },
    {
      sequence: ['۸۰', '۷۲', '۶۴', '❓', '۴۸'],
      options: ['۵۴', '۵۶', '۵۸', '۶۰'],
      correct: '۵۶',
      stepText: 'الگوی کاهشی ۸تایی: ۶۴ - ۸ = ۵۶',
      rule: '-۸'
    },
    {
      sequence: ['۱۰', '۲۵', '۴۰', '❓', '۷۰'],
      options: ['۵۰', '۵۵', '۶۰', '۶۵'],
      correct: '۵۵',
      stepText: 'الگوی ۱۵تایی افزایشی: ۴۰ + ۱۵ = ۵۵',
      rule: '+۱۵'
    },
    {
      sequence: ['۱', '۳', '۶', '۱۰', '❓'],
      options: ['۱۳', '۱۴', '۱۵', '۱۶'],
      correct: '۱۵',
      stepText: 'الگوی افزایشی تصاعدی (+۲, +۳, +۴, +۵): ۱۰ + ۵ = ۱۵',
      rule: 'افزایش گام‌ها'
    },
    {
      sequence: ['۱۰۰۰', '۲۰۰۰', '۳۰۰۰', '❓', '۵۰۰۰'],
      options: ['۳۵۰۰', '۴۰۰۰', '۴۵۰۰', '۶۰۰۰'],
      correct: '۴۰۰۰',
      stepText: 'شمارش ۱۰۰۰ تا ۱۰۰۰ تا: ۳۰۰۰ + ۱۰۰۰ = ۴۰۰۰',
      rule: '+۱۰۰۰'
    }
  ];

  // 2. Input/Output Machine Questions (10 diverse machine challenges)
  const machineQuestions = [
    {
      input: 7,
      ruleName: 'افزودن ۴ (➕ ۴)',
      operation: (n: number) => n + 4,
      correctOutput: 11,
      options: [10, 11, 12, 14],
      hint: 'عدد ۷ وارد ماشین می‌شود و ۴ واحد به آن اضافه می‌شود.'
    },
    {
      input: 5,
      ruleName: 'ضرب در ۳ (✖️ ۳)',
      operation: (n: number) => n * 3,
      correctOutput: 15,
      options: [12, 15, 18, 10],
      hint: 'عدد ۵ وارد ماشین می‌شود و ۳ برابر می‌شود.'
    },
    {
      input: 20,
      ruleName: 'کاهش ۶ (➖ ۶)',
      operation: (n: number) => n - 6,
      correctOutput: 14,
      options: [12, 13, 14, 16],
      hint: 'از عدد ۲۰ مقدار ۶ واحد کم کن (۲۰ - ۶).'
    },
    {
      input: 8,
      ruleName: 'ضرب در ۲ و اضافه کردن ۱ (✖️۲ + ۱)',
      operation: (n: number) => n * 2 + 1,
      correctOutput: 17,
      options: [15, 16, 17, 18],
      hint: 'اول ۸ ضرب در ۲ می‌شود (۱۶)، بعد ۱ واحد به آن اضافه می‌شود (۱۷).'
    },
    {
      input: 6,
      ruleName: 'ضرب در ۵ (✖️ ۵)',
      operation: (n: number) => n * 5,
      correctOutput: 30,
      options: [25, 28, 30, 35],
      hint: 'عدد ۶ را ۵ بار با خودش جمع کن یا ۶ × ۵ را حساب کن.'
    },
    {
      input: 36,
      ruleName: 'تقسیم بر ۴ (➗ ۴)',
      operation: (n: number) => n / 4,
      correctOutput: 9,
      options: [7, 8, 9, 10],
      hint: 'چه عددی ضرب در ۴ برابر ۳۶ می‌شود؟'
    },
    {
      input: 9,
      ruleName: 'ضرب در ۴ و منهای ۵ (✖️۴ - ۵)',
      operation: (n: number) => n * 4 - 5,
      correctOutput: 31,
      options: [28, 30, 31, 36],
      hint: 'ابتدا ۹ × ۴ = ۳۶، سپس ۳۶ - ۵ = ۳۱.'
    },
    {
      input: 50,
      ruleName: 'نصف کردن و اضافه کردن ۱۰ (➗۲ + ۱۰)',
      operation: (n: number) => n / 2 + 10,
      correctOutput: 35,
      options: [30, 35, 40, 45],
      hint: 'نصف ۵۰ می‌شود ۲۵، سپس ۲۵ + ۱۰ = ۳۵.'
    },
    {
      input: 12,
      ruleName: 'به اضافه ۸ و سپس ضرب در ۲ (➕۸ ➔ ✖️۲)',
      operation: (n: number) => (n + 8) * 2,
      correctOutput: 40,
      options: [32, 38, 40, 44],
      hint: 'ابتدا ۱۲ + ۸ = ۲۰، سپس ۲۰ × ۲ = ۴۰.'
    },
    {
      input: 4,
      ruleName: 'ضرب در خودش (توان ۲) (✖️ خودش)',
      operation: (n: number) => n * n,
      correctOutput: 16,
      options: [12, 14, 16, 20],
      hint: 'مساحت مربع: ۴ ضرب در ۴ = ۱۶.'
    }
  ];

  // 3. Geometric Patterns (16 rich, diverse visual questions for Grade 3)
  const geoQuestions = [
    {
      id: 'geo_1',
      title: 'الگوی مربع‌های شطرنجی',
      steps: [
        { label: 'شکل ۱', count: 2, icon: '🟩' },
        { label: 'شکل ۲', count: 4, icon: '🟩' },
        { label: 'شکل ۳', count: 6, icon: '🟩' },
      ],
      questionText: 'در شکل ۴ چند مربع وجود دارد؟',
      correct: 8,
      options: [7, 8, 9, 10],
      formulaHint: 'قانون: شماره شکل × ۲',
      explanation: 'تعداد مربع‌ها ۲ تا ۲ تا زیاد می‌شود: ۲، ۴، ۶، ۸. پس در شکل چهارم ۸ مربع داریم.'
    },
    {
      id: 'geo_2',
      title: 'الگوی مثلث‌های رنگی',
      steps: [
        { label: 'شکل ۱', count: 1, icon: '🔺' },
        { label: 'شکل ۲', count: 3, icon: '🔺' },
        { label: 'شکل ۳', count: 5, icon: '🔺' },
      ],
      questionText: 'در شکل ۴ چند مثلث وجود دارد؟',
      correct: 7,
      options: [6, 7, 8, 9],
      formulaHint: 'قانون: اعداد فرد (۲ تا ۲ تا افزایش)',
      explanation: 'تعداد مثلث‌ها با گام‌های ۲تایی زیاد می‌شود: ۱، ۳، ۵، ۷. پس در شکل چهارم ۷ مثلث داریم.'
    },
    {
      id: 'geo_3',
      title: 'الگوی چوب‌کبریت‌های خانه‌سازی',
      steps: [
        { label: 'شکل ۱ (۱ خانه)', count: 5, icon: '🪵' },
        { label: 'شکل ۲ (۲ خانه)', count: 9, icon: '🪵' },
        { label: 'شکل ۳ (۳ خانه)', count: 13, icon: '🪵' },
      ],
      questionText: 'برای ساخت شکل ۴ (۴ خانه متصل)، به چند چوب‌کبریت نیاز داریم؟',
      correct: 17,
      options: [15, 16, 17, 18],
      formulaHint: 'قانون: شماره شکل × ۴ + ۱',
      explanation: 'خانه اول ۵ چوب‌کبریت دارد و هر خانه بعدی با ۴ چوب‌کبریت اضافه می‌شود: ۱۳ + ۴ = ۱۷.'
    },
    {
      id: 'geo_4',
      title: 'الگوی ستاره‌های طلایی',
      steps: [
        { label: 'شکل ۱', count: 3, icon: '⭐' },
        { label: 'شکل ۲', count: 6, icon: '⭐' },
        { label: 'شکل ۳', count: 9, icon: '⭐' },
      ],
      questionText: 'در شکل ۴ چند ستاره وجود دارد؟',
      correct: 12,
      options: [10, 11, 12, 15],
      formulaHint: 'قانون: شماره شکل × ۳ (جدول ضرب ۳)',
      explanation: 'ستاره‌ها ۳ تا ۳ تا زیاد می‌شوند: ۳، ۶، ۹، ۱۲. پس در شکل ۴ داریم: ۴ × ۳ = ۱۲ ستاره.'
    },
    {
      id: 'geo_5',
      title: 'الگوی دایره‌های زنجیره‌ای',
      steps: [
        { label: 'شکل ۱', count: 4, icon: '🔵' },
        { label: 'شکل ۲', count: 7, icon: '🔵' },
        { label: 'شکل ۳', count: 10, icon: '🔵' },
      ],
      questionText: 'در شکل ۴ چند دایره قرار می‌گیرد؟',
      correct: 13,
      options: [12, 13, 14, 15],
      formulaHint: 'قانون: هر مرحله ۳ دایره بیشتر',
      explanation: 'هر شکل ۳ دایره بیشتر از قبلی دارد: ۱۰ + ۳ = ۱۳.'
    },
    {
      id: 'geo_6',
      title: 'الگوی گلبرگ‌های گل بهاری',
      steps: [
        { label: 'شکل ۱', count: 5, icon: '🌸' },
        { label: 'شکل ۲', count: 10, icon: '🌸' },
        { label: 'شکل ۳', count: 15, icon: '🌸' },
      ],
      questionText: 'در شکل ۵ (پنج گل)، مجموعاً چند گلبرگ داریم؟',
      correct: 25,
      options: [20, 22, 25, 30],
      formulaHint: 'قانون: شماره شکل × ۵',
      explanation: 'هر گل ۵ گلبرگ دارد، پس برای شکل ۵ داریم: ۵ × ۵ = ۲۵ گلبرگ.'
    },
    {
      id: 'geo_7',
      title: 'الگوی لوزی‌های فیروزه‌ای',
      steps: [
        { label: 'شکل ۱', count: 1, icon: '🔷' },
        { label: 'شکل ۲', count: 4, icon: '🔷' },
        { label: 'شکل ۳', count: 7, icon: '🔷' },
      ],
      questionText: 'در شکل ۴ چند لوزی وجود خواهد داشت؟',
      correct: 10,
      options: [8, 9, 10, 11],
      formulaHint: 'قانون: شماره شکل × ۳ - ۲',
      explanation: 'هر بار ۳ لوزی اضافه می‌شود: ۱ + ۳ = ۴، ۴ + ۳ = ۷، ۷ + ۳ = ۱۰.'
    },
    {
      id: 'geo_8',
      title: 'الگوی مکعب‌های برجی',
      steps: [
        { label: 'شکل ۱', count: 2, icon: '🧊' },
        { label: 'شکل ۲', count: 5, icon: '🧊' },
        { label: 'شکل ۳', count: 8, icon: '🧊' },
      ],
      questionText: 'در شکل ۴ چند مکعب در برج قرار می‌گیرد؟',
      correct: 11,
      options: [10, 11, 12, 13],
      formulaHint: 'قانون: هر طبقه ۳ مکعب افزایشی',
      explanation: 'اختلاف هر دو شکل متوالی ۳ مکعب است: ۸ + ۳ = ۱۱.'
    },
    {
      id: 'geo_9',
      title: 'الگوی سیب‌های قرمز در سبد',
      steps: [
        { label: 'شکل ۱', count: 4, icon: '🍎' },
        { label: 'شکل ۲', count: 8, icon: '🍎' },
        { label: 'شکل ۳', count: 12, icon: '🍎' },
      ],
      questionText: 'در شکل ۴ چند عدد سیب در سبدها چیده می‌شود؟',
      correct: 16,
      options: [14, 15, 16, 20],
      formulaHint: 'قانون: شماره شکل × ۴ (جدول ضرب ۴)',
      explanation: 'سیب‌ها ۴ تا ۴ تا افزایش می‌یابند: ۴ × ۴ = ۱۶.'
    },
    {
      id: 'geo_10',
      title: 'الگوی قلب‌های مهر و دوستی',
      steps: [
        { label: 'شکل ۱', count: 3, icon: '💖' },
        { label: 'شکل ۲', count: 5, icon: '💖' },
        { label: 'شکل ۳', count: 7, icon: '💖' },
      ],
      questionText: 'در شکل ۵ چند قلب وجود خواهد داشت؟',
      correct: 11,
      options: [9, 10, 11, 13],
      formulaHint: 'قانون: شماره شکل × ۲ + ۱',
      explanation: 'شکل ۴ دارای ۹ قلب و شکل ۵ دارای ۹ + ۲ = ۱۱ قلب است (یا ۵ × ۲ + ۱ = ۱۱).'
    },
    {
      id: 'geo_11',
      title: 'الگوی شش‌ضلعی‌های کندوی عسل',
      steps: [
        { label: 'شکل ۱', count: 6, icon: '⬡' },
        { label: 'شکل ۲', count: 11, icon: '⬡' },
        { label: 'شکل ۳', count: 16, icon: '⬡' },
      ],
      questionText: 'در شکل ۴ کندو، به چند خانه شش‌ضلعی می‌رسیم؟',
      correct: 21,
      options: [19, 20, 21, 22],
      formulaHint: 'قانون: ۵ تا ۵ تا افزایش',
      explanation: 'هر بار ۵ خانه به کندو متصل می‌شود: ۱۶ + ۵ = ۲۱.'
    },
    {
      id: 'geo_12',
      title: 'الگوی بادکنک‌های رنگین جشن',
      steps: [
        { label: 'شکل ۱', count: 2, icon: '🎈' },
        { label: 'شکل ۲', count: 6, icon: '🎈' },
        { label: 'شکل ۳', count: 10, icon: '🎈' },
      ],
      questionText: 'در شکل ۴ چند بادکنک خواهیم داشت؟',
      correct: 14,
      options: [12, 13, 14, 16],
      formulaHint: 'قانون: ۴ تا ۴ تا افزایش (شماره شکل × ۴ - ۲)',
      explanation: 'اختلاف مراحل ۴ بادکنک است: ۱۰ + ۴ = ۱۴.'
    },
    {
      id: 'geo_13',
      title: 'الگوی پرچم‌های مربعی مسابقه',
      steps: [
        { label: 'شکل ۱ (۱×۱)', count: 1, icon: '🚩' },
        { label: 'شکل ۲ (۲×۲)', count: 4, icon: '🚩' },
        { label: 'شکل ۳ (۳×۳)', count: 9, icon: '🚩' },
      ],
      questionText: 'در شکل ۴ (شبکه مربعی ۴×۴)، چند پرچم قرار دارد؟',
      correct: 16,
      options: [12, 14, 15, 16],
      formulaHint: 'قانون اعداد مربعی: شماره شکل × خودش',
      explanation: 'در شکل ۴ یک شبکه ۴ در ۴ داریم: ۴ × ۴ = ۱۶ پرچم.'
    },
    {
      id: 'geo_14',
      title: 'الگوی الماس‌های درخشان',
      steps: [
        { label: 'شکل ۱', count: 3, icon: '💎' },
        { label: 'شکل ۲', count: 7, icon: '💎' },
        { label: 'شکل ۳', count: 11, icon: '💎' },
      ],
      questionText: 'در شکل ۴ چند الماس چیده می‌شود؟',
      correct: 15,
      options: [13, 14, 15, 16],
      formulaHint: 'قانون: ۴ تا ۴ تا افزایش',
      explanation: 'هر مرحله ۴ الماس اضافه می‌شود: ۱۱ + ۴ = ۱۵.'
    },
    {
      id: 'geo_15',
      title: 'الگوی چرخ‌های قطار اسباب‌بازی',
      steps: [
        { label: 'شکل ۱ (۱ واگن)', count: 4, icon: '⚙️' },
        { label: 'شکل ۲ (۲ واگن)', count: 8, icon: '⚙️' },
        { label: 'شکل ۳ (۳ واگن)', count: 12, icon: '⚙️' },
      ],
      questionText: 'یک قطار با ۵ واگن (شکل ۵) چند چرخ دارد؟',
      correct: 20,
      options: [16, 18, 20, 24],
      formulaHint: 'قانون: شماره شکل × ۴',
      explanation: 'هر واگن ۴ چرخ دارد: ۵ × ۴ = ۲۰ چرخ.'
    },
    {
      id: 'geo_16',
      title: 'الگوی کاشی‌های هندسی هفت‌رنگ',
      steps: [
        { label: 'شکل ۱', count: 1, icon: '🟨' },
        { label: 'شکل ۲', count: 5, icon: '🟨' },
        { label: 'شکل ۳', count: 9, icon: '🟨' },
      ],
      questionText: 'در شکل ۴ چند کاشی زرد رنگ‌آمیزی می‌شود؟',
      correct: 13,
      options: [11, 12, 13, 14],
      formulaHint: 'قانون: ۴ تا ۴ تا افزایش',
      explanation: 'کاشی‌ها ۴ تا ۴ تا زیاد می‌شوند: ۹ + ۴ = ۱۳.'
    }
  ];

  const [patternIdx, setPatternIdx] = useState(0);
  const [machineIdx, setMachineIdx] = useState(0);
  const [geoIdx, setGeoIdx] = useState(0);

  const currentPattern = patternQuestions[patternIdx];
  const currentMachine = machineQuestions[machineIdx];
  const currentGeo = geoQuestions[geoIdx];

  const handleShuffle = () => {
    playSound('pop', soundEnabled);
    setFeedback(null);
    setSelectedAns(null);
    if (mode === 'pattern_finder') {
      setPatternIdx(Math.floor(Math.random() * patternQuestions.length));
    } else if (mode === 'input_output_machine') {
      setMachineIdx(Math.floor(Math.random() * machineQuestions.length));
    } else {
      setGeoIdx(Math.floor(Math.random() * geoQuestions.length));
    }
  };

  const handleNext = () => {
    playSound('click', soundEnabled);
    setFeedback(null);
    setSelectedAns(null);
    if (mode === 'pattern_finder') {
      setPatternIdx((prev) => (prev + 1) % patternQuestions.length);
    } else if (mode === 'input_output_machine') {
      setMachineIdx((prev) => (prev + 1) % machineQuestions.length);
    } else {
      setGeoIdx((prev) => (prev + 1) % geoQuestions.length);
    }
  };

  const handlePrev = () => {
    playSound('click', soundEnabled);
    setFeedback(null);
    setSelectedAns(null);
    if (mode === 'pattern_finder') {
      setPatternIdx((prev) => (prev - 1 + patternQuestions.length) % patternQuestions.length);
    } else if (mode === 'input_output_machine') {
      setMachineIdx((prev) => (prev - 1 + machineQuestions.length) % machineQuestions.length);
    } else {
      setGeoIdx((prev) => (prev - 1 + geoQuestions.length) % geoQuestions.length);
    }
  };

  const handleSelectAnswer = (ans: number | string) => {
    if (feedback !== null) return;
    setSelectedAns(ans);

    let isCorrect = false;
    if (mode === 'pattern_finder') {
      isCorrect = String(ans) === currentPattern.correct;
    } else if (mode === 'input_output_machine') {
      isCorrect = Number(ans) === currentMachine.correctOutput;
    } else if (mode === 'geometric_pattern') {
      isCorrect = Number(ans) === currentGeo.correct;
    }

    if (isCorrect) {
      setFeedback('correct');
      playSound('correct', soundEnabled);
      setScore(s => s + 10);
      setStreak(st => st + 1);
      onAddStars(2);
      onIncrementSolved();

      if ((streak + 1) % 3 === 0) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }

      setTimeout(() => {
        setFeedback(null);
        setSelectedAns(null);
        if (mode === 'pattern_finder') {
          setPatternIdx((prev) => (prev + 1) % patternQuestions.length);
        } else if (mode === 'input_output_machine') {
          setMachineIdx((prev) => (prev + 1) % machineQuestions.length);
        } else {
          setGeoIdx((prev) => (prev + 1) % geoQuestions.length);
        }
      }, 1600);
    } else {
      setFeedback('wrong');
      playSound('wrong', soundEnabled);
      setStreak(0);
      setTimeout(() => {
        setFeedback(null);
        setSelectedAns(null);
      }, 1400);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-md max-w-4xl mx-auto space-y-4 dir-rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-100 pb-3">
        <div>
          <h3 className="font-black text-slate-800 text-sm sm:text-lg flex items-center gap-1.5">
            <span>الگوها و ماشین ورودی-خروجی (فصل ۱) ⚙️</span>
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-500">یادگیری الگوهای عددی، شمارش چندتا چندتا، الگوهای هندسی و ماشین ریاضی</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-1 rounded-xl text-xs sm:text-sm">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
            <span>امتیاز: {score}</span>
          </div>
          <div className="flex items-center gap-1 bg-orange-100 text-orange-900 border border-orange-300 font-bold px-2.5 py-1 rounded-xl text-xs sm:text-sm">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 fill-orange-500" />
            <span>پیاپی: {streak}</span>
          </div>
        </div>
      </div>

      {/* Mode Select Tabs + Navigation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setMode('geometric_pattern');
              setFeedback(null);
              setSelectedAns(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer min-h-[36px] flex items-center gap-1 ${
              mode === 'geometric_pattern'
                ? 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>۱. الگوهای هندسی 📐</span>
            <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-bold">۱۶ سوال</span>
          </button>

          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setMode('pattern_finder');
              setFeedback(null);
              setSelectedAns(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer min-h-[36px] flex items-center gap-1 ${
              mode === 'pattern_finder'
                ? 'bg-[#FF6B6B] text-white border-2 border-[#EE5253] shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>۲. الگوهای عددی 🔢</span>
            <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-bold">۱۲ سوال</span>
          </button>

          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setMode('input_output_machine');
              setFeedback(null);
              setSelectedAns(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer min-h-[36px] flex items-center gap-1 ${
              mode === 'input_output_machine'
                ? 'bg-[#6C5CE7] text-white border-2 border-[#5b4cc4] shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>۳. ماشین ورودی - خروجی ⚙️</span>
            <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-bold">۱۰ سوال</span>
          </button>
        </div>

        {/* Quick Question Stepper */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl">
          <button
            onClick={handlePrev}
            className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
            title="سوال قبلی"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold px-2 text-slate-700 whitespace-nowrap">
            {mode === 'geometric_pattern' && `سوال ${geoIdx + 1} از ${geoQuestions.length}`}
            {mode === 'pattern_finder' && `سوال ${patternIdx + 1} از ${patternQuestions.length}`}
            {mode === 'input_output_machine' && `سوال ${machineIdx + 1} از ${machineQuestions.length}`}
          </span>

          <button
            onClick={handleNext}
            className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
            title="سوال بعدی"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleShuffle}
            className="p-1 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors cursor-pointer mr-1"
            title="سوال تصادفی"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MODE 1: Geometric Pattern (Rich 16 Visual Scenarios) */}
      {mode === 'geometric_pattern' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-tr from-teal-700 via-emerald-600 to-teal-500 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-md space-y-3 text-center">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 text-amber-200">
                {currentGeo.title}
              </span>
              <span className="text-[10px] text-emerald-100 bg-emerald-900/40 px-2 py-0.5 rounded-lg">
                {currentGeo.formulaHint}
              </span>
            </div>

            {/* Pattern Display Stages */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 py-1">
              {currentGeo.steps.map((st, idx) => (
                <div key={idx} className="bg-white/15 backdrop-blur-xs border border-white/30 rounded-2xl p-2 sm:p-3 space-y-1.5 flex flex-col items-center justify-between min-h-[90px] sm:min-h-[110px]">
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-100 bg-black/20 px-2 py-0.5 rounded-md">
                    {st.label} ({st.count} تا)
                  </span>
                  
                  <div className="flex flex-wrap justify-center gap-1 items-center max-w-[140px] my-auto">
                    {Array.from({ length: Math.min(st.count, 15) }).map((_, i) => (
                      <span key={i} className="text-base sm:text-xl drop-shadow-xs transform transition-transform hover:scale-125">
                        {st.icon}
                      </span>
                    ))}
                    {st.count > 15 && (
                      <span className="text-xs font-bold text-amber-200">+{st.count - 15}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs sm:text-sm font-black text-amber-200 bg-black/30 p-2.5 rounded-xl border border-white/20 shadow-inner">
              {currentGeo.questionText}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {currentGeo.options.map((opt, idx) => {
              const isSelected = selectedAns === opt;
              let btnClass = 'bg-slate-50 hover:bg-emerald-100 text-slate-800 border-2 border-slate-200';
              if (isSelected && feedback === 'correct') {
                btnClass = 'bg-emerald-500 text-white border-2 border-emerald-600 animate-bounce';
              } else if (isSelected && feedback === 'wrong') {
                btnClass = 'bg-rose-500 text-white border-2 border-rose-600 animate-shake';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(opt)}
                  disabled={feedback !== null}
                  className={`py-3 sm:py-4 px-4 rounded-2xl font-black text-lg sm:text-2xl transition-all cursor-pointer shadow-xs min-h-[52px] ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {feedback === 'correct' && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-center text-xs sm:text-sm font-bold text-emerald-800 flex items-center justify-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>عالی بود! {currentGeo.explanation}</span>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Pattern Finder (Numerical) */}
      {mode === 'pattern_finder' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white text-center shadow-md space-y-3">
            <span className="text-xs sm:text-sm font-bold bg-white/20 px-3 py-1 rounded-full border border-white/30 inline-block">
              عدد مجهول (❓) در این الگوی عددی چند است؟
            </span>

            {/* Sequence Display */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2">
              {currentPattern.sequence.map((num, idx) => {
                const isQuestion = num === '❓';
                return (
                  <div
                    key={idx}
                    className={`w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center font-black text-base sm:text-2xl shadow-xs transition-transform ${
                      isQuestion
                        ? 'bg-yellow-300 text-slate-900 border-yellow-400 scale-110 animate-pulse'
                        : 'bg-white/20 text-white border-white/40 backdrop-blur-xs'
                    }`}
                  >
                    {num}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-amber-100 font-medium">به فاصله بین عددها دقت کن تا قانون الگو رو پیدا کنی!</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {currentPattern.options.map((opt, idx) => {
              const isSelected = selectedAns === opt;
              let btnClass = 'bg-slate-50 hover:bg-amber-100 text-slate-800 border-2 border-slate-200';
              if (isSelected && feedback === 'correct') {
                btnClass = 'bg-emerald-500 text-white border-2 border-emerald-600 animate-bounce';
              } else if (isSelected && feedback === 'wrong') {
                btnClass = 'bg-rose-500 text-white border-2 border-rose-600 animate-shake';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(opt)}
                  disabled={feedback !== null}
                  className={`py-3 sm:py-4 px-4 rounded-2xl font-black text-lg sm:text-2xl transition-all cursor-pointer shadow-xs min-h-[52px] ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {feedback === 'correct' && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-center text-xs sm:text-sm font-bold text-emerald-800 flex items-center justify-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>آفرین! {currentPattern.stepText} (قانون: {currentPattern.rule})</span>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: Input Output Machine */}
      {mode === 'input_output_machine' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-md space-y-3 text-center">
            <span className="text-xs sm:text-sm font-bold bg-white/20 px-3 py-1 rounded-full border border-white/30 inline-block">
              ماشین ریاضی پایه سوم
            </span>

            {/* Visual Machine Graphic */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 py-2">
              {/* Input */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] sm:text-xs font-bold text-indigo-200 mb-1">ورودی</span>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-400 border-2 border-amber-300 text-slate-900 font-black text-xl sm:text-3xl flex items-center justify-center shadow-md">
                  {currentMachine.input}
                </div>
              </div>

              <div className="text-amber-300 text-lg sm:text-2xl font-bold animate-pulse">➡️</div>

              {/* Machine Body */}
              <div className="bg-white/20 backdrop-blur-md border-3 border-white/40 p-2.5 sm:p-4 rounded-3xl space-y-1 max-w-[200px] shadow-lg">
                <div className="text-2xl sm:text-3xl">⚙️🤖⚙️</div>
                <div className="text-xs sm:text-sm font-black text-amber-300">{currentMachine.ruleName}</div>
              </div>

              <div className="text-amber-300 text-lg sm:text-2xl font-bold animate-pulse">➡️</div>

              {/* Output */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] sm:text-xs font-bold text-pink-200 mb-1">خروجی</span>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-pink-400 border-2 border-pink-300 text-white font-black text-xl sm:text-3xl flex items-center justify-center shadow-md animate-bounce">
                  ❓
                </div>
              </div>
            </div>

            <p className="text-xs text-purple-100 font-medium">{currentMachine.hint}</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {currentMachine.options.map((opt, idx) => {
              const isSelected = selectedAns === opt;
              let btnClass = 'bg-slate-50 hover:bg-purple-100 text-slate-800 border-2 border-slate-200';
              if (isSelected && feedback === 'correct') {
                btnClass = 'bg-emerald-500 text-white border-2 border-emerald-600 animate-bounce';
              } else if (isSelected && feedback === 'wrong') {
                btnClass = 'bg-rose-500 text-white border-2 border-rose-600 animate-shake';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(opt)}
                  disabled={feedback !== null}
                  className={`py-3 sm:py-4 px-4 rounded-2xl font-black text-lg sm:text-2xl transition-all cursor-pointer shadow-xs min-h-[52px] ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {feedback === 'correct' && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-center text-xs sm:text-sm font-bold text-emerald-800 flex items-center justify-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>پاسخ صحیح است! خروجی ماشین عدد {currentMachine.correctOutput} است.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
