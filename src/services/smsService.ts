/**
 * SMS Provider Interface and Implementations for Iranian Mobile Numbers
 * پشتیبانی از سرویس‌های پیامکی ایران (کاوه‌نگار) همراه با فال‌بک توسعه و تست (Mock)
 */

export interface ISmsService {
  sendOtp(phoneNumber: string, code: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

/**
 * سرویس ارسال پیامک کاوه‌نگار (Kavenegar)
 * ۱. اولویت اول: استفاده از متد Lookup و الگوی اعتبارسنجی (Verify Lookup) جهت عبور از بلک‌لیست مخابرات و ارسال زیر ۵ ثانیه
 * ۲. اولویت دوم: در صورت عدم وجود قالب، استفاده از متد ارسال مستقیم پیامک با شماره اختصاصی (sms/send)
 */
export class KavenegarSmsService implements ISmsService {
  private apiKey: string;
  private templateName: string;
  private senderNumber?: string;

  constructor(apiKey?: string, templateName?: string, senderNumber?: string) {
    this.apiKey = apiKey || process.env.KAVENEGAR_API_KEY || '';
    this.templateName = templateName || process.env.KAVENEGAR_OTP_TEMPLATE || 'math-tutor-otp';
    this.senderNumber = senderNumber || process.env.KAVENEGAR_SENDER;
  }

  async sendOtp(phoneNumber: string, code: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.apiKey) {
      console.warn('[SMS] کلید KAVENEGAR_API_KEY تنظیم نشده است. ارسال به صورت شبیه‌سازی انجام می‌شود.');
      return { success: true, messageId: 'mock_' + Date.now() };
    }

    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');

    // ۱. روش استاندارد: اعتبارسنجی با الگو (Verify Lookup)
    try {
      const lookupUrl = `https://api.kavenegar.com/v1/${this.apiKey}/verify/lookup.json`;
      const lookupParams = new URLSearchParams({
        receptor: cleanPhone,
        token: code,
        template: this.templateName,
      });

      const response = await fetch(`${lookupUrl}?${lookupParams.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      const data = await response.json();
      if (response.ok && data.return?.status === 200) {
        const msgId = data.entries?.[0]?.messageid?.toString();
        console.log(`[Kavenegar OTP] پیامک تایید با موفقیت ارسال شد (شناسه پیام: ${msgId})`);
        return { success: true, messageId: msgId };
      }

      const status = data.return?.status;
      const errorMsg = data.return?.message || 'خطا در وب‌سرویس کاوه‌نگار';
      console.warn(`[Kavenegar Lookup Warning] کد وضعیت ${status}: ${errorMsg}`);

      // اگر قالب تعریف نشده بود (خطای ۴۲۰ در کاوه‌نگار) و خط فرستنده موجود بود، فال‌بک به پیامک ساده
      if (this.senderNumber) {
        console.log('[Kavenegar] تلاش برای ارسال پیامک از طریق خط فرستنده اختصاصی...');
        return await this.sendSimpleSms(cleanPhone, code);
      }

      return { success: false, error: `${errorMsg} (کد خطا: ${status})` };
    } catch (err: any) {
      console.error('[Kavenegar Network Error]', err);

      // در صورت خطای شبکه، اگر شماره فرستنده هست یکبار با ارسال متنی تلاش می‌کنیم
      if (this.senderNumber) {
        return await this.sendSimpleSms(cleanPhone, code);
      }

      return { success: false, error: err?.message || 'عدم امکان اتصال به سامانه پیامک کاوه‌نگار' };
    }
  }

  /**
   * ارسال پیامک ساده در صورت عدم تایید یا غیاب الگوی Verify
   */
  private async sendSimpleSms(cleanPhone: string, code: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const sendUrl = `https://api.kavenegar.com/v1/${this.apiKey}/sms/send.json`;
      const messageText = `کد تایید ورود به آموزگار ریاضی سوم دبستان:\n${code}\nاعتبار: ۳ دقیقه`;

      const sendParams = new URLSearchParams({
        receptor: cleanPhone,
        message: messageText,
        sender: this.senderNumber || '',
      });

      const res = await fetch(`${sendUrl}?${sendParams.toString()}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
      });

      const data = await res.json();
      if (res.ok && data.return?.status === 200) {
        return { success: true, messageId: data.entries?.[0]?.messageid?.toString() };
      }

      return { success: false, error: data.return?.message || 'خطا در ارسال پیامک عادی کاوه‌نگار' };
    } catch (sendErr: any) {
      return { success: false, error: sendErr?.message || 'خطای شبکه در ارسال پیامک کاوه‌نگار' };
    }
  }
}

/**
 * سرویس شبیه‌ساز پیامک برای محیط توسعه و تست بدون هزینه
 */
export class MockDevSmsService implements ISmsService {
  async sendOtp(phoneNumber: string, code: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log(`\n=================================================`);
    console.log(`📱 [SMS SERVICE - DEV MOCK MODE]`);
    console.log(`به شماره موبایل: ${phoneNumber}`);
    console.log(`کد تایید ورود: [ ${code} ]`);
    console.log(`مدت اعتبار: ۳ دقیقه`);
    console.log(`وضعیت کاوه‌نگار: کلید تنظیم نشده؛ در حالت آزمایشی`);
    console.log(`=================================================\n`);
    return { success: true, messageId: 'mock_' + Date.now() };
  }
}

// انتخاب سرویس بر اساس پیکربندی محیط
export function getSmsService(): ISmsService {
  const apiKey = process.env.KAVENEGAR_API_KEY;
  if (apiKey && apiKey.trim().length > 10) {
    return new KavenegarSmsService(apiKey.trim());
  }
  return new MockDevSmsService();
}
