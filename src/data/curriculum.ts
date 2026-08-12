import { ChapterInfo, Badge, QuizQuestion } from '../types';

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
