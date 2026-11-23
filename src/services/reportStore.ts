import { ReportItem, ReportAnswerRequest, IssueType } from '../types';

let cachedKv: any = null;
let kvLoadAttempted = false;

async function getSafeKv() {
  if (kvLoadAttempted) return cachedKv;
  kvLoadAttempted = true;
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const kvModule = await import('@vercel/kv');
      cachedKv = kvModule.kv || (kvModule as any).default?.kv || kvModule;
      return cachedKv;
    } catch (err) {
      console.warn('[ReportStore] @vercel/kv could not be loaded, using memory fallback:', err);
    }
  }
  return null;
}

const memoryReportsMap = new Map<string, ReportItem>();
const memoryPendingKeys: string[] = [];
const memoryReviewedKeys: string[] = [];

// Helper to sanitize inputs against XSS
export function sanitizeText(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export class ReportStoreService {
  async saveReport(request: ReportAnswerRequest): Promise<ReportItem> {
    const timestamp = request.timestamp || Date.now();
    const key = `report:${timestamp}:${request.messageId}`;
    
    const sanitizedExplanation = sanitizeText(request.explanation);
    const sanitizedQuestion = sanitizeText(request.question);
    
    const reportItem: ReportItem = {
      id: key,
      sessionId: request.sessionId,
      messageId: request.messageId,
      question: sanitizedQuestion,
      aiResponse: request.aiResponse,
      issueType: request.issueType,
      explanation: sanitizedExplanation,
      userId: request.userId,
      timestamp,
      status: 'pending',
    };

    const kv = await getSafeKv();
    if (kv && typeof kv.set === 'function') {
      try {
        // Save report with 90-day TTL (7,776,000 seconds)
        const TTL_90_DAYS = 90 * 24 * 60 * 60;
        await kv.set(key, JSON.stringify(reportItem), { ex: TTL_90_DAYS });
        
        // Push key to pending list
        if (typeof kv.lpush === 'function') {
          await kv.lpush('reports:pending', key);
          if (typeof kv.ltrim === 'function') {
            await kv.ltrim('reports:pending', 0, 499); // max 500
          }
        }
      } catch (err) {
        console.warn('[ReportStore] KV save failed, falling back to memory:', err);
      }
    }

    // Always maintain in memory as fallback
    memoryReportsMap.set(key, reportItem);
    if (!memoryPendingKeys.includes(key)) {
      memoryPendingKeys.unshift(key);
      if (memoryPendingKeys.length > 500) memoryPendingKeys.pop();
    }

    console.log(`[ReportService] New report filed by ${request.userId} for message ${request.messageId} (Type: ${request.issueType})`);
    return reportItem;
  }

  async getAllReports(options: {
    status?: 'all' | 'pending' | 'reviewed';
    issueType?: IssueType | 'all';
    search?: string;
  } = {}): Promise<ReportItem[]> {
    const kv = await getSafeKv();
    let reportsList: ReportItem[] = [];

    if (kv && typeof kv.lrange === 'function') {
      try {
        const pendingKeys: string[] = await kv.lrange('reports:pending', 0, -1) || [];
        const reviewedKeys: string[] = await kv.lrange('reports:reviewed', 0, -1) || [];
        
        const allKeys = Array.from(new Set([...pendingKeys, ...reviewedKeys]));
        for (const k of allKeys) {
          const raw = await kv.get(k);
          if (raw) {
            const item = typeof raw === 'string' ? JSON.parse(raw) : raw;
            reportsList.push(item);
          }
        }
      } catch (err) {
        console.warn('[ReportStore] KV read failed, using memory:', err);
      }
    }

    if (reportsList.length === 0) {
      reportsList = Array.from(memoryReportsMap.values());
    }

    // Sort descending by timestamp
    reportsList.sort((a, b) => b.timestamp - a.timestamp);

    // Apply filters
    if (options.status && options.status !== 'all') {
      reportsList = reportsList.filter(r => r.status === options.status);
    }
    if (options.issueType && options.issueType !== 'all') {
      reportsList = reportsList.filter(r => r.issueType === options.issueType);
    }
    if (options.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      reportsList = reportsList.filter(r => 
        (r.question && r.question.toLowerCase().includes(q)) ||
        (r.explanation && r.explanation.toLowerCase().includes(q)) ||
        (r.userId && r.userId.toLowerCase().includes(q)) ||
        (r.aiResponse && r.aiResponse.toLowerCase().includes(q))
      );
    }

    return reportsList;
  }

  async markReviewed(reportKey: string): Promise<boolean> {
    const report = memoryReportsMap.get(reportKey);
    const kv = await getSafeKv();

    if (kv) {
      try {
        const raw = await kv.get(reportKey);
        if (raw) {
          const item: ReportItem = typeof raw === 'string' ? JSON.parse(raw) : raw;
          item.status = 'reviewed';
          item.reviewedAt = new Date().toISOString();
          await kv.set(reportKey, JSON.stringify(item));

          if (typeof kv.lrem === 'function') {
            await kv.lrem('reports:pending', 0, reportKey);
          }
          if (typeof kv.lpush === 'function') {
            await kv.lpush('reports:reviewed', reportKey);
          }
        }
      } catch (err) {
        console.warn('[ReportStore] KV markReviewed failed:', err);
      }
    }

    if (report) {
      report.status = 'reviewed';
      report.reviewedAt = new Date().toISOString();
      const pIdx = memoryPendingKeys.indexOf(reportKey);
      if (pIdx > -1) memoryPendingKeys.splice(pIdx, 1);
      if (!memoryReviewedKeys.includes(reportKey)) memoryReviewedKeys.unshift(reportKey);
      return true;
    }
    return true;
  }

  async deleteReport(reportKey: string): Promise<boolean> {
    const kv = await getSafeKv();
    if (kv) {
      try {
        if (typeof kv.del === 'function') await kv.del(reportKey);
        if (typeof kv.lrem === 'function') {
          await kv.lrem('reports:pending', 0, reportKey);
          await kv.lrem('reports:reviewed', 0, reportKey);
        }
      } catch (err) {
        console.warn('[ReportStore] KV delete failed:', err);
      }
    }

    memoryReportsMap.delete(reportKey);
    const pIdx = memoryPendingKeys.indexOf(reportKey);
    if (pIdx > -1) memoryPendingKeys.splice(pIdx, 1);
    const rIdx = memoryReviewedKeys.indexOf(reportKey);
    if (rIdx > -1) memoryReviewedKeys.splice(rIdx, 1);
    return true;
  }
}

export const reportStore = new ReportStoreService();
