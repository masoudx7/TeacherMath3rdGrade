import React, { useState, useRef } from 'react';
import { playSound } from '../utils/sound';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  FileSearch, 
  CheckCircle2, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Star, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface ImageSolverProps {
  soundEnabled: boolean;
  onAddStars: (count: number) => void;
  onIncrementScanned: () => void;
}

export const ImageSolver: React.FC<ImageSolverProps> = ({
  soundEnabled,
  onAddStars,
  onIncrementScanned,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [userNote, setUserNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('لطفاً یک فایل تصویری (عکس) انتخاب کنید.');
      return;
    }
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setResult(null);
      setError(null);
      playSound('pop', soundEnabled);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    playSound('click', soundEnabled);

    try {
      const res = await fetch('/api/tutor/solve-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: mimeType,
          userQuestion: userNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطا در تحلیل تصویر');
      }

      setResult(data.explanation);
      playSound('badge', soundEnabled);
      onAddStars(2); // 2 stars for scanning and solving an image!
      onIncrementScanned();
    } catch (err: any) {
      setError(err.message || 'مشکل در خواندن عکس ریاضی. لطفاً تصویر شفاف‌تری انتخاب کنید.');
      playSound('wrong', soundEnabled);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakResult = () => {
    if (!result) return;
    if (!('speechSynthesis' in window)) {
      alert('مرورگر شما از پخش صوتی پشتیبانی نمی‌کند.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanedText = result.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'fa-IR';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 dir-rtl">
      {/* Title Header */}
      <div className="bg-white rounded-[2rem] border-4 border-[#A29BFE] p-6 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FF6B6B] text-white flex items-center justify-center text-3xl shadow-xs shrink-0">
            📸
          </div>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2D3436]">اسکن و حل تصویری مسئله با هوش مصنوعی</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              تصویر مسئله ریاضی را آپلود کن یا عکس بگیر تا استاد دانا قدم به قدم آن را توضیح دهد.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#FFEAA7] text-[#D35400] font-bold px-4 py-2 rounded-full border-2 border-[#FDCB6E] text-xs shadow-xs shrink-0">
          <Star className="w-4 h-4 fill-amber-400 text-amber-600" />
          <span>۲ امتیاز پاداش اسکن!</span>
        </div>
      </div>

      {/* Main Upload / Preview Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dropzone & Preview */}
        <div className="bg-[#FFF5F5] border-4 border-dashed border-[#D63031] border-opacity-30 hover:bg-white rounded-[2rem] p-6 transition-all flex flex-col items-center justify-center text-center shadow-xs relative group min-h-[300px]"
             onDragOver={(e) => e.preventDefault()}
             onDrop={handleDrop}
        >
          {selectedImage ? (
            <div className="w-full space-y-4">
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 max-h-[280px] bg-slate-100 flex items-center justify-center p-2">
                <img
                  src={selectedImage}
                  alt="مسئله ریاضی"
                  className="max-h-[250px] object-contain rounded-xl"
                />
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>تغییر عکس</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-6">
              <div className="text-6xl mb-2 animate-bounce">📸</div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#D63031]">تصویر مسئله را اینجا بگذار یا عکس بگیر</h3>
                <p className="text-xs text-slate-400">فرمت‌های پشتیبانی شده: JPG, PNG</p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#FF7675] hover:bg-[#d63031] text-white font-bold px-6 py-3.5 rounded-2xl shadow-[0_4px_0_0_#d63031] flex items-center gap-2 mx-auto cursor-pointer transition-all hover:translate-y-0.5 active:shadow-none"
              >
                <Upload className="w-5 h-5" />
                <span>انتخاب عکس مسئله</span>
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Input Details & Analyze Trigger */}
        <div className="bg-white border-4 border-[#A29BFE] rounded-[2rem] p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h3 className="font-bold text-[#2D3436] text-base sm:text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#6C5CE7]" />
              <span>یا سوالت رو دقیق‌تر بنویس...</span>
            </h3>

            <textarea
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="اگر نکته خاصی روی این عکس هست برام بنویس (مثلاً: سوال شماره ۳)..."
              rows={4}
              className="w-full bg-[#F0F2F5] border-none rounded-2xl p-4 text-sm font-medium text-[#2D3436] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] transition-all dir-rtl"
            />

            <div className="bg-[#E1F5FE] border-2 border-[#74B9FF] rounded-2xl p-3 text-xs text-[#01579B] flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#00B0FF] shrink-0 mt-0.5" />
              <span>راهنمایی: مطمئن شو اعداد و اشکال روی برگه واضح و خوانا بافتاده باشند.</span>
            </div>
          </div>

          <button
            onClick={handleAnalyzeImage}
            disabled={!selectedImage || loading}
            className="w-full bg-[#6C5CE7] hover:bg-[#5b4cc4] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 px-6 rounded-2xl shadow-[0_4px_0_0_#4834D4] disabled:shadow-none flex items-center justify-center gap-2 text-base transition-all cursor-pointer disabled:cursor-not-allowed hover:translate-y-0.5 active:shadow-none"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>استاد دانا در حال خواندن عکس... 🧐</span>
              </>
            ) : (
              <>
                <FileSearch className="w-6 h-6" />
                <span>حل مسئله با هوش مصنوعی!</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-[#FFF3F0] border-2 border-[#FF7675] text-[#D35400] rounded-2xl p-4 text-sm font-bold dir-rtl">
          ⚠️ {error}
        </div>
      )}

      {/* Result Display Box */}
      {result && (
        <div className="bg-white border-4 border-[#55E6C1] rounded-[2rem] p-6 shadow-md space-y-4 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#55E6C1]/30 text-emerald-800 flex items-center justify-center text-2xl">
                ✨
              </div>
              <div>
                <h3 className="font-bold text-[#2D3436] text-xl flex items-center gap-2">
                  <span>راه‌حل گام به گام استاد دانا</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">پاسخ کامل</span>
                </h3>
                <p className="text-xs text-slate-500">منطبق بر الگوی آموزشی کتاب ریاضی سوم</p>
              </div>
            </div>

            <button
              onClick={handleSpeakResult}
              className={`px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 border-2 transition-all cursor-pointer ${
                isSpeaking 
                  ? 'bg-rose-500 border-rose-600 text-white animate-pulse'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
              <span>{isSpeaking ? 'توقف خواندن' : 'پخش صوتی راه‌حل'}</span>
            </button>
          </div>

          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line dir-rtl font-medium">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};
