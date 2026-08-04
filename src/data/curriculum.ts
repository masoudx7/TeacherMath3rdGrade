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
      question: 'عقربه‌ کوچک ساعت روی ۴ و عقربه بزرگ روی ۶ قرار دارد. ساعت چند است؟',
      options: ['۴:۳۰', '۶:۲۰', '۴:۰۶', '۵:۳۰'],
      correctAnswerIndex: 0,
      explanation: 'عقربه کوچک ساعت ۴ را نشان می‌دهد و عقربه بزرگ روی ۶ یعنی ۳۰ دقیقه گذرانده است (۴:۳۰).',
      hint: 'هر شماره روی ساعت نشان‌دهنده ۵ دقیقه است. ۶ ضرب در ۵ می‌شود ۳۰ دقیقه!'
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
  {
    id: 'first_step',
    title: 'شروع طلایی 🚀',
    description: 'اولین مسئله ریاضی را حل کردی!',
    icon: '🚀',
    requiredSolved: 1
  },
  {
    id: 'star_collector',
    title: 'کلکسیونر ستاره ⭐',
    description: '۱۰ ستاره درسی به دست آوردی!',
    icon: '⭐',
    requiredStars: 10
  },
  {
    id: 'mul_master',
    title: 'استاد جدول ضرب ✖️',
    description: 'فصل ضرب و تقسیم را تمرین کردی!',
    icon: '✖️',
    requiredSolved: 5
  },
  {
    id: 'photo_detective',
    title: 'عکاس ریاضی 📸',
    description: 'یک مسئله را با دوربین اسکن کردی!',
    icon: '📸',
    requiredScanned: 1
  },
  {
    id: 'fraction_king',
    title: 'قهرمان کسرها 🍕',
    description: 'کسرها را مثل آب خوردن یاد گرفتی!',
    icon: '🍕',
    requiredSolved: 10
  },
  {
    id: 'super_hero',
    title: 'ابرقهرمان ریاضی 🏆',
    description: 'رسیدن به سطح ۵ ریاضی پایه سوم!',
    icon: '🏆',
    requiredStars: 25
  }
];
