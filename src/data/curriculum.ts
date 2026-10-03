import { ChapterInfo, Badge, QuizQuestion, ChapterId, Lesson } from '../types';
export { BADGES } from './playstationTrophies';

export const CHAPTERS: ChapterInfo[] = [
  {
    id: 'patterns',
    title: 'الگوها و شمارش',
    chapterNumber: 1,
    iconName: 'Shapes',
    color: 'from-amber-400 to-orange-500',
    description: 'الگویابی، شمارش چندتاچندتا، خواندن ساعت و تقویم و ماشین‌های ورودی-خروجی',
    topics: ['شمارش چندتا چندتا', 'الگوهای عددی و هندسی', 'ساعت و دقیقه (۲۴ ساعته)', 'ماشین ورودی-خروجی'],
    gameId: 'pattern',
    gameTitle: 'ماشین شگفت‌انگیز الگوها و ساعت',
    gameIcon: '⚙️',
    gameDescription: 'کشف قانون الگوها، تنظیم ساعت عقربه‌ای و بازی ماشین ورودی-خروجی'
  },
  {
    id: 'place_value',
    title: 'عددنویسی و ارزش مکانی',
    chapterNumber: 2,
    iconName: 'Calculator',
    color: 'from-blue-400 to-indigo-600',
    description: 'معرفی عدد هزار، گسترده‌نویسی، مقایسه اعداد و واحد پول (ریال و تومان)',
    topics: ['معرفی عدد ۴ رقمی', 'جدول ارزش مکانی (یکی، ده تایی، صدتایی، هزارتایی)', 'واحد پول تومان و ریال', 'تقریب زدن اعداد'],
    gameId: 'place_value',
    gameTitle: 'آزمایشگاه ارزش مکانی و بانک پول',
    gameIcon: '🏦',
    gameDescription: 'ساخت اعداد ۴ رقمی با چرتکه و بلوک‌ها و تبدیل پول‌های ریال و تومان'
  },
  {
    id: 'fractions',
    title: 'کسرها',
    chapterNumber: 3,
    iconName: 'PieChart',
    color: 'from-emerald-400 to-teal-600',
    description: 'مفهوم کسر، صورت و مخرج، مقایسه کسرها و کسر روی محور اعداد',
    topics: ['مفهوم صورت و مخرج کسر', 'نمایش تصویری کسرها', 'مقایسه کسرها با مخرج یا صورت مساوی', 'کسرهای مساوی'],
    gameId: 'fraction',
    gameTitle: 'کارگاه پیتزای کسرها و محور',
    gameIcon: '🍕',
    gameDescription: 'برش زدن پیتزا، رنگ‌آمیزی اشکال هندسی و مقایسه تصویری کسرها'
  },
  {
    id: 'multiplication_division',
    title: 'ضرب و تقسیم',
    chapterNumber: 4,
    iconName: 'Grid',
    color: 'from-purple-400 to-pink-500',
    description: 'مفهوم دسته و تعداد، جدول ضرب، خاصیت جابه‌جایی و تقسیم',
    topics: ['مفهوم ضرب (دسته‌ها و عضوها)', 'جدول ضرب ۱ تا ۱۰', 'خاصیت جابه‌جایی ضرب', 'مفهوم تقسیم و دسته‌بندی'],
    gameId: 'multiplication',
    gameTitle: 'ماتریس جادویی جدول ضرب و تقسیم',
    gameIcon: '✖️',
    gameDescription: 'تمرین ریتمیک جدول ضرب، دسته‌بندی مهره‌ها و حل معماهای تقسیم'
  },
  {
    id: 'perimeter_area',
    title: 'محیط و مساحت',
    chapterNumber: 5,
    iconName: 'Square',
    color: 'from-rose-400 to-red-500',
    description: 'مفهوم دور تا دور (محیط) و سطح داخل (مساحت) در اشکال هندسی',
    topics: ['محاسبه محیط مربع و مستطیل', 'مفهوم مساحت با مربع‌های واحد', 'ارتباط محیط و مساحت', 'حل مسئله با رسم شکل'],
    gameId: 'perimeter',
    gameTitle: 'صفحه شطرنجی محیط و مساحت',
    gameIcon: '📐',
    gameDescription: 'کشیدن ریسه دور شکل‌ها (محیط) و فرش کردن زمین با کاشی‌های رنگی (مساحت)'
  },
  {
    id: 'regrouping',
    title: 'جمع و تفریق تکنیکی',
    chapterNumber: 6,
    iconName: 'PlusCircle',
    color: 'from-cyan-400 to-blue-500',
    description: 'جمع و تفریق اعداد ۴ رقمی با انتقال (انتقال ده تایی، صدتایی، هزارتایی)',
    topics: ['جمع تکنیکی با جدول ارزش مکانی', 'تفریق تکنیکی (قرض گرفتن)', 'جمع و تفریق ذهنی', 'حل مسائل مالی'],
    gameId: 'regrouping',
    gameTitle: 'ماشین انتقال و قرض‌گرفتن تکنیکی',
    gameIcon: '➕',
    gameDescription: 'حل پله‌پله جمع و تفریق ۴ رقمی با فرستادن بسته‌های ده‌تایی و صدتایی به همسایه'
  },
  {
    id: 'statistics',
    title: 'آمار و احتمال',
    chapterNumber: 7,
    iconName: 'BarChart3',
    color: 'from-violet-400 to-purple-600',
    description: 'چوب‌خط، جدول داده‌ها، نمودار ستونی و احتمال وقوع اتفاقات',
    topics: ['چوب‌خط و شمارش داده‌ها', 'رسم نمودار ستونی', 'مفهوم احتمال (حتما، ممکن، غیرممکن)', 'چرخنده شانس'],
    gameId: 'statistics',
    gameTitle: 'آزمایشگاه چوب‌خط و چرخنده شانس',
    gameIcon: '📊',
    gameDescription: 'بسته‌بندی ۵تایی چوب‌خط‌ها، ساخت نمودار ستونی و چرخش چرخنده احتمال'
  },
  {
    id: 'advanced_multiplication',
    title: 'ضرب اعداد بزرگ‌تر',
    chapterNumber: 8,
    iconName: 'Zap',
    color: 'from-yellow-400 to-amber-600',
    description: 'ضرب در ۱۰، ۱۰۰، ۱۰۰۰ و ضرب دو رقم در یک رقم و راهبردهای حل مسئله',
    topics: ['ضرب در ۱۰ و ۱۰۰ و ۱۰۰۰', 'ضرب دو رقم در یک رقم', 'تخمین ضرب', 'راهبرد زیرمسئله و جدول حدس و آزمایش'],
    gameId: 'advanced_multiplication',
    gameTitle: 'کارخانه ضرب‌های بزرگ و سریع',
    gameIcon: '⚡',
    gameDescription: 'شعبده‌بازی با صفرهای ضرب ۱۰ و ۱۰۰ و ضرب‌های ذهنی دو رقمی'
  }
];

