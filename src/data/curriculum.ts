import { ChapterInfo, Badge, QuizQuestion, ChapterId, Lesson } from '../types';

export const CHAPTERS: ChapterInfo[] = [
  {
    id: 'patterns',
    title: 'الگوها و شمارش',
    chapterNumber: 1,
    iconName: 'Shapes',
    color: 'from-amber-400 to-orange-500',
    description: 'الگویابی، شمارش چندتاچندتا، خواندن ساعت و تقویم',
    topics: ['شمارش چندتا چندتا', 'الگوهای عددی و هندسی', 'ساعت و دقیقه', 'ماشین ورودی-خروجی']
  },
  {
    id: 'place_value',
    title: 'عددنویسی و ارزش مکانی',
    chapterNumber: 2,
    iconName: 'Calculator',
    color: 'from-blue-400 to-indigo-600',
    description: 'معرفی عدد هزار، گسترده‌نویسی، مقایسه اعداد و واحد پول (ریال و تومان)',
    topics: ['معرفی عدد ۴ رقمی', 'جدول ارزش مکانی (یکی، ده تایی، صدتایی، هزارتایی)', 'واحد پول تومان و ریال', 'تقریب زدن اعداد']
  },
  {
    id: 'fractions',
    title: 'کسرها',
    chapterNumber: 3,
    iconName: 'PieChart',
    color: 'from-emerald-400 to-teal-600',
    description: 'مفهوم کسر، صورت و مخرج، مقایسه کسرها و کسر روی محور اعداد',
    topics: ['مفهوم صورت و مخرج کسر', 'نمایش تصویری کسرها', 'مقایسه کسرها با مخرج یا صورت مساوی', 'کسرهای مساوی']
  },
  {
    id: 'multiplication_division',
    title: 'ضرب و تقسیم',
    chapterNumber: 4,
    iconName: 'Grid',
    color: 'from-purple-400 to-pink-500',
    description: 'مفهوم دسته و تعداد، جدول ضرب، خاصیت جابه‌جایی و تقسیم',
    topics: ['مفهوم ضرب (دسته‌ها و عضوها)', 'جدول ضرب ۱ تا ۱۰', 'خاصیت جابه‌جایی ضرب', 'مفهوم تقسیم و دسته‌بندی']
  },
  {
    id: 'perimeter_area',
    title: 'محیط و مساحت',
    chapterNumber: 5,
    iconName: 'Square',
    color: 'from-rose-400 to-red-500',
    description: 'مفهوم دور تا دور (محیط) و سطح داخل (مساحت) در اشکال هندسی',
    topics: ['محاسبه محیط مربع و مستطیل', 'مفهوم مساحت با مربع‌های واحد', 'ارتباط محیط و مساحت', 'حل مسئله با رسم شکل']
  },
  {
    id: 'regrouping',
    title: 'جمع و تفریق تکنیکی',
    chapterNumber: 6,
    iconName: 'PlusCircle',
    color: 'from-cyan-400 to-blue-500',
    description: 'جمع و تفریق اعداد ۴ رقمی با انتقال (انتقال ده تایی، صدتایی، هزارتایی)',
    topics: ['جمع تکنیکی با جدول ارزش مکانی', 'تفریق تکنیکی (قرض گرفتن)', 'جمع و تفریق ذهنی', 'حل مسائل مالی']
  },
  {
    id: 'statistics',
    title: 'آمار و احتمال',
    chapterNumber: 7,
    iconName: 'BarChart3',
    color: 'from-violet-400 to-purple-600',
    description: 'چوب‌خط، جدول داده‌ها، نمودار ستونی و احتمال وقوع اتفاقات',
    topics: ['چوب‌خط و شمارش داده‌ها', 'رسم نمودار ستونی', 'مفهوم احتمال (حتما، ممکن، غیرممکن)', 'چرخنده شانس']
  },
  {
    id: 'advanced_multiplication',
    title: 'ضرب اعداد بزرگ‌تر',
    chapterNumber: 8,
    iconName: 'Zap',
    color: 'from-yellow-400 to-amber-600',
    description: 'ضرب در ۱۰، ۱۰۰، ۱۰۰۰ و ضرب دو رقم در یک رقم و راهبردهای حل مسئله',
    topics: ['ضرب در ۱۰ و ۱۰۰ و ۱۰۰۰', 'ضرب دو رقم در یک رقم', 'تخمین ضرب', 'راهبرد زیرمسئله و جدول حدس و آزمایش']
  }
];

