export type PaymentProviderId = 'bazaar' | 'myket' | 'zarinpal' | 'manual';

export interface PaymentProvider {
  id: PaymentProviderId;
  createPurchase(planId: string, userId: string): Promise<{
    redirectUrl?: string;
    sku?: string;
    status: string;
    message?: string;
  }>;
  verifyPurchase(payload: any): Promise<{
    success: boolean;
    planId?: string;
    error?: string;
  }>;
}