export const SAMPLE_QUIZZES: Record<string, QuizQuestion[]> = {
  patterns: [
    // --- آسان (Easy) ---
    {
      id: 'pat_e1',
      chapterId: 'patterns',
      difficulty: 'easy',
      question: 'در الگوی عددی ۵، ۱۰، ۱۵، ۲۰، عدد بعدی کدام است؟',
      options: ['۲۲', '۲۵', '۳۰', '۲۴'],
      correctAnswerIndex: 1,
      explanation: 'در این الگو، اعداد ۵ تا ۵ تا زیاد می‌شوند (شمارش پرشی ۵تایی): ۲۰ + ۵ = ۲۵.',
      hint: 'شمارش ۵ تا ۵ تا را یک گام دیگر ادامه بده!',
      visualType: 'grid',
      visualData: { step: 5, sequence: [5, 10, 15, 20, 25] }
    },
    {
      id: 'pat_e2',
      chapterId: 'patterns',
      difficulty: 'easy',
      question: 'عقربه کوچک ساعت روی ۲ و عقربه بزرگ روی ۱۲ قرار دارد. ساعت بعدازظهر چه عددی را نشان می‌دهد؟',
      options: ['۱۲:۰۰', '۱۴:۰۰', '۱۶:۰۰', '۰۲:۰۰'],
      correctAnswerIndex: 1,
      explanation: 'برای به دست آوردن ساعت بعدازظهر، عدد ساعت را با ۱۲ جمع می‌کنیم: ۲ + ۱۲ = ۱۴.',
      hint: 'ساعت ۲ را با ۱۲ جمع کن تا ساعت بعدازظهر به دست بیاید.',
      visualType: 'clock',
      visualData: { hour: 14, minute: 0 }
    },
    {
      id: 'pat_e3',
      chapterId: 'patterns',
      difficulty: 'easy',
      question: 'در الگوی کاهشی ۹۰، ۸۰، ۷۰، ۶۰، عدد بعدی کدام است؟',
      options: ['۴۰', '۵۰', '۵۵', '۴۵'],
      correctAnswerIndex: 1,
      explanation: 'در این الگو، در هر مرحله ۱۰ واحد کم می‌شود: ۶۰ - ۱۰ = ۵۰.',
      hint: '۱۰ تا رو به عقب بشمار.',
      visualType: 'grid',
      visualData: { step: -10, sequence: [90, 80, 70, 60, 50] }
    },
    {
      id: 'pat_e4',
      chapterId: 'patterns',
      difficulty: 'easy',
      question: 'یک ماشین ورودی-خروجی به هر عدد ورودی ۴ واحد اضافه می‌کند (+۴). اگر عدد ۶ وارد شود، چه عددی خارج می‌شود؟',
      options: ['۸', '۹', '۱۰', '۱۲'],
      correctAnswerIndex: 2,
      explanation: 'قانون ماشین +۴ است. پس ۶ + ۴ برابر ۱۰ می‌شود.',
      hint: 'عدد ورودی (۶) را با ۴ جمع کن.'
    },
    {
      id: 'pat_e5',
      chapterId: 'patterns',
      difficulty: 'easy',
      question: 'در الگوی شکلی: 🔺 🟦 🔴 🔺 🟦 ... شکل بعدی کدام است؟',
      options: ['🔺', '🟦', '🔴', '⭐'],
      correctAnswerIndex: 2,
      explanation: 'نظم تکرار شونده این الگو سه‌تایی است: مثلث، مربع، دایره. پس بعد از مربع، نوبت دایره 🔴 است.',
      hint: 'دسته‌های تکراری ۳تایی شکل‌ها را پیدا کن.'
    },

    // --- متوسط (Medium) ---
    {
      id: 'pat_m1',
      chapterId: 'patterns',
      difficulty: 'medium',
      question: 'عقربه کوچک ساعت بین ۴ و ۵ و عقربه بزرگ روی عدد ۶ قرار دارد. ساعت بعدازظهر چند است؟',
      options: ['۱۵:۳۰', '۱۶:۳۰', '۱۷:۳۰', '۰۴:۳۰'],
      correctAnswerIndex: 1,
      explanation: 'عقربه کوچک روی ۴ (در بعدازظهر ۴ + ۱۲ = ۱۶) و عقربه بزرگ روی ۶ یعنی ۳۰ دقیقه: ۱۶:۳۰.',
      hint: '۴ ساعت را با ۱۲ جمع کن و به دقیقه عقربه بزرگ (۳۰ دقیقه) اضافه کن.',
      visualType: 'clock',
      visualData: { hour: 16, minute: 30 }
    },
    {
      id: 'pat_m2',
      chapterId: 'patterns',
      difficulty: 'medium',
      question: 'در الگوی پرشی ۱۲، ۱۸، ۲۴، ۳۰، عدد بعدی کدام است؟',
      options: ['۳۴', '۳۶', '۳۸', '۴۰'],
      correctAnswerIndex: 1,
      explanation: 'فاصله بین اعداد ۶ تا ۶ تا است: ۳۰ + ۶ = ۳۶.',
      hint: 'اختلاف بین دو عدد پشت سر هم (مثلاً ۱۸ منهای ۱۲) را پیدا کن.',
      visualType: 'grid',
      visualData: { step: 6, sequence: [12, 18, 24, 30, 36] }
    },
    {
      id: 'pat_m3',
      chapterId: 'patterns',
      difficulty: 'medium',
      question: 'در یک ماشین دو مرحله‌ای، عدد ورودی ابتدا "ضرب در ۲" و سپس "به علاوه ۵" می‌شود. اگر عدد ۴ وارد شود، خروجی چند است؟',
      options: ['۱۱', '۱۳', '۱۵', '۱۸'],
      correctAnswerIndex: 1,
      explanation: 'مرحله اول: ۴ × ۲ = ۸. مرحله دوم: ۸ + ۵ = ۱۳.',
      hint: 'ابتدا ۴ را دو برابر کن، سپس حاصل را با ۵ جمع کن.'
    },
    {
      id: 'pat_m4',
      chapterId: 'patterns',
      difficulty: 'medium',
      question: 'شکل اول ۳ چوب‌کبریت (یک مثلث)، شکل دوم ۵ چوب‌کبریت (دو مثلث متصل) و شکل سوم ۷ چوب‌کبریت دارد. شکل چهارم چند چوب‌کبریت می‌خواهد؟',
      options: ['۸', '۹', '۱۰', '۱۱'],
      correctAnswerIndex: 1,
      explanation: 'در هر مرحله ۲ چوب‌کبریت اضافه می‌شود: ۳، ۵، ۷، ۹. (یا رابطه: شماره شکل × ۲ + ۱ ➔ ۴ × ۲ + ۱ = ۹).',
      hint: 'به تعداد چوب‌کبریت‌های اضافه شده در هر مرحله دقت کن (۲ تا ۲ تا).'
    },
    {
      id: 'pat_m5',
      chapterId: 'patterns',
      difficulty: 'medium',
      question: 'کدام شکل هندسی هم خط تقارن افقی و هم خط تقارن عمودی دارد (۲ خط تقارن)؟',
      options: ['مثلث معمولی', 'مستطیل', 'ذوزنقه', 'متوازی‌الاضلاع'],
      correctAnswerIndex: 1,
      explanation: 'مستطیل دارای دو خط تقارن است؛ یکی خط افقی که از وسط می‌گذرد و دیگری خط عمودی.',
      hint: 'شکلی را تصور کن که اگر از بالا به پایین یا از چپ به راست تا شود، دقیقاً روی خودش بیفتد.'
    },

    // --- سخت (Hard) ---
    {
      id: 'pat_h1',
      chapterId: 'patterns',
      difficulty: 'hard',
      question: 'یک ماشین ورودی-خروجی هر عدد را "ضرب در ۳" کرده و سپس ۲ واحد اضافه می‌کند. اگر خروجی ماشین ۲۳ باشد، ورودی چه عددی بوده است؟',
      options: ['۵', '۶', '۷', '۸'],
      correctAnswerIndex: 2,
      explanation: 'عملیات را از آخر به اول برعکس انجام می‌دهیم: ۲۳ - ۲ = ۲۱، سپس ۲۱ ÷ ۳ = ۷.',
      hint: 'از خروجی به عقب حرکت کن: اول ۲ واحد کم کن، بعد بر ۳ تقسیم کن.'
    },
    {
      id: 'pat_h2',
      chapterId: 'patterns',
      difficulty: 'hard',
      question: 'در الگوی اعداد مربعی: ۱، ۴، ۹، ۱۶، عدد پنجم الگو کدام است؟',
      options: ['۲۰', '۲۴', '۲۵', '۳۰'],
      correctAnswerIndex: 2,
      explanation: 'هر شکل حاصل ضرب شماره شکل در خودش است: شکل اول ۱×۱=۱، شکل دوم ۲×۲=۴، شکل سوم ۳×۳=۹، شکل چهارم ۴×۴=۱۶ و شکل پنجم ۵×۵=۲۵.',
      hint: 'شماره شکل (۵) را در خودش ضرب کن.',
      visualType: 'grid',
      visualData: { squares: [1, 4, 9, 16, 25] }
    },
    {
      id: 'pat_h3',
      chapterId: 'patterns',
      difficulty: 'hard',
      question: 'برنامه کودک در ساعت ۱۷:۱۵ شروع شد و ۴۰ دقیقه طول کشید. این برنامه در چه ساعتی تمام شده است؟',
      options: ['۱۷:۴۵', '۱۷:۵۵', '۱۸:۰۵', '۱۸:۰۰'],
      correctAnswerIndex: 1,
      explanation: 'دقیقه‌ها را جمع می‌کنیم: ۱۵ دقیقه + ۴۰ دقیقه = ۵۵ دقیقه. پس ساعت پایان ۱۷:۵۵ است.',
      hint: '۱۵ دقیقه را با ۴۰ دقیقه جمع کن.',
      visualType: 'clock',
      visualData: { hour: 17, minute: 55 }
    },
    {
      id: 'pat_h4',
      chapterId: 'patterns',
      difficulty: 'hard',
      question: 'در یک الگوی هندسی، شکل ۱ دارای ۴ مربع، شکل ۲ دارای ۷ مربع و شکل ۳ دارای ۱۰ مربع است. شکل ششم چند مربع دارد؟',
      options: ['۱۶', '۱۸', '۱۹', '۲۱'],
      correctAnswerIndex: 2,
      explanation: 'گام الگو ۳ تا است. رابطه: (شماره شکل × ۳) + ۱. برای شکل ششم: (۶ × ۳) + ۱ = ۱۸ + ۱ = ۱۹.',
      hint: 'تعداد ۳ تا ۳ تا اضافه می‌شود. می‌توانی الگو را تا شکل ششم بنویسی: ۴، ۷، ۱۰، ۱۳، ۱۶، ۱۹.'
    },
    {
      id: 'pat_h5',
      chapterId: 'patterns',
      difficulty: 'hard',
      question: 'در یک ماشین ورودی-خروجی: با ورود ۲ عدد ۷ خارج می‌شود، با ورود ۴ عدد ۱۳ خارج می‌شود و با ورود ۵ عدد ۱۶ خارج می‌شود. قانون این ماشین چیست؟',
      options: ['ضرب در ۲ به اضافه ۳', 'ضرب در ۳ به اضافه ۱', 'ضرب در ۴ منهای ۱', 'به اضافه ۵'],
      correctAnswerIndex: 1,
      explanation: 'قانون ماشین: ورودی × ۳ + ۱. بررسی: (۲×۳)+۱=۷، (۴×۳)+۱=۱۳، (۵×۳)+۱=۱۶.',
      hint: 'امتحان کن ببین هر ورودی در چه عددی ضرب شود و چه عددی به آن اضافه شود تا خروجی ساخته شود.'
    }
  ],

  place_value: [
    // --- آسان (Easy) ---
    {
      id: 'pv_e1',
      chapterId: 'place_value',
      difficulty: 'easy',
      question: 'عدد "دو هزار و چهارصد و شصت و پنج" به رقم چگونه نوشته می‌شود؟',
      options: ['۲۴۵۶', '۲۴۶۵', '۲۶۴۵', '۴۲۶۵'],
      correctAnswerIndex: 1,
      explanation: '۲ هزار + ۴ صد + ۶ ده + ۵ یک = ۲۴۶۵.',
      hint: 'به جایگاه هر رقم دقت کن: هزارگان ۲، صدگان ۴، دهگان ۶ و یکان ۵.'
    },
    {
      id: 'pv_e2',
      chapterId: 'place_value',
      difficulty: 'easy',
      question: 'ارزش مکانی رقم ۷ در عدد ۳۷۵۲ چیست؟',
      options: ['۷', '۷۰', '۷۰۰', '۷۰۰۰'],
      correctAnswerIndex: 2,
      explanation: 'رقم ۷ در جایگاه صدگان قرار دارد، بنابراین ارزش آن برابر با ۷۰۰ است.',
      hint: 'شمارش کن: یکان، دهگان، صدگان! رقم ۷ در کدام خانه است؟',
      visualType: 'blocks',
      visualData: { thousands: 3, hundreds: 7, tens: 5, ones: 2 }
    },
    {
      id: 'pv_e3',
      chapterId: 'place_value',
      difficulty: 'easy',
      question: '۷۰،۰۰۰ ریال برابر با چند تومان است؟',
      options: ['۷۰۰ تومان', '۷،۰۰۰ تومان', '۷۰،۰۰۰ تومان', '۷۰ تومان'],
      correctAnswerIndex: 1,
      explanation: 'برای تبدیل ریال به تومان، یک صفر از سمت راست عدد برمی‌داریم: ۷،۰۰۰ تومان.',
      hint: 'هر ۱۰ ریال برابر با ۱ تومان است (یک صفر را حذف کن).'
    },
    {
      id: 'pv_e4',
      chapterId: 'place_value',
      difficulty: 'easy',
      question: 'کدام علامت بین دو عدد ۳۴۸۰ و ۳۴۰۸ قرار می‌گیرد؟ (۳۴۸۰ ... ۳۴۰۸)',
      options: ['<', '>', '=', 'هیچ‌کدام'],
      correctAnswerIndex: 1,
      explanation: 'هزارگان و صدگان هر دو برابر است (۳ و ۴)، اما دهگان اولی ۸ و دومی ۰ است، پس ۳۴۸۰ > ۳۴۰۸.',
      hint: 'از سمت چپ‌ترین رقم مقایسه کن؛ دهگان ۸ بزرگ‌تر از دهگان ۰ است.'
    },
    {
      id: 'pv_e5',
      chapterId: 'place_value',
      difficulty: 'easy',
      question: 'کوچک‌ترین عدد چهار رقمی کدام است؟',
      options: ['۹۹۹', '۱۰۰۰', '۱۰۲۳', '۱۱۱۱'],
      correctAnswerIndex: 1,
      explanation: 'کوچک‌ترین عدد ۴ رقمی عدد ۱۰۰۰ است که دقیقاً بعد از عدد ۳ رقمی ۹۹۹ می‌آید.',
      hint: 'کوچک‌ترین عددی که ۴ تا رقم دارد و با ۱ شروع می‌شود.'
    },

    // --- متوسط (Medium) ---
    {
      id: 'pv_m1',
      chapterId: 'place_value',
      difficulty: 'medium',
      question: 'گسترده عدد ۵۰۸۲ کدام گزینه است؟',
      options: ['۵۰۰۰ + ۸۰ + ۲', '۵۰۰۰ + ۸۰۰ + ۲', '۵۰۰ + ۸۰ + ۲', '۵۰۰۰ + ۸۰ + ۲۰'],
      correctAnswerIndex: 0,
      explanation: '۵ هزارتایی (۵۰۰۰) + ۰ صدتایی + ۸ ده‌تایی (۸۰) + ۲ یکی (۲) = ۵۰۰۰ + ۸۰ + ۲.',
      hint: 'چون رقم صدگان صفر است، در گسترده‌نویسی نوشته نمی‌شود.'
    },
    {
      id: 'pv_m2',
      chapterId: 'place_value',
      difficulty: 'medium',
      question: 'عدد ۶۷۸۴ با تقریب رقم صدگان به کدام عدد نزدیک‌تر است؟',
      options: ['۶۷۰۰', '۶۸۰۰', '۶۰۰۰', '۷۰۰۰'],
      correctAnswerIndex: 1,
      explanation: 'به رقم بعد از صدگان (دهگان) نگاه می‌کنیم؛ رقم ۸ است (۵ یا بیشتر)، پس صدگان یکی زیاد می‌شود: ۶۸۰۰.',
      hint: 'عدد ۸۴ از ۵۰ بیشتر است، بنابراین به ۶۸۰۰ نزدیک‌تر است تا ۶۷۰۰.'
    },
    {
      id: 'pv_m3',
      chapterId: 'place_value',
      difficulty: 'medium',
      question: 'با ارقام ۴، ۰، ۷ و ۹ بزرگ‌ترین عدد چهار رقمی بدون تکرار کدام است؟',
      options: ['۹۷۰۴', '۹۴۷۰', '۹۷۴۰', '۷۹۴۰'],
      correctAnswerIndex: 2,
      explanation: 'برای ساخت بزرگ‌ترین عدد، ارقام را از بزرگ به کوچک از سمت چپ می‌چینیم: ۹، ۷، ۴، ۰ یعنی ۹۷۴۰.',
      hint: 'بزرگ‌ترین رقم‌ها را در سمت چپ‌ترین خانه‌ها (هزارگان و صدگان) بگذار.'
    },
    {
      id: 'pv_m4',
      chapterId: 'place_value',
      difficulty: 'medium',
      question: 'کیان ۴ اسکناس ۱۰۰۰ تومانی و ۳ سکه ۵۰۰ تومانی دارد. او در مجموع چند تومان پول دارد؟',
      options: ['۴۵۰۰ تومان', '۵۰۰۰ تومان', '۵۵۰۰ تومان', '۶۰۰۰ تومان'],
      correctAnswerIndex: 2,
      explanation: '۴ اسکناس هزار تومانی = ۴۰۰۰ تومان. ۳ سکه ۵۰۰ تومانی = ۱۵۰۰ تومان. مجموع: ۴۰۰۰ + ۱۵۰۰ = ۵۵۰۰ تومان.',
      hint: '۴ تا ۱۰۰۰ تومان می‌شود ۴۰۰۰، ۳ تا ۵۰۰ تومان می‌شود ۱۵۰۰. جمع کن!'
    },
    {
      id: 'pv_m5',
      chapterId: 'place_value',
      difficulty: 'medium',
      question: 'اگر به عدد ۴۳۲۰ دو بسته صدتایی اضافه کنیم، عدد جدید کدام است؟',
      options: ['۴۳۴۰', '۴۵۲۰', '۶۳۲۰', '۴۳۲۲'],
      correctAnswerIndex: 1,
      explanation: 'دو بسته صدتایی یعنی ۲۰۰ واحد. پس ۴۳۲۰ + ۲۰۰ = ۴۵۲۰ (رقم صدگان از ۳ به ۵ تغییر می‌کند).',
      hint: 'فقط به رقم صدگان (۳) دو تا اضافه کن.'
    },

    // --- سخت (Hard) ---
    {
      id: 'pv_h1',
      chapterId: 'place_value',
      difficulty: 'hard',
      question: 'عدد ۴۵۲۹ با تقریب صدگان و هزارگان به ترتیب برابر با کدام اعداد است؟',
      options: ['۴۵۰۰ و ۴۰۰۰', '۴۵۰۰ و ۵۰۰۰', '۴۶۰۰ و ۵۰۰۰', '۴۵۲۰ و ۵۰۰۰'],
      correctAnswerIndex: 1,
      explanation: 'تقریب صدگان: رقم دهگان ۲ است (کمتر از ۵) پس ۴۵۰۰ می‌شود. تقریب هزارگان: رقم صدگان ۵ است پس ۵۰۰۰ می‌شود.',
      hint: 'در تقریب صدگان به رقم دهگان (۲) نگاه کن، در تقریب هزارگان به رقم صدگان (۵) نگاه کن.'
    },
    {
      id: 'pv_h2',
      chapterId: 'place_value',
      difficulty: 'hard',
      question: 'یک عدد ۴ رقمی با این ویژگی‌ها پیدا کنید: هزارگان آن بزرگ‌ترین رقم یک‌رقمی (۹)، صدگانش ۰، دهگانش ۳ و یکانش زوج باشد.',
      options: ['۹۰۳۱', '۹۰۳۲', '۹۳۰۲', '۹۰۳۵'],
      correctAnswerIndex: 1,
      explanation: 'هزارگان ۹، صدگان ۰، دهگان ۳ و یکان زوج (۲). عدد حاصل ۹۰۳۲ است.',
      hint: 'به جایگاه صفر در صدگان و زوج بودن رقم یکان دقت کن.'
    },
    {
      id: 'pv_h3',
      chapterId: 'place_value',
      difficulty: 'hard',
      question: 'سارا یک اسکناس ۱۰،۰۰۰ تومانی به فروشنده داد و یک دفتر ۷،۵۰۰ تومانی خرید. فروشنده چند ریال باید به او پس بدهد؟',
      options: ['۲۵۰۰ ریال', '۲۵،۰۰۰ ریال', '۲۵۰،۰۰۰ ریال', '۱۵،۰۰۰ ریال'],
      correctAnswerIndex: 1,
      explanation: 'باقیمانده پول: ۱۰،۰۰۰ - ۷،۵۰۰ = ۲،۵۰۰ تومان. چون جواب به ریال خواسته شده، یک صفر اضافه می‌کنیم: ۲۵،۰۰۰ ریال.',
      hint: 'اول باقیمانده را به تومان به دست بیاور، بعد با اضافه کردن یک صفر آن را به ریال تبدیل کن.'
    },
    {
      id: 'pv_h4',
      chapterId: 'place_value',
      difficulty: 'hard',
      question: 'در عدد ۶۳۰۰ چند بسته صدتایی کامل وجود دارد؟',
      options: ['۳ بسته', '۶ بسته', '۶۳ بسته', '۶۳۰ بسته'],
      correctAnswerIndex: 2,
      explanation: 'هر ۱۰۰۰ برابر با ۱۰ تا صدتایی است، پس ۶۰۰۰ یعنی ۶۰ صدتایی + ۳ صدتایی = ۶۳ بسته صدتایی کامل.',
      hint: 'عدد ۶۳۰۰ را بر ۱۰۰ تقسیم کن یا دو صفر آن را بردار.'
    },
    {
      id: 'pv_h5',
      chapterId: 'place_value',
      difficulty: 'hard',
      question: 'اختلاف بزرگ‌ترین و کوچک‌ترین عدد ۴ رقمی بدون تکرار که با ارقام ۲، ۵، ۰ و ۸ می‌توان ساخت کدام است؟',
      options: ['۶۴۶۲', '۶۵۴۰', '۶۲۴۲', '۶۳۵۲'],
      correctAnswerIndex: 0,
      explanation: 'بزرگ‌ترین عدد: ۸۵۲۰. کوچک‌ترین عدد (صفر نمی‌تواند اول باشد): ۲۰۵۸. اختلاف: ۸۵۲۰ - ۲۰۵۸ = ۶۴۶۲.',
      hint: 'بزرگ‌ترین عدد ۸۵۲۰ و کوچک‌ترین عدد ۲۰۵۸ است. این دو را از هم کم کن.'
    }
  ],

  fractions: [
    // --- آسان (Easy) ---
    {
      id: 'fr_e1',
      chapterId: 'fractions',
      difficulty: 'easy',
      question: 'یک دایره به ۴ قسمت کاملاً مساوی تقسیم شده و ۳ قسمت آن رنگ شده است. کسر رنگ شده کدام است؟',
      options: ['۱/۴', '۲/۴', '۳/۴', '۴/۳'],
      correctAnswerIndex: 2,
      explanation: 'تعداد کل قسمت‌ها ۴ (مخرج) و قسمت‌های رنگی ۳ (صورت) است: ۳/۴.',
      hint: 'قسمت‌های رنگ‌شده را در صورت (بالا) و کل قسمت‌ها را در مخرج (پایین) بنویس.',
      visualType: 'fraction',
      visualData: { numerator: 3, denominator: 4 }
    },
    {
      id: 'fr_e2',
      chapterId: 'fractions',
      difficulty: 'easy',
      question: 'در کسر ۵/۸، عدد ۵ چه نام دارد و عدد ۸ چه نام دارد؟',
      options: ['۵ مخرج و ۸ صورت', '۵ صورت و ۸ مخرج', 'هر دو صورت هستند', 'هر دو مخرج هستند'],
      correctAnswerIndex: 1,
      explanation: 'عدد بالای خط کسری «صورت» (تعداد انتخاب شده) و عدد پایین خط کسری «مخرج» (کل قسمت‌ها) است.',
      hint: 'صورت همیشه بالا است مثل صورت انسان!'
    },
    {
      id: 'fr_e3',
      chapterId: 'fractions',
      difficulty: 'easy',
      question: 'کدام کسر بزرگ‌تر است؟ (۲/۷ یا ۵/۷)',
      options: ['۲/۷', '۵/۷', 'مساوی هستند', 'قابل مقایسه نیستند'],
      correctAnswerIndex: 1,
      explanation: 'وقتی مخرج‌ها مساوی هستند، کسری بزرگ‌تر است که صورتش بزرگ‌تر باشد: ۵/۷ > ۲/۷.',
      hint: '۵ تکه از ۷ تکه پیتزا بیشتر است یا ۲ تکه از همان پیتزا؟'
    },
    {
      id: 'fr_e4',
      chapterId: 'fractions',
      difficulty: 'easy',
      question: 'کدام‌یک از کسرهای زیر برابر با عدد ۱ (واحد کامل) است؟',
      options: ['۱/۴', '۴/۴', '۰/۴', '۲/۴'],
      correctAnswerIndex: 1,
      explanation: 'هر گاه صورت و مخرج کسر با هم برابر باشند، کسر برابر با ۱ واحد کامل است: ۴/۴ = ۱.',
      hint: 'اگر تمام تکه‌های یک پیتزا را بخوری، یک پیتزای کامل خورده‌ای.'
    },
    {
      id: 'fr_e5',
      chapterId: 'fractions',
      difficulty: 'easy',
      question: 'روی محور اعداد، نقطه‌ای که دقیقاً در وسط بین ۰ و ۱ قرار دارد چه کسری را نشان می‌دهد؟',
      options: ['۱/۴', '۱/۲', '۳/۴', '۱/۳'],
      correctAnswerIndex: 1,
      explanation: 'نقطه وسط بین ۰ و ۱ نشان‌دهنده کسر یک‌دوم (۱/۲) یعنی نصف واحد است.',
      hint: 'نصف یک واحد با کسر ۱/۲ نشان داده می‌شود.'
    },

    // --- متوسط (Medium) ---
    {
      id: 'fr_m1',
      chapterId: 'fractions',
      difficulty: 'medium',
      question: 'کدام کسر بزرگ‌تر است؟ (۱/۳ یا ۱/۶)',
      options: ['۱/۳', '۱/۶', 'هر دو برابرند', '۱/۶ چون ۶ بزرگ‌تر است'],
      correctAnswerIndex: 0,
      explanation: 'وقتی صورت‌ها برابرند، کسری بزرگ‌تر است که مخرجش کوچک‌تر باشد (به تکه‌های کمتری تقسیم شده و تکه‌ها بزرگ‌ترند): ۱/۳ > ۱/۶.',
      hint: 'اگر یک پیتزا را بین ۳ نفر تقسیم کنی تکه بزرگ‌تری می‌رسد یا بین ۶ نفر؟'
    },
    {
      id: 'fr_m2',
      chapterId: 'fractions',
      difficulty: 'medium',
      question: 'کدام کسر با کسر ۲/۴ مساوی است؟',
      options: ['۱/۳', '۱/۲', '۳/۴', '۲/۸'],
      correctAnswerIndex: 1,
      explanation: '۲ قسمت از ۴ قسمت یعنی دقیقاً نصف شکل. کسر مساوی با آن ۱/۲ است.',
      hint: 'اگر صورت و مخرج ۲/۴ را بر ۲ تقسیم کنیم، به چه کسری می‌رسیم؟'
    },
    {
      id: 'fr_m3',
      chapterId: 'fractions',
      difficulty: 'medium',
      question: 'در یک جعبه ۸ مداد وجود دارد که ۳ تای آن‌ها قرمز و بقیه آبی هستند. چه کسری از مدادها آبی است؟',
      options: ['۳/۸', '۵/۸', '۸/۵', '۵/۳'],
      correctAnswerIndex: 1,
      explanation: 'تعداد مدادهای آبی: ۸ - ۳ = ۵. پس کسر مدادهای آبی ۵/۸ است.',
      hint: 'اول تعداد مدادهای آبی را پیدا کن (۸ منهای ۳).'
    },
    {
      id: 'fr_m4',
      chapterId: 'fractions',
      difficulty: 'medium',
      question: 'یک شکل به ۳ قسمت تقسیم شده اما قسمت‌ها مساوی نیستند. آیا می‌توان گفت هر قسمت ۱/۳ شکل است؟',
      options: ['بله، چون ۳ قسمت است', 'خیر، چون شرط کسر این است که قسمت‌ها کاملاً مساوی باشند', 'بستگی به رنگ شکل دارد', 'فقط اگر مثلث باشد بله'],
      correctAnswerIndex: 1,
      explanation: 'مهم‌ترین قانون کسر این است که واحد باید به قسمت‌های کاملاً مساوی و هم‌اندازه تقسیم شود.',
      hint: 'آیا تکه‌ها هم‌اندازه هستند؟ اگر مساوی نباشند کسر درست نیست.'
    },
    {
      id: 'fr_m5',
      chapterId: 'fractions',
      difficulty: 'medium',
      question: 'یک نوار کاغذی به طول ۱۲ سانتی‌متر داریم. ۳/۴ طول این نوار چند سانتی‌متر است؟',
      options: ['۳ سانتی‌متر', '۶ سانتی‌متر', '۹ سانتی‌متر', '۱۰ سانتی‌متر'],
      correctAnswerIndex: 2,
      explanation: 'ابتدا ۱/۴ طول نوار را حساب می‌کنیم: ۱۲ ÷ ۴ = ۳ سانتی‌متر. سپس ۳/۴ آن می‌شود: ۳ × ۳ = ۹ سانتی‌متر.',
      hint: '۱۲ را بر ۴ تقسیم کن و جواب را در ۳ ضرب کن.'
    },

    // --- سخت (Hard) ---
    {
      id: 'fr_h1',
      chapterId: 'fractions',
      difficulty: 'hard',
      question: 'در تساوی کسرهای روبه‌رو، به جای علامت سوال چه عددی قرار می‌گیرد؟  ۲/۵ = ؟/۱۰',
      options: ['۳', '۴', '۵', '۶'],
      correctAnswerIndex: 1,
      explanation: 'مخرج ۵ در ۲ ضرب شده تا ۱۰ شود، پس صورت ۲ هم باید در ۲ ضرب شود: ۲ × ۲ = ۴.',
      hint: 'ببین مخرج (۵) ضرب در چه عددی شده تا بشود ۱۰؛ صورت را هم در همان ضرب کن!'
    },
    {
      id: 'fr_h2',
      chapterId: 'fractions',
      difficulty: 'hard',
      question: 'پارسا ۱/۵ پولش را خوراکی خرید و ۲/۵ آن را یک دفتر خرید. چه کسری از کل پولش برایش باقی مانده است؟',
      options: ['۳/۵', '۲/۵', '۱/۵', '۴/۵'],
      correctAnswerIndex: 1,
      explanation: 'خرج شده‌ها: ۱/۵ + ۲/۵ = ۳/۵. کل پول ۵/۵ است: ۵/۵ - ۳/۵ = ۲/۵ باقی مانده است.',
      hint: 'کسرهای خرج شده را جمع کن (۳/۵)، بعد از یک واحد کامل (۵/۵) کم کن.'
    },
    {
      id: 'fr_h3',
      chapterId: 'fractions',
      difficulty: 'hard',
      question: 'کدام‌یک از کسرهای زیر از ۱/۲ (نصف) بزرگ‌تر است؟',
      options: ['۲/۶', '۳/۸', '۴/۶', '۱/۴'],
      correctAnswerIndex: 2,
      explanation: 'نصف کسر با مخرج ۶ برابر با ۳/۶ است. کسر ۴/۶ چون صورتش ۴ از ۳ بیشتر است، از نصف بزرگ‌تر است.',
      hint: 'نصف مخرج ۶ می‌شود ۳. پس هر کسری که صورتش از ۳ بیشتر باشد، از نصف بزرگ‌تر است.'
    },
    {
      id: 'fr_h4',
      chapterId: 'fractions',
      difficulty: 'hard',
      question: 'روی محور اعداد، فاصله ۰ تا ۱ به ۸ قسمت مساوی تقسیم شده است. کدام کسر ۲ واحد کوچک‌تر از ۷/۸ است؟',
      options: ['۵/۸', '۴/۸', '۳/۸', '۶/۸'],
      correctAnswerIndex: 0,
      explanation: 'دو قسمت قبل از ۷/۸ روی محور: ۷/۸ - ۲/۸ = ۵/۸.',
      hint: 'از صورت عدد ۷، دو تا کم کن چون مخرج‌ها مساوی هستند.'
    },
    {
      id: 'fr_h5',
      chapterId: 'fractions',
      difficulty: 'hard',
      question: 'اگر ۱/۴ پول نوید برابر با ۸،۰۰۰ تومان باشد، کل پول نوید چند تومان است؟',
      options: ['۲،۰۰۰ تومان', '۱۶،۰۰۰ تومان', '۲۴،۰۰۰ تومان', '۳۲،۰۰۰ تومان'],
      correctAnswerIndex: 3,
      explanation: 'وقتی ۱ قسمت از ۴ قسمت ۸،۰۰۰ تومان است، کل پول ۴ برابر آن است: ۸،۰۰۰ × ۴ = ۳۲،۰۰۰ تومان.',
      hint: '۸،۰۰۰ را در ۴ ضرب کن تا کل پول به دست آید.'
    }
  ],

  multiplication_division: [
    // --- آسان (Easy) ---
    {
      id: 'md_e1',
      chapterId: 'multiplication_division',
      difficulty: 'easy',
      question: 'عبارت جمع تکراری ۴ + ۴ + ۴ + ۴ + ۴ برابر با کدام عبارت ضرب است؟',
      options: ['۴ × ۴', '۵ × ۴', '۵ × ۵', '۴ + ۵'],
      correctAnswerIndex: 1,
      explanation: 'عدد ۴ به تعداد ۵ بار تکرار شده است، بنابراین ضرب آن ۵ × ۴ = ۲۰ است.',
      hint: 'بشمار چند تا عدد ۴ داریم؟ ۵ تا ۴ تایی!'
    },
    {
      id: 'md_e2',
      chapterId: 'multiplication_division',
      difficulty: 'easy',
      question: 'حاصل ضرب ۶ × ۷ کدام است؟',
      options: ['۳۶', '۴۰', '۴۲', '۴۸'],
      correctAnswerIndex: 2,
      explanation: 'از جدول ضرب می‌دانیم که ۶ × ۷ = ۴۲ است.',
      hint: '۶ دسته ۷ تایی برابر ۴۲ است.'
    },
    {
      id: 'md_e3',
      chapterId: 'multiplication_division',
      difficulty: 'easy',
      question: 'حاصل ضرب ۹ × ۰ و ۸ × ۱ به ترتیب کدام است؟',
      options: ['۹ و ۸', '۰ و ۸', '۰ و ۱', '۹ و ۰'],
      correctAnswerIndex: 1,
      explanation: 'هر عدد ضرب در صفر برابر صفر می‌شود (۹ × ۰ = ۰) و هر عدد ضرب در یک برابر خودش می‌شود (۸ × ۱ = ۸).',
      hint: 'ضرب در صفر عدد را صفر می‌کند و ضرب در یک خود عدد را برمی‌گرداند.'
    },
    {
      id: 'md_e4',
      chapterId: 'multiplication_division',
      difficulty: 'easy',
      question: '۱۸ سیب را بین ۳ کودک به طور مساوی تقسیم می‌کنیم. به هر کودک چند سیب می‌رسد؟',
      options: ['۵', '۶', '۷', '۹'],
      correctAnswerIndex: 1,
      explanation: '۱۸ ÷ ۳ = ۶، زیرا ۶ × ۳ = ۱۸ است.',
      hint: 'فکر کن چه عددی ضرب در ۳ می‌شود ۱۸؟'
    },
    {
      id: 'md_e5',
      chapterId: 'multiplication_division',
      difficulty: 'easy',
      question: 'با توجه به خاصیت جابه‌جایی در ضرب، اگر ۵ × ۹ = ۴۵ باشد، حاصل ۹ × ۵ چیست؟',
      options: ['۴۰', '۴۵', '۵۰', '۵۴'],
      correctAnswerIndex: 1,
      explanation: 'در ضرب جابه‌جا کردن عددها حاصل را تغییر نمی‌دهد: ۵ × ۹ = ۹ × ۵ = ۴۵.',
      hint: 'خاصیت جابه‌جایی: ترتیب ضرب عددها حاصل را عوض نمی‌کند.'
    },

    // --- متوسط (Medium) ---
    {
      id: 'md_m1',
      chapterId: 'multiplication_division',
      difficulty: 'medium',
      question: 'حاصل ضرب ۷ × ۸ کدام است؟',
      options: ['۵۴', '۵۶', '۵۸', '۶۴'],
      correctAnswerIndex: 1,
      explanation: '۷ ضرب در ۸ برابر ۵۶ است.',
      hint: '۷ دسته ۸ تایی برابر ۵۶ می‌شود.'
    },
    {
      id: 'md_m2',
      chapterId: 'multiplication_division',
      difficulty: 'medium',
      question: 'از عبارت ضرب ۶ × ۴ = ۲۴ کدام عبارت تقسیم زیر نتیجه می‌شود؟',
      options: ['۲۴ ÷ ۳ = ۸', '۲۴ ÷ ۶ = ۴', '۲۴ ÷ ۲ = ۱۲', '۶ ÷ ۴ = ۲'],
      correctAnswerIndex: 1,
      explanation: 'هر ضرب دو تقسیم متناظر دارد: ۲۴ ÷ ۶ = ۴ و ۲۴ ÷ ۴ = ۶.',
      hint: 'کل (۲۴) تقسیم بر یکی از عامل‌های ضرب باید عامل دیگر را بدهد.'
    },
    {
      id: 'md_m3',
      chapterId: 'multiplication_division',
      difficulty: 'medium',
      question: 'مریم ۴ بسته مداد رنگی ۶ تایی خرید. او در مجموع چند مداد رنگی دارد؟',
      options: ['۲۰', '۲۲', '۲۴', '۲۶'],
      correctAnswerIndex: 2,
      explanation: '۴ بسته ۶ تایی یعنی ۴ × ۶ = ۲۴ مداد رنگی.',
      hint: 'تعداد بسته‌ها (۴) را در تعداد هر بسته (۶) ضرب کن.'
    },
    {
      id: 'md_m4',
      chapterId: 'multiplication_division',
      difficulty: 'medium',
      question: 'یک باغبان می‌خواهد ۳۵ شاخه گل رز را در دسته‌های ۵ تایی بسته‌بندی کند. او چند دسته گل درست می‌کند؟',
      options: ['۶ دسته', '۷ دسته', '۸ دسته', '۹ دسته'],
      correctAnswerIndex: 1,
      explanation: '۳۵ ÷ ۵ = ۷ دسته، زیرا ۷ × ۵ = ۳۵.',
      hint: 'چه عددی ضرب در ۵ می‌شود ۳۵؟'
    },
    {
      id: 'md_m5',
      chapterId: 'multiplication_division',
      difficulty: 'medium',
      question: 'یک خرگوش روی محور اعداد از نقطه ۰ شروع کرده و ۴ پرشِ ۳تایی به سمت جلو انجام می‌دهد. او روی چه عددی قرار می‌گیرد؟',
      options: ['۷', '۱۰', '۱۲', '۱۴'],
      correctAnswerIndex: 2,
      explanation: '۴ پرش ۳تایی یعنی ۴ × ۳ = ۱۲.',
      hint: '۴ بار ۳ تا ۳ تا جلو برو: ۳، ۶، ۹، ۱۲.'
    },

    // --- سخت (Hard) ---
    {
      id: 'md_h1',
      chapterId: 'multiplication_division',
      difficulty: 'hard',
      question: 'در جدول ضرب عدد ۹، مجموع ارقام حاصل‌ضرب‌ها (مثلاً ۱۸، ۲۷، ۳۶، ...) همیشه برابر با چه عددی است؟',
      options: ['۸', '۹', '۱۰', '۱۲'],
      correctAnswerIndex: 1,
      explanation: 'ویژگی شگفت‌انگیز جدول ضرب ۹: مجموع ارقام همیشه ۹ است (۱+۸=۹، ۲+۷=۹، ۳+۶=۹، ۴+۵=۹ و...).',
      hint: 'ارقام حاصل ۱۸ (۱+۸) یا ۲۷ (۲+۷) را با هم جمع کن.'
    },
    {
      id: 'md_h2',
      chapterId: 'multiplication_division',
      difficulty: 'hard',
      question: 'حاصل ضرب ۶ × ۷ را می‌توان به صورت (۶ × ۵) + (۶ × ۲) خرد کرد و نوشت. حاصل جمع این دو بخش کدام است؟',
      options: ['۳۶', '۴۰', '۴۲', '۴۴'],
      correctAnswerIndex: 2,
      explanation: '۶ × ۵ = ۳۰ و ۶ × ۲ = ۱۲. مجموع: ۳۰ + ۱۲ = ۴۲.',
      hint: 'خاصیت پخشی ضرب: ۳۰ را با ۱۲ جمع کن.'
    },
    {
      id: 'md_h3',
      chapterId: 'multiplication_division',
      difficulty: 'hard',
      question: 'علی ۳ بسته خودکار ۴ تایی و ۲ بسته خودکار ۵ تایی دارد. او در مجموع چند خودکار دارد؟',
      options: ['۱۹', '۲۰', '۲۲', '۲۴'],
      correctAnswerIndex: 2,
      explanation: 'بسته‌های اول: ۳ × ۴ = ۱۲ خودکار. بسته‌های دوم: ۲ × ۵ = ۱۰ خودکار. مجموع: ۱۲ + ۱۰ = ۲۲ خودکار.',
      hint: 'اول هر دسته را جداگانه ضرب کن و سپس دو حاصل ضرب را جمع کن.'
    },
    {
      id: 'md_h4',
      chapterId: 'multiplication_division',
      difficulty: 'hard',
      question: 'در عبارت روبه‌رو عدد داخل مربع کدام است؟  □ × ۸ = ۷۲',
      options: ['۷', '۸', '۹', '۱۰'],
      correctAnswerIndex: 2,
      explanation: '۷۲ ÷ ۸ = ۹، زیرا ۹ × ۸ = ۷۲.',
      hint: 'جدول ضرب ۸ را مرور کن: ۸ ضرب در چه عددی برابر ۷۲ می‌شود؟'
    },
    {
      id: 'md_h5',
      chapterId: 'multiplication_division',
      difficulty: 'hard',
      question: 'کدام عبارت زیر مقدار بزرگ‌تری دارد؟',
      options: ['۵ دسته ۶ تایی', '۴ دسته ۸ تایی', '۶ دسته ۵ تایی', '۷ دسته ۴ تایی'],
      correctAnswerIndex: 1,
      explanation: '۵×۶=۳۰، ۴×۸=۳۲، ۶×۵=۳۰، ۷×۴=۲۸. بزرگ‌ترین مقدار ۳۲ متعلق به ۴ دسته ۸ تایی است.',
      hint: 'حاصل ضرب هر گزینه را حساب کن: ۳۰، ۳۲، ۳۰، ۲۸.'
    }
  ],

  perimeter_area: [
    // --- آسان (Easy) ---
    {
      id: 'pa_e1',
      chapterId: 'perimeter_area',
      difficulty: 'easy',
      question: 'محیط یعنی اندازه ............. یک شکل و مساحت یعنی اندازه ............. آن شکل.',
      options: ['سطح داخل - دور تا دور', 'دور تا دور - سطح داخل', 'خط تقارن - گوشه‌ها', 'قطرها - اضلاع'],
      correctAnswerIndex: 1,
      explanation: 'محیط اندازه خط دور تا دور شکل است و مساحت اندازه سطح و فضای داخل شکل است.',
      hint: 'محیط مثل دیوارکشی دور باغچه است، مساحت مثل چمن‌کاری داخل باغچه!'
    },
    {
      id: 'pa_e2',
      chapterId: 'perimeter_area',
      difficulty: 'easy',
      question: 'محیط یک مثلث متساوی‌الاضلاع به ضلع ۶ سانتی‌متر چند سانتی‌متر است؟',
      options: ['۱۲', '۱۶', '۱۸', '۲۴'],
      correctAnswerIndex: 2,
      explanation: 'مثلث متساوی‌الاضلاع ۳ ضلع مساوی دارد: ۳ × ۶ = ۱۸ سانتی‌متر.',
      hint: '۳ ضلع مساوی ۶ سانتی‌متری را با هم جمع کن.'
    },
    {
      id: 'pa_e3',
      chapterId: 'perimeter_area',
      difficulty: 'easy',
      question: 'محیط مربعی به ضلع ۵ سانتی‌متر چند سانتی‌متر است؟',
      options: ['۱۰ سانتی‌متر', '۱۵ سانتی‌متر', '۲۰ سانتی‌متر', '۲۵ سانتی‌متر'],
      correctAnswerIndex: 2,
      explanation: 'محیط مربع = یک ضلع × ۴ = ۵ × ۴ = ۲۰ سانتی‌متر.',
      hint: 'مربع ۴ ضلع مساوی دارد؛ ۵ را در ۴ ضرب کن.'
    },
    {
      id: 'pa_e4',
      chapterId: 'perimeter_area',
      difficulty: 'easy',
      question: 'مستطیلی در صفحه شطرنجی از ۳ ردیف ۴ تایی مربع واحد تشکیل شده است. مساحت آن چند مربع است؟',
      options: ['۷ مربع', '۱۰ مربع', '۱۲ مربع', '۱۴ مربع'],
      correctAnswerIndex: 2,
      explanation: 'مساحت یعنی تعداد کل مربع‌های داخل شکل: ۳ × ۴ = ۱۲ مربع واحد.',
      hint: '۳ ردیف ۴ تایی را در هم ضرب کن.'
    },
    {
      id: 'pa_e5',
      chapterId: 'perimeter_area',
      difficulty: 'easy',
      question: 'محیط مستطیلی با طول ۷ سانتی‌متر و عرض ۳ سانتی‌متر با جمع کردن اضلاع کدام است؟',
      options: ['۱۰ سانتی‌متر', '۱۴ سانتی‌متر', '۲۰ سانتی‌متر', '۲۱ سانتی‌متر'],
      correctAnswerIndex: 2,
      explanation: 'دور تا دور مستطیل: ۷ + ۳ + ۷ + ۳ = ۲۰ سانتی‌متر.',
      hint: 'دو تا طول و دو تا عرض را با هم جمع کن.'
    },

    // --- متوسط (Medium) ---
    {
      id: 'pa_m1',
      chapterId: 'perimeter_area',
      difficulty: 'medium',
      question: 'فرمول استاندارد محاسبه محیط مستطیل کدام است؟',
      options: ['طول × عرض', '(طول + عرض) × ۲', 'یک ضلع × خودش', 'یک ضلع × ۴'],
      correctAnswerIndex: 1,
      explanation: 'محیط مستطیل = (طول + عرض) × ۲.',
      hint: 'طول و عرض را جمع کن و جواب را دو برابر کن.'
    },
    {
      id: 'pa_m2',
      chapterId: 'perimeter_area',
      difficulty: 'medium',
      question: 'مساحت مستطیلی به طول ۸ متر و عرض ۴ متر چند متر مربع است؟',
      options: ['۲۴ متر مربع', '۲۸ متر مربع', '۳۲ متر مربع', '۶۴ متر مربع'],
      correctAnswerIndex: 2,
      explanation: 'مساحت مستطیل = طول × عرض = ۸ × ۴ = ۳۲ متر مربع.',
      hint: 'طول را در عرض ضرب کن.'
    },
    {
      id: 'pa_m3',
      chapterId: 'perimeter_area',
      difficulty: 'medium',
      question: 'مساحت مربعی به ضلع ۶ سانتی‌متر چند سانتی‌متر مربع است؟',
      options: ['۲۴ سانتی‌متر مربع', '۳۰ سانتی‌متر مربع', '۳۶ سانتی‌متر مربع', '۱۲ سانتی‌متر مربع'],
      correctAnswerIndex: 2,
      explanation: 'مساحت مربع = یک ضلع × خودش = ۶ × ۶ = ۳۶ سانتی‌متر مربع.',
      hint: 'اندازه یک ضلع (۶) را در خودش ضرب کن.'
    },
    {
      id: 'pa_m4',
      chapterId: 'perimeter_area',
      difficulty: 'medium',
      question: 'باغچه‌ای به شکل مربع با ضلع ۹ متر داریم. برای حصارکشی با سیم‌خاردار به دور این باغچه، به چند متر سیم نیاز داریم؟',
      options: ['۱۸ متر', '۲۷ متر', '۳۶ متر', '۸۱ متر'],
      correctAnswerIndex: 2,
      explanation: 'حصارکشی دور باغچه یعنی محاسبه محیط: ۴ × ۹ = ۳۶ متر.',
      hint: 'چون دور باغچه حصار کشیده می‌شود، باید محیط مربع (ضلع × ۴) را حساب کنی.'
    },
    {
      id: 'pa_m5',
      chapterId: 'perimeter_area',
      difficulty: 'medium',
      question: 'اگر محیط یک مربع ۲۸ سانتی‌متر باشد، طول هر ضلع آن چند سانتی‌متر است؟',
      options: ['۶ سانتی‌متر', '۷ سانتی‌متر', '۸ سانتی‌متر', '۱۴ سانتی‌متر'],
      correctAnswerIndex: 1,
      explanation: 'چون مربع ۴ ضلع مساوی دارد: ۲۸ ÷ ۴ = ۷ سانتی‌متر.',
      hint: 'محیط را بر تعداد اضلاع مربع (۴) تقسیم کن.'
    },

    // --- سخت (Hard) ---
    {
      id: 'pa_h1',
      chapterId: 'perimeter_area',
      difficulty: 'hard',
      question: 'یک شکل پلکانی در صفحه شطرنجی از یک مستطیل ۴×۲ و یک مربع ۲×۲ متصل به آن تشکیل شده است. مساحت کل شکل چند مربع واحد است؟',
      options: ['۱۰', '۱۲', '۱۴', '۱۶'],
      correctAnswerIndex: 1,
      explanation: 'مساحت مستطیل: ۴ × ۲ = ۸. مساحت مربع: ۲ × ۲ = ۴. مساحت کل: ۸ + ۴ = ۱۲ مربع واحد.',
      hint: 'مساحت هر بخش را جداگانه حساب کن و با هم جمع کن.'
    },
    {
      id: 'pa_h2',
      chapterId: 'perimeter_area',
      difficulty: 'hard',
      question: 'دو مستطیل محیط مساوی ۲۰ سانتی‌متر دارند. اولی با اضلاع ۹ و ۱ سانتی‌متر و دومی با اضلاع ۶ و ۴ سانتی‌متر. مساحت کدام بیشتر است؟',
      options: ['مستطیل اولی (۹ و ۱)', 'مستطیل دومی (۶ و ۴)', 'مساحت هر دو برابر است', 'محیط مساوی یعنی مساحت مساوی'],
      correctAnswerIndex: 1,
      explanation: 'مساحت اولی: ۹ × ۱ = ۹ سانتی‌متر مربع. مساحت دومی: ۶ × ۴ = ۲۴ سانتی‌متر مربع. هر چه شکل به مربع نزدیک‌تر باشد مساحت بیشتری دارد.',
      hint: 'مساحت هر دو را حساب کن (۹×۱ و ۶×۴) و با هم مقایسه کن.'
    },
    {
      id: 'pa_h3',
      chapterId: 'perimeter_area',
      difficulty: 'hard',
      question: 'محیط مستطیلی ۲۴ سانتی‌متر و طول آن ۸ سانتی‌متر است. عرض این مستطیل چند سانتی‌متر است؟',
      options: ['۳ سانتی‌متر', '۴ سانتی‌متر', '۵ سانتی‌متر', '۶ سانتی‌متر'],
      correctAnswerIndex: 1,
      explanation: 'نصف محیط (طول + عرض) = ۲۴ ÷ ۲ = ۱۲. عرض = ۱۲ - ۸ = ۴ سانتی‌متر.',
      hint: 'ابتدا محیط را نصف کن تا حاصل جمع یک طول و یک عرض به دست آید (۱۲)، سپس ۸ را از آن کم کن.'
    },
    {
      id: 'pa_h4',
      chapterId: 'perimeter_area',
      difficulty: 'hard',
      question: 'کف اتاقی به طول ۵ متر و عرض ۳ متر را می‌خواهیم موکت کنیم. اگر قیمت هر متر مربع موکت ۴۰،۰۰۰ تومان باشد، کل هزینه چقدر می‌شود؟',
      options: ['۱۵۰،۰۰۰ تومان', '۳۰۰،۰۰۰ تومان', '۶۰۰،۰۰۰ تومان', '۸۰۰،۰۰۰ تومان'],
      correctAnswerIndex: 2,
      explanation: 'مساحت کف اتاق = ۵ × ۳ = ۱۵ متر مربع. کل هزینه = ۱۵ × ۴۰،۰۰۰ = ۶۰۰،۰۰۰ تومان.',
      hint: 'اول مساحت کف اتاق (طول × عرض) را پیدا کن، بعد آن را در قیمت هر متر مربع ضرب کن.'
    },
    {
      id: 'pa_h5',
      chapterId: 'perimeter_area',
      difficulty: 'hard',
      question: 'از وسط یک مقوای مربعی به ضلع ۶ سانتی‌متر، یک مربع کوچک به ضلع ۲ سانتی‌متر بریده‌ایم. مساحت مقوای باقی‌مانده چند سانتی‌متر مربع است؟',
      options: ['۲۸ سانتی‌متر مربع', '۳۰ سانتی‌متر مربع', '۳۲ سانتی‌متر مربع', '۳۴ سانتی‌متر مربع'],
      correctAnswerIndex: 2,
      explanation: 'مساحت مربع بزرگ = ۶ × ۶ = ۳۶. مساحت مربع بریده شده = ۲ × ۲ = ۴. مساحت باقیمانده: ۳۶ - ۴ = ۳۲ سانتی‌متر مربع.',
      hint: 'مساحت مربع کوچک را از مساحت مربع بزرگ کم کن.'
    }
  ],

  regrouping: [
    // --- آسان (Easy) ---
    {
      id: 'rg_e1',
      chapterId: 'regrouping',
      difficulty: 'easy',
      question: 'حاصل جمع ۳۲۱۴ + ۲۴۵۳ بدون انتقال کدام است؟',
      options: ['۵۶۶۷', '۵۶۵۷', '۵۷۶۷', '۵۶۶۶'],
      correctAnswerIndex: 0,
      explanation: 'یکان: ۴+۳=۷، دهگان: ۱+۵=۶، صدگان: ۲+۴=۶، هزارگان: ۳+۲=۵ ➔ ۵۶۶۷.',
      hint: 'رقم‌های هم‌ارزش را از یکان به هزارگان با هم جمع کن.'
    },
    {
      id: 'rg_e2',
      chapterId: 'regrouping',
      difficulty: 'easy',
      question: 'حاصل تفریق ۷۸۹۵ - ۲۴۳۱ بدون قرض گرفتن کدام است؟',
      options: ['۵۴۵۴', '۵۴۶۴', '۵۳۶۴', '۵۴۷۴'],
      correctAnswerIndex: 1,
      explanation: 'یکان: ۵-۱=۴، دهگان: ۹-۳=۶، صدگان: ۸-۴=۴، هزارگان: ۷-۲=۵ ➔ ۵۴۶۴.',
      hint: 'از هر مرتبه رقم پایینی را کم کن.'
    },
    {
      id: 'rg_e3',
      chapterId: 'regrouping',
      difficulty: 'easy',
      question: 'حاصل جمع ۲۱۴۸ + ۱۳۲۵ با یک انتقال در یکان کدام است؟',
      options: ['۳۴۶۳', '۳۴۷۳', '۳۳۷۳', '۳۴۸۳'],
      correctAnswerIndex: 1,
      explanation: 'یکان: ۸ + ۵ = ۱۳ (۳ می‌ماند و ۱ بسته ده تایی به دهگان می‌رود). دهگان: ۴ + ۲ + ۱ = ۷. صدگان: ۱ + ۳ = ۴. هزارگان: ۲ + ۱ = ۳ ➔ ۳۴۷۳.',
      hint: 'در جمع یکان ۸ + ۵ می‌شود ۱۳؛ ۱ ده‌تایی به ستون دهگان اضافه می‌شود.'
    },
    {
      id: 'rg_e4',
      chapterId: 'regrouping',
      difficulty: 'easy',
      question: 'حاصل جمع ذهنی ۵۰۰۰ + ۲۴۰۰ کدام است؟',
      options: ['۷۲۰۰', '۷۴۰۰', '۷۵۰۰', '۸۴۰۰'],
      correctAnswerIndex: 1,
      explanation: '۵ هزارتایی + ۲ هزارتایی = ۷ هزارتایی (۷۰۰۰) به اضافه ۴۰۰ = ۷۴۰۰.',
      hint: '۵۰۰۰ را با ۲۰۰۰ جمع کن (۷۰۰۰)، بعد ۴۰۰ را به آن اضافه کن.'
    },
    {
      id: 'rg_e5',
      chapterId: 'regrouping',
      difficulty: 'easy',
      question: 'حاصل تفریق ذهنی ۶۸۰۰ - ۳۰۰۰ کدام است؟',
      options: ['۲۸۰۰', '۳۸۰۰', '۴۸۰۰', '۳۵۰۰'],
      correctAnswerIndex: 1,
      explanation: '۶۸۰۰ منهای ۳۰۰۰ می‌شود ۳۸۰۰ (فقط از هزارگان ۶ منهای ۳ = ۳ می‌شود).',
      hint: 'از ۶ هزارتایی ۳ هزارتایی کم کن، ۸۰۰ دست‌نخورده می‌ماند.'
    },

    // --- متوسط (Medium) ---
    {
      id: 'rg_m1',
      chapterId: 'regrouping',
      difficulty: 'medium',
      question: 'حاصل جمع تکنیکی ۳۶۷۵ + ۲۴۸۲ با دو انتقال کدام است؟',
      options: ['۶۰۵۷', '۶۱۴۷', '۶۱۵۷', '۶۲۵۷'],
      correctAnswerIndex: 2,
      explanation: 'یکان: ۵+۲=۷. دهگان: ۷+۸=۱۵ (۵ می‌ماند، ۱ به صدگان). صدگان: ۶+۴+۱=۱۱ (۱ می‌ماند، ۱ به هزارگان). هزارگان: ۳+۲+۱=۶ ➔ ۶۱۵۷.',
      hint: 'انتقال‌های دهگان و صدگان را بالای ستون بعدی یادداشت کن.'
    },
    {
      id: 'rg_m2',
      chapterId: 'regrouping',
      difficulty: 'medium',
      question: 'حاصل تفریق تکنیکی ۴۵۲۰ - ۱۲۶۰ با یک قرض گرفتن کدام است؟',
      options: ['۳۲۴۰', '۳۲۵۰', '۳۲۶۰', '۳۳۶۰'],
      correctAnswerIndex: 2,
      explanation: 'یکان: ۰-۰=۰. در دهگان از ۲ نمی‌توان ۶ را کم کرد، از صدگان ۱ قرض می‌گیریم: ۱۲ - ۶ = ۶. صدگان ۴ - ۲ = ۲. هزارگان ۴ - ۱ = ۳ ➔ ۳۲۶۰.',
      hint: 'از صدگان (۵) یک بسته صدتایی بردار تا دهگان بشود ۱۲.'
    },
    {
      id: 'rg_m3',
      chapterId: 'regrouping',
      difficulty: 'medium',
      question: 'در روش فرآیندی جمع ۲۳۵۰ + ۱۴۲۰، در مرحله اول جمع هزارتایی‌ها چه عددی به دست می‌آید؟',
      options: ['۳۰۰۰', '۳۷۰۰', '۳۷۵۰', '۳۷۷۰'],
      correctAnswerIndex: 1,
      explanation: 'در روش فرآیندی ابتدا هزارتایی عدد دوم (۱۰۰۰) را به عدد اول اضافه می‌کنیم: ۲۳۵۰ + ۱۰۰۰ = ۳۳۵۰، سپس ۴۰۰ را اضافه می‌کنیم: ۳۷۵۰، سپس ۲۰: ۳۷۷۰.',
      hint: 'در روش فرآیندی از سمت چپ شروع می‌کنیم: ابتدا هزارتایی‌ها با هم جمع می‌شوند.'
    },
    {
      id: 'rg_m4',
      chapterId: 'regrouping',
      difficulty: 'medium',
      question: 'حاصل تقریبی جمع ۳۸۲۰ + ۲۱۹۰ با تقریب رقم صدگان کدام است؟',
      options: ['۵۹۰۰', '۶۰۰۰', '۶۱۰۰', '۶۲۰۰'],
      correctAnswerIndex: 1,
      explanation: '۳۸۲۰ با تقریب صدگان ۳۸۰۰ و ۲۱۹۰ با تقریب صدگان ۲۲۰۰ است: ۳۸۰۰ + ۲۲۰۰ = ۶۰۰۰.',
      hint: 'ابتدا هر دو عدد را به نزدیک‌ترین صدتایی گرد کن، سپس جمع بزن.'
    },
    {
      id: 'rg_m5',
      chapterId: 'regrouping',
      difficulty: 'medium',
      question: 'رضا ۳،۴۰۰ تومان شیر و ۲،۸۰۰ تومان نان خرید. او در مجموع چند تومان باید به صندوق‌دار بپردازد؟',
      options: ['۵،۲۰۰ تومان', '۶،۰۰۰ تومان', '۶،۲۰۰ تومان', '۶،۴۰۰ تومان'],
      correctAnswerIndex: 2,
      explanation: '۳۴۰۰ + ۲۸۰۰ = ۶۲۰۰ تومان.',
      hint: '۳۴۰۰ را با ۲۰۰۰ جمع کن (۵۴۰۰)، بعد ۸۰۰ به آن اضافه کن.'
    },

    // --- سخت (Hard) ---
    {
      id: 'rg_h1',
      chapterId: 'regrouping',
      difficulty: 'hard',
      question: 'حاصل تفریق تکنیکی ۵۰۰۰ - ۲۳۶۵ با قرض گرفتن از صفرها کدام است؟',
      options: ['۲۶۳۵', '۲۶۴۵', '۲۷۳۵', '۳۶۳۵'],
      correctAnswerIndex: 0,
      explanation: 'از ۵ هزارتایی ۱ بسته می‌گیریم (می‌شود ۴). صدگان و دهگان ۹ می‌شوند و یکان ۱۰ می‌شود: یکان ۱۰-۵=۵، دهگان ۹-۶=۳، صدگان ۹-۳=۶، هزارگان ۴-۲=۲ ➔ ۲۶۳۵.',
      hint: 'وقتی صفرها قرض می‌گیرند، صفر یکان ۱۰ می‌شود و صفرهای بین راه ۹ می‌شوند.'
    },
    {
      id: 'rg_h2',
      chapterId: 'regrouping',
      difficulty: 'hard',
      question: 'در جمع روبه‌رو رقم گم‌شده داخل مربع کدام است؟  ۲□۴۵ + ۱۳۲۸ = ۳۸۷۳',
      options: ['۳', '۴', '۵', '۶'],
      correctAnswerIndex: 2,
      explanation: 'یکان: ۵+۸=۱۳ (۱ انتقال به دهگان). دهگان: ۴+۲+۱=۷. صدگان: □ + ۳ = ۸ پس □ = ۵ است.',
      hint: 'ستون صدگان را بررسی کن: چه عددی با ۳ جمع شود حاصل ۸ می‌شود؟'
    },
    {
      id: 'rg_h3',
      chapterId: 'regrouping',
      difficulty: 'hard',
      question: 'حاصل تفریق ۷۱۴۲ - ۳۵۶۸ کدام است؟',
      options: ['۳۴۷۴', '۳۵۷۴', '۳۵۸۴', '۳۶۷۴'],
      correctAnswerIndex: 1,
      explanation: 'یکان: ۱۲ - ۸ = ۴. دهگان: ۱۳ - ۶ = ۷. صدگان: ۱۰ - ۵ = ۵. هزارگان: ۶ - ۳ = ۳ ➔ ۳۵۷۴.',
      hint: 'مراحل قرض گرفتن در یکان، دهگان و صدگان را با دقت مرحله به مرحله انجام بده.'
    },
    {
      id: 'rg_h4',
      chapterId: 'regrouping',
      difficulty: 'hard',
      question: 'در یک کتابخانه ۴،۲۵۰ جلد کتاب بود. ۱،۲۰۰ جلد به امانت برده شد و سپس ۶۵۰ جلد کتاب جدید خریداری شد. اکنون چند جلد کتاب در کتابخانه موجود است؟',
      options: ['۳،۶۰۰', '۳،۷۰۰', '۳،۸۰۰', '۳،۹۰۰'],
      correctAnswerIndex: 1,
      explanation: 'کتاب‌های بعد از امانت: ۴۲۵۰ - ۱۲۰۰ = ۳۰۵۰. کتاب‌های جدید: ۳۰۵۰ + ۶۵۰ = ۳۷۰۰ جلد.',
      hint: 'ابتدا کتاب‌های امانت داده شده را کم کن، سپس کتاب‌های جدید را اضافه کن.'
    },
    {
      id: 'rg_h5',
      chapterId: 'regrouping',
      difficulty: 'hard',
      question: 'در تساوی روبه‌رو مقدار داخل مربع کدام است؟  □ - ۲۴۵۰ = ۳۶۵۰',
      options: ['۵۱۰۰', '۶۰۰۰', '۶۱۰۰', '۶۲۰۰'],
      correctAnswerIndex: 2,
      explanation: 'برای پیدا کردن عدد اول در تفریق، حاصل تفریق را با عدد دوم جمع می‌کنیم: ۳۶۵۰ + ۲۴۵۰ = ۶۱۰۰.',
      hint: 'عملیات برعکس تفریق، جمع است: ۳۶۵۰ را با ۲۴۵۰ جمع کن.'
    }
  ],

  statistics: [
    // --- آسان (Easy) ---
    {
      id: 'st_e1',
      chapterId: 'statistics',
      difficulty: 'easy',
      question: 'علامت چوب‌خط "卌 卌 ||||" نشان‌دهنده چه عددی است؟',
      options: ['۱۲', '۱۳', '۱۴', '۱۵'],
      correctAnswerIndex: 2,
      explanation: 'دو بسته ۵ تایی (۱۰) به اضافه ۴ خط تکی = ۱۴.',
      hint: 'هر بسته چوب‌خط خط‌خورده برابر ۵ است: ۵ + ۵ + ۴.'
    },
    {
      id: 'st_e2',
      chapterId: 'statistics',
      difficulty: 'easy',
      question: 'اتفاق «فردا بعد از روز شنبه، روز یکشنبه خواهد بود» چگونه است؟',
      options: ['حتماً اتفاق می‌افتد', 'ممکن است اتفاق بیفتد', 'غیرممکن است', 'به احتمال کم'],
      correctAnswerIndex: 0,
      explanation: 'چون ترتیب روزهای هفته ثابت است، بعد از شنبه همیشه و ۱۰۰٪ یکشنبه می‌آید (حتماً اتفاق می‌افتد).',
      hint: 'آیا ممکن است بعد از شنبه روز دیگری بیاید؟ خیر، پس حتمی است.'
    },
    {
      id: 'st_e3',
      chapterId: 'statistics',
      difficulty: 'easy',
      question: 'در یک نمودار ستونی، اگر ستون مربوط به کتاب داستان روی عدد ۱۲ باشد، یعنی چند دانش‌آموز کتاب داستان را انتخاب کرده‌اند؟',
      options: ['۶ نفر', '۱۰ نفر', '۱۲ نفر', '۲۴ نفر'],
      correctAnswerIndex: 2,
      explanation: 'ارتفاع ستون در نمودار ستونی دقیقاً تعداد داده‌ها را نشان می‌دهد، پس ۱۲ نفر است.',
      hint: 'ارتفاع ستون را تا محور عمودی دنبال کن.'
    },
    {
      id: 'st_e4',
      chapterId: 'statistics',
      difficulty: 'easy',
      question: 'در کیسه‌ای که فقط ۵ مهره زرد وجود دارد، احتمال بیرون کشیدن مهره آبی با چشمان بسته چگونه است؟',
      options: ['حتماً', 'احتمال مساوی', 'غیرممکن است', 'احتمال زیاد'],
      correctAnswerIndex: 2,
      explanation: 'چون اصلاً هیچ مهره آبی در کیسه وجود ندارد، بیرون کشیدن آن کاملاً غیرممکن است.',
      hint: 'وقتی چیزی در کیسه نباشد، بیرون آمدنش چه احتمالی دارد؟'
    },
    {
      id: 'st_e5',
      chapterId: 'statistics',
      difficulty: 'easy',
      question: 'برای نمایش عدد ۱۷ با چوب‌خط، به چند بسته ۵ تایی و چند خط تکی نیاز داریم؟',
      options: ['۲ بسته ۵ تایی و ۷ خط', '۳ بسته ۵ تایی و ۲ خط', '۳ بسته ۵ تایی و ۱ خط', '۴ بسته ۵ تایی'],
      correctAnswerIndex: 1,
      explanation: '۱۷ = ۳ × ۵ + ۲ ➔ سه بسته ۵ تایی (۱۵) به اضافه ۲ خط تکی.',
      hint: '۵ تا ۵ تا بشمار: ۵، ۱۰، ۱۵... چند تا تا ۱۷ باقی می‌ماند؟'
    },

    // --- متوسط (Medium) ---
    {
      id: 'st_m1',
      chapterId: 'statistics',
      difficulty: 'medium',
      question: 'یک چرخنده شانس به ۸ قسمت مساوی تقسیم شده است: ۴ قسمت آبی، ۳ قسمت قرمز و ۱ قسمت زرد. عقربه روی کدام رنگ شانس بیشتری برای توقف دارد؟',
      options: ['آبی', 'قرمز', 'زرد', 'همه شانس مساوی دارند'],
      correctAnswerIndex: 0,
      explanation: 'رنگ آبی ۴ قسمت از ۸ قسمت را دارد (بیشترین تعداد قسمت‌ها)، بنابراین بیشترین شانس متعلق به آبی است.',
      hint: 'کدام رنگ مساحت و تعداد قسمت‌های بیشتری روی چرخنده دارد؟'
    },
    {
      id: 'st_m2',
      chapterId: 'statistics',
      difficulty: 'medium',
      question: 'در نمودار ستونی میوه‌ها، ستون سیب روی ۸ کیلوگرم و ستون پرتقال روی ۵ کیلوگرم است. مقدار سیب چند کیلوگرم بیشتر از پرتقال است؟',
      options: ['۲ کیلوگرم', '۳ کیلوگرم', '۴ کیلوگرم', '۱۳ کیلوگرم'],
      correctAnswerIndex: 1,
      explanation: 'اختلاف دو ستون: ۸ - ۵ = ۳ کیلوگرم.',
      hint: 'ارتفاع ستون سیب را از ستون پرتقال کم کن.'
    },
    {
      id: 'st_m3',
      chapterId: 'statistics',
      difficulty: 'medium',
      question: 'در یک نظرسنجی، نصف یک نمودار دایره‌ای به رنگ سبز (ورزش فوتبال) اختصاص دارد. چه کسری از افراد فوتبال را انتخاب کرده‌اند؟',
      options: ['۱/۴', '۱/۳', '۱/۲', '۲/۳'],
      correctAnswerIndex: 2,
      explanation: 'نصف دایره نشان‌دهنده کسر یک‌دوم (۱/۲) است.',
      hint: 'نصف یک شکل با چه کسری نمایش داده می‌شود؟'
    },
    {
      id: 'st_m4',
      chapterId: 'statistics',
      difficulty: 'medium',
      question: 'هنگام انداختن یک تاس ۶ وجهی معمولی، احتمال آمدن عدد ۷ چگونه است؟',
      options: ['حتماً', 'غیرممکن', 'احتمال کم', 'احتمال زیاد'],
      correctAnswerIndex: 1,
      explanation: 'وجوه تاس اعداد ۱ تا ۶ هستند و عدد ۷ روی تاس وجود ندارد، بنابراین آمدن ۷ غیرممکن است.',
      hint: 'روی تاس چه اعدادی نوشته شده است؟ ۱ تا ۶!'
    },
    {
      id: 'st_m5',
      chapterId: 'statistics',
      difficulty: 'medium',
      question: 'در یک جدول داده‌ها، ۱۰ دانش‌آموز فوتبال، ۸ نفر والیبال و ۱۲ نفر شنا را دوست دارند. تعداد کل دانش‌آموزان این نظرسنجی چند نفر است؟',
      options: ['۲۸ نفر', '۳۰ نفر', '۳۲ نفر', '۲۵ نفر'],
      correctAnswerIndex: 1,
      explanation: 'تعداد کل = ۱۰ + ۸ + ۱۲ = ۳۰ نفر.',
      hint: 'همه اعداد داخل جدول را با هم جمع کن.'
    },

    // --- سخت (Hard) ---
    {
      id: 'st_h1',
      chapterId: 'statistics',
      difficulty: 'hard',
      question: 'در یک کیسه ۴ مهره قرمز و ۶ مهره سبز وجود دارد. چه کسری از مهره‌های کیسه قرمز است؟',
      options: ['۴/۶', '۴/۱۰', '۶/۱۰', '۲/۵'],
      correctAnswerIndex: 1,
      explanation: 'کل مهره‌ها = ۴ + ۶ = ۱۰ مهره. مهره‌های قرمز ۴ تا از ۱۰ تا هستند: ۴/۱۰.',
      hint: 'تعداد کل مهره‌ها (۴+۶) مخرج کسر و تعداد مهره‌های قرمز صورت کسر است.'
    },
    {
      id: 'st_h2',
      chapterId: 'statistics',
      difficulty: 'hard',
      question: 'برای این‌که یک بازی چرخنده دو نفره کاملاً «عادلانه» باشد، صفحه چرخنده بین دو رنگ باید چگونه تقسیم شود؟',
      options: ['رنگ اول ۳ برابر رنگ دوم باشد', 'به دو قسمت کاملاً مساوی تقسیم شود', 'رنگ اول یک‌چهارم و رنگ دوم سه‌چهارم باشد', 'تعداد تقسیم‌ها فرد باشد'],
      correctAnswerIndex: 1,
      explanation: 'بازی زمانی عادلانه است که شانس هر دو نفر برابر باشد، بنابراین صفحه باید به قسمت‌های کاملاً مساوی تقسیم شود.',
      hint: 'عادلانه یعنی شانس هر دو نفر برابر باشد.'
    },
    {
      id: 'st_h3',
      chapterId: 'statistics',
      difficulty: 'hard',
      question: 'در یک نمودار ستونی با ۴ ستون، مجموع کل افراد ۴۰ نفر است. اگر ۳ ستون اول به ترتیب ۸، ۱۲ و ۱۰ نفر باشند، ستون چهارم چند نفر است؟',
      options: ['۸ نفر', '۱۰ نفر', '۱۲ نفر', '۱۴ نفر'],
      correctAnswerIndex: 1,
      explanation: 'مجموع سه ستون اول: ۸ + ۱۲ + ۱۰ = ۳۰ نفر. ستون چهارم: ۴۰ - ۳۰ = ۱۰ نفر.',
      hint: 'مجموع سه ستون را حساب کن و از کل (۴۰) کم کن.'
    },
    {
      id: 'st_h4',
      chapterId: 'statistics',
      difficulty: 'hard',
      question: 'نمودار «خط شکسته» در کتاب ریاضی سوم بیشتر برای نمایش کدام موضوع به کار می‌رود؟',
      options: ['شمارش کتاب‌های کتابخانه', 'تغییرات دمای هوا در طول روزها و ساعات', 'مقایسه قد دانش‌آموزان', 'تعداد میوه‌های سبد'],
      correctAnswerIndex: 1,
      explanation: 'نمودار خط شکسته بهترین نمودار برای نشان دادن تغییرات یک پدیده در گذر زمان است (مانند بالا و پایین رفتن دما).',
      hint: 'نمودار خط شکسته تغییرات و روند را در طول زمان خوب نشان می‌دهد.'
    },
    {
      id: 'st_h5',
      chapterId: 'statistics',
      difficulty: 'hard',
      question: 'یک چرخنده به ۴ قسمت مساوی تقسیم شده: ۲ قسمت سبز، ۱ قسمت زرد و ۱ قسمت قرمز. اگر این چرخنده را ۱۰۰ بار بچرخانیم، انتظار داریم عقربه حدوداً چند بار روی رنگ سبز بایستد؟',
      options: ['حدود ۲۵ بار', 'حدود ۵۰ بار', 'حدود ۷۵ بار', 'دقیقاً ۱۰۰ بار'],
      correctAnswerIndex: 1,
      explanation: 'رنگ سبز ۲ قسمت از ۴ قسمت یعنی دقیقاً نصف چرخنده است. نصف ۱۰۰ بار برابر با حدود ۵۰ بار است.',
      hint: 'رنگ سبز نصف کل چرخنده است؛ نصف ۱۰۰ چقدر می‌شود؟'
    }
  ],

  advanced_multiplication: [
    // --- آسان (Easy) ---
    {
      id: 'am_e1',
      chapterId: 'advanced_multiplication',
      difficulty: 'easy',
      question: 'حاصل ضرب ۸ × ۱۰ کدام است؟',
      options: ['۱۸', '۸۰', '۸۰۰', '۸۸'],
      correctAnswerIndex: 1,
      explanation: 'در ضرب اعداد در ۱۰، یک صفر جلوی عدد قرار می‌گیرد: ۸ × ۱۰ = ۸۰.',
      hint: 'یک صفر جلوی عدد ۸ بگذار.'
    },
    {
      id: 'am_e2',
      chapterId: 'advanced_multiplication',
      difficulty: 'easy',
      question: 'حاصل ضرب ۴ × ۱۰۰ کدام است؟',
      options: ['۴۰', '۴۰۰', '۴۰۰۰', '۴۴۰'],
      correctAnswerIndex: 1,
      explanation: 'در ضرب اعداد در ۱۰۰، دو صفر جلوی عدد قرار می‌گیرد: ۴ × ۱۰۰ = ۴۰۰.',
      hint: 'دو صفر جلوی عدد ۴ بگذار.'
    },
    {
      id: 'am_e3',
      chapterId: 'advanced_multiplication',
      difficulty: 'easy',
      question: 'حاصل ضرب ۳ × ۳۰ کدام است؟',
      options: ['۶۰', '۹۰', '۳۳', '۳۰۰'],
      correctAnswerIndex: 1,
      explanation: 'ابتدا ۳ × ۳ = ۹، سپس صفر را جلوی آن قرار می‌دهیم: ۹۰.',
      hint: '۳ را در ۳ ضرب کن، سپس صفر را به آخرش اضافه کن.'
    },
    {
      id: 'am_e4',
      chapterId: 'advanced_multiplication',
      difficulty: 'easy',
      question: 'حاصل ضرب ۵ × ۱۰۰۰ کدام است؟',
      options: ['۵۰۰', '۵۰۰۰', '۵۰،۰۰۰', '۱۵۰۰'],
      correctAnswerIndex: 1,
      explanation: 'در ضرب در ۱۰۰۰، سه صفر جلوی عدد قرار می‌گیرد: ۵ × ۱۰۰۰ = ۵۰۰۰.',
      hint: 'سه صفر جلوی عدد ۵ قرار بده.'
    },
    {
      id: 'am_e5',
      chapterId: 'advanced_multiplication',
      difficulty: 'easy',
      question: 'حاصل ضرب ۱۳ × ۲ بدون انتقال کدام است؟',
      options: ['۲۳', '۲۶', '۳۶', '۱۵'],
      correctAnswerIndex: 1,
      explanation: '۲ × ۳ = ۶ و ۲ × ۱۰ = ۲۰ ➔ ۲۰ + ۶ = ۲۶.',
      hint: '۱۳ را دو برابر کن (۱۳ + ۱۳).'
    },

    // --- متوسط (Medium) ---
    {
      id: 'am_m1',
      chapterId: 'advanced_multiplication',
      difficulty: 'medium',
      question: 'حاصل ضرب ۲۵ × ۳ با روش گسترده‌نویسی و باز کردن عدد ۲۵ به (۲۰ + ۵) کدام است؟',
      options: ['۶۵', '۷۰', '۷۵', '۸۵'],
      correctAnswerIndex: 2,
      explanation: '۳ × ۲۰ = ۶۰ و ۳ × ۵ = ۱۵. مجموع: ۶۰ + ۱۵ = ۷۵.',
      hint: '۳ را ابتدا در ۲۰ و سپس در ۵ ضرب کن و حاصل‌ها را جمع کن.'
    },
    {
      id: 'am_m2',
      chapterId: 'advanced_multiplication',
      difficulty: 'medium',
      question: 'حاصل ضرب ۶ × ۳۰۰ کدام است؟',
      options: ['۱۸۰', '۱۸۰۰', '۱۸۰۰۰', '۳۶۰'],
      correctAnswerIndex: 1,
      explanation: '۶ × ۳ = ۱۸، با اضافه کردن دو صفر می‌شود ۱۸۰۰.',
      hint: '۶ را در ۳ ضرب کن (۱۸)، سپس دو صفر ۳۰۰ را جلوی آن بگذار.'
    },
    {
      id: 'am_m3',
      chapterId: 'advanced_multiplication',
      difficulty: 'medium',
      question: 'حاصل ضرب تکنیکی ۱۴ × ۵ با انتقال در دهگان کدام است؟',
      options: ['۶۰', '۶۵', '۷۰', '۷۵'],
      correctAnswerIndex: 2,
      explanation: '۵ × ۴ = ۲۰ (۰ می‌ماند، ۲ به دهگان). ۵ × ۱ = ۵ + ۲ = ۷ ➔ ۷۰.',
      hint: '۵ ضرب در ۴ می‌شود ۲۰، ۲ رقم نقلی را به حاصل ۵ ضرب در ۱ اضافه کن.'
    },
    {
      id: 'am_m4',
      chapterId: 'advanced_multiplication',
      difficulty: 'medium',
      question: 'حاصل تقریبی ضرب ۴۹ × ۴ با گرد کردن ۴۹ به نزدیک‌ترین ده‌تایی کدام است؟',
      options: ['۱۶۰', '۱۸۰', '۲۰۰', '۲۴۰'],
      correctAnswerIndex: 2,
      explanation: '۴۹ به ۵۰ گرد می‌شود: ۵۰ × ۴ = ۲۰۰.',
      hint: '۴۹ به ۵۰ نزدیک‌تر است یا ۴۰؟ ۵۰ را در ۴ ضرب کن.'
    },
    {
      id: 'am_m5',
      chapterId: 'advanced_multiplication',
      difficulty: 'medium',
      question: 'علی ۴ بسته مداد رنگی خرید که قیمت هر بسته ۲،۰۰۰ تومان بود. او چند تومان پرداخت کرد؟',
      options: ['۶،۰۰۰ تومان', '۸،۰۰۰ تومان', '۱۰،۰۰۰ تومان', '۸۰۰ تومان'],
      correctAnswerIndex: 1,
      explanation: '۴ × ۲۰۰۰ = ۸۰۰۰ تومان.',
      hint: '۴ را در ۲۰۰۰ ضرب کن (۴ × ۲ = ۸ با سه صفر).'
    },

    // --- سخت (Hard) ---
    {
      id: 'am_h1',
      chapterId: 'advanced_multiplication',
      difficulty: 'hard',
      question: 'حاصل ضرب ۳۸ × ۷ به روش تکنیکی کدام است؟',
      options: ['۲۵۶', '۲۶۶', '۲۷۶', '۲۸۶'],
      correctAnswerIndex: 1,
      explanation: '۷ × ۸ = ۵۶ (۶ می‌ماند، ۵ انتقال). ۷ × ۳ = ۲۱ + ۵ = ۲۶ ➔ ۲۶۶.',
      hint: '۷ ضرب در ۸ می‌شود ۵۶؛ ۵ را به حاصل ۷ ضرب در ۳ (۲۱) اضافه کن.'
    },
    {
      id: 'am_h2',
      chapterId: 'advanced_multiplication',
      difficulty: 'hard',
      question: 'با راهبرد حدس و آزمایش: حاصل‌ضرب دو عدد متوالی ۴۲ است. آن دو عدد کدامند؟',
      options: ['۵ و ۶', '۶ و ۷', '۷ و ۸', '۸ و ۹'],
      correctAnswerIndex: 1,
      explanation: 'دو عدد پشت سر هم ۶ و ۷ هستند که حاصل ضربشان: ۶ × ۷ = ۴۲ است.',
      hint: 'جدول ضرب را به یاد بیاور: کدام دو عدد پشت‌سرهم در هم ضرب شوند ۴۲ می‌شوند؟'
    },
    {
      id: 'am_h3',
      chapterId: 'advanced_multiplication',
      difficulty: 'hard',
      question: 'یک باغدار ۶ جعبه سیب چید. در هر جعبه ۲۰ سیب قرمز و ۱۰ سیب زرد چیده شده است. در کل چند عدد سیب در جعبه‌ها وجود دارد؟',
      options: ['۱۲۰ سیب', '۱۵۰ سیب', '۱۸۰ سیب', '۲۰۰ سیب'],
      correctAnswerIndex: 2,
      explanation: 'تعداد سیب‌های هر جعبه: ۲۰ + ۱۰ = ۳۰ سیب. تعداد کل: ۶ × ۳۰ = ۱۸۰ سیب.',
      hint: 'ابتدا سیب‌های یک جعبه را جمع کن (۳۰)، سپس در ۶ جعبه ضرب کن.'
    },
    {
      id: 'am_h4',
      chapterId: 'advanced_multiplication',
      difficulty: 'hard',
      question: 'برای محاسبه آسان حاصل ضرب ۲ × ۹ × ۵، بهتر است ابتدا کدام دو عدد را در هم ضرب کنیم؟',
      options: ['۲ × ۹ = ۱۸ بعد ضرب در ۵', '۲ × ۵ = ۱۰ بعد ضرب در ۹', '۹ × ۵ = ۴۵ بعد ضرب در ۲', 'فرقی نمی‌کند کدام ضرب شود'],
      correctAnswerIndex: 1,
      explanation: 'با خاصیت شرکت‌پذیری و جابه‌جایی: ابتدا ۲ × ۵ = ۱۰ می‌شود، و ضرب هر عدد در ۱۰ بسیار ساده و سریع است (۱۰ × ۹ = ۹۰).',
      hint: 'کدام دو عدد ضرب شوند حاصل رند (۱۰) به دست می‌آید؟'
    },
    {
      id: 'am_h5',
      chapterId: 'advanced_multiplication',
      difficulty: 'hard',
      question: 'کیان ۴ اسکناس ۵۰۰ تومانی و ۳ اسکناس ۱،۰۰۰ تومانی دارد. او می‌خواهد کتابی به قیمت ۵،۵۰۰ تومان بخرد. کدام جمله درست است؟',
      options: ['پولش دقیقاً اندازه است', 'پولش ۵۰۰ تومان اضافه می‌آید', 'پولش ۵۰۰ تومان کم است', 'او ۱،۰۰۰ تومان کم دارد'],
      correctAnswerIndex: 2,
      explanation: '۴ تا ۵۰۰ تومانی = ۲،۰۰۰ تومان. ۳ تا ۱،۰۰۰ تومانی = ۳،۰۰۰ تومان. کل پول کیان: ۲،۰۰۰ + ۳،۰۰۰ = ۵،۰۰۰ تومان. قیمت کتاب ۵،۵۰۰ تومان است، پس ۵۰۰ تومان کم دارد.',
      hint: 'ابتدا کل پول کیان را حساب کن (۲۰۰۰ + ۳۰۰۰ = ۵۰۰۰)، بعد با قیمت کتاب مقایسه کن.'
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

// --- Old badges removed ---
/* {
    id: 'badge_first_step',
    title: 'اولین قدم ریاضی',
    description: 'حل کردن اولین مسئله در سامانه استاد دانا',
    icon: '🌱',
    category: 'daily',
    requiredSolved: 1
  },
  {
    id: 'badge_star_collector_1',
    title: 'ستاره‌چین کوچک',
    description: 'جمع‌آوری ۵۰ ستاره در تمرینات',
    icon: '⭐',
    category: 'daily',
    requiredStars: 50
  },
  {
    id: 'badge_streak_3',
    title: 'عادت خوب مطالعه',
    description: '۳ روز متوالی تمرین ریاضی بدون وقفه',
    icon: '🔥',
    category: 'daily',
    requiredStreak: 3
  },
  {
    id: 'badge_scanner_novice',
    title: 'کارآگاه تکالیف',
    description: 'اسکن و تحلیل ۵ عکس از تمرینات کتاب',
    icon: '📸',
    category: 'daily',
    requiredScanned: 5
  },

  // --- Weekly / Intermediate Badges (Requires weeks of practice) ---
  {
    id: 'badge_solver_50',
    title: 'مسئله‌جوی ساعی',
    description: 'حل موفقیت‌آمیز ۵۰ مسئله ریاضی',
    icon: '💡',
    category: 'weekly',
    requiredSolved: 50
  },
  {
    id: 'badge_star_collector_200',
    title: 'کهکشان ستاره‌ها',
    description: 'جمع‌آوری ۲۰۰ ستاره طلایی در حل تمرینات',
    icon: '🌟',
    category: 'weekly',
    requiredStars: 200
  },
  {
    id: 'badge_streak_7',
    title: 'قهرمان پیوستگی هفتگی',
    description: '۷ روز متوالی (یک هفته کامل) تمرین روزانه',
    icon: '🗓️',
    category: 'weekly',
    requiredStreak: 7
  },
  {
    id: 'badge_scanner_20',
    title: 'مهندس بینایی ماشین',
    description: 'اسکن و رفع اشکال ۲۰ عکس از مسائل دست‌نویس',
    icon: '🔬',
    category: 'weekly',
    requiredScanned: 20
  },
  {
    id: 'badge_level_5',
    title: 'ریاضی‌دان سطح ۵',
    description: 'رسیدن به سطح ۵ در مهارت‌های ریاضی',
    icon: '🏅',
    category: 'weekly',
    requiredLevel: 5
  },

  // --- Monthly / Advanced Badges (Takes months of dedicated practice) ---
  {
    id: 'badge_solver_200',
    title: 'استاد حل مسئله',
    description: 'حل ۲۰۰ مسئله ریاضی با دقت بالا',
    icon: '🎯',
    category: 'monthly',
    requiredSolved: 200
  },
  {
    id: 'badge_solver_500',
    title: 'نابغه بی‌رقیب ریاضی',
    description: 'حل ۵۰۰ مسئله مختلف در تمام فصل‌های کتاب',
    icon: '🏆',
    category: 'monthly',
    requiredSolved: 500
  },
  {
    id: 'badge_solver_1000',
    title: 'اسطوره ریاضیات سوم دبستان',
    description: 'حل ۱۰۰۰ مسئله ریاضی! (نیازمند ماه‌ها تمرین مستمر)',
    icon: '👑',
    category: 'monthly',
    requiredSolved: 1000
  },
  {
    id: 'badge_star_1000',
    title: 'کهکشانی از ستاره‌ها',
    description: 'کسب ۱۰۰۰ ستاره طلایی در کل دوره تحصیلی',
    icon: '🌌',
    category: 'monthly',
    requiredStars: 1000
  },
  {
    id: 'badge_star_5000',
    title: 'خالق سیاره ستارگان',
    description: 'کسب ۵۰۰۰ ستاره طلایی! (نشان بالاترین پشتکار)',
    icon: '🌠',
    category: 'monthly',
    requiredStars: 5000
  },
  {
    id: 'badge_streak_30',
    title: 'قهرمان ماهانه (۳۰ روز متوالی)',
    description: '۳۰ روز متوالی بدون حتی یک روز غیبت در تمرین ریاضی',
    icon: '🗓️🔥',
    category: 'monthly',
    requiredStreak: 30
  },
  {
    id: 'badge_streak_90',
    title: 'فصل‌شکن بی‌وقفه (۹۰ روز)',
    description: '۹۰ روز متوالی (سه ماه کامل) تمرین روزانه ریاضی',
    icon: '⚡🛡️',
    category: 'monthly',
    requiredStreak: 90
  },
  {
    id: 'badge_scanner_50',
    title: 'اسکنر ارشد تکالیف',
    description: 'اسکن و تحلیل ۵۰ عکس از تکالیف سخت',
    icon: '📡',
    category: 'monthly',
    requiredScanned: 50
  },
  {
    id: 'badge_level_10',
    title: 'دانشمند کوچک (سطح ۱۰)',
    description: 'ارتقای سطح به رتبه ۱۰ ریاضی‌دانان برتر',
    icon: '🎓',
    category: 'monthly',
    requiredLevel: 10
  },
  {
    id: 'badge_level_25',
    title: 'استاد اعظم ریاضی (سطح ۲۵)',
    description: 'رسیدن به سطح فوق‌العاده ۲۵ در پلتفرم استاد دانا',
    icon: '🔮',
    category: 'monthly',
    requiredLevel: 25
  },
  {
    id: 'badge_level_50',
    title: 'افسانه زنده ریاضی (سطح ۵۰)',
    description: 'بالاترین افتخار علمی سامانه؛ رسیدن به سطح ۵۰!',
    icon: '🌟💎👑',
    category: 'monthly',
    requiredLevel: 50
  }
*/

export const CHAPTER_LESSONS: Record<ChapterId, Lesson[]> = {
  // ==========================================
  // فصل ۱: الگوها و شمارش
  // ==========================================
  patterns: [
    {
      id: 'pat_l1',
      chapterId: 'patterns',
      title: 'شمارش چندتاچندتا و کشف الگوهای عددی',
      lessonNumber: 1,
      shortSummary: 'یادگیری پرش‌های منظم روی خط اعداد با گام‌های ثابت (مثل ۲تا۲تا، ۵تا۵تا و ۱۰تا۱۰تا) و کشف جملات بعدی الگو.',
      explanationText: 'الگوی عددی یعنی یک نظم تکرارشونده و قانون‌مند بین اعداد. برای حل هر الگو، ابتدا تفاوت دو عدد پشت سر هم را به دست می‌آوریم تا ببینیم الگو «افزایشی» است (جمع) یا «کاهشی» (تفریق).',
      visualExplanation: {
        emoji: '🐸',
        diagramTitle: 'پرش‌های منظم قورباغه روی محور اعداد',
        description: 'وقتی قورباغه با گام‌های ۵تایی می‌پرد: ۰ ➔ ۵ ➔ ۱۰ ➔ ۱۵ ➔ ۲۰ ➔ ۲۵ ➔ ۳۰',
        formulaOrRule: 'عدد بعدی = عدد فعلی + گام ثابت الگو (یا تفریق در الگوی کاهشی)'
      },
      examples: [
        {
          title: 'مثال ۱: الگوی افزایشی ۷ تایی',
          problem: 'در دنباله عددی ۷، ۱۴، ۲۱، ۲۸، دو عدد بعدی را پیدا کنید.',
          solution: 'ابتدا اختلاف دو عدد اول را بررسی می‌کنیم: ۱۴ - ۷ = ۷. پس هر بار ۷ تا اضافه می‌شود.\n۲۸ + ۷ = ۳۵\n۳۵ + ۷ = ۴۲\nپاسخ: ۳۵ و ۴۲',
          visualCue: '➕۷ ➔ ➕۷ ➔ ➕۷ ➔ ➕۷',
          keyTakeaway: 'در الگوهای افزایشی، کافی است فاصله کشف‌شده را با آخرین عدد جمع کنیم.'
        },
        {
          title: 'مثال ۲: الگوی کاهشی از صد',
          problem: 'در دنباله ۱۰۰، ۹۰، ۸۰، ۷۰، عدد بعدی چیست؟',
          solution: 'فاصله بین ۱۰۰ و ۹۰ برابر ۱۰- است. پس الگو ۱۰ تا ۱۰ تا کم می‌شود: ۷۰ - ۱۰ = ۶۰.',
          visualCue: '➖۱۰ ➔ ➖۱۰ ➔ ➖۱۰',
          keyTakeaway: 'همیشه دقت کن که اعداد در حال بزرگ شدن هستند یا کوچک شدن!'
        }
      ],
      commonMistakes: [
        'اشتباه گرفتن الگوی رو به جلو (جمع) با الگوی رو به عقب (تفریق)',
        'تغییر دادن فاصله بین اعداد در وسط الگو بدون بررسی همه جملات'
      ],
      easyQuestions: [
        {
          id: 'pat_e1',
          chapterId: 'patterns',
          difficulty: 'easy',
          question: 'در الگوی عددی ۲، ۴، ۶، ۸، عدد بعدی کدام است؟',
          options: ['۹', '۱۰', '۱۱', '۱۲'],
          correctAnswerIndex: 1,
          explanation: 'الگو ۲ تا ۲ تا اضافه می‌شود: ۸ + ۲ = ۱۰.',
          hint: '۲ تا به عدد ۸ اضافه کن!'
        }
      ],
      mediumQuestions: [
        {
          id: 'pat_m1',
          chapterId: 'patterns',
          difficulty: 'medium',
          question: 'در الگوی ۶، ۱۲، ۱۸، ۲۴، ۳۰، عدد هفتم این الگو کدام است؟',
          options: ['۳۶', '۴۰', '۴۲', '۴۸'],
          correctAnswerIndex: 2,
          explanation: 'عدد ششم ۳۶ و عدد هفتم ۳۶ + ۶ = ۴۲ است.',
          hint: 'این الگو جدول ضرب ۶ است (۶ × ۷ = ۴۲).'
        }
      ],
      hardQuestions: [
        {
          id: 'pat_h1',
          chapterId: 'patterns',
          difficulty: 'hard',
          question: 'در الگوی کاهشی ۸۵، ۷۷، ۶۹، ۶۱، عدد بعدی کدام است؟',
          options: ['۵۳', '۵۴', '۵۵', '۵۲'],
          correctAnswerIndex: 0,
          explanation: 'اختلاف بین هر دو عدد ۸ واحد کاهشی است: ۶۱ - ۸ = ۵۳.',
          hint: 'از عدد ۶۱، ۸ واحد کم کن.'
        }
      ]
    },
    {
      id: 'pat_l2',
      chapterId: 'patterns',
      title: 'ساعت بعدازظهر و تبدیل به زمان ۲۴ ساعته',
      lessonNumber: 2,
      shortSummary: 'خواندن زمان در قالب ۲۴ ساعته. برای ساعت‌های بعدازظهر کافی است عدد ساعت را با ۱۲ جمع کنیم.',
      explanationText: 'یک شبانه‌روز ۲۴ ساعت است. عقربه ساعت‌شمار دو دور کامل دور ساعت می‌چرخد. بعد از ساعت ۱۲ ظهر، ساعت ۱ بعدازظهر را ۱۳، ساعت ۲ بعدازظهر را ۱۴ و ... می‌نامیم.',
      visualExplanation: {
        emoji: '⏰',
        diagramTitle: 'ساعت دایره‌ای دو لایه (۱۲ و ۲۴ ساعته)',
        description: '۱ ظهر = ۱۳:۰۰ | ۳ عصر = ۱۵:۰۰ | ۵ عصر = ۱۷:۰۰ | ۸ شب = ۲۰:۰۰',
        formulaOrRule: 'ساعت بعدازظهر = عدد ساعت روی صفحه + ۱۲ (دقیقه‌ها تغییری نمی‌کنند)'
      },
      examples: [
        {
          title: 'مثال ۱: تبدیل ساعت بعدازظهر به ۲۴ ساعته',
          problem: 'ساعت ۴:۲۵ بعدازظهر در نمایشگر دیجیتال ۲۴ ساعته چگونه نشان داده می‌شود؟',
          solution: 'عدد ساعت یعنی ۴ را با ۱۲ جمع می‌کنیم: ۴ + ۱۲ = ۱۶.\nدقیقه‌ها ثابت می‌مانند: ۲۵.\nپاسخ: ۱۶:۲۵',
          visualCue: '۴:۲۵ بعدازظهر ➔ (۴+۱۲):۲۵ ➔ ۱۶:۲۵',
          keyTakeaway: 'فقط عدد ساعت تغییر می‌کند و مقدار دقیقه کاملاً دست‌نخورده می‌ماند.'
        },
        {
          title: 'مثال ۲: تبدیل ساعت ۲۴ ساعته به ساعت معمولی',
          problem: 'پرواز هواپیما ساعت ۲۱:۴۵ است. این چه ساعتی از شب است؟',
          solution: 'از عدد ساعت ۲۱ مقدار ۱۲ را کم می‌کنیم: ۲۱ - ۱۲ = ۹.\nپاسخ: ساعت ۹:۴۵ شب.',
          visualCue: '۲۱:۴۵ ➔ (۲۱-۱۲):۴۵ ➔ ۹:۴۵ شب',
          keyTakeaway: 'برای تبدیل برعکس، از عدد ساعت ۱۲ تا کم می‌کنیم.'
        }
      ],
      commonMistakes: [
        'جمع کردن دقیقه با ۱۲ به جای ساعت (مثلاً نوشتن ۴:۳۷ به جای ۱۶:۲۵)',
        'اشتباه خواندن عقربه بزرگ دقیقه‌شمار با عقربه کوچک ساعت‌شمار'
      ],
      easyQuestions: [
        {
          id: 'pat_e2',
          chapterId: 'patterns',
          difficulty: 'easy',
          question: 'ساعت ۶ بعدازظهر برابر با کدام ساعت است؟',
          options: ['۱۶:۰۰', '۱۷:۰۰', '۱۸:۰۰', '۱۹:۰۰'],
          correctAnswerIndex: 2,
          explanation: '۶ + ۱۲ = ۱۸:۰۰.',
          hint: '۶ را با ۱۲ جمع کن.'
        }
      ],
      mediumQuestions: [
        {
          id: 'pat_m2',
          chapterId: 'patterns',
          difficulty: 'medium',
          question: 'ساعت ۲۰:۱۵ چه زمانی را نشان می‌دهد؟',
          options: ['۸:۱۵ صبح', '۸:۱۵ شب', '۷:۱۵ شب', '۹:۱۵ شب'],
          correctAnswerIndex: 1,
          explanation: '۲۰ - ۱۲ = ۸، پس ساعت ۸:۱۵ بعدازظهر (شب) است.',
          hint: '۲۰ را منهای ۱۲ کن.'
        }
      ],
      hardQuestions: [
        {
          id: 'pat_h2',
          chapterId: 'patterns',
          difficulty: 'hard',
          question: 'فیلم سینمایی ساعت ۱۷:۴۰ شروع شد و ۵۰ دقیقه طول کشید. فیلم چه ساعتی تمام شد؟',
          options: ['۱۸:۲۰', '۱۸:۳۰', '۱۸:۴۰', '۱۹:۰۰'],
          correctAnswerIndex: 1,
          explanation: '۱۷:۴۰ به اضافه ۲۰ دقیقه می‌شود ۱۸:۰۰. ۳۰ دقیقه دیگر باقی‌مانده اضافه شود می‌شود ۱۸:۳۰.',
          hint: 'ابتدا تا ساعت ۱۸:۰۰ را حساب کن (۲۰ دقیقه)، سپس ۳۰ دقیقه باقی را اضافه کن.'
        }
      ]
    },
    {
      id: 'pat_l3',
      chapterId: 'patterns',
      title: 'ماشین‌های ورودی و خروجی',
      lessonNumber: 3,
      shortSummary: 'ماشین ریاضی یک عدد ورودی دریافت کرده، عملگری معین (+، -، ×) روی آن اجرا نموده و حاصل را به عنوان خروجی تحویل می‌دهد.',
      explanationText: 'ماشین ورودی و خروجی مثل یک ربات حسابگر است. اگر ورودی را داشته باشیم، طبق قانون ماشین عمل می‌کنیم. اگر خروجی را داشته باشیم و بخواهیم ورودی را پیدا کنیم، باید عملیات را برعکس (معکوس) انجام دهیم.',
      visualExplanation: {
        emoji: '⚙️',
        diagramTitle: 'جعبه پردازشگر ماشین ریاضی',
        description: 'ورودی [۵] ➔ ⚙️ [× ۴] ➔ خروجی [۲۰] | معکوس: [۲۰] ➔ [÷ ۴] ➔ [۵]',
        formulaOrRule: 'خروجی = ورودی × قانون ماشین | ورودی = خروجی ÷ قانون ماشین'
      },
      examples: [
        {
          title: 'مثال ۱: پیدا کردن خروجی ماشین',
          problem: 'ماشینی هر عدد را «ضرب در ۳ و سپس به اضافه ۲» می‌کند. اگر عدد ۴ وارد شود، خروجی چیست؟',
          solution: 'مرحله اول: ۴ × ۳ = ۱۲\nمرحله دوم: ۱۲ + ۲ = ۱۴\nخروجی = ۱۴',
          visualCue: '۴ ➔ [×۳] ➔ ۱۲ ➔ [+۲] ➔ ۱۴',
          keyTakeaway: 'در ماشین‌های دو مرحله‌ای، محاسبات را دقیقاً به ترتیب ورود انجام بده.'
        },
        {
          title: 'مثال ۲: پیدا کردن ورودی با عملیات معکوس',
          problem: 'قانون ماشینی «+ ۷» است. اگر عدد ۲۵ از ماشین خارج شده باشد، ورودی چه بوده است؟',
          solution: 'عملیات معکوس جمع، تفریق است: ۲۵ - ۷ = ۱۸.\nبررسی: ۱۸ + ۷ = ۲۵ (کاملاً درست است).',
          visualCue: 'ورودی ؟ ➔ [+۷] ➔ ۲۵ ===> ۲۵ - ۷ = ۱۸',
          keyTakeaway: 'برای حرکت رو به عقب از خروجی به ورودی، جمع به تفریق و ضرب به تقسیم تبدیل می‌شود.'
        }
      ],
      commonMistakes: [
        'انجام برعکس ترتیب مراحل در ماشین‌های چندمرحله‌ای',
        'فراموش کردن معکوس کردن علامت هنگام پیدا کردن عدد ورودی'
      ],
      easyQuestions: [
        {
          id: 'pat_e3',
          chapterId: 'patterns',
          difficulty: 'easy',
          question: 'ماشینی هر عدد را "ضرب در ۵" می‌کند. اگر عدد ۳ وارد شود چه عددی خارج می‌شود؟',
          options: ['۸', '۱۵', '۱۲', '۲۰'],
          correctAnswerIndex: 1,
          explanation: '۳ × ۵ = ۱۵.',
          hint: '۳ را ۵ بار با خودش جمع کن یا ۳ × ۵ را حساب کن.'
        }
      ],
      mediumQuestions: [
        {
          id: 'pat_m3',
          chapterId: 'patterns',
          difficulty: 'medium',
          question: 'اگر قانون یک ماشین «منهای ۶» باشد و عدد ۱۸ خارج شده باشد، ورودی چه بوده است؟',
          options: ['۱۲', '۲۲', '۲۴', '۲۶'],
          correctAnswerIndex: 2,
          explanation: 'عملیات معکوس تفریق، جمع است: ۱۸ + ۶ = ۲۴.',
          hint: 'چه عددی منهای ۶ می‌شود ۱۸؟ ۱۸ را با ۶ جمع کن.'
        }
      ],
      hardQuestions: [
        {
          id: 'pat_h3',
          chapterId: 'patterns',
          difficulty: 'hard',
          question: 'ماشینی عدد را ابتدا «+ ۵» کرده و سپس «× ۲» می‌کند. اگر خروجی ۲۶ باشد، ورودی چه بوده است؟',
          options: ['۸', '۹', '۱۰', '۱۱'],
          correctAnswerIndex: 0,
          explanation: 'مرحله اول معکوس: ۲۶ ÷ ۲ = ۱۳. مرحله دوم معکوس: ۱۳ - ۵ = ۸.',
          hint: 'ابتدا ۲۶ را نصف کن (تقسیم بر ۲)، سپس ۵ واحد از آن کم کن.'
        }
      ]
    },
    {
      id: 'pat_l4',
      chapterId: 'patterns',
      title: 'الگوهای هندسی و شمارش شکل‌ها',
      lessonNumber: 4,
      shortSummary: 'در الگوهای هندسی، تعداد اشکال با یک نظم مشخص (مانند اضافه شدن مقدار ثابت یا دو برابر شدن) تغییر می‌کند.',
      explanationText: 'برای حل الگوهای هندسی، ابتدا تعداد شکل‌ها را در مرحله ۱، مرحله ۲ و مرحله ۳ می‌شماریم و یک جدول نظام‌دار می‌کشیم. سپس فاصله بین تعدادها را پیدا می‌کنیم تا قانون الگو (مثلاً: شماره شکل × ۲ یا شماره شکل × ۳ + ۱) کشف شود.',
      visualExplanation: {
        emoji: '📐',
        diagramTitle: 'جدول شمارش الگوهای هندسی',
        description: 'در هر مرحله تعداد شکل‌ها را یادداشت می‌کنیم (شکل ۱: ۱ مثلث 🔺، شکل ۲: ۳ مثلث 🔺🔺🔺، شکل ۳: ۵ مثلث 🔺🔺🔺🔺🔺).',
        formulaOrRule: 'فرمول طلایی: تعداد شکل‌ها = (فاصله بین مراحل × شماره شکل) ± مقدار اولیه'
      },
      commonMistakes: [
        'اشتباه در شمارش ضلع‌های مشترک در اشکال چوب‌کبریتی متصل به هم',
        'حدس زدن بدون تشکیل جدول نظام‌دار عددی برای ۳ مرحله اول'
      ],
      examples: [
        {
          title: 'شمارش چوب‌کبریت‌های خانه‌سازی',
          problem: 'یک خانه با ۵ چوب‌کبریت ساخته می‌شود. اگر دو خانه به هم چسبیده باشند ۹ چوب‌کبریت و سه خانه ۱۳ چوب‌کبریت می‌خواهند. برای ۴ خانه به چند چوب‌کبریت نیاز داریم؟',
          solution: 'تعدادها را می‌نویسیم: ۵، ۹، ۱۳. فاصله مراحل ۴ تا است (۱۳ - ۹ = ۴). پس برای شکل چهارم: ۱۳ + ۴ = ۱۷ چوب‌کبریت (یا ۴ × ۴ + ۱ = ۱۷).',
          visualCue: '🏠 ➔ 🏠🏠 ➔ 🏠🏠🏠',
          keyTakeaway: 'چون ضلع مشترک دارند، برای خانه‌های بعدی فقط ۴ چوب‌کبریت اضافه می‌شود.'
        },
        {
          title: 'الگوی کاشی‌های مربعی',
          problem: 'در شکل ۱ یک ردیف ۲ کاشی، در شکل ۲ چهار کاشی و در شکل ۳ شش کاشی داریم. در شکل ۵ چند کاشی داریم؟',
          solution: 'الگوی تعداد کاشی‌ها ۲، ۴، ۶ است (۲ تا ۲ تا). برای شکل پنجم: ۵ × ۲ = ۱۰ کاشی.',
          visualCue: '🟨🟨 ➔ 🟨🟨🟨🟨',
          keyTakeaway: 'از شمارش ۲ تا ۲ تا یا جدول ضرب ۲ استفاده می‌کنیم.'
        }
      ],
      easyQuestions: [
        {
          id: 'pat_e4_1',
          chapterId: 'patterns',
          difficulty: 'easy',
          question: 'در الگوی هندسی با تعداد دایره‌های ۳، ۶، ۹، در شکل بعدی چند دایره خواهیم داشت؟',
          options: ['۱۰', '۱۱', '۱۲', '۱۵'],
          correctAnswerIndex: 2,
          explanation: 'دایره‌ها ۳ تا ۳ تا زیاد می‌شوند: ۹ + ۳ = ۱۲.',
          hint: 'شمارش ۳ تا ۳ تا را ادامه بده.'
        },
        {
          id: 'pat_e4_2',
          chapterId: 'patterns',
          difficulty: 'easy',
          question: 'اگر در شکل اول ۲ ستاره، در شکل دوم ۴ ستاره و در شکل سوم ۶ ستاره باشد، قانون الگو چیست؟',
          options: ['شمارش ۲ تا ۲ تا (زوج)', 'شمارش ۳ تا ۳ تا', 'شمارش ۵ تا ۵ تا', 'یکی اضافه شدن'],
          correctAnswerIndex: 0,
          explanation: 'هر مرحله ۲ ستاره بیشتر از مرحله قبل دارد.',
          hint: 'اختلاف بین ۲، ۴ و ۶ چند تاست؟'
        }
      ],
      mediumQuestions: [
        {
          id: 'pat_m4_1',
          chapterId: 'patterns',
          difficulty: 'medium',
          question: 'در یک الگوی مثلثی، شکل ۱ دارای ۱ مثلث، شکل ۲ دارای ۴ مثلث و شکل ۳ دارای ۷ مثلث است. شکل پنجم چند مثلث دارد؟',
          options: ['۱۰', '۱۲', '۱۳', '۱۵'],
          correctAnswerIndex: 2,
          explanation: 'الگو ۳ تا ۳ تا زیاد می‌شود: شکل ۴ دارای ۱۰ و شکل ۵ دارای ۱۰ + ۳ = ۱۳ مثلث است.',
          hint: 'قانون: شماره شکل × ۳ - ۲. برای شکل ۵: ۵ × ۳ - ۲ = ۱۳.'
        },
        {
          id: 'pat_m4_2',
          chapterId: 'patterns',
          difficulty: 'medium',
          question: 'برای ساختن یک مثلث با چوب‌کبریت به ۳ چوب‌کبریت نیاز است. برای دو مثلث چسبیده ۵ چوب‌کبریت و سه مثلث ۷ چوب‌کبریت لازم است. برای ۵ مثلث چسبیده چند چوب‌کبریت می‌خواهیم؟',
          options: ['۹', '۱۰', '۱۱', '۱۲'],
          correctAnswerIndex: 2,
          explanation: 'الگوی چوب‌کبریت‌ها: ۳، ۵، ۷، ۹، ۱۱ (فرمول: شماره شکل × ۲ + ۱). برای شکل ۵: ۵ × ۲ + ۱ = ۱۱.',
          hint: 'هر بار ۲ چوب‌کبریت اضافه می‌شود.'
        }
      ],
      hardQuestions: [
        {
          id: 'pat_h4_1',
          chapterId: 'patterns',
          difficulty: 'hard',
          question: 'در یک الگوی مربعی، شکل ۱ دارای ۱ کاشی (۱×۱)، شکل ۲ دارای ۴ کاشی (۲×۲)، و شکل ۳ دارای ۹ کاشی (۳×۳) است. اختلاف تعداد کاشی‌های شکل ۵ و شکل ۴ چقدر است؟',
          options: ['۷', '۸', '۹', '۱۰'],
          correctAnswerIndex: 2,
          explanation: 'تعداد کاشی شکل ۴: ۴ × ۴ = ۱۶. تعداد کاشی شکل ۵: ۵ × ۵ = ۲۵. اختلاف: ۲۵ - ۱۶ = ۹.',
          hint: 'ابتدا ۲۵ و ۱۶ را حساب کن، سپس آنها را از هم کم کن.'
        },
        {
          id: 'pat_h4_2',
          chapterId: 'patterns',
          difficulty: 'hard',
          question: 'در یک الگوی هندسی، تعداد چوب‌کبریت‌ها با فرمول «شماره شکل × ۵ - ۲» به دست می‌آید. شکلی که با ۲۸ چوب‌کبریت ساخته شده، شکل شماره چندم است؟',
          options: ['شکل ۴', 'شکل ۵', 'شکل ۶', 'شکل ۷'],
          correctAnswerIndex: 2,
          explanation: 'عملیات برعکس: ۲۸ + ۲ = ۳۰. سپس ۳۰ ÷ ۵ = ۶. پس شکل شماره ۶ است.',
          hint: 'اول ۲ واحد به ۲۸ اضافه کن (۳۰)، بعد بر ۵ تقسیم کن.'
        }
      ]
    }
  ],

  // ==========================================
  // فصل ۲: عددنویسی و ارزش مکانی
  // ==========================================
  place_value: [
    {
      id: 'pv_l1',
      chapterId: 'place_value',
      title: 'معرفی عدد هزار و جدول ارزش مکانی ۴ رقمی',
      lessonNumber: 1,
      shortSummary: '۱۰ بسته صدتایی با هم یک بسته هزارتایی (۱۰۰۰) را می‌سازند. اعداد ۴ رقمی دارای چهار مرتبه یکی، ده‌تایی، صدتایی و هزارتایی هستند.',
      explanationText: 'برای خواندن و نوشتن اعداد ۴ رقمی، از سمت چپ (بزرگ‌ترین مرتبه یعنی هزارگان) شروع می‌کنیم. برای مرتبه‌هایی که عددی ندارند، حتماً رقم صفر (۰) قرار می‌دهیم.',
      visualExplanation: {
        emoji: '🧱',
        diagramTitle: 'جدول ۴ طبقه‌ای ارزش مکانی',
        description: '| هزارگان (۱۰۰۰) | صدگان (۱۰۰) | دهگان (۱۰) | یکان (۱) |\nعدد ۴۳۵۲ = ۴ تا ۱۰۰۰ + ۳ تا ۱۰۰ + ۵ تا ۱۰ + ۲ تا ۱',
        formulaOrRule: 'عدد ۴ رقمی = (هزارگان × ۱۰۰۰) + (صدگان × ۱۰۰) + (دهگان × ۱۰) + یکان'
      },
      examples: [
        {
          title: 'مثال ۱: گسترده‌نویسی عدد ۴ رقمی',
          problem: 'عدد ۶۴۰۸ را به صورت گسترده بنویسید.',
          solution: '۶۴۰۸ = ۶۰۰۰ + ۴۰۰ + ۰ + ۸ = ۶۰۰۰ + ۴۰۰ + ۸\nچون دهگان صفر است، در گسترده نوشته نمی‌شود اما در عدد اصلی رقم ۰ می‌نشیند.',
          visualCue: '۶۴۰۸ ➔ ۶۰۰۰ + ۴۰۰ + ۸',
          keyTakeaway: 'حواست باشد صفرها جایگاه مرتبه را حفظ می‌کنند؛ اگر صفر را نگذاری عدد ۶۴۸ خوانده می‌شود!'
        },
        {
          title: 'مثال ۲: تبدیل حروف به رقم',
          problem: 'عدد «پنج هزار و هفتاد و دو» را به رقم بنویسید.',
          solution: 'هزارگان: ۵ | صدگان: ۰ (چون صدتایی گفته نشده) | دهگان: ۷ | یکان: ۲ ➔ ۵۰۷۲',
          visualCue: '۵ [هزار] + ۰ [صد] + ۷ [ده] + ۲ [یک] = ۵۰۷۲',
          keyTakeaway: 'وقتی مرتبه‌ای در گفتار غایب است، جایش حتماً صفر بگذار.'
        }
      ],
      commonMistakes: [
        'جا انداختن صفر در مرتبه‌های میانی (نوشتن ۵۷۲ به جای ۵۰۷۲)',
        'اشتباه در مقایسه دو عدد ۴ رقمی بدون توجه به بزرگ‌ترین مرتبه'
      ],
      easyQuestions: [
        {
          id: 'pv_e1',
          chapterId: 'place_value',
          difficulty: 'easy',
          question: 'ارزش مکانی رقم ۶ در عدد ۷۶۴۲ چیست؟',
          options: ['یکان', 'دهگان', 'صدگان', 'هزارگان'],
          correctAnswerIndex: 2,
          explanation: 'رقم ۲ یکان، ۴ دهگان، ۶ صدگان (ارزش ۶۰۰) و ۷ هزارگان است.',
          hint: 'از سمت راست جایگاه سوم است.'
        }
      ],
      mediumQuestions: [
        {
          id: 'pv_m1',
          chapterId: 'place_value',
          difficulty: 'medium',
          question: 'با رقم‌های ۴، ۰، ۸ و ۳ بزرگ‌ترین عدد ۴ رقمی کدام است؟',
          options: ['۸۴۳۰', '۸۴۰۳', '۸۳۴۰', '۸۰۰۴'],
          correctAnswerIndex: 0,
          explanation: 'برای بزرگ‌ترین عدد، بزرگ‌ترین رقم‌ها را از چپ می‌چینیم: ۸، ۴، ۳، ۰ ➔ ۸۴۳۰.',
          hint: 'بزرگ‌ترین رقم (۸) را در هزارگان و بقیه را به ترتیب از بزرگ به کوچک بچین.'
        }
      ],
      hardQuestions: [
        {
          id: 'pv_h1',
          chapterId: 'place_value',
          difficulty: 'hard',
          question: 'کوچک‌ترین عدد ۴ رقمی بدون تکرار ارقام که رقم یکان آن زوج باشد کدام است؟',
          options: ['۱۰۲۴', '۱۰۳۲', '۱۲۳۴', '۱۰۴۲'],
          correctAnswerIndex: 1,
          explanation: 'ارقام کوچک را می‌چینیم: ۱ در هزارگان، ۰ در صدگان. برای دهگان ۳ و یکان زوج ۲ ➔ ۱۰۳۲ (کوچک‌تر از ۱۰۲۴ نیست؟ ۱۰۲۴ رقم یکان ۴ و دهگان ۲ دارد. ۱۰۲۴ کوچک‌تر از ۱۰۳۲ است! ۱۰۲۴: ۱،۰،۲،۴ بدون تکرار و زوج است).',
          hint: 'هزارگان ۱، صدگان ۰، دهگان ۲، یکان ۴ ➔ ۱۰۲۴.'
        }
      ]
    },
    {
      id: 'pv_l2',
      chapterId: 'place_value',
      title: 'واحد پول (ریال و تومان) و تقریب زدن اعداد',
      lessonNumber: 2,
      shortSummary: 'هر ۱۰ ریال برابر با ۱ تومان است. برای تبدیل ریال به تومان یک صفر برمی‌داریم و برای تقریب زدن به نزدیک‌ترین ۱۰، ۱۰۰ یا ۱۰۰۰ گرد می‌کنیم.',
      explanationText: 'واحد رسمی پول ایران ریال است اما در زندگی روزمره از تومان استفاده می‌کنیم. در تقریب زدن، اگر رقم بعدی کمتر از ۵ باشد به سمت پایین و اگر ۵ یا بیشتر باشد به سمت بالا گرد می‌کنیم.',
      visualExplanation: {
        emoji: '🪙',
        diagramTitle: 'ترازوی تبدیل پول و خط‌کش تقریب',
        description: '۱۰۰۰۰ ریال = ۱۰۰۰ تومان (حذف یک صفر) | ۴۷۸۰ تقریباً برابر است با ۴۸۰۰ (تقریب صدگان)',
        formulaOrRule: 'تومان = ریال ÷ ۱۰ | ریال = تومان × ۱۰'
      },
      examples: [
        {
          title: 'مثال ۱: تبدیل ریال به تومان',
          problem: 'قیمت یک مدادرنگی ۴۵،۰۰۰ ریال است. قیمت آن چند تومان است؟',
          solution: 'یک صفر از آخر عدد برمی‌داریم: ۴۵،۰۰۰ ÷ ۱۰ = ۴،۵۰۰ تومان.',
          visualCue: '۴۵۰۰[۰] ریال ➔ ۴۵۰۰ تومان',
          keyTakeaway: 'همیشه ریال یک صفر بیشتر از تومان دارد.'
        },
        {
          title: 'مثال ۲: تقریب زدن با رقم صدگان',
          problem: 'عدد ۳۶۷۲ را با تقریب رقم صدگان بنویسید.',
          solution: 'رقم صدگان ۶ است. رقم سمت راست آن ۷ است (بزرگ‌تر یا مساوی ۵). پس ۶ به ۷ تبدیل شده و ارقام سمت راست صفر می‌شوند: ۳۷۰۰.',
          visualCue: '۳۶[۷۲] ➔ چون ۷۲ >= ۵۰ ➔ ۳۷۰۰',
          keyTakeaway: 'برای تقریب صدگان، به رقم دهگان نگاه کن؛ اگر ۵، ۶، ۷، ۸ یا ۹ بود، یکی به صدگان اضافه کن.'
        }
      ],
      commonMistakes: [
        'اشتباه در جهت اضافه یا حذف کردن صفر برای تبدیل ریال و تومان',
        'صفر نکردن ارقام سمت راست مرتبه مورد تقریب'
      ],
      easyQuestions: [
        {
          id: 'pv_e2',
          chapterId: 'place_value',
          difficulty: 'easy',
          question: '۷۰،۰۰۰ ریال برابر با چند تومان است؟',
          options: ['۷۰۰ تومان', '۷،۰۰۰ تومان', '۷۰،۰۰۰ تومان', '۷۰ تومان'],
          correctAnswerIndex: 1,
          explanation: 'یک صفر حذف می‌شود: ۷،۰۰۰ تومان.',
          hint: 'یک صفر از ۷۰۰۰۰ بردار.'
        }
      ],
      mediumQuestions: [
        {
          id: 'pv_m2',
          chapterId: 'place_value',
          difficulty: 'medium',
          question: 'عدد ۵۲۳۸ با تقریب رقم ده‌گان کدام است؟',
          options: ['۵۲۳۰', '۵۲۴۰', '۵۲۰۰', '۵۳۰۰'],
          correctAnswerIndex: 1,
          explanation: 'رقم یکان ۸ است (بیشتر از ۵)، پس دهگان ۳ به ۴ تبدیل می‌شود: ۵۲۴۰.',
          hint: 'چون رقم یکان ۸ است، ۳ به سمت بالا یعنی ۴۰ گرد می‌شود.'
        }
      ],
      hardQuestions: [
        {
          id: 'pv_h2',
          chapterId: 'place_value',
          difficulty: 'hard',
          question: 'سارا یک کیف به قیمت ۳۵۰۰ تومان و یک دفتر به قیمت ۱۵۰۰۰ ریال خرید. او در مجموع چند تومان پرداخت کرد؟',
          options: ['۴۵۰۰ تومان', '۵۰۰۰ تومان', '۱۸۵۰۰ تومان', '۳۶۵۰ تومان'],
          correctAnswerIndex: 1,
          explanation: '۱۵۰۰۰ ریال = ۱۵۰۰ تومان. مجموع: ۳۵۰۰ + ۱۵۰۰ = ۵۰۰۰ تومان.',
          hint: 'ابتدا ۱۵۰۰۰ ریال را به تومان تبدیل کن (۱۵۰۰ تومان) سپس با ۳۵۰۰ جمع کن.'
        }
      ]
    }
  ],

  // ==========================================
  // فصل ۳: کسرها
  // ==========================================
  fractions: [
    {
      id: 'frc_l1',
      chapterId: 'fractions',
      title: 'مفهوم کسر، صورت و مخرج',
      lessonNumber: 1,
      shortSummary: 'کسر نشان‌دهنده قسمتی از یک کل مساوی است. عدد بالا (صورت) تعداد تکه‌های انتخابی و عدد پایین (مخرج) کل تکه‌های مساوی شکل را نشان می‌دهد.',
      explanationText: 'شرط اصلی در ساخت کسر، «مساوی بودن تمام قسمت‌ها» است. خط بین دو عدد خط کسری نام دارد.',
      visualExplanation: {
        emoji: '🍕',
        diagramTitle: 'پیتزای برش‌خورده به قسمت‌های مساوی',
        description: 'صورت کسر (تکه‌های خورده‌شده) / مخرج کسر (کل تکه‌های مساوی پیتزا)\n۳/۴ یعنی ۳ تکه از ۴ تکه مساوی.',
        formulaOrRule: 'کسر = صورت (تعداد بخش‌های رنگ‌شده) ÷ مخرج (تعداد کل بخش‌های مساوی)'
      },
      examples: [
        {
          title: 'مثال ۱: نوشتن کسر از روی شکل',
          problem: 'شکل دایره‌ای به ۶ قسمت کاملاً مساوی تقسیم شده و ۴ قسمت آن رنگی است. کسر مربوطه چیست؟',
          solution: 'تعداد کل قسمت‌ها = ۶ (مخرج)\nتعداد قسمت‌های رنگی = ۴ (صورت)\nکسر = ۴/۶ (چهار ششم).',
          visualCue: '🔴🔴🔴🔴⚪⚪ ➔ ۴/۶',
          keyTakeaway: 'همیشه اول کل قسمت‌ها را بشمار تا مخرج را بنویسی.'
        },
        {
          title: 'مثال ۲: کسر واحد کامل',
          problem: 'اگر تمام ۸ تکه یک شکلات خورده شود، کسر آن چقدر است؟',
          solution: '۸ تکه از ۸ تکه = ۸/۸ که برابر با عدد ۱ (یک واحد کامل) است.',
          visualCue: '۸/۸ = ۱ واحد کامل',
          keyTakeaway: 'هرگاه صورت و مخرج کسر با هم برابر باشند، کسر برابر ۱ واحد کامل است.'
        }
      ],
      commonMistakes: [
        'نوشتن کسر برای شکل‌هایی که تکه‌های آن‌ها با هم مساوی نیستند',
        'برعکس نوشتن صورت و مخرج'
      ],
      easyQuestions: [
        {
          id: 'frc_e1',
          chapterId: 'fractions',
          difficulty: 'easy',
          question: 'در کسر ۳/۵، صورت کسر کدام عدد است؟',
          options: ['۳', '۵', '۸', '۲'],
          correctAnswerIndex: 0,
          explanation: 'عدد بالای خط کسری (۳) صورت کسر نام دارد.',
          hint: 'صورت عدد بالایی است.'
        }
      ],
      mediumQuestions: [
        {
          id: 'frc_m1',
          chapterId: 'fractions',
          difficulty: 'medium',
          question: 'کدام شکل کسر ۲/۳ را به درستی نشان می‌دهد؟',
          options: ['شکلی با ۳ قسمت نامساوی که ۲ تا رنگ شده', 'شکلی با ۳ قسمت مساوی که ۲ تا رنگ شده', 'شکلی با ۲ قسمت مساوی که ۳ تا رنگ شده', 'شکلی با ۵ قسمت که ۲ تا رنگ شده'],
          correctAnswerIndex: 1,
          explanation: 'باید حتماً ۳ قسمت مساوی وجود داشته باشد و ۲ تای آن رنگی باشد.',
          hint: 'شرط مساوی بودن قسمت‌ها را بررسی کن.'
        }
      ],
      hardQuestions: [
        {
          id: 'frc_h1',
          chapterId: 'fractions',
          difficulty: 'hard',
          question: 'یک جعبه مدادرنگی ۱۲ تایی داریم. ۱/۳ این مدادها قرمز است. چند مداد قرمز در جعبه است؟',
          options: ['۳', '۴', '۶', '۸'],
          correctAnswerIndex: 1,
          explanation: '۱۲ را بر مخرج (۳) تقسیم می‌کنیم: ۱۲ ÷ ۳ = ۴ مداد قرمز.',
          hint: '۱۲ تا مداد را به ۳ دسته مساوی تقسیم کن.'
        }
      ]
    },
    {
      id: 'frc_l2',
      chapterId: 'fractions',
      title: 'مقایسه کسرها و کسر روی محور اعداد',
      lessonNumber: 2,
      shortSummary: 'وقتی مخرج‌ها مساوی باشند، صورت بزرگ‌تر کسر بزرگ‌تر است. وقتی صورت‌ها مساوی باشند، مخرج کوچک‌تر کسر بزرگ‌تر است!',
      explanationText: 'روی محور اعداد بین ۰ و ۱، هر چه کسر به عدد ۱ نزدیک‌تر باشد بزرگ‌تر است. برای رسم کسر روی محور، فاصله ۰ تا ۱ را به تعداد مخرج تقسیم مساوی می‌کنیم.',
      visualExplanation: {
        emoji: '📏',
        diagramTitle: 'محور مقایسه کسرها بین ۰ تا ۱',
        description: 'مخرج‌های مساوی: ۳/۵ > ۱/۵ | صورت‌های مساوی: ۱/۲ > ۱/۴ (نصف پیتزا از یک چهارم بزرگتر است!)',
        formulaOrRule: 'کسرهای هم‌مخرج: صورت بزرگ‌تر = کسر بزرگ‌تر | کسرهای هم‌صورت: مخرج کوچک‌تر = کسر بزرگ‌تر'
      },
      examples: [
        {
          title: 'مثال ۱: مقایسه با مخرج مساوی',
          problem: 'کدام کسر بزرگ‌تر است؟ ۵/۸ یا ۳/۸؟',
          solution: 'چون مخرج هر دو ۸ است، ۵ تکه از ۳ تکه بیشتر است. پس ۵/۸ > ۳/۸.',
          visualCue: '۵/۸ 🟩🟩🟩🟩🟩⬜⬜⬜ > ۳/۸ 🟩🟩🟩⬜⬜⬜⬜⬜',
          keyTakeaway: 'در مخرج مساوی، هر که صورتش بیش، کسرش بیشتر!'
        },
        {
          title: 'مثال ۲: مقایسه با صورت مساوی',
          problem: 'کدام کسر بزرگ‌تر است؟ ۱/۲ یا ۱/۸؟',
          solution: 'صورت هر دو ۱ است. نصف یک کیک (۱/۲) خیلی بزرگ‌تر از یک برش از هشت برش کیک (۱/۸) است. پس ۱/۲ > ۱/۸.',
          visualCue: '۱/۲ (نصف کامل) > ۱/۸ (یک تکه کوچک)',
          keyTakeaway: 'هر چه مخرج بزرگ‌تر شود، تکه‌ها کوچک‌تر می‌شوند!'
        }
      ],
      commonMistakes: [
        'تصور اینکه چون ۸ بزرگ‌تر از ۲ است، پس ۱/۸ بزرگ‌تر از ۱/۲ است!',
        'تقسیم نامساوی فواصل روی محور اعداد'
      ],
      easyQuestions: [
        {
          id: 'frc_e2',
          chapterId: 'fractions',
          difficulty: 'easy',
          question: 'کدام علامت بین دو کسر ۴/۷ و ۶/۷ صحیح است؟',
          options: ['۴/۷ > ۶/۷', '۴/۷ < ۶/۷', '۴/۷ = ۶/۷', 'نامعلوم'],
          correctAnswerIndex: 1,
          explanation: 'چون مخرج‌ها مساوی است و ۴ کمتر از ۶ است: ۴/۷ < ۶/۷.',
          hint: '۴ تکه کمتر از ۶ تکه است.'
        }
      ],
      mediumQuestions: [
        {
          id: 'frc_m2',
          chapterId: 'fractions',
          difficulty: 'medium',
          question: 'کدام کسر از بقیه بزرگ‌تر است؟ (۱/۳، ۱/۵، ۱/۲، ۱/۶)',
          options: ['۱/۳', '۱/۵', '۱/۲', '۱/۶'],
          correctAnswerIndex: 2,
          explanation: 'همه صورت‌ها ۱ هستند، پس کسری که مخرجش از همه کوچک‌تر است (۱/۲) بزرگ‌ترین کسر است.',
          hint: 'نصف (۱/۲) بزرگ‌ترین برش است.'
        }
      ],
      hardQuestions: [
        {
          id: 'frc_h2',
          chapterId: 'fractions',
          difficulty: 'hard',
          question: 'کدام کسر روی محور اعداد دقیقاً وسط ۰ و ۱ قرار می‌گیرد؟',
          options: ['۱/۴', '۲/۴ (یا ۱/۲)', '۳/۴', '۱/۳'],
          correctAnswerIndex: 1,
          explanation: 'نقطه وسط یعنی نصف، که کسر ۱/۲ یا ۲/۴ آن را نشان می‌دهد.',
          hint: 'نصف فاصله بین ۰ و ۱.'
        }
      ]
    }
  ],

  // ==========================================
  // فصل ۴: ضرب و تقسیم
  // ==========================================
  multiplication_division: [
    {
      id: 'mul_l1',
      chapterId: 'multiplication_division',
      title: 'مفهوم ضرب، دسته‌ها و عضوها',
      lessonNumber: 1,
      shortSummary: 'ضرب یعنی جمع سریع دسته‌های مساوی. عبارت ۴ × ۳ یعنی ۴ دسته که در هر دسته ۳ شیء وجود دارد.',
      explanationText: 'به جای اینکه بگوییم ۳ + ۳ + ۳ + ۳ = ۱۲، خیلی سریع می‌نویسیم ۴ × ۳ = ۱۲. عدد اول تعداد دسته‌ها و عدد دوم تعداد اعضای هر دسته است.',
      visualExplanation: {
        emoji: '🧺',
        diagramTitle: 'سبدهای میوه مساوی',
        description: '۳ سبد سیب که در هر سبد ۵ سیب است ➔ ۳ × ۵ = ۱۵ سیب',
        formulaOrRule: 'تعداد کل = تعداد دسته‌ها × تعداد عضوهای هر دسته'
      },
      examples: [
        {
          title: 'مثال ۱: تبدیل جمع تکراری به ضرب',
          problem: 'عبارت جمع ۶ + ۶ + ۶ + ۶ را به صورت یک ضرب بنویسید و حاصل را حساب کنید.',
          solution: 'تعداد دفعات تکرار = ۴ بار\nعدد تکرارشونده = ۶\nضرب: ۴ × ۶ = ۲۴',
          visualCue: '۶ + ۶ + ۶ + ۶ ➔ ۴ × ۶ = ۲۴',
          keyTakeaway: 'ضرب یک راه سریع و راحت برای نجات از جمع‌های طولانی است!'
        },
        {
          title: 'مثال ۲: خاصیت جابه‌جایی در ضرب',
          problem: 'آیا حاصل ۴ × ۵ با ۵ × ۴ برابر است؟ چرا؟',
          solution: 'بله، ۴ × ۵ = ۲۰ و ۵ × ۴ = ۲۰. در ضرب اگر جای دو عدد را عوض کنیم حاصل ضرب هیچ تغییری نمی‌کند (خاصیت جابه‌جایی).',
          visualCue: '۴ × ۵ = ۵ × ۴ = ۲۰',
          keyTakeaway: 'جابه‌جایی در ضرب مثل این است که یک شکلات مستطیلی را بچرخانی؛ تعداد خانه‌هایش عوض نمی‌شود.'
        }
      ],
      commonMistakes: [
        'اشتباه گرفتن ضرب با جمع (مثلاً گفتن ۳ × ۳ = ۶ به جای ۹)',
        'اشتباه در ضرب‌های شامل عدد صفر (حاصل ضرب هر عدد در صفر همیشه صفر است!)'
      ],
      easyQuestions: [
        {
          id: 'mul_e1',
          chapterId: 'multiplication_division',
          difficulty: 'easy',
          question: 'حاصل ضرب ۵ × ۷ کدام است؟',
          options: ['۳۰', '۳۵', '۴۰', '۲۵'],
          correctAnswerIndex: 1,
          explanation: '۵ × ۷ = ۳۵.',
          hint: 'شمارش ۵ تا ۵ تا تا هفتمین عدد: ۵، ۱۰، ۱۵، ۲۰، ۲۵، ۳۰، ۳۵.'
        }
      ],
      mediumQuestions: [
        {
          id: 'mul_m1',
          chapterId: 'multiplication_division',
          difficulty: 'medium',
          question: 'حاصل عبارت (۰ × ۹) + (۱ × ۸) کدام است؟',
          options: ['۰', '۸', '۹', '۱۷'],
          correctAnswerIndex: 1,
          explanation: '۰ × ۹ = ۰ و ۱ × ۸ = ۸. حاصل: ۰ + ۸ = ۸.',
          hint: 'هر عدد ضرب در صفر می‌شود صفر، و ضرب در یک خودش می‌شود.'
        }
      ],
      hardQuestions: [
        {
          id: 'mul_h1',
          chapterId: 'multiplication_division',
          difficulty: 'hard',
          question: 'در یک پارکینگ ۷ ردیف خودرو پارک شده است. اگر در هر ردیف ۶ خودرو و در کنار پارکینگ ۴ خودروی دیگر باشد، کل خودروها چندتاست؟',
          options: ['۴۲', '۴۴', '۴۶', '۴۸'],
          correctAnswerIndex: 2,
          explanation: '۷ × ۶ = ۴۲ خودرو در ردیف‌ها + ۴ خودروی کنار = ۴۶ خودرو.',
          hint: 'اول حاصل ضرب ۷ در ۶ را حساب کن، بعد ۴ تا اضافه کن.'
        }
      ]
    },
    {
      id: 'mul_l2',
      chapterId: 'multiplication_division',
      title: 'مفهوم تقسیم و دسته‌بندی مساوی',
      lessonNumber: 2,
      shortSummary: 'تقسیم یعنی تقسیم کردن یک تعداد کل به دسته‌های مساوی یا پیدا کردن تعداد عضوهای هر دسته.',
      explanationText: 'تقسیم عملیات برعکس ضرب است. برای حل ۲۰ ÷ ۴ از خودمان می‌پرسیم: «چه عددی ضرب در ۴ می‌شود ۲۰؟» پاسخ ۵ است.',
      visualExplanation: {
        emoji: '➗',
        diagramTitle: 'توزیع مساوی بین دوستان',
        description: '۱۸ شکلات بین ۳ نفر به طور مساوی ➔ ۱۸ ÷ ۳ = ۶ شکلات به هر نفر',
        formulaOrRule: 'مقسوم ÷ مقسوم‌علیه = خارج قسمت (حاصل تقسیم)'
      },
      examples: [
        {
          title: 'مثال ۱: حل مسئله تقسیم با ضرب',
          problem: 'حاصل تقسیم ۳۶ ÷ ۶ را با کمک جدول ضرب پیدا کنید.',
          solution: 'از خود می‌پرسیم ۶ ضرب در چه عددی برابر ۳۶ می‌شود؟\n۶ × ۶ = ۳۶\nپس ۳۶ ÷ ۶ = ۶.',
          visualCue: '۳۶ ÷ ۶ = ؟ ➔ ۶ × [۶] = ۳۶',
          keyTakeaway: 'برای استاد شدن در تقسیم، کافی است جدول ضرب را خوب بلد باشی!'
        },
        {
          title: 'مثال ۲: دسته‌بندی با باقیمانده صفر',
          problem: 'مادری می‌خواهد ۲۸ گردو را در کیسه‌های ۴تایی بسته‌بندی کند. او به چند کیسه نیاز دارد؟',
          solution: '۲۸ ÷ ۴ = ۷ کیسه.\nبررسی: ۷ کیسه ۴ تایی = ۲۸ گردو.',
          visualCue: '۲۸ ÷ ۴ = ۷',
          keyTakeaway: 'تعداد کل تقسیم بر اندازه هر دسته، تعداد دسته‌ها را می‌دهد.'
        }
      ],
      commonMistakes: [
        'تقسیم عدد بر صفر (تقسیم بر صفر در ریاضی تعریف‌نشده است!)',
        'اشتباه در نوشتن جای مقسوم و مقسوم‌علیه'
      ],
      easyQuestions: [
        {
          id: 'mul_e2',
          chapterId: 'multiplication_division',
          difficulty: 'easy',
          question: 'حاصل تقسیم ۱۵ ÷ ۳ کدام است؟',
          options: ['۳', '۴', '۵', '۶'],
          correctAnswerIndex: 2,
          explanation: 'چون ۵ × ۳ = ۱۵ می‌شود، حاصل ۵ است.',
          hint: 'چه عددی ضرب در ۳ می‌شود ۱۵؟'
        }
      ],
      mediumQuestions: [
        {
          id: 'mul_m2',
          chapterId: 'multiplication_division',
          difficulty: 'medium',
          question: 'اگر ۴۰ مداد را بین ۸ دانش‌آموز مساوی تقسیم کنیم، به هر نفر چند مداد می‌رسد؟',
          options: ['۴', '۵', '۶', '۸'],
          correctAnswerIndex: 1,
          explanation: '۴۰ ÷ ۸ = ۵ مداد.',
          hint: '۵ × ۸ = ۴۰.'
        }
      ],
      hardQuestions: [
        {
          id: 'mul_h2',
          chapterId: 'multiplication_division',
          difficulty: 'hard',
          question: 'حاصل عبارت (۶ × ۸) ÷ ۲ کدام است؟',
          options: ['۲۴', '۲۸', '۳۲', '۴۸'],
          correctAnswerIndex: 0,
          explanation: '۶ × ۸ = ۴۸، سپس ۴۸ ÷ ۲ = ۲۴ (نصف ۴۸).',
          hint: 'ابتدا ۶ × ۸ را حساب کن (۴۸)، سپس حاصل را نصف کن.'
        }
      ]
    }
  ],

  // ==========================================
  // فصل ۵: محیط و مساحت
  // ==========================================
  perimeter_area: [
    {
      id: 'pa_l1',
      chapterId: 'perimeter_area',
      title: 'محیط اشکال هندسی (دور تا دور)',
      lessonNumber: 1,
      shortSummary: 'محیط یعنی مجموع طول تمام ضلع‌های دور تا دور یک شکل هندسی، درست مثل کشیدن یک ریسه یا حصار دور یک باغچه.',
      explanationText: 'برای به دست آوردن محیط هر شکل، کافی است اندازه همه خط‌های دور آن را با هم جمع کنیم.',
      visualExplanation: {
        emoji: '📐',
        diagramTitle: 'محیط = حصار دور تا دور شکل',
        description: 'محیط مربع = یک ضلع × ۴\nمحیط مستطیل = (طول + عرض) × ۲ یا (طول + طول + عرض + عرض)',
        formulaOrRule: 'محیط = مجموع طول تمام اضلاع دور شکل'
      },
      examples: [
        {
          title: 'مثال ۱: محیط مربع',
          problem: 'محیط مربعی به ضلع ۶ سانتی‌متر چقدر است؟',
          solution: 'چون مربع ۴ ضلع مساوی دارد: ۶ × ۴ = ۲۴ سانتی‌متر\nیا: ۶ + ۶ + ۶ + ۶ = ۲۴ سانتی‌متر.',
          visualCue: '۶ + ۶ + ۶ + ۶ = ۲۴ سانتی‌متر',
          keyTakeaway: 'برای مربع کافی است یک ضلع را در ۴ ضرب کنی.'
        },
        {
          title: 'مثال ۲: محیط مستطیل',
          problem: 'مستطیلی دارای طول ۸ سانتی‌متر و عرض ۵ سانتی‌متر است. محیط آن چقدر است؟',
          solution: 'فرمول: (طول + عرض) × ۲\n(۸ + ۵) × ۲ = ۱۳ × ۲ = ۲۶ سانتی‌متر.',
          visualCue: '(۸ + ۵) × ۲ = ۲۶ سانتی‌متر',
          keyTakeaway: 'طول و عرض را با هم جمع کن و سپس دو برابر کن.'
        }
      ],
      commonMistakes: [
        'اشتباه گرفتن محیط با مساحت (ضرب کردن طول در عرض به جای جمع)',
        'فراموش کردن جمع کردن دو ضلع روبه‌رو در مستطیل'
      ],
      easyQuestions: [
        {
          id: 'pa_e1',
          chapterId: 'perimeter_area',
          difficulty: 'easy',
          question: 'محیط مثلث متساوی‌الاضلاعی به ضلع ۵ سانتی‌متر چقدر است؟',
          options: ['۱۰ سانتی‌متر', '۱۵ سانتی‌متر', '۲۰ سانتی‌متر', '۲۵ سانتی‌متر'],
          correctAnswerIndex: 1,
          explanation: 'مثلث متساوی‌الاضلاع ۳ ضلع مساوی دارد: ۵ × ۳ = ۱۵ سانتی‌متر.',
          hint: '۳ تا ۵ تایی.'
        }
      ],
      mediumQuestions: [
        {
          id: 'pa_m1',
          chapterId: 'perimeter_area',
          difficulty: 'medium',
          question: 'محیط مستطیلی با طول ۱۰ متر و عرض ۴ متر چقدر است؟',
          options: ['۱۴ متر', '۲۸ متر', '۴۰ متر', '۲۰ متر'],
          correctAnswerIndex: 1,
          explanation: '(۱۰ + ۴) × ۲ = ۱۴ × ۲ = ۲۸ متر.',
          hint: '(طول + عرض) را در ۲ ضرب کن.'
        }
      ],
      hardQuestions: [
        {
          id: 'pa_h1',
          chapterId: 'perimeter_area',
          difficulty: 'hard',
          question: 'محیط مربعی ۳۶ سانتی‌متر است. طول هر ضلع این مربع چند سانتی‌متر است؟',
          options: ['۶', '۸', '۹', '۱۲'],
          correctAnswerIndex: 2,
          explanation: 'چون مربع ۴ ضلع مساوی دارد: ۳۶ ÷ ۴ = ۹ سانتی‌متر.',
          hint: '۳۶ را بر ۴ تقسیم کن.'
        }
      ]
    },
    {
      id: 'pa_l2',
      chapterId: 'perimeter_area',
      title: 'مساحت اشکال هندسی (سطح داخل)',
      lessonNumber: 2,
      shortSummary: 'مساحت یعنی اندازه سطح داخل یک شکل. برای اندازه‌گیری مساحت می‌شماریم چند مربع واحد (کاشی) سطح شکل را می‌پوشاند.',
      explanationText: 'واحد مساحت، سانتی‌متر مربع است. برای مستطیل، ردیف‌ها و ستون‌های کاشی را در هم ضرب می‌کنیم (طول × عرض). برای مربع، یک ضلع × خودش.',
      visualExplanation: {
        emoji: '🟩',
        diagramTitle: 'مساحت = کاشی‌کاری سطح داخل',
        description: 'مساحت مربع = یک ضلع × خودش\nمساحت مستطیل = طول × عرض',
        formulaOrRule: 'مساحت = اندازه سطح پوشانده‌شده با مربع‌های واحد'
      },
      examples: [
        {
          title: 'مثال ۱: مساحت مستطیل',
          problem: 'مساحت اتاقی با طول ۶ متر و عرض ۴ متر چقدر است؟',
          solution: 'مساحت مستطیل = طول × عرض = ۶ × ۴ = ۲۴ متر مربع.',
          visualCue: '۶ × ۴ = ۲۴ مربع واحد',
          keyTakeaway: 'مساحت یعنی ضرب دو بعد شکل در هم.'
        },
        {
          title: 'مثال ۲: تفاوت محیط و مساحت',
          problem: 'برای یک مربع به ضلع ۴ سانتی‌متر، محیط و مساحت را مقایسه کنید.',
          solution: 'محیط = ۴ × ۴ = ۱۶ سانتی‌متر (خط دور شکل)\nمساحت = ۴ × ۴ = ۱۶ سانتی‌متر مربع (سطح داخل شکل)\nاگرچه عددها ۱۶ شده‌اند اما واحدهای آن‌ها فرق دارد (سانتی‌متر در برابر سانتی‌متر مربع).',
          visualCue: 'محیط: خط دور | مساحت: سطح پر داخل',
          keyTakeaway: 'محیط طول خط است و مساحت اندازه سطح پرشده است.'
        }
      ],
      commonMistakes: [
        'نوشتن واحد مساحت به صورت سانتی‌متر به جای سانتی‌متر مربع',
        'جمع کردن طول و عرض به جای ضرب کردن آن‌ها برای مساحت'
      ],
      easyQuestions: [
        {
          id: 'pa_e2',
          chapterId: 'perimeter_area',
          difficulty: 'easy',
          question: 'مساحت مربعی به ضلع ۷ سانتی‌متر کدام است؟',
          options: ['۲۸ سانتی‌متر مربع', '۴۹ سانتی‌متر مربع', '۱۴ سانتی‌متر مربع', '۲۱ سانتی‌متر مربع'],
          correctAnswerIndex: 1,
          explanation: 'مساحت مربع = یک ضلع × خودش = ۷ × ۷ = ۴۹ سانتی‌متر مربع.',
          hint: '۷ را در خودش ضرب کن.'
        }
      ],
      mediumQuestions: [
        {
          id: 'pa_m2',
          chapterId: 'perimeter_area',
          difficulty: 'medium',
          question: 'مساحت مستطیلی با طول ۹ سانتی‌متر و عرض ۵ سانتی‌متر کدام است؟',
          options: ['۲۸ سانتی‌متر مربع', '۴۵ سانتی‌متر مربع', '۱۴ سانتی‌متر مربع', '۹۰ سانتی‌متر مربع'],
          correctAnswerIndex: 1,
          explanation: 'طول × عرض = ۹ × ۵ = ۴۵ سانتی‌متر مربع.',
          hint: '۹ را در ۵ ضرب کن.'
        }
      ],
      hardQuestions: [
        {
          id: 'pa_h2',
          chapterId: 'perimeter_area',
          difficulty: 'hard',
          question: 'مساحت مستطیلی ۳۰ سانتی‌متر مربع است. اگر عرض آن ۵ سانتی‌متر باشد، محیط این مستطیل چقدر است؟',
          options: ['۱۱ سانتی‌متر', '۲۲ سانتی‌متر', '۲۴ سانتی‌متر', '۲۶ سانتی‌متر'],
          correctAnswerIndex: 1,
          explanation: 'طول = ۳۰ ÷ ۵ = ۶ سانتی‌متر. محیط = (۶ + ۵) × ۲ = ۱۱ × ۲ = ۲۲ سانتی‌متر.',
          hint: 'ابتدا با تقسیم مساحت بر ۵ طول را به دست آور (۶)، سپس محیط را حساب کن.'
        }
      ]
    }
  ],

  // ==========================================
  // فصل ۶: جمع و تفریق تکنیکی
  // ==========================================
  regrouping: [
    {
      id: 'reg_l1',
      chapterId: 'regrouping',
      title: 'جمع تکنیکی اعداد ۴ رقمی با انتقال',
      lessonNumber: 1,
      shortSummary: 'در جمع تکنیکی، همیشه از ستون یکان شروع می‌کنیم. اگر حاصل جمع ستونی بیشتر از ۹ شد، رقم دهگان آن را به ستون بعدی انتقال می‌دهیم.',
      explanationText: 'ارزش ارقام را زیر هم در یک ستون مرتب می‌نویسیم (یکان زیر یکان، دهگان زیر دهگان و ...). بسته ده‌تایی ساخته‌شده به همسایه سمت چپ منتقل می‌شود.',
      visualExplanation: {
        emoji: '➕',
        diagramTitle: 'انتقال بسته‌های ده‌تایی و صدتایی',
        description: '  ¹  ¹\n  ۳ ۷ ۶ ۵\n+ ۲ ۴ ۸ ۳\n---------\n  ۶ ۲ ۴ ۸',
        formulaOrRule: 'جمع از راست به چپ + انتقال رقم ده‌تایی به ستون بعدی در صورت >= ۱۰'
      },
      examples: [
        {
          title: 'مثال ۱: جمع ۴ رقمی با انتقال',
          problem: 'حاصل جمع ۲۵۸۴ + ۳۷۴۹ را به دست آورید.',
          solution: 'یکان: ۴ + ۹ = ۱۳ (۳ می‌ماند، ۱ منتقل می‌شود)\nدهگان: ۸ + ۴ + ۱ = ۱۳ (۳ می‌ماند، ۱ منتقل می‌شود)\nصدگان: ۵ + ۷ + ۱ = ۱۳ (۳ می‌ماند، ۱ منتقل می‌شود)\nهزارگان: ۲ + ۳ + ۱ = ۶\nحاصل = ۶۳۳۳',
          visualCue: '۲۵۸۴ + ۳۷۴۹ = ۶۳۳۳',
          keyTakeaway: 'همیشه بسته‌های انتقالی (۱ کوچک بالای ستون) را فراموش نکن!'
        }
      ],
      commonMistakes: [
        'فراموش کردن اضافه کردن عدد انتقالی در ستون بعدی',
        'نوشتن دو رقم حاصل در یک ستون بدون انتقال'
      ],
      easyQuestions: [
        {
          id: 'reg_e1',
          chapterId: 'regrouping',
          difficulty: 'easy',
          question: 'حاصل جمع ۳۵۰۰ + ۲۴۰۰ کدام است؟',
          options: ['۵۸۰۰', '۵۹۰۰', '۶۰۰۰', '۵۷۰۰'],
          correctAnswerIndex: 1,
          explanation: '۳۵۰۰ + ۲۴۰۰ = ۵۹۰۰.',
          hint: 'صدگان ۵+۴=۹ و هزارگان ۳+۲=۵.'
        }
      ],
      mediumQuestions: [
        {
          id: 'reg_m1',
          chapterId: 'regrouping',
          difficulty: 'medium',
          question: 'حاصل جمع ۴۸۷۵ + ۲۳۶۸ کدام است؟',
          options: ['۷۲۴۳', '۷۱۴۳', '۷۲۳۳', '۶۲۴۳'],
          correctAnswerIndex: 0,
          explanation: '۴۸۷۵ + ۲۳۶۸ = ۷۲۴۳.',
          hint: 'مرحله به مرحله از یکان جمع بزن و رقم‌های انتقالی را بالا بگذار.'
        }
      ],
      hardQuestions: [
        {
          id: 'reg_h1',
          chapterId: 'regrouping',
          difficulty: 'hard',
          question: 'در تساوی ۴۵۰۰ + ؟ = ۸۲۵۰ عدد مجهول چیست؟',
          options: ['۳۶۵۰', '۳۷۵۰', '۳۸۵۰', '۴۲۵۰'],
          correctAnswerIndex: 1,
          explanation: '۸۲۵۰ - ۴۵۰۰ = ۳۷۵۰.',
          hint: 'از ۸۲۵۰ مقدار ۴۵۰۰ را کم کن.'
        }
      ]
    },
    {
      id: 'reg_l2',
      chapterId: 'regrouping',
      title: 'تفریق تکنیکی با قرض گرفتن از صفرها',
      lessonNumber: 2,
      shortSummary: 'اگر رقم بالایی از پایینی کوچک‌تر باشد، از همسایه سمت چپ ۱ بسته قرض می‌گیریم. وقتی همسایه صفر است، از نزدیک‌ترین مرتبه بزرگ‌تر کمک می‌گیریم.',
      explanationText: 'وقتی از ۱۰۰۰ قرض می‌گیریم، صفرها تبدیل به ۹ می‌شوند و آخرین صفر تبدیل به ۱۰ می‌شود.',
      visualExplanation: {
        emoji: '➖',
        diagramTitle: 'زنجیره قرض گرفتن از صفرها',
        description: '  ۴ ⁹ ⁹ ¹⁰\n  ۵ ۰ ۰ ۰\n- ۲ ۳ ۴ ۵\n---------\n  ۲ ۶ ۵ ۵',
        formulaOrRule: 'قرض گرفتن از همسایه چپ: عدد همسایه ۱ واحد کم و به عدد فعلی ۱۰ واحد اضافه می‌شود'
      },
      examples: [
        {
          title: 'مثال ۱: تفریق از روی صفرها',
          problem: 'حاصل تفریق ۴۰۰۰ - ۱۶۵۰ را حساب کنید.',
          solution: '۴۰۰۰ منهای ۱۰۰۰ می‌شود ۳۰۰۰.\n۳۰۰۰ منهای ۶۵۰ می‌شود ۲۳۵۰.\nپاسخ: ۲۳۵۰.',
          visualCue: '۴۰۰۰ - ۱۶۵۰ = ۲۳۵۰',
          keyTakeaway: 'برای تفریق ذهنی از صفرها، اول هزارتایی‌ها و بعد باقی را کم کن.'
        }
      ],
      commonMistakes: [
        'تفریق کردن رقم کوچک از بزرگ به جای قرض گرفتن (مثلاً گفتن ۰ - ۵ = ۵!)',
        'فراموش کردن تبدیل ۱۰ به ۹ در صفرهای میانی'
      ],
      easyQuestions: [
        {
          id: 'reg_e2',
          chapterId: 'regrouping',
          difficulty: 'easy',
          question: 'حاصل تفریق ۶۰۰۰ - ۲۵۰۰ کدام است؟',
          options: ['۳۰۰۰', '۳۵۰۰', '۴۰۰۰', '۴۵۰۰'],
          correctAnswerIndex: 1,
          explanation: '۶۰۰۰ - ۲۰۰۰ = ۴۰۰۰، منهای ۵۰۰ = ۳۵۰۰.',
          hint: '۶۰۰۰ منهای ۲۵۰۰.'
        }
      ],
      mediumQuestions: [
        {
          id: 'reg_m2',
          chapterId: 'regrouping',
          difficulty: 'medium',
          question: 'حاصل تفریق ۷۲۰۵ - ۳۴۸۰ کدام است؟',
          options: ['۳۷۲۵', '۳۶۲۵', '۳۸۲۵', '۴۷۲۵'],
          correctAnswerIndex: 0,
          explanation: '۷۲۰۵ - ۳۴۸۰ = ۳۷۲۵.',
          hint: 'از ستون یکان شروع کن، برای دهگان از صدگان قرض بگیر.'
        }
      ],
      hardQuestions: [
        {
          id: 'reg_h2',
          chapterId: 'regrouping',
          difficulty: 'hard',
          question: 'اختلاف بزرگ‌ترین عدد ۴ رقمی با کوچک‌ترین عدد ۴ رقمی بدون تکرار ارقام کدام است؟',
          options: ['۸۹۷۶', '۸۸۹۹', '۸۹۵۳', '۸۹۶۵'],
          correctAnswerIndex: 0,
          explanation: 'بزرگ‌ترین ۴ رقمی = ۹۹۹۹. کوچک‌ترین ۴ رقمی بدون تکرار = ۱۰۲۳. اختلاف: ۹۹۹۹ - ۱۰۲۳ = ۸۹۷۶.',
          hint: '۹۹۹۹ منهای ۱۰۲۳.'
        }
      ]
    }
  ],

  // ==========================================
  // فصل ۷: آمار و احتمال
  // ==========================================
  statistics: [
    {
      id: 'sta_l1',
      chapterId: 'statistics',
      title: 'چوب‌خط، جدول داده‌ها و نمودار ستونی',
      lessonNumber: 1,
      shortSummary: 'چوب‌خط‌ها در دسته‌های ۵تایی به ما کمک می‌کنند اطلاعات را سریع و تمیز بشماریم. نمودار ستونی مقایسه سریع داده‌ها را با چشم ممکن می‌سازد.',
      explanationText: 'در چوب‌خط، ۴ خط عمودی می‌کشیم و خط پنجم را مورب روی آن‌ها می‌کشیم (卌 = ۵). در نمودار ستونی، ارتفاع هر ستون نشان‌دهنده فراوانی آن موضوع است.',
      visualExplanation: {
        emoji: '📊',
        diagramTitle: 'دسته‌های ۵ تایی چوب‌خط و میله‌های نمودار',
        description: '卌 = ۵ | 卌 卌 = ۱۰ | 卌 卌 ||| = ۱۳\nستون بلندتر = بیشترین تعداد | ستون کوتاه‌تر = کمترین تعداد',
        formulaOrRule: 'هر بسته کامل چوب‌خط = ۵ واحد'
      },
      examples: [
        {
          title: 'مثال ۱: خواندن چوب‌خط',
          problem: 'علامت چوب‌خط 卌 卌 卌 |||| چه عددی را نشان می‌دهد؟',
          solution: '۳ دسته ۵ تایی = ۳ × ۵ = ۱۵\n۴ خط تکی = ۴\nمجموع: ۱۵ + ۴ = ۱۹.',
          visualCue: '۵ + ۵ + ۵ + ۴ = ۱۹',
          keyTakeaway: 'دسته‌های ۵ تایی را با ضرب سریع در ۵ بشمار.'
        }
      ],
      commonMistakes: [
        'کشیدن خط پنجم به صورت عمودی به جای مورب',
        'اشتباه در خواندن اعداد محور عمودی در نمودار ستونی'
      ],
      easyQuestions: [
        {
          id: 'sta_e1',
          chapterId: 'statistics',
          difficulty: 'easy',
          question: 'علامت "卌 卌 ||" نشان‌دهنده چه عددی است؟',
          options: ['۱۰', '۱۱', '۱۲', '۱۳'],
          correctAnswerIndex: 2,
          explanation: 'دو بسته ۵ تایی (۱۰) به اضافه ۲ خط تکی = ۱۲.',
          hint: '۵ + ۵ + ۲.'
        }
      ],
      mediumQuestions: [
        {
          id: 'sta_m1',
          chapterId: 'statistics',
          difficulty: 'medium',
          question: 'در یک نمودار ستونی میوه مورد علاقه دانش‌آموزان: سیب ۸ نفر، موز ۱۲ نفر و پرتقال ۶ نفر است. چند نفر موز را بیشتر از پرتقال انتخاب کرده‌اند؟',
          options: ['۴ نفر', '۶ نفر', '۸ نفر', '۲ نفر'],
          correctAnswerIndex: 1,
          explanation: '۱۲ - ۶ = ۶ نفر.',
          hint: 'تعداد موز (۱۲) منهای تعداد پرتقال (۶).'
        }
      ],
      hardQuestions: [
        {
          id: 'sta_h1',
          chapterId: 'statistics',
          difficulty: 'hard',
          question: 'در کلاسی با ۲۸ دانش‌آموز، چوب‌خط دانش‌آموزانی که عینک دارند "卌 ||" است. چند نفر عینک ندارند؟',
          options: ['۲۰ نفر', '۲۱ نفر', '۲۲ نفر', '۲۳ نفر'],
          correctAnswerIndex: 1,
          explanation: 'عینکی‌ها: ۵ + ۲ = ۷ نفر. بدون عینک: ۲۸ - ۷ = ۲۱ نفر.',
          hint: 'ابتدا ۷ نفر عینکی را از ۲۸ کم کن.'
        }
      ]
    },
    {
      id: 'sta_l2',
      chapterId: 'statistics',
      title: 'مفهوم احتمال، شانس و چرخنده‌ها',
      lessonNumber: 2,
      shortSummary: 'احتمال رخداد یک اتفاق می‌تواند «حتماً»، «ممکن» یا «غیرممکن» باشد. هر چه سهم یک رنگ در چرخنده بیشتر باشد، شانس ایستادن عقربه روی آن بیشتر است.',
      explanationText: 'اتفاق حتمی یعنی حتماً و صددرصد رخ می‌دهد (مثل آمدن عدد کمتر از ۷ در تاس). اتفاق غیرممکن یعنی هرگز رخ نمی‌دهد (مثل آمدن عدد ۸ در تاس معمولی).',
      visualExplanation: {
        emoji: '🎯',
        diagramTitle: 'چرخنده رنگی شانس',
        description: 'چرخنده با ۶ بخش آبی و ۲ بخش قرمز ➔ شانس آبی بیشتر از قرمز است.\nکیسه فقط با مهره‌های سبز ➔ بیرون آمدن مهره سبز حتمی است.',
        formulaOrRule: 'شانس بیشتر = تعداد بخش‌های بیشتر | غیرممکن = تعداد صفر'
      },
      examples: [
        {
          title: 'مثال ۱: بررسی حالت‌های احتمال',
          problem: 'در یک جعبه فقط ۵ سیب قرمز وجود دارد. احتمال اینکه با چشم بسته یک پرتقال برداریم چیست؟',
          solution: 'چون هیچ پرتقالی در جعبه نیست، این اتفاق «غیرممکن» است.',
          visualCue: 'پرتقال در جعبه سیب ➔ غیرممکن ❌',
          keyTakeaway: 'اگر گزینه‌ای وجود نداشته باشد، رخداد آن غیرممکن است.'
        }
      ],
      commonMistakes: [
        'اشتباه گرفتن اتفاق «ممکن» با اتفاق «حتمی»',
        'فکر کردن به اینکه شانس کم یعنی غیرممکن بودن'
      ],
      easyQuestions: [
        {
          id: 'sta_e2',
          chapterId: 'statistics',
          difficulty: 'easy',
          question: 'اگر تاسی را بیندازیم، احتمال آمدن عدد ۷ چگونه است؟',
          options: ['حتماً', 'ممکن', 'غیرممکن', 'شانس زیاد'],
          correctAnswerIndex: 2,
          explanation: 'تاس فقط اعداد ۱ تا ۶ دارد، پس آمدن عدد ۷ غیرممکن است.',
          hint: 'تاس اعداد ۱ تا ۶ دارد.'
        }
      ],
      mediumQuestions: [
        {
          id: 'sta_m2',
          chapterId: 'statistics',
          difficulty: 'medium',
          question: 'روی یک چرخنده ۴ قسمت زرد و ۱ قسمت آبی وجود دارد. کدام جمله درست است؟',
          options: ['شانس آبی بیشتر است', 'شانس زرد بیشتر است', 'شانس هر دو برابر است', 'آمدن آبی غیرممکن است'],
          correctAnswerIndex: 1,
          explanation: 'چون مساحت و تعداد بخش‌های زرد (۴) بیشتر از آبی (۱) است، شانس زرد بیشتر است.',
          hint: 'رنگ با بخش‌های بیشتر شانس بیشتری دارد.'
        }
      ],
      hardQuestions: [
        {
          id: 'sta_h2',
          chapterId: 'statistics',
          difficulty: 'hard',
          question: 'در کیسه‌ای ۳ مهره سفید و ۳ مهره سیاه است. بدون نگاه کردن یک مهره برمی‌داریم. احتمال آمدن کدام رنگ بیشتر است؟',
          options: ['سفید', 'سیاه', 'شانس هر دو کاملاً مساوی است', 'غیرممکن است'],
          correctAnswerIndex: 2,
          explanation: 'چون تعداد مهره‌های سفید و سیاه برابر است (۳ = ۳)، شانس هر دو برابر است.',
          hint: 'تعداد هر دو رنگ ۳ تاست.'
        }
      ]
    }
  ],

  // ==========================================
  // فصل ۸: ضرب اعداد بزرگ‌تر
  // ==========================================
  advanced_multiplication: [
    {
      id: 'amul_l1',
      chapterId: 'advanced_multiplication',
      title: 'ضرب در ۱۰، ۱۰۰، ۱۰۰۰ و خواص صفرها',
      lessonNumber: 1,
      shortSummary: 'برای ضرب هر عدد در ۱۰، ۱۰۰ یا ۱۰۰۰، عدد را در ۱ ضرب کرده و به تعداد صفرهای آن، صفر در سمت راست عدد قرار می‌دهیم.',
      explanationText: 'این قاعده جادوی صفرهاست: در ضرب ۵ × ۳۰، ابتدا ۵ × ۳ = ۱۵ را حساب می‌کنیم و سپس یک صفر جلوی آن می‌گذاریم: ۱۵۰.',
      visualExplanation: {
        emoji: '⚡',
        diagramTitle: 'شعبده‌بازی سریع با صفرها',
        description: '۷ × ۱۰ = ۷۰ | ۷ × ۱۰۰ = ۷۰۰ | ۷ × ۱۰۰۰ = ۷۰۰۰\n۶۰ × ۴۰ = (۶ × ۴) و دو تا صفر = ۲۴۰۰',
        formulaOrRule: 'ضرب در مضارب ۱۰ = ضرب اعداد غیر صفر + قرار دادن مجموع صفرها در انتها'
      },
      examples: [
        {
          title: 'مثال ۱: ضرب دو عدد دارای صفر',
          problem: 'حاصل ضرب ۵۰ × ۶۰ را پیدا کنید.',
          solution: 'مرحله ۱: اعداد غیر صفر را در هم ضرب می‌کنیم: ۵ × ۶ = ۳۰\nمرحله ۲: تعداد کل صفرها (۲ صفر) را جلوی ۳۰ قرار می‌دهیم.\nحاصل = ۳۰۰۰.',
          visualCue: '۵[۰] × ۶[۰] ➔ ۳۰ + ۰۰ ➔ ۳۰۰۰',
          keyTakeaway: 'دقت کن که صفر خود عدد ۳۰ جدا از دو صفر دیگر است!'
        }
      ],
      commonMistakes: [
        'گم کردن یکی از صفرها در اعدادی که حاصل ضربشان خودش صفر دارد (مثل ۵ × ۶ = ۳۰)',
        'جمع کردن صفرها با عدد به جای قرار دادن در انتهای آن'
      ],
      easyQuestions: [
        {
          id: 'amul_e1',
          chapterId: 'advanced_multiplication',
          difficulty: 'easy',
          question: 'حاصل ضرب ۸ × ۱۰۰ کدام است؟',
          options: ['۸۰', '۸۰۰', '۸۰۰۰', '۸۸'],
          correctAnswerIndex: 1,
          explanation: '۸ × ۱۰۰ = ۸۰۰.',
          hint: 'دو تا صفر جلوی ۸ بگذار.'
        }
      ],
      mediumQuestions: [
        {
          id: 'amul_m1',
          chapterId: 'advanced_multiplication',
          difficulty: 'medium',
          question: 'حاصل ضرب ۴۰ × ۷۰ کدام است؟',
          options: ['۲۸۰', '۲۸۰۰', '۲۸۰۰۰', '۱۱۰۰'],
          correctAnswerIndex: 1,
          explanation: '۴ × ۷ = ۲۸ به همراه دو صفر ➔ ۲۸۰۰.',
          hint: '۴ را در ۷ ضرب کن (۲۸) و دو تا صفر اضافه کن.'
        }
      ],
      hardQuestions: [
        {
          id: 'amul_h1',
          chapterId: 'advanced_multiplication',
          difficulty: 'hard',
          question: 'یک جعبه ۵۰ بسته مداد ۱۲ تایی دارد. این جعبه در مجموع چند مداد دارد؟',
          options: ['۵۰۰', '۵۵۰', '۶۰۰', '۶۵۰'],
          correctAnswerIndex: 2,
          explanation: '۵۰ × ۱۲ = (۵ × ۱۲) با یک صفر = ۶۰ با یک صفر = ۶۰۰ مداد.',
          hint: '۵ را در ۱۲ ضرب کن (۶۰)، سپس صفر ۵۰ را جلوی آن بگذار.'
        }
      ]
    },
    {
      id: 'amul_l2',
      chapterId: 'advanced_multiplication',
      title: 'ضرب دو رقم در یک رقم و راهبردهای گسترده‌نویسی',
      lessonNumber: 2,
      shortSummary: 'برای ضرب دو رقم در یک رقم (مثلاً ۲۴ × ۳)، عدد دو رقمی را به دهگان و یکان گسترده می‌کنیم: (۲۰ × ۳) + (۴ × ۳).',
      explanationText: 'روش گسترده‌نویسی و مساحتی به ما کمک می‌کند بدون حفظ کردن فرمول‌های پیچیده، ضرب‌های بزرگ را به صورت ذهنی و مطمئن حل کنیم.',
      visualExplanation: {
        emoji: '🧠',
        diagramTitle: 'مستطیل گسترده‌نویسی ضرب',
        description: '  ۳۴ × ۳ = (۳۰ × ۳) + (۴ × ۳)\n  ۹۰ + ۱۲ = ۱۰۲',
        formulaOrRule: '(دهگان × عدد) + (یکان × عدد) = حاصل کل'
      },
      examples: [
        {
          title: 'مثال ۱: ضرب دو رقمی با گسترده‌نویسی',
          problem: 'حاصل ضرب ۴۳ × ۵ را به روش گسترده به دست آورید.',
          solution: '۴۳ = ۴۰ + ۳\n۵ × ۴۰ = ۲۰۰\n۵ × ۳ = ۱۵\nمجموع: ۲۰۰ + ۱۵ = ۲۱۵.',
          visualCue: '۵ × (۴۰ + ۳) = ۲۰۰ + ۱۵ = ۲۱۵',
          keyTakeaway: 'اول دهگان را ضرب کن، بعد یکان را، و در نهایت حاصل را جمع کن.'
        }
      ],
      commonMistakes: [
        'فراموش کردن ضرب کردن دهگان',
        'اشتباه در جمع نهایی بخش‌های ضرب'
      ],
      easyQuestions: [
        {
          id: 'amul_e2',
          chapterId: 'advanced_multiplication',
          difficulty: 'easy',
          question: 'حاصل ضرب ۲۱ × ۴ کدام است؟',
          options: ['۸۱', '۸۲', '۸۴', '۸۸'],
          correctAnswerIndex: 2,
          explanation: '۲۰ × ۴ = ۸۰ و ۱ × ۴ = ۴ ➔ ۸۰ + ۴ = ۸۴.',
          hint: '۲۰ × ۴ = ۸۰، سپس ۴ تا اضافه کن.'
        }
      ],
      mediumQuestions: [
        {
          id: 'amul_m2',
          chapterId: 'advanced_multiplication',
          difficulty: 'medium',
          question: 'حاصل ضرب ۵۶ × ۳ کدام است؟',
          options: ['۱۵۸', '۱۶۸', '۱۷۸', '۱۴۸'],
          correctAnswerIndex: 1,
          explanation: '۵۰ × ۳ = ۱۵۰ و ۶ × ۳ = ۱۸ ➔ ۱۵۰ + ۱۸ = ۱۶۸.',
          hint: '۵۰ × ۳ = ۱۵۰، ۶ × ۳ = ۱۸. ۱۵۰ + ۱۸.'
        }
      ],
      hardQuestions: [
        {
          id: 'amul_h2',
          chapterId: 'advanced_multiplication',
          difficulty: 'hard',
          question: 'یک سالن نمایش ۴ ردیف صندلی دارد و در هر ردیف ۲۸ صندلی چیده شده است. کل صندلی‌ها چند عدد است؟',
          options: ['۱۰۲', '۱۱۲', '۱۲۲', '۱۱۸'],
          correctAnswerIndex: 1,
          explanation: '۴ × ۲۰ = ۸۰ و ۴ × ۸ = ۳۲ ➔ ۸۰ + ۳۲ = ۱۱۲ صندلی.',
          hint: '۴ تا ۲۵ تایی می‌شود ۱۰۰، ۴ تا ۳ تایی هم ۱۲ ➔ ۱۱۲!'
        }
      ]
    }
  ]
};