export const SAMPLE_QUIZZES: Record<string, QuizQuestion[]> = {
  patterns: [
    {
      id: 'p1',
      chapterId: 'patterns',
      question: 'در الگوی عددی ۵، ۱۰، ۱۵، ۲۰، عدد بعدی کدام است؟',
      options: ['۲۲', '۲۵', '۳۰', '۲۴'],
      correctAnswerIndex: 1,
      explanation: 'در این الگو، هر عدد ۵ تا ۵ تا زیاد می‌شود. پس ۲۰ + ۵ می‌شود ۲۵.',
      hint: 'شمارش ۵ تا ۵ تا را ادامه بده!'
    },
    {
      id: 'p2',
      chapterId: 'patterns',
      question: 'یک ماشین ورودی-خروجی هر عدد را "ضرب در ۳" می‌کند. اگر عدد ۴ وارد ماشین شود، چه عددی خارج می‌شود؟',
      options: ['۷', '۱۰', '۱۲', '۱۴'],
      correctAnswerIndex: 2,
      explanation: 'ورودی ۴ است. ماشین آن را ضرب در ۳ می‌کند: ۴ × ۳ = ۱۲.',
      hint: '۴ را ۳ بار با خودش جمع کن یا حاصل ضرب ۴ × ۳ را به دست آور.'
    },
    {
      id: 'p3',
      chapterId: 'patterns',
      question: 'عقربه‌ کوچک ساعت روی ۴ و عقربه بزرگ روی ۶ قرار دارد. ساعت چند است؟',
      options: ['۴:۳۰', '۶:۲۰', '۴:۰۶', '۵:۳۰'],
      correctAnswerIndex: 0,
      explanation: 'عقربه کوچک ساعت ۴ را نشان می‌دهد و عقربه بزرگ روی ۶ یعنی ۳۰ دقیقه گذرانده است (۴:۳۰).',
      hint: 'هر شماره روی ساعت نشان‌دهنده ۵ دقیقه است. ۶ ضرب در ۵ می‌شود ۳۰ دقیقه!'
    },
    {
      id: 'p4',
      chapterId: 'patterns',
      question: 'در یک الگوی شمارش ۳تا ۳تا، جملات الگو به این صورت است: ۳، ۶، ۹، ۱۲، .... عدد پنجم کدام است؟',
      options: ['۱۳', '۱۴', '۱۵', '۱۶'],
      correctAnswerIndex: 2,
      explanation: 'عدد چهارم ۱۲ است. برای عدد پنجم ۳ واحد اضافه می‌کنیم: ۱۲ + ۳ = ۱۵.',
      hint: 'شمارش ۳تا ۳تا: ۳، ۶، ۹، ۱۲، ۱۵.'
    },
    {
      id: 'p5',
      chapterId: 'patterns',
      question: 'یک ماشین ریاضی عدد ۷ را می‌گیرد و عدد ۱۲ تحویل می‌دهد. قانون این ماشین چیست؟',
      options: ['افزودن ۵ (+۵)', 'کاهش ۵ (-۵)', 'ضرب در ۲ (×۲)', 'افزودن ۳ (+۳)'],
      correctAnswerIndex: 0,
      explanation: 'چون ۷ + ۵ = ۱۲ می‌شود، قانون ماشین "افزودن ۵" یا (+۵) است.',
      hint: 'ببین چقدر به عدد ۷ اضافه شده تا به ۱۲ برسد؟ ۱۲ - ۷ = ۵.'
    },
    {
      id: 'p6',
      chapterId: 'patterns',
      question: 'در یک الگوی شطرنجی، شکل اول ۲ مربع، شکل دوم ۴ مربع و شکل سوم ۶ مربع دارد. شکل چهارم چند مربع دارد؟',
      options: ['۷', '۸', '۹', '۱۰'],
      correctAnswerIndex: 1,
      explanation: 'الگو ۲ تا ۲ تا زیاد می‌شود (۲، ۴، ۶، ۸). پس شکل چهارم ۸ مربع دارد.',
      hint: 'شمارش ۲تا ۲تا را ادامه بده.'
    }
  ],
  place_value: [
    {
      id: 'pv1',
      chapterId: 'place_value',
      question: 'عدد "سه هزار و چهارصد و بیست و پنج" به رقم چگونه نوشته می‌شود؟',
      options: ['۳۴۵۲', '۳۴۲۵', '۳۲۴۵', '۴۳۲۵'],
      correctAnswerIndex: 1,
      explanation: '۳ هزار + ۴ صد + ۲ ده + ۵ یک = ۳۴۲۵',
      hint: 'به جایگاه هزارتایی (۳)، صدتایی (۴)، ده تایی (۲) و یکی (۵) دقت کن.'
    },
    {
      id: 'pv2',
      chapterId: 'place_value',
      question: 'اگر ۵۰۰۰ تومان داشته باشی و یک دفتر ۲۰۰۰ تومانی بخری، چقدر پول برایت باقی می‌ماند؟',
      options: ['۲۰۰۰ تومان', '۳۰۰۰ تومان', '۱۰۰۰ تومان', '۴۰۰۰ تومان'],
      correctAnswerIndex: 1,
      explanation: '۵۰۰۰ منهای ۲۰۰۰ برابر است با ۳۰۰۰ تومان.',
      hint: '۵ منهای ۲ می‌شود ۳، پس ۵۰۰۰ منهای ۲۰۰۰ می‌شود ۳۰۰۰.'
    }
  ],
  fractions: [
    {
      id: 'f1',
      chapterId: 'fractions',
      question: 'کدام کسر بزرگ‌تر است؟ (۱/۴ یا ۳/۴)',
      options: ['۱/۴', '۳/۴', 'هر دو مساوی هستند', 'قابل مقایسه نیستند'],
      correctAnswerIndex: 1,
      explanation: 'وقتی مخرج‌ها مساوی باشند (۴)، کسری که صورتش بزرگ‌تر است (۳) بزرگ‌تر خواهد بود.',
      hint: 'تصور کن یک پیتزا ۴ قسمت شده؛ ۳ قسمت پیتزا بیشتر است یا ۱ قسمت؟'
    }
  ],
  multiplication_division: [
    {
      id: 'm1',
      chapterId: 'multiplication_division',
      question: 'حاصل ضرب ۷ × ۶ کدام است؟',
      options: ['۳۶', '۴۰', '۴۲', '۴۸'],
      correctAnswerIndex: 2,
      explanation: '۷ دسته ۶ تایی برابر با ۴۲ است.',
      hint: '۶ × ۶ می‌شود ۳۶، ۶ تای دیگر به آن اضافه کن!'
    },
    {
      id: 'm2',
      chapterId: 'multiplication_division',
      question: 'اگر ۲۰ شکلات را بین ۴ دوست به طور مساوی تقسیم کنیم، به هر نفر چند شکلات می‌رسد؟',
      options: ['۴', '۵', '۶', '۱۰'],
      correctAnswerIndex: 1,
      explanation: '۲۰ تقسیم بر ۴ برابر است با ۵. زیرا ۵ × ۴ = ۲۰.',
      hint: 'چه عددی ضرب در ۴ می‌شود ۲۰؟'
    }
  ],
  perimeter_area: [
    {
      id: 'pa1',
      chapterId: 'perimeter_area',
      question: 'محیط مربعی که ضلع آن ۵ سانتی‌متر است چقدر است؟',
      options: ['۱۰ سانتی‌متر', '۱۵ سانتی‌متر', '۲۰ سانتی‌متر', '۲۵ سانتی‌متر'],
      correctAnswerIndex: 2,
      explanation: 'مربع ۴ ضلع مساوی دارد. ۴ × ۵ = ۲۰ سانتی‌متر.',
      hint: 'دور تا دور مربع ۴ تا ضلع ۵ سانتی‌متری است. ۴ ضرب در ۵!'
    }
  ],
  regrouping: [
    {
      id: 'rg1',
      chapterId: 'regrouping',
      question: 'حاصل جمع ۳۴۵۸ + ۲۳۶۷ کدام است؟',
      options: ['۵۷۱۵', '۵۸۲۵', '۵۸۱۵', '۵۹۲۵'],
      correctAnswerIndex: 1,
      explanation: 'جمع از مرتبه یکی‌ها با انتقال ده تایی و صدتایی: ۵۸۲۵.',
      hint: '۸ + ۷ = ۱۵ (۵ در یکی، ۱ ده تایی به مرتبه بعدی منتقل می‌شود).'
    },
    {
      id: 'rg2',
      chapterId: 'regrouping',
      question: 'حاصل تفریق ۵۴۳۲ - ۲۱۶۵ کدام است؟',
      options: ['۳۲۶۷', '۳۲۷۷', '۳۳۶۷', '۳۱۶۷'],
      correctAnswerIndex: 0,
      explanation: 'تفریق تکنیکی با قرض گرفتن از مرتبه ده تایی و صدتایی: ۳۲۶۷.',
      hint: 'از ده تایی ۱ واحد قرض بگیر تا ۲ تبدیل به ۱۲ شود: ۱۲ - ۵ = ۷.'
    },
    {
      id: 'rg3',
      chapterId: 'regrouping',
      question: 'مریم ۴۵۰۰ تومان پول داشت. او ۲۳۰۰ تومان دفتر خرید. چقدر پول برایش باقی ماند؟',
      options: ['۲۱۰۰ تومان', '۲۲۰۰ تومان', '۲۳۰۰ تومان', '۲۴۰۰ تومان'],
      correctAnswerIndex: 1,
      explanation: '۴۵۰۰ - ۲۳۰۰ = ۲۲۰۰ تومان.',
      hint: '۴۵ صدتایی منهای ۲۳ صدتایی می‌شود ۲۲ صدتایی (۲۲۰۰ تومان).'
    }
  ],
  statistics: [
    {
      id: 'st1',
      chapterId: 'statistics',
      question: 'علامت چوب‌خط "卌 卌 |||" نشان‌دهنده چه عددی است؟',
      options: ['۱۱', '۱۲', '۱۳', '۱۴'],
      correctAnswerIndex: 2,
      explanation: 'هر دسته ۵ تایی چوب‌خط: ۵ + ۵ + ۳ = ۱۳.',
      hint: 'دسته‌های ۵ تایی را ۵ تا ۵ تا بشمار و چوب‌خط‌های منفرد را اضافه کن.'
    },
    {
      id: 'st2',
      chapterId: 'statistics',
      question: 'در یک چرخنده شانس که ۴ بخش قرمز و ۱ بخش آبی دارد، شانس ایستادن چرخنده روی کدام رنگ بیشتر است؟',
      options: ['قرمز', 'آبی', 'هر دو برابرند', 'غیرممکن است'],
      correctAnswerIndex: 0,
      explanation: 'چون بخش قرمز بیشتر است (۴ از ۵)، شانس ایستادن روی قرمز بسیار بیشتر است.',
      hint: 'رنگی که مساحت بیشتری دارد شانس بیشتری برای برنده شدن دارد.'
    },
    {
      id: 'st3',
      chapterId: 'statistics',
      question: 'اگر در کیسه‌ای فقط مهره‌های سبز وجود داشته باشد، احتمال بیرون آوردن مهره قرمز چقدر است؟',
      options: ['حتماً', 'ممکن', 'غیرممکن', 'زیاد'],
      correctAnswerIndex: 2,
      explanation: 'چون مهره قرمزی وجود ندارد، آمدن مهره قرمز غیرممکن است.',
      hint: 'وقتی چیزی اصلاً وجود ندارد، رخ دادن آن غیرممکن است.'
    }
  ],
  advanced_multiplication: [
    {
      id: 'am1',
      chapterId: 'advanced_multiplication',
      question: 'حاصل ضرب ۶ × ۱۰۰ کدام است؟',
      options: ['۶۰', '۶۰۰', '۶۰۰۰', '۶۶۰'],
      correctAnswerIndex: 1,
      explanation: 'در ضرب در ۱۰۰، دو صفر جلوی عدد قرار می‌گیرد: ۶۰۰.',
      hint: '۶ را ضرب در ۱ کن و دو صفر ۱۰۰ را جلوی آن بگذار.'
    },
    {
      id: 'am2',
      chapterId: 'advanced_multiplication',
      question: 'حاصل ضرب ۲۳ × ۴ به روش گسترده‌نویسی کدام است؟',
      options: ['۸۲', '۸۸', '۹۲', '۱۰۲'],
      correctAnswerIndex: 2,
      explanation: '۴ × ۲۰ = ۸۰ و ۴ × ۳ = ۱۲. مجموع: ۸۰ + ۱۲ = ۹۲.',
      hint: '۲۰ × ۴ می‌شود ۸۰، ۳ × ۴ می‌شود ۱۲. ۸۰ + ۱۲!'
    },
    {
      id: 'am3',
      chapterId: 'advanced_multiplication',
      question: 'قیمت تقربی ۴ جلد کتاب ۴۸ تومانی حدوداً چقدر است؟ (با گرد کردن ۴۸ به ۵۰)',
      options: ['۱۵۰ تومان', '۱۸۰ تومان', '۲۰۰ تومان', '۲۵۰ تومان'],
      correctAnswerIndex: 2,
      explanation: '۴۸ تقریباً ۵۰ است. ۴ × ۵۰ = ۲۰۰ تومان.',
      hint: '۴ تا ۵۰ تایی می‌شود ۲۰۰.'
    }
  ]
};

