import React, { useState } from 'react';
import { StudentProfile, SubscriptionPlanId } from '../types';
import { PRICING_PLANS, DISCOUNT_COUPONS } from '../data/pricingPlans';
import { formatToman, activatePlan } from '../utils/subscriptionManager';
import { getPaymentProvider } from '../services/payment/paymentProviders';
import { playSound } from '../utils/sound';
import { 
  Crown, 
  CheckCircle2, 
  Sparkles, 
  X, 
  ShieldCheck, 
  Tag, 
  CreditCard, 
  Zap, 
  HelpCircle,
  Clock,
  Flame,
  Award,
  BookOpen
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  soundEnabled: boolean;
  onPurchaseSuccess: (updatedProfile: StudentProfile) => void;
  initialSelectedPlan?: SubscriptionPlanId;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  profile,
  soundEnabled,
  onPurchaseSuccess,
  initialSelectedPlan = 'yearly',
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>(initialSelectedPlan);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number; label: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'web' | 'bazaar' | 'myket' | 'zarinpal'>('web');
  const [storeNotice, setStoreNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedPlan = PRICING_PLANS.find(p => p.id === selectedPlanId) || PRICING_PLANS[2];

  // محاسبه قیمت بعد از تخفیف کوپن
  const basePrice = selectedPlan.priceToman;
  const couponDiscountAmount = appliedCoupon ? Math.round((basePrice * appliedCoupon.percent) / 100) : 0;
  const finalPrice = Math.max(0, basePrice - couponDiscountAmount);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await fetch('/api/subscription/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, planId: selectedPlanId }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({ code: data.code, percent: data.percent, label: data.label });
        playSound('correct', soundEnabled);
        setCouponError(null);
      } else {
        const localCoupon = DISCOUNT_COUPONS[code];
        if (localCoupon) {
          setAppliedCoupon({ code, percent: localCoupon.percent, label: localCoupon.label });
          playSound('correct', soundEnabled);
        } else {
          setCouponError(data.error || 'کد تخفیف معتبر نیست یا منقضی شده است.');
          playSound('wrong', soundEnabled);
        }
      }
    } catch {
      const localCoupon = DISCOUNT_COUPONS[code];
      if (localCoupon) {
        setAppliedCoupon({ code, percent: localCoupon.percent, label: localCoupon.label });
        playSound('correct', soundEnabled);
      } else {
        setCouponError('کد تخفیف معتبر نیست.');
        playSound('wrong', soundEnabled);
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleConfirmPurchase = async () => {
    setIsProcessing(true);
    setStoreNotice(null);
    playSound('click', soundEnabled);

    const userId = profile.phoneNumber || 'guest_student';
    const provider = getPaymentProvider(selectedPlatform);

    // اگر پلتفرم کافه بازار، مایکت یا زرین‌پال باشد، ابتدا متد provider را صدا می‌زنیم
    if (selectedPlatform !== 'web' && selectedPlatform !== 'manual') {
      const providerRes = await provider.createPurchase(selectedPlanId, userId);
      if (providerRes.message) {
        setStoreNotice(`⚠️ ${providerRes.message} (SKU: ${providerRes.sku || 'N/A'})`);
      }
      setIsProcessing(false);
      return;
    }

    try {
      let updatedProfile = activatePlan(profile, selectedPlanId);

      try {
        const res = await fetch('/api/subscription/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            planId: selectedPlanId,
            couponCode: appliedCoupon?.code,
            platform: selectedPlatform,
          }),
        });
        const data = await res.json();
        if (res.ok && data.subscription) {
          updatedProfile = {
            ...updatedProfile,
            subscription: data.subscription,
          };
        }
      } catch (err) {
        console.warn('Offline purchase activation:', err);
      }

      playSound('fanfare', soundEnabled);
      setPurchaseSuccess(true);
      onPurchaseSuccess(updatedProfile);
    } catch (err) {
      console.error('Purchase error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestActivation = async () => {
    setIsProcessing(true);
    const userId = profile.phoneNumber || 'guest_student';
    try {
      const res = await fetch('/api/subscription/activate-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': 'ostad_admin_secret_123',
        },
        body: JSON.stringify({ userId, planId: selectedPlanId }),
      });
      const data = await res.json();
      if (res.ok && data.profile) {
        playSound('fanfare', soundEnabled);
        setPurchaseSuccess(true);
        onPurchaseSuccess(data.profile);
      } else {
        alert(data.error || 'خطا در فعال‌سازی تست');
      }
    } catch (err: any) {
      alert('خطای اتصال: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border-4 border-amber-300 relative flex flex-col no-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 p-5 sm:p-6 text-white text-center relative overflow-hidden shrink-0">
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              onClose();
            }}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all cursor-pointer z-10"
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black mb-2 shadow-xs border border-white/30">
            <Crown className="w-4 h-4 text-yellow-200 fill-yellow-300 animate-bounce" />
            <span>پکیج طلایی آموزگار هوشمند ریاضی سوم</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black mb-1 drop-shadow-sm">
            بازگشایی تمامی فصل‌ها و معلم هوشمند ۲۴ ساعته
          </h2>
          <p className="text-xs sm:text-sm text-amber-50 font-medium max-w-2xl mx-auto">
            با یک‌بار اشتراک، تمام ۸ فصل کتاب ریاضی سوم دبستان، حل تمرینات با عکس و گزارش‌های اولیا در دسترس فرزند شماست.
          </p>
        </div>

        {/* Purchase Success Overlay */}
        {purchaseSuccess ? (
          <div className="p-8 text-center space-y-5 my-auto animate-scale-in">
            <div className="w-20 h-20 bg-emerald-100 border-4 border-emerald-400 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg animate-bounce">
              👑
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800">
                تبریک! به جمع مشترکین طلایی آموزگار خوش آمدید 🌟
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                تمام فصل‌های کتاب ریاضی، بازی‌های تعاملی، آزمون‌های هوشمند و گفتگوهای بی‌پایان با «استاد دانا» فعال شدند.
              </p>
            </div>
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 max-w-md mx-auto text-xs text-amber-900 font-bold space-y-1">
              <p>طرح فعال‌شده: {selectedPlan.title}</p>
              <p>پشتیبانی ۲۴ ساعته اولیا آماده همراهی در طول سال تحصیلی است.</p>
            </div>
            <button
              onClick={() => {
                playSound('click', soundEnabled);
                setPurchaseSuccess(false);
                onClose();
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-base shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all cursor-pointer"
            >
              شروع یادگیری با نسخه طلایی 🚀
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Platform Selector Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                درگاه پرداخت موردنظر شما:
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('web')}
                  className={`px-3 py-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedPlatform === 'web'
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  💳 کارت به کارت / شتاب
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('bazaar')}
                  className={`px-3 py-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedPlatform === 'bazaar'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🛍 کافه بازار
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('myket')}
                  className={`px-3 py-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedPlatform === 'myket'
                      ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🛒 مایکت
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('zarinpal')}
                  className={`px-3 py-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedPlatform === 'zarinpal'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  💳 زرین‌پال
                </button>
              </div>
            </div>

            {storeNotice && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 text-xs text-amber-900 font-bold flex items-center justify-between gap-2 animate-fade-in">
                <span>{storeNotice}</span>
                <button
                  type="button"
                  onClick={() => setStoreNotice(null)}
                  className="text-amber-700 hover:text-amber-900 font-black px-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PRICING_PLANS.slice(0, 3).map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => {
                      playSound('pop', soundEnabled);
                      setSelectedPlanId(plan.id);
                    }}
                    className={`rounded-3xl p-5 border-4 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 shadow-[0_8px_25px_rgba(245,158,11,0.25)] scale-[1.02]'
                        : 'border-slate-200 hover:border-amber-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3.5 right-4 bg-gradient-to-r from-red-500 to-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md">
                        {plan.badge}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-black text-slate-800">{plan.title}</h3>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-4 h-4 fill-white text-amber-500" />}
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 font-medium">{plan.subtitle}</p>

                      <div className="pt-2 border-t border-slate-100">
                        {plan.originalPriceToman && (
                          <span className="text-xs text-slate-400 line-through block">
                            {formatToman(plan.originalPriceToman)}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl sm:text-2xl font-black text-slate-900">
                            {plan.priceToman.toLocaleString('fa-IR')}
                          </span>
                          <span className="text-xs font-bold text-slate-600">تومان</span>
                        </div>
                        {plan.monthlyEquivalentToman && plan.id !== 'monthly' && (
                          <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            معادل {plan.monthlyEquivalentToman.toLocaleString('fa-IR')} ت / ماه
                          </span>
                        )}
                      </div>

                      {/* Key features bullets */}
                      <ul className="space-y-1.5 pt-3 text-xs text-slate-600 font-medium">
                        {plan.features.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className={`w-full py-2 rounded-xl text-center text-xs font-black transition-all ${
                        isSelected 
                          ? 'bg-amber-500 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}>
                        {isSelected ? 'طرح انتخاب‌شده' : 'انتخاب این طرح'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alternative: Question Pack (50 Questions) */}
            <div 
              onClick={() => {
                playSound('pop', soundEnabled);
                setSelectedPlanId('ai_pack_50');
              }}
              className={`border-3 rounded-2xl p-4 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                selectedPlanId === 'ai_pack_50'
                  ? 'border-indigo-500 bg-indigo-50/70 shadow-md'
                  : 'border-slate-200 hover:border-indigo-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl flex items-center justify-center text-xl shrink-0">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-800">بسته ۵۰ سوال اضافه هوش مصنوعی استاد دانا</h4>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                      بدون تاریخ انقضا
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    برای حل تمرینات کتاب و اسکن عکس بدون نیاز به اشتراک زمانی (۹۵,۰۰۰ تومان)
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-base font-black text-slate-900">
                  {formatToman(95000)}
                </span>
                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  selectedPlanId === 'ai_pack_50' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {selectedPlanId === 'ai_pack_50' ? 'انتخاب‌شده' : 'انتخاب'}
                </div>
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="bg-[#FFF9E5] border-2 border-[#FFEAA7] rounded-2xl p-4 space-y-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-amber-600 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="کد تخفیف دارید؟ (مثال: BAZAAR یا OSTAD)"
                    className="w-full pr-9 pl-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs disabled:opacity-50 transition-all cursor-pointer shrink-0"
                >
                  {couponLoading ? 'در حال بررسی...' : 'اعمال تخفیف'}
                </button>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-1.5 font-bold">
                  <span>✅ {appliedCoupon.label} ({appliedCoupon.percent}٪ تخفیف)</span>
                  <span>-{formatToman(couponDiscountAmount)}</span>
                </div>
              )}

              {couponError && (
                <p className="text-xs text-red-600 font-bold">{couponError}</p>
              )}
            </div>

            {/* Price Summary & Payment CTA */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                <div>
                  <span className="text-xs text-slate-400 font-medium">پلن انتخابی شما:</span>
                  <h4 className="text-base font-black text-amber-300">{selectedPlan.title}</h4>
                </div>
                <div className="text-left sm:text-right">
                  {appliedCoupon && (
                    <span className="text-xs text-slate-400 line-through block">
                      {formatToman(basePrice)}
                    </span>
                  )}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {finalPrice.toLocaleString('fa-IR')}
                    </span>
                    <span className="text-xs text-amber-300 font-bold">تومان</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>ضمانت بازگشت وجه تا ۷ روز در صورت عدم رضایت اولیا</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestActivation}
                    disabled={isProcessing}
                    className="text-[11px] text-amber-300 hover:text-amber-200 font-bold underline text-right cursor-pointer"
                  >
                    🛠️ [حالت توسعه] فعال‌سازی تست آنی اشتراک
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-600 text-white font-black text-sm sm:text-base shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Crown className="w-5 h-5 fill-white" />
                  <span>{isProcessing ? 'در حال فعال‌سازی...' : 'پرداخت و بازگشایی آنی تمامی فصل‌ها'}</span>
                </button>
              </div>
            </div>

            {/* Parent FAQ bullet points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500 shrink-0" />
                <span>شامل فصل‌های ۴، ۵، ۶، ۷ و ۸ ریاضی سوم دبستان</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>رفع اشکال و حل مسئله تکالیف با هوش مصنوعی</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>سازگار با کتاب درسی آموزش و پرورش ۱۴۰۴-۱۴۰۵</span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>پشتیبانی پیامکی و آنلاین اولیا در صورت بروز مشکل</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
