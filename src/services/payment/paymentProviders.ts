import { PaymentProvider, PaymentProviderId } from './types';

/**
 * 🛠️ Manual & Test Payment Provider (Current Sandbox Fallback)
 */
export class ManualPaymentProvider implements PaymentProvider {
  id: PaymentProviderId = 'manual';

  async createPurchase(planId: string, userId: string) {
    return {
      status: 'pending_manual',
      message: 'درگاه پرداخت تستی / دستی فعال است. می‌توانید از دکمه فعال‌سازی آزمایشی استفاده کنید.'
    };
  }

  async verifyPurchase(payload: any) {
    return {
      success: true,
      planId: payload.planId || 'yearly'
    };
  }
}

/**
 * 🛍️ Cafe Bazaar In-App Billing Provider (TODO Stub)
 * TODO: Integrate Cafe Bazaar In-App Billing AIDL / TrivialDrive service when publishing to Bazaar.
 */
export class BazaarPaymentProvider implements PaymentProvider {
  id: PaymentProviderId = 'bazaar';

  async createPurchase(planId: string, userId: string) {
    // TODO: Implement Cafe Bazaar Billing connection (Intent purchase request for SKU)
    return {
      sku: `ir.ostaddana.sub.${planId}`,
      status: 'bazaar_sdk_pending',
      message: 'پرداخت درون‌برنامه‌ای کافه بازار به زودی فعال می‌شود.'
    };
  }

  async verifyPurchase(payload: any) {
    // TODO: Verify Bazaar purchase token with Bazaar Developer API backend
    return {
      success: false,
      error: 'پرداخت کافه بازار در حال حاضر به صورت آزمایشی است.'
    };
  }
}

/**
 * 🛒 Myket In-App Billing Provider (TODO Stub)
 * TODO: Integrate Myket Billing service.
 */
export class MyketPaymentProvider implements PaymentProvider {
  id: PaymentProviderId = 'myket';

  async createPurchase(planId: string, userId: string) {
    // TODO: Implement Myket Billing intent
    return {
      sku: `ir.ostaddana.sub.${planId}`,
      status: 'myket_sdk_pending',
      message: 'پرداخت درون‌برنامه‌ای مایکت به زودی فعال می‌شود.'
    };
  }

  async verifyPurchase(payload: any) {
    // TODO: Verify Myket purchase token on backend
    return {
      success: false,
      error: 'پرداخت مایکت در حال حاضر به صورت آزمایشی است.'
    };
  }
}

/**
 * 💳 Zarinpal Web Gateway Provider (TODO Stub)
 * TODO: Integrate Zarinpal SOAP / REST v4 payment request and callback verification.
 */
export class ZarinpalPaymentProvider implements PaymentProvider {
  id: PaymentProviderId = 'zarinpal';

  async createPurchase(planId: string, userId: string) {
    // TODO: Call Zarinpal /pg/v4/payment/request.json and return redirectUrl
    return {
      redirectUrl: 'https://sandbox.zarinpal.com/pg/StartPay/TEST-GATEWAY-TODO',
      status: 'zarinpal_redirect_pending',
      message: 'درگاه وب زرین‌پال به زودی فعال می‌شود.'
    };
  }

  async verifyPurchase(payload: any) {
    // TODO: Call Zarinpal /pg/v4/payment/verify.json with Authority & Amount
    return {
      success: false,
      error: 'تراکنش زرین‌پال در حال حاضر پیاده‌سازی نشده است.'
    };
  }
}

export function getPaymentProvider(providerId: PaymentProviderId): PaymentProvider {
  switch (providerId) {
    case 'bazaar':
      return new BazaarPaymentProvider();
    case 'myket':
      return new MyketPaymentProvider();
    case 'zarinpal':
      return new ZarinpalPaymentProvider();
    case 'manual':
    default:
      return new ManualPaymentProvider();
  }
}