export const AVATARS = [
  { id: 'fox', name: 'دانا روباهه 🦊', icon: '🦊' },
  { id: 'bee', name: 'زنبور باهوش 🐝', icon: '🐝' },
  { id: 'lion', name: 'شیر قهرمان 🦁', icon: '🦁' },
  { id: 'owl', name: 'جغد دانا 🦉', icon: '🦉' },
  { id: 'rabbit', name: 'خرگوش فرز 🐰', icon: '🐰' },
  { id: 'panda', name: 'پاندای ریاضی 🐼', icon: '🐼' },
  { id: 'cat', name: 'گربه زرنگ 🐱', icon: '🐱' },
  { id: 'bear', name: 'خرس مهربان 🐻', icon: '🐻' }
];

export const BADGES: Badge[] = [
  // ☀️ مدال‌های روزانه (Daily Badges)
  {
    id: 'daily_first_step',
    title: 'قدم اول امروز 🚀',
    description: 'حل حداقل ۱ مسئله تمرینی در امروز',
    icon: '🚀',
    category: 'daily',
    requiredSolved: 1
  },
  {
    id: 'daily_star_catcher',
    title: 'ستاره‌چین روز 🌟',
    description: 'کسب ۵ ستاره در تمرینات امروز',
    icon: '🌟',
    category: 'daily',
    requiredStars: 5
  },
  {
    id: 'daily_scanner',
    title: 'اسکنر تیزبین 📸',
    description: 'اسکن و حل حداقل ۱ مسئله با دوربین',
    icon: '📸',
    category: 'daily',
    requiredScanned: 1
  },
  {
    id: 'daily_hero',
    title: 'قهرمان روزانه 🏆',
    description: 'حل ۳ مسئله ریاضی در فعالیت روزانه',
    icon: '🏆',
    category: 'daily',
    requiredSolved: 3
  },

  // 📅 مدال‌های هفتگی (Weekly Badges)
  {
    id: 'weekly_streak_7',
    title: 'مبارز ۷ روزه 🔥',
    description: '۷ روز ورود و تمرین متوالی در هفته',
    icon: '🔥',
    category: 'weekly',
    requiredStreak: 7
  },
  {
    id: 'weekly_stars_25',
    title: 'کهکشان ستاره‌ها ✨',
    description: 'جمع‌آوری ۲۵ ستاره در طول هفته',
    icon: '✨',
    category: 'weekly',
    requiredStars: 25
  },
  {
    id: 'weekly_solver_15',
    title: 'حل‌کننده پرانرژی ⚡',
    description: 'حل ۱۵ مسئله ریاضی مختلف',
    icon: '⚡',
    category: 'weekly',
    requiredSolved: 15
  },
  {
    id: 'weekly_scanner_5',
    title: 'کارآگاه تصاویر 🔍',
    description: 'اسکن و حل ۵ عکس کتاب درسی در هفته',
    icon: '🔍',
    category: 'weekly',
    requiredScanned: 5
  },
  {
    id: 'weekly_level_3',
    title: 'دانشمند سطح ۳ 🧠',
    description: 'رسیدن به سطح ۳ دانش‌آموز ممتاز',
    icon: '🧠',
    category: 'weekly',
    requiredLevel: 3
  },

  // 👑 مدال‌های ماهانه (Monthly Master Badges)
  {
    id: 'monthly_streak_30',
    title: 'افسانه ۳۰ روزه 👑',
    description: '۳۰ روز فعالیت متوالی و یادگیری بی‌وقفه!',
    icon: '👑',
    category: 'monthly',
    requiredStreak: 30
  },
  {
    id: 'monthly_stars_100',
    title: 'استاد ستاره‌ها 🎖️',
    description: 'کسب ۱۰۰ ستاره افتخار در ریاضی سوم',
    icon: '🎖️',
    category: 'monthly',
    requiredStars: 100
  },
  {
    id: 'monthly_solver_50',
    title: 'نابغه ریاضی سوم 💎',
    description: 'حل ۵۰ مسئله ریاضی پایه سوم ابتدایی',
    icon: '💎',
    category: 'monthly',
    requiredSolved: 50
  },
  {
    id: 'monthly_scanner_15',
    title: 'استاد بینایی هوش‌مصنوعی 👁️',
    description: 'اسکن ۱۵ مسئله از کتاب یا دفتر ریاضی',
    icon: '👁️',
    category: 'monthly',
    requiredScanned: 15
  },
  {
    id: 'monthly_level_5',
    title: 'مدال طلایی ریاضی‌دان 🎓',
    description: 'رسیدن به سطح ۵ و تسلط بر فصول ریاضی',
    icon: '🎓',
    category: 'monthly',
    requiredLevel: 5
  }
];

