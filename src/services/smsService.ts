/**
 * SMS Provider Interface and Implementations for Iranian Mobile Numbers
 * پشتیبانی از سرویس‌های پیامکی ایران (کاوه نگار) همراه با فال‌بک توسعه و تست (Mock)
 */

export interface ISmsService {
  sendOtp(phoneNumber: string, code: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

/**
 * سرویس ارسال پیامک کاوه‌نگار (Kavenegar)
 * استفاده از متد Lookup و الگوی اعتبارسنجی (Verify Lookup) برای ارسال فوق‌سریع زیر ۵ ثانیه
 */
export class KavenegarSmsService implements ISmsService {
  private apiKey: string;
  private templateName: string;

  constructor(apiKey?: string, templateName = 'math-tutor-otp') {
    this.apiKey = apiKey || process.env.KAVENEGAR_API_KEY || '';
    this.templateName = templateName;
  }

  async sendOtp(phoneNumber: string, code: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.apiKey) {
      console.warn('[SMS] کلید KAVENEGAR_API_KEY تنظیم نشده است. ارسال به صورت شبیه‌سازی انجام می‌شود.');
      return { success: true, messageId: 'mock_' + Date.now() };
    }

    try {
      const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
      const url = `https://api.kavenegar.com/v1/${this.apiKey}/verify/lookup.json`;
      
      const params = new URLSearchParams({
        receptor: cleanPhone,
        token: code,
        template: this.templateName,
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      const data = await response.json();
      if (response.ok && data.return?.status === 200) {
        return { success: true, messageId: data.entries?.[0]?.messageid?.toString() };
      } else {
        const errorMsg = data.return?.message || 'خطا در وب‌سرویس کاوه‌نگار';
        console.error('[Kavenegar Error]', errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('[Kavenegar Network Error]', err);
      return { success: false, error: err?.message || 'عدم امکان اتصال به سامانه پیامک' };
    }
  }
}

/**
 * سرویس شبیه‌ساز پیامک برای محیط توسعه و تست بدون هزینه
 */
export class MockDevSmsService implements ISmsService {
  async sendOtp(phoneNumber: string, code: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log(`\n=================================================`);
    console.log(`📱 [SMS SERVICE - DEV MOCK]`);
    console.log(`به شماره: ${phoneNumber}`);
    console.log(`کد تایید ورود: [ ${code} ]`);
    console.log(`مدت اعتبار: ۳ دقیقه`);
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