export const CHAPTER_LESSONS: Record<ChapterId, Lesson[]> = {
  patterns: [
    {
      id: 'pat_l1',
      chapterId: 'patterns',
      title: 'شمارش چندتاچندتا و الگوهای عددی',
      lessonNumber: 1,
      shortSummary: 'در این درس یاد می‌گیریم چطور با یک فاصله مشخص (مثلاً ۲ تا ۲ تا یا ۵ تا ۵ تا) به سمت جلو بپریم و اعداد بعدی الگو را کشف کنیم.',
      visualExplanation: {
        emoji: '🐸',
        diagramTitle: 'پرش قورباغه روی خط اعداد',
        description: 'وقتی قورباغه ۵ تا ۵ تا می‌پرد، روی عددهای ۰، ۵، ۱۰، ۱۵، ۲۰، ۲۵ فرود می‌آید.',
        formulaOrRule: 'عدد بعدی = عدد قبلی + مقدار فاصله ثابت'
      },
      commonMistakes: [
        'اشتباه گرفتن الگوی رو به جلو (جمع) با الگوی رو به عقب (تفریق)',
        'تغییر دادن فاصله بین اعداد در وسط الگو'
      ],
      easyQuestions: [
        {
          id: 'pat_e1',
          chapterId: 'patterns',
          difficulty: 'easy',
          question: 'در الگوی ۲، ۴، ۶، ۸، عدد بعدی کدام است؟',
          options: ['۹', '۱۰', '۱۱', '۱۲'],
          correctAnswerIndex: 1,
          explanation: 'الگو ۲ تا ۲ تا زیاد می‌شود: ۸ + ۲ = ۱۰.',
          hint: '۲ تا به ۸ اضافه کن!'
        }
      ],
      mediumQuestions: [
        {
          id: 'pat_m1',
          chapterId: 'patterns',
          difficulty: 'medium',
          question: 'در الگوی ۷، ۱۴، ۲۱، ۲۸، عدد بعدی کدام است؟',
          options: ['۳۲', '۳۴', '۳۵', '۳۶'],
          correctAnswerIndex: 2,
          explanation: 'الگو ۷ تا ۷ تا اضافه می‌شود (جدول ضرب ۷): ۲۸ + ۷ = ۳۵.',
          hint: '۷ تا به ۲۸ اضافه کن.'
        }
      ],
      hardQuestions: [
        {
          id: 'pat_h1',
          chapterId: 'patterns',
          difficulty: 'hard',
          question: 'در الگوی کاهشی ۱۰۰، ۹۲، ۸۴، ۷۶، عدد بعدی چیست؟',
          options: ['۶۸', '۷۰', '۶۶', '۶۴'],
          correctAnswerIndex: 0,
          explanation: 'هر بار ۸ تا کم می‌شود: ۷۶ - ۸ = ۶۸.',
          hint: 'فاصله کم شدن ۸ واحد است.'
        }
      ]
    },
    {
      id: 'pat_l2',
      chapterId: 'patterns',
      title: 'ساعت بعدازظهر و تقویم',
      lessonNumber: 2,
      shortSummary: 'برای خواندن ساعت‌های بعدازظهر، کافی است عدد ساعت را با ۱۲ جمع کنیم. مثلاً ۴ بعدازظهر یعنی ساعت ۱۶.',
      visualExplanation: {
        emoji: '⏰',
        diagramTitle: 'ساعت دایره‌ای ۲۴ ساعته',
        description: 'ساعت ۱ بعدازظهر = ۱۳، ساعت ۲ بعدازظهر = ۱۴، ساعت ۳ = ۱۵، ساعت ۴ = ۱۶.',
        formulaOrRule: 'ساعت بعدازظهر = ساعت قبل از ظهر + ۱۲'
      },
      commonMistakes: [
        'جمع کردن دقیقه با ۱۲ به جای ساعت',
        'اشتباه گرفتن عقربه کوچک (ساعت‌شمار) با عقربه بزرگ (دقیقه‌شمار)'
      ],
      easyQuestions: [
        {
          id: 'pat_e2',
          chapterId: 'patterns',
          difficulty: 'easy',
          question: 'ساعت ۵ بعدازظهر با کدام عدد در ساعت ۲۴ ساعته برابر است؟',
          options: ['۱۵:۰۰', '۱۶:۰۰', '۱۷:۰۰', '۱۸:۰۰'],
          correctAnswerIndex: 2,
          explanation: '۵ + ۱۲ = ۱۷ (ساعت ۱۷:۰۰).',
          hint: '۵ را با ۱۲ جمع کن!'
        }
      ],
      mediumQuestions: [
        {
          id: 'pat_m2',
          chapterId: 'patterns',
          difficulty: 'medium',
          question: 'اگر ساعت ۸:۳۰ شب باشد، ساعت ۲۴ ساعته چقدر را نشان می‌دهد؟',
          options: ['۲۰:۳۰', '۱۹:۳۰', '۲۱:۳۰', '۱۸:۳۰'],
          correctAnswerIndex: 0,
          explanation: '۸ + ۱۲ = ۲۰، دقیقه‌ها هم ۳۰ می‌ماند: ۲۰:۳۰.',
          hint: '۸ را با ۱۲ جمع کن، دقیقه ثابت می‌ماند.'
        }
      ],
      hardQuestions: [
        {
          id: 'pat_h2',
          chapterId: 'patterns',
          difficulty: 'hard',
          question: 'کلاس زبان علی ساعت ۱۶:۱۵ شروع می‌شود و ۴۵ دقیقه طول می‌کشد. کلاس چه ساعتی تمام می‌شود؟',
          options: ['۱۶:۴۵', '۱۷:۰۰', '۱۷:۱۵', '۱۶:۵۰'],
          correctAnswerIndex: 1,
          explanation: '۱۶:۱۵ به اضافه ۴۵ دقیقه می‌شود ۱۶:۶۰ که همان ساعت ۱۷:۰۰ است.',
          hint: '۱۵ دقیقه + ۴۵ دقیقه = ۶۰ دقیقه (۱ ساعت کامل).'
        }
      ]
    },
    {
      id: 'pat_l3',
      chapterId: 'patterns',
      title: 'ماشین‌های ورودی و خروجی',
      lessonNumber: 3,
      shortSummary: 'ماشین ریاضی یک عدد می‌گیرد، با توجه به قانونی که دارد (مثلاً +۴ یا ×۳) روی آن عملیات انجام می‌دهد و عدد جدیدی بیرون می‌دهد.',
      visualExplanation: {
        emoji: '⚙️',
        diagramTitle: 'کارخانه کوچک اعداد',
        description: 'ورودی ➔ [عملگر ماشین] ➔ خروجی',
        formulaOrRule: 'خروجی = ورودی عملیات قانون ماشین'
      },
      commonMistakes: [
        'انجام برعکس عملیات هنگام پیدا کردن خروجی',
        'فراموش کردن معکوس کردن عملیات هنگام پیدا کردن ورودی از روی خروجی'
      ],
      easyQuestions: [
        {
          id: 'pat_e3',
          chapterId: 'patterns',
          difficulty: 'easy',
          question: 'ماشینی هر عدد را "به اضافه ۶" می‌کند. اگر عدد ۳ وارد شود چه عددی خارج می‌شود؟',
          options: ['۸', '۹', '۱۰', '۱۱'],
          correctAnswerIndex: 1,
          explanation: '۳ + ۶ = ۹.',
          hint: '۳ را با ۶ جمع کن.'
        }
      ],
      mediumQuestions: [
        {
          id: 'pat_m3',
          chapterId: 'patterns',
          difficulty: 'medium',
          question: 'اگر قانون یک ماشین "ضرب در ۴" باشد و عدد ۲۴ از آن خارج شده باشد، ورودی چه بوده؟',
          options: ['۵', '۶', '۷', '۸'],
          correctAnswerIndex: 1,
          explanation: 'عملیات برعکس ضرب، تقسیم است: ۲۴ تقسیم بر ۴ = ۶.',
          hint: 'چه عددی ضرب در ۴ می‌شود ۲۴؟'
        }
      ],
      hardQuestions: [
        {
          id: 'pat_h3',
          chapterId: 'patterns',
          difficulty: 'hard',
          question: 'یک ماشین دو مرحله‌ای ابتدا عدد را "+ ۳" کرده و سپس "× ۲" می‌کند. اگر عدد ۵ وارد شود، خروجی چیست؟',
          options: ['۱۳', '۱۵', '۱۶', '۱۸'],
          correctAnswerIndex: 2,
          explanation: 'مرحله اول: ۵ + ۳ = ۸. مرحله دوم: ۸ × ۲ = ۱۶.',
          hint: 'اول ۳ تا اضافه کن، بعد حاصل را دو برابر کن!'
        }
      ]
    }
  ],

  place_value: [
    {
      id: 'pv_l1',
      chapterId: 'place_value',
      title: 'معرفی عدد هزار و جدول ارزش مکانی',
      lessonNumber: 1,
      shortSummary: '۱۰ بسته صدتایی با هم تشکیل یک بسته ۱۰۰۰ تایی می‌دهند. اعداد ۴ رقمی دارای ۴ مرتبه هستند: یکی، ده‌تایی، صدتایی، هزارتایی.',
      visualExplanation: {
        emoji: '🧱',
        diagramTitle: 'بلوک‌های ارزش مکانی',
        description: '۱ مکعب بزرگ هزارتایی = ۱۰ صفحه صدتایی = ۱۰۰ میله ده‌تایی = ۱۰۰۰ مکعب یکی.',
        formulaOrRule: 'عدد ۴ رقمی = هزارگان + صدگان + دهگان + یکان'
      },
      commonMistakes: [
        'قرار ندادن صفر برای مرتبه‌هایی که عددی ندارند (مثلاً نوشتن ۴۵ به جای ۴۰۰۵)',
        'اشتباه خواندن طبقه هزارها'
      ],
      easyQuestions: [
        {
          id: 'pv_e1',
          chapterId: 'place_value',
          difficulty: 'easy',
          question: 'عدد "چهار هزار و دویست و سی" به رقم کدام است؟',
          options: ['۴۲۳۰', '۴۲۰۳', '۴۲۳', '۲۴۳۰'],
          correctAnswerIndex: 0,
          explanation: '۴ هزار + ۲ صد + ۳ ده + ۰ یک = ۴۲۳۰.',
          hint: 'به جایگاه هر رقم در جدول دقت کن.'
        }
      ],
      mediumQuestions: [
        {
          id: 'pv_m1',
          chapterId: 'place_value',
          difficulty: 'medium',
          question: 'ارزش مکانی رقم ۶ در عدد ۵۶۲۱ چیست؟',
          options: ['یکان', 'دهگان', 'صدگان', 'هزارگان'],
          correctAnswerIndex: 2,
          explanation: 'رقم ۶ در جایگاه سوم از سمت راست قرار دارد که مرتبه صدگان است (۶۰۰).',
          hint: 'از سمت راست بشمار: یکی، ده تایی، صدتایی!'
        }
      ],
      hardQuestions: [
        {
          id: 'pv_h1',
          chapterId: 'place_value',
          difficulty: 'hard',
          question: 'بزرگ‌ترین عدد ۴ رقمی با ارقام ۲، ۰، ۸، ۵ بدون تکرار رقم کدام است؟',
          options: ['۸۵۲۰', '۸۵۰۲', '۸۲۵۰', '۵۸۲۰'],
          correctAnswerIndex: 0,
          explanation: 'برای بزرگ‌ترین عدد، بزرگ‌ترین رقم‌ها را از چپ به راست می‌چینیم: ۸۵۲۰.',
          hint: 'بزرگ‌ترین رقم (۸) را در هزارگان بگذار.'
        }
      ]
    },
    {
      id: 'pv_l2',
      chapterId: 'place_value',
      title: 'واحد پول (ریال و تومان) و تقریب زدن',
      lessonNumber: 2,
      shortSummary: 'هر ۱۰ ریال برابر با ۱ تومان است. برای تبدیل ریال به تومان یک صفر از آخر عدد برمی‌داریم و برای تومان به ریال یک صفر اضافه می‌کنیم.',
      visualExplanation: {
        emoji: '🪙',
        diagramTitle: 'کیف پول ریاضی',
        description: '۱۰۰۰ تومان = ۱۰۰۰۰ ریال | ۵۰۰۰۰ ریال = ۵۰۰۰ تومان.',
        formulaOrRule: 'تومان = ریال ÷ ۱۰ | ریال = تومان × ۱۰'
      },
      commonMistakes: [
        'فراموش کردن حذف صفر هنگام تبدیل ریال به تومان',
        'گرد کردن اشتباه در تقریب با رقم کمتر از ۵'
      ],
      easyQuestions: [
        {
          id: 'pv_e2',
          chapterId: 'place_value',
          difficulty: 'easy',
          question: '۷۰۰۰ ریال چند تومان است؟',
          options: ['۷۰ تومان', '۷۰۰ تومان', '۷۰۰۰ تومان', '۷ تومان'],
          correctAnswerIndex: 1,
          explanation: 'یک صفر از آخر ۷۰۰۰ برمی‌داریم: ۷۰۰ تومان.',
          hint: 'یک صفر از انتها حذف کن.'
        }
      ],
      mediumQuestions: [
        {
          id: 'pv_m2',
          chapterId: 'place_value',
          difficulty: 'medium',
          question: 'تقریب عدد ۳۸۴ به نزدیک‌ترین صدتایی کدام است؟',
          options: ['۳۰۰', '۳۸۰', '۴۰۰', '۵۰۰'],
          correctAnswerIndex: 2,
          explanation: 'چون دهگان ۸ است (بیشتر از ۵)، صدگان به ۴۰۰ گرد می‌شود.',
          hint: '۳۸۴ به ۴۰۰ نزدیک‌تر است یا ۳۰۰؟'
        }
      ],
      hardQuestions: [
        {
          id: 'pv_h2',
          chapterId: 'place_value',
          difficulty: 'hard',
          question: 'سارا با یک اسکناس ۵۰۰۰ تومانی دو مداد ۱۵۰۰ تومانی خرید. چقدر برایش باقی ماند؟',
          options: ['۱۰۰۰ تومان', '۲۰۰۰ تومان', '۲۵۰۰ تومان', '۳۰۰۰ تومان'],
          correctAnswerIndex: 1,
          explanation: 'قیمت دو مداد: ۱۵۰۰ + ۱۵۰۰ = ۳۰۰۰ تومان. باقی‌مانده: ۵۰۰۰ - ۳۰۰۰ = ۲۰۰۰ تومان.',
          hint: 'اول کل هزینه دو مداد را حساب کن.'
        }
      ]
    }
  ],

  fractions: [
    {
      id: 'frc_l1',
      chapterId: 'fractions',
      title: 'مفهوم کسر، صورت و مخرج',
      lessonNumber: 1,
      shortSummary: 'کسر یعنی قسمتی از یک کل مساوی. عدد بالای خط (صورت) تعداد قسمت‌های برداشته‌شده را نشان می‌دهد و عدد پایین خط (مخرج) تعداد کل قسمت‌های مساوی است.',
      visualExplanation: {
        emoji: '🍕',
        diagramTitle: 'پیتزای کسرها',
        description: 'اگر یک پیتزا را به ۴ قسمت مساوی برش دهیم و ۳ تکه را برداریم، کسر ۳/۴ ساخته می‌شود.',
        formulaOrRule: 'کسر = (قسمت‌های رنگ‌شده یا خورده‌شده) / (کل قسمت‌های مساوی)'
      },
      commonMistakes: [
        'تقسیم کردن شکل به قسمت‌های نامساوی',
        'برعکس نوشتن صورت و مخرج کسر'
      ],
      easyQuestions: [
        {
          id: 'frc_e1',
          chapterId: 'fractions',
          difficulty: 'easy',
          question: 'اگر یک سیب را به ۲ نیمه مساوی تقسیم کنیم، هر نیمه چه کسری از سیب است؟',
          options: ['۱/۲', '۱/۴', '۲/۱', '۲/۲'],
          correctAnswerIndex: 0,
          explanation: 'یک قسمت از دو قسمت مساوی برابر با ۱/۲ (یک دوم) است.',
          hint: '۱ قسمت از کل ۲ قسمت.'
        }
      ],
      mediumQuestions: [
        {
          id: 'frc_m1',
          chapterId: 'fractions',
          difficulty: 'medium',
          question: 'کدام کسر بزرگ‌تر است؟ ۲/۵ یا ۴/۵؟',
          options: ['۲/۵', '۴/۵', 'مساوی هستند', 'قابل مقایسه نیستند'],
          correctAnswerIndex: 1,
          explanation: 'وقتی مخرج‌ها مساوی هستند، کسری که صورتش بزرگ‌تر است مقدار بیشتری دارد (۴/۵).',
          hint: '۴ تکه شکلات بیشتر است یا ۲ تکه؟'
        }
      ],
      hardQuestions: [
        {
          id: 'frc_h1',
          chapterId: 'fractions',
          difficulty: 'hard',
          question: 'کدام کسر با کسر ۱/۲ برابر است؟',
          options: ['۲/۴', '۲/۶', '۳/۴', '۱/۴'],
          correctAnswerIndex: 0,
          explanation: 'کسر ۲/۴ مساوی نصف (۱/۲) است چون هر دو نصف کل شکل را نشان می‌دهند.',
          hint: 'صورت و مخرج را در ۲ ضرب کن.'
        }
      ]
    }
  ],

  multiplication_division: [
    {
      id: 'mul_l1',
      chapterId: 'multiplication_division',
      title: 'مفهوم ضرب و دسته‌ها',
      lessonNumber: 1,
      shortSummary: 'ضرب یعنی جمع سریع دسته‌های مساوی! وقتی ۳ بسته ۴ تایی مداد داریم، به جای جمع ۴+۴+۴ می‌نویسیم ۳ × ۴ = ۱۲.',
      visualExplanation: {
        emoji: '🧺',
        diagramTitle: 'سبدهای میوه',
        description: '۳ سبد که در هر کدام ۴ سیب قرار دارد ➔ ۳ دسته ۴ تایی ➔ ۳ × ۴ = ۱۲.',
        formulaOrRule: 'حاصل ضرب = تعداد دسته‌ها × تعداد اعضای هر دسته'
      },
      commonMistakes: [
        'جمع کردن دو عدد به جای ضرب کردن',
        'اشتباه در ضرب عدد صفر (هر عددی ضرب در صفر می‌شود صفر!)'
      ],
      easyQuestions: [
        {
          id: 'mul_e1',
          chapterId: 'multiplication_division',
          difficulty: 'easy',
          question: 'حاصل ضرب ۵ × ۰ کدام است؟',
          options: ['۵', '۰', '۱', '۵۰'],
          correctAnswerIndex: 1,
          explanation: 'هر عددی در صفر ضرب شود حاصل حتماً صفر است.',
          hint: 'صفر یعنی هیچ بسته‌ای وجود ندارد!'
        }
      ],
      mediumQuestions: [
        {
          id: 'mul_m1',
          chapterId: 'multiplication_division',
          difficulty: 'medium',
          question: 'حاصل ضرب ۸ × ۷ کدام است؟',
          options: ['۵۴', '۵۶', '۵۸', '۶۴'],
          correctAnswerIndex: 1,
          explanation: '۸ دسته ۷ تایی برابر با ۵۶ است.',
          hint: '۷ × ۷ می‌شود ۴۹، ۷ تا به آن اضافه کن!'
        }
      ],
      hardQuestions: [
        {
          id: 'mul_h1',
          chapterId: 'multiplication_division',
          difficulty: 'hard',
          question: 'در یک مزرعه ۶ مرغ و ۴ گاو وجود دارد. این حیوانات روی هم چند پا دارند؟',
          options: ['۲۰', '۲۴', '۲۸', '۳۲'],
          correctAnswerIndex: 2,
          explanation: 'پای مرغ‌ها: ۶ × ۲ = ۱۲. پای گاوها: ۴ × ۴ = ۱۶. کل پاها: ۱۲ + ۱۶ = ۲۸.',
          hint: 'مرغ ۲ پا دارد و گاو ۴ پا.'
        }
      ]
    },
    {
      id: 'mul_l2',
      chapterId: 'multiplication_division',
      title: 'مفهوم تقسیم و دسته‌بندی عادلانه',
      lessonNumber: 2,
      shortSummary: 'تقسیم یعنی پخش کردن یا دسته‌بندی مساوی اشیاء بین چند نفر یا چند گروه.',
      visualExplanation: {
        emoji: '🍬',
        diagramTitle: 'تقسیم شکلات‌ها',
        description: '۱۲ شکلات بین ۳ کودک ➔ ۱۲ ÷ ۳ = ۴ شکلات به هر کودک.',
        formulaOrRule: 'سهم هر دسته = کل اشیاء ÷ تعداد دسته‌ها'
      },
      commonMistakes: [
        'تقسیم نامساوی و بدون توجه به باقیمانده',
        'اشتباه گرفتن مقسوم و مقسوم‌علیه'
      ],
      easyQuestions: [
        {
          id: 'mul_e2',
          chapterId: 'multiplication_division',
          difficulty: 'easy',
          question: 'حاصل ۱۸ ÷ ۲ کدام است؟',
          options: ['۸', '۹', '۱۰', '۱۱'],
          correctAnswerIndex: 1,
          explanation: '۱۸ تقسیم بر ۲ می‌شود ۹ (چون ۹ × ۲ = ۱۸).',
          hint: 'چه عددی ضرب در ۲ می‌شود ۱۸؟'
        }
      ],
      mediumQuestions: [
        {
          id: 'mul_m2',
          chapterId: 'multiplication_division',
          difficulty: 'medium',
          question: 'اگر ۳۵ مداد را در دسته‌های ۵ تایی بسته‌بندی کنیم، چند دسته به دست می‌آید؟',
          options: ['۶', '۷', '۸', '۹'],
          correctAnswerIndex: 1,
          explanation: '۳۵ ÷ ۵ = ۷ دسته.',
          hint: 'جدول ضرب ۵: چه عددی ضرب در ۵ می‌شود ۳۵؟'
        }
      ],
      hardQuestions: [
        {
          id: 'mul_h2',
          chapterId: 'multiplication_division',
          difficulty: 'hard',
          question: 'حاصل عبارت (۲۴ ÷ ۴) + (۶ × ۳) کدام است؟',
          options: ['۲۲', '۲۴', '۲۶', '۲۸'],
          correctAnswerIndex: 1,
          explanation: '۲۴ ÷ ۴ = ۶ و ۶ × ۳ = ۱۸. جمع: ۶ + ۱۸ = ۲۴.',
          hint: 'اول داخل هر پرانتز را حساب کن و بعد جمع کن.'
        }
      ]
    }
  ],

  perimeter_area: [
    {
      id: 'pa_l1',
      chapterId: 'perimeter_area',
      title: 'محیط و مساحت اشکال هندسی',
      lessonNumber: 1,
      shortSummary: 'محیط یعنی اندازه دور تا دور یک شکل (مثل حصار دور باغچه). مساحت یعنی اندازه سطح داخل شکل (مثل چمن کاری داخل باغچه).',
      visualExplanation: {
        emoji: '📐',
        diagramTitle: 'محیط دور خط و مساحت سطح داخل',
        description: 'محیط مربع = یک ضلع × ۴ | مساحت مربع = یک ضلع × خودش',
        formulaOrRule: 'محیط = مجموع اضلاع دور شکل | مساحت مستطیل = طول × عرض'
      },
      commonMistakes: [
        'اشتباه گرفتن فرمول محیط با مساحت',
        'فراموش کردن جمع کردن تمام ضلع‌ها در محیط'
      ],
      easyQuestions: [
        {
          id: 'pa_e1',
          chapterId: 'perimeter_area',
          difficulty: 'easy',
          question: 'محیط مربعی با ضلع ۳ سانتی‌متر چقدر است؟',
          options: ['۶ سانتی‌متر', '۹ سانتی‌متر', '۱۲ سانتی‌متر', '۱۵ سانتی‌متر'],
          correctAnswerIndex: 2,
          explanation: '۴ × ۳ = ۱۲ سانتی‌متر.',
          hint: 'مربع ۴ ضلع ۳ سانتی‌متری دارد.'
        }
      ],
      mediumQuestions: [
        {
          id: 'pa_m1',
          chapterId: 'perimeter_area',
          difficulty: 'medium',
          question: 'مساحت مستطیلی با طول ۶ سانتی‌متر و عرض ۴ سانتی‌متر چقدر است؟',
          options: ['۲۰ سانتی‌متر مربع', '۲۴ سانتی‌متر مربع', '۱۰ سانتی‌متر مربع', '۱۸ سانتی‌متر مربع'],
          correctAnswerIndex: 1,
          explanation: 'مساحت مستطیل = طول × عرض = ۶ × ۴ = ۲۴ سانتی‌متر مربع.',
          hint: 'طول را در عرض ضرب کن.'
        }
      ],
      hardQuestions: [
        {
          id: 'pa_h1',
          chapterId: 'perimeter_area',
          difficulty: 'hard',
          question: 'محیط یک مستطیل ۲۴ سانتی‌متر است. اگر طول آن ۸ سانتی‌متر باشد، عرض آن چند است؟',
          options: ['۳ سانتی‌متر', '۴ سانتی‌متر', '۵ سانتی‌متر', '۶ سانتی‌متر'],
          correctAnswerIndex: 1,
          explanation: 'مجموع دو طول: ۸+۸=۱۶. مجموع دو عرض: ۲۴-۱۶=۸. یک عرض: ۸÷۲=۴ سانتی‌متر.',
          hint: 'نصف محیط می‌شود طول + عرض.'
        }
      ]
    }
  ],

  regrouping: [
    {
      id: 'reg_l1',
      chapterId: 'regrouping',
      title: 'جمع و تفریق تکنیکی اعداد ۴ رقمی',
      lessonNumber: 1,
      shortSummary: 'در جمع تکنیکی، اگر جمع ارقام یک ستون از ۹ بیشتر شد، رقم ده‌تایی به ستون سمت چپ منتقل می‌شود. در تفریق نیز اگر رقم بالا کمتر بود، از ستون کناری قرض می‌گیریم.',
      visualExplanation: {
        emoji: '🧮',
        diagramTitle: 'انتقال ده‌تایی و صدتایی',
        description: 'همیشه از ستون یکان‌ها (سمت راست) شروع می‌کنیم و به سمت چپ پیش می‌رویم.',
        formulaOrRule: 'جمع و تفریق ستون به ستون با رعایت انتقال و قرض گرفتن'
      },
      commonMistakes: [
        'فراموش کردن اضافه کردن رقم انتقالی (ده‌بریک)',
        'کم نکردن رقم بالایی پس از قرض دادن در تفریق'
      ],
      easyQuestions: [
        {
          id: 'reg_e1',
          chapterId: 'regrouping',
          difficulty: 'easy',
          question: 'حاصل جمع ۱۲۰۰ + ۲۳۰۰ کدام است؟',
          options: ['۳۴۰۰', '۳۵۰۰', '۳۶۰۰', '۳۷۰۰'],
          correctAnswerIndex: 1,
          explanation: '۱۲ صدتایی + ۲۳ صدتایی = ۳۵ صدتایی (۳۵۰۰).',
          hint: 'صدتایی‌ها را باهم جمع کن.'
        }
      ],
      mediumQuestions: [
        {
          id: 'reg_m1',
          chapterId: 'regrouping',
          difficulty: 'medium',
          question: 'حاصل جمع ۲۵۸۰ + ۱۶۴۰ کدام است؟',
          options: ['۴۲۲۰', '۴۱۲۰', '۴۳۲۰', '۴۱۸۰'],
          correctAnswerIndex: 0,
          explanation: 'جمع با دو بار انتقال: ۴۲۲۰.',
          hint: '۸+۴=۱۲ (۲ را بنویس و ۱ به صدگان منتقل کن).'
        }
      ],
      hardQuestions: [
        {
          id: 'reg_h1',
          chapterId: 'regrouping',
          difficulty: 'hard',
          question: 'حاصل تفریق ۴۰۰۰ - ۱۲۵۰ کدام است؟',
          options: ['۲۶۵۰', '۲۷۵۰', '۲۸۵۰', '۳۲۵۰'],
          correctAnswerIndex: 1,
          explanation: 'تفریق تکنیکی از روی صفرها با قرض گرفتن از ۴: ۲۷۵۰.',
          hint: '۴۰۰۰ منهای ۱۰۰۰ می‌شود ۳۰۰۰، منهای ۲۵۰ می‌شود ۲۷۵۰.'
        }
      ]
    }
  ],

  statistics: [
    {
      id: 'sta_l1',
      chapterId: 'statistics',
      title: 'چوب‌خط، نمودار و احتمال',
      lessonNumber: 1,
      shortSummary: 'چوب‌خط‌ها در دسته‌های ۵تایی به ما کمک می‌کنند داده‌ها را سریع بشماریم. نمودار ستونی مقایسه را بسیار آسان می‌کند و شانس نشان‌دهنده احتمال وقوع است.',
      visualExplanation: {
        emoji: '📊',
        diagramTitle: 'دسته‌های چوب‌خط و چرخنده شانس',
        description: '卌 = ۵ | 卌 卌 = ۱۰ | چرخنده با ۴ بخش زرد و ۱ بخش بنفش ➔ شانس زرد بیشتر است.',
        formulaOrRule: 'شمارش دسته‌های ۵تایی چوب‌خط و مقایسه ارتفاع ستون‌ها'
      },
      commonMistakes: [
        'کشیدن ۴ خط عمودی و فراموش کردن خط مورب پنجم در چوب‌خط',
        'اشتباه خواندن مقیاس محور در نمودار ستونی'
      ],
      easyQuestions: [
        {
          id: 'sta_e1',
          chapterId: 'statistics',
          difficulty: 'easy',
          question: 'علامت "卌 卌 ||" نشان‌دهنده چه عددی است؟',
          options: ['۱۰', '۱۱', '۱۲', '۱۳'],
          correctAnswerIndex: 2,
          explanation: 'دو دسته ۵ تایی (۱۰) به اضافه ۲ تا خط تکی = ۱۲.',
          hint: '۵ + ۵ + ۲.'
        }
      ],
      mediumQuestions: [
        {
          id: 'sta_m1',
          chapterId: 'statistics',
          difficulty: 'medium',
          question: 'در یک کیسه ۵ مهره آبی و ۲ مهره قرمز است. شانس درآوردن کدام رنگ بیشتر است؟',
          options: ['قرمز', 'آبی', 'مساوی', 'غیرممکن'],
          correctAnswerIndex: 1,
          explanation: 'چون تعداد مهره‌های آبی بیشتر است (۵ تا)، شانس آبی بیشتر است.',
          hint: 'تعداد کدام مهره‌ها بیشتر است؟'
        }
      ],
      hardQuestions: [
        {
          id: 'sta_h1',
          chapterId: 'statistics',
          difficulty: 'hard',
          question: 'اگر تاسی را پرتاب کنیم، احتمال آمدن عدد ۷ چقدر است؟',
          options: ['حتماً', 'ممکن', 'غیرممکن', 'خیلی زیاد'],
          correctAnswerIndex: 2,
          explanation: 'تاس فقط شماره‌های ۱ تا ۶ دارد؛ بنابراین آمدن عدد ۷ غیرممکن است.',
          hint: 'تاس چند وجه دارد؟ اعداد روی تاس ۱ تا ۶ هستند.'
        }
      ]
    }
  ],

  advanced_multiplication: [
    {
      id: 'amul_l1',
      chapterId: 'advanced_multiplication',
      title: 'ضرب در ۱۰، ۱۰۰، ۱۰۰۰ و ضرب دو رقمی',
      lessonNumber: 1,
      shortSummary: 'برای ضرب در ۱۰ یک صفر، در ۱۰۰ دو صفر و در ۱۰۰۰ سه صفر جلوی عدد می‌گذاریم. برای ضرب دو رقم در یک رقم، عدد را گسترده کرده و در رقم ضرب می‌کنیم.',
      visualExplanation: {
        emoji: '⚡',
        diagramTitle: 'شعبده‌بازی با صفرها',
        description: '۷ × ۱۰ = ۷۰ | ۷ × ۱۰۰ = ۷۰۰ | ۷ × ۱۰۰۰ = ۷۰۰۰',
        formulaOrRule: 'ضرب در توان‌های ۱۰ = اضافه کردن تعداد صفرهای آن به انتهای عدد'
      },
      commonMistakes: [
        'فراموش کردن قرار دادن صفرها در ضرب‌های چند مرحله‌ای',
        'اشتباه در ضرب دهگان عدد دو رقمی'
      ],
      easyQuestions: [
        {
          id: 'amul_e1',
          chapterId: 'advanced_multiplication',
          difficulty: 'easy',
          question: 'حاصل ضرب ۹ × ۱۰۰ کدام است؟',
          options: ['۹۰', '۹۰۰', '۹۰۰۰', '۹۹'],
          correctAnswerIndex: 1,
          explanation: 'دو صفر جلوی ۹ قرار می‌گیرد: ۹۰۰.',
          hint: 'دو تا صفر به ۹ اضافه کن.'
        }
      ],
      mediumQuestions: [
        {
          id: 'amul_m1',
          chapterId: 'advanced_multiplication',
          difficulty: 'medium',
          question: 'حاصل ضرب ۳۲ × ۳ کدام است؟',
          options: ['۹۲', '۹۴', '۹۶', '۹۸'],
          correctAnswerIndex: 2,
          explanation: '۳۰ × ۳ = ۹۰ و ۲ × ۳ = ۶. حاصل: ۹۰ + ۶ = ۹۶.',
          hint: '۳۰ را در ۳ و سپس ۲ را در ۳ ضرب کن.'
        }
      ],
      hardQuestions: [
        {
          id: 'amul_h1',
          chapterId: 'advanced_multiplication',
          difficulty: 'hard',
          question: 'یک جعبه ۶ ردیف شکلات دارد و در هر ردیف ۲۵ شکلات است. این جعبه چند شکلات دارد؟',
          options: ['۱۲۰', '۱۴۰', '۱۵۰', '۱۶۰'],
          correctAnswerIndex: 2,
          explanation: '۶ × ۲۰ = ۱۲۰ و ۶ × ۵ = ۳۰. حاصل: ۱۲۰ + ۳۰ = ۱۵۰.',
          hint: '۶ × ۲۵: ۴ تا ۲۵ تایی می‌شود ۱۰۰، ۲ تای دیگر ۵۰، مجموع ۱۵۰!'
        }
      ]
    }
  ]
};

