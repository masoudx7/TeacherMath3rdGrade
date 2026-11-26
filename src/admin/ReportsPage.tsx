import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Trash2, 
  Eye, 
  X, 
  RefreshCw, 
  AlertTriangle,
  Key,
  Clock,
  User,
  MessageSquare,
  FileSpreadsheet
} from 'lucide-react';
import { ReportItem, IssueType } from '../types';
import { apiUrl } from '../utils/apiConfig';

interface ReportsPageProps {
  onClose?: () => void;
}

const ISSUE_TYPE_LABELS: Record<IssueType, { label: string; icon: string; colorClass: string }> = {
  wrong_calculation: { label: 'محاسبه اشتباه', icon: '🧮', colorClass: 'bg-[#FFF3F0] text-[#D35400] border-[#FAB1A0]' },
  wrong_method: { label: 'روش حل اشتباه', icon: '📐', colorClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  irrelevant: { label: 'نامربوط به سوال', icon: '❓', colorClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  inappropriate: { label: 'نامناسب برای کودک', icon: '🛡️', colorClass: 'bg-rose-100 text-rose-800 border-rose-300 font-black' },
};

export const ReportsPage: React.FC<ReportsPageProps> = ({ onClose }) => {
  const [adminSecret, setAdminSecret] = useState<string>(() => {
    return localStorage.getItem('ostad_admin_secret_key') || 'ostad_admin_2026';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [secretInput, setSecretInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedIssueType, setSelectedIssueType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeReportDetail, setActiveReportDetail] = useState<ReportItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchReports = async (secret: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(apiUrl('/api/admin/reports'), {
        headers: {
          'x-admin-secret': secret,
        },
      });

      if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false);
        setAuthError('کلید ادمین (ADMIN_SECRET) وارد شده معتبر نیست.');
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setReports(data.reports || []);
        localStorage.setItem('ostad_admin_secret_key', secret);
      } else {
        setAuthError(data.error || 'خطا در دریافت اطلاعات ادمین');
        setIsAuthenticated(false);
      }
    } catch (err: any) {
      setAuthError('خطا در برقراری ارتباط با سرور.');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminSecret) {
      fetchReports(adminSecret);
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretInput.trim()) return;
    setAdminSecret(secretInput.trim());
    fetchReports(secretInput.trim());
  };

  const handleAction = async (reportKey: string, action: 'mark_reviewed' | 'delete') => {
    try {
      const res = await fetch(apiUrl('/api/admin/reports/action'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ reportKey, action }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(action === 'mark_reviewed' ? 'گزارش با موفقیت تایید شد.' : 'گزارش حذف گردید.');
        if (activeReportDetail && activeReportDetail.id === reportKey) {
          if (action === 'delete') {
            setActiveReportDetail(null);
          } else {
            setActiveReportDetail({ ...activeReportDetail, status: 'reviewed' });
          }
        }
        fetchReports(adminSecret);
      } else {
        showNotification(data.error || 'خطا در انجام عملیات');
      }
    } catch (err) {
      showNotification('خطا در شبکه');
    }
  };

  const exportToCSV = () => {
    if (reports.length === 0) {
      showNotification('گزارشی برای خروجی وجود ندارد.');
      return;
    }

    const filtered = filteredReports;
    const headers = ['شناسه گزارش', 'زمان ثبت', 'کاربر', 'نوع اشکال', 'متن سوال', 'توضیحات کاربر', 'وضعیت'];
    
    const rows = filtered.map(r => [
      `"${r.id}"`,
      `"${new Date(r.timestamp).toLocaleString('fa-IR')}"`,
      `"${r.userId}"`,
      `"${ISSUE_TYPE_LABELS[r.issueType]?.label || r.issueType}"`,
      `"${(r.question || '').replace(/"/g, '""')}"`,
      `"${(r.explanation || '').replace(/"/g, '""')}"`,
      `"${r.status === 'reviewed' ? 'بررسی‌شده' : 'در انتظار'}"`
    ]);

    // UTF-8 BOM for Farsi support in Excel
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `OstadDana_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReports = reports.filter(r => {
    if (selectedIssueType !== 'all' && r.issueType !== selectedIssueType) return false;
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQ = r.question?.toLowerCase().includes(q);
      const matchE = r.explanation?.toLowerCase().includes(q);
      const matchU = r.userId?.toLowerCase().includes(q);
      if (!matchQ && !matchE && !matchU) return false;
    }
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 dir-rtl">
        <div className="bg-white rounded-3xl border-3 border-indigo-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-indigo-100 border-2 border-indigo-300 rounded-2xl flex items-center justify-center mx-auto text-indigo-700">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-indigo-950">پنل مدیریت گزارش‌های پاسخ</h2>
            <p className="text-xs text-slate-500 font-medium">لطفاً کلید رمز سرور (ADMIN_SECRET) را وارد کنید:</p>
          </div>

          {authError && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold p-3 rounded-2xl text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">کلید ادمین:</label>
              <div className="relative">
                <input
                  type="password"
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  placeholder="پیش‌فرض: ostad_admin_2026"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-indigo-500 transition-all"
                  autoFocus
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-2xl shadow-md transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>در حال بررسی...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>ورود به پنل مدیریت</span>
                </>
              )}
            </button>
          </form>

          {onClose && (
            <button
              onClick={onClose}
              className="w-full text-center text-xs text-slate-500 font-bold hover:underline cursor-pointer pt-2"
            >
              بازگشت به برنامه
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 dir-rtl font-sans pb-10">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/20">
            📊
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">
              <span>مدیریت گزارش‌های پاسخ اشتباه</span>
              <span className="text-xs bg-amber-400 text-amber-950 font-black px-2.5 py-0.5 rounded-full">
                {reports.length} گزارش
              </span>
            </h1>
            <p className="text-xs text-indigo-200 font-medium mt-0.5">
              بررسی با بازخورد هوش مصنوعی استاد دانا و رفع اشکالات محاسباتی
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => fetchReports(adminSecret)}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10"
            title="به‌روزرسانی"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>خروجی فایل اکسل (CSV)</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-600 text-white font-bold text-xs p-3 rounded-2xl text-center shadow-md animate-in fade-in">
          {notification}
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در سوال، کاربر یا توضیحات..."
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pl-4 pr-9 py-2 text-xs font-medium focus:outline-none focus:border-indigo-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {/* Issue Type Select */}
          <select
            value={selectedIssueType}
            onChange={(e) => setSelectedIssueType(e.target.value)}
            className="bg-slate-50 border-2 border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">همه موضوعات اشکال</option>
            <option value="wrong_calculation">محاسبه اشتباه 🧮</option>
            <option value="wrong_method">روش حل اشتباه 📐</option>
            <option value="irrelevant">نامربوط به سوال ❓</option>
            <option value="inappropriate">نامناسب برای کودک 🛡️</option>
          </select>

          {/* Status Select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border-2 border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="pending">در انتظار بررسی ⏳</option>
            <option value="reviewed">بررسی‌شده ✅</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-sm">
            در حال بارگذاری گزارش‌ها...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="text-4xl">🎉</div>
            <h3 className="font-bold text-slate-700">هیچ گزارشی یافت نشد</h3>
            <p className="text-xs text-slate-400 font-medium">گزارشی با فیلترهای انتخابی شما ثبت نشده است.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black">
                  <th className="p-3.5">زمان ثبت</th>
                  <th className="p-3.5">شناسه کاربر</th>
                  <th className="p-3.5">نوع اشکال</th>
                  <th className="p-3.5">سوال (خلاصه)</th>
                  <th className="p-3.5">توضیحات تکمیلی</th>
                  <th className="p-3.5 text-center">وضعیت</th>
                  <th className="p-3.5 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => {
                  const issueMeta = ISSUE_TYPE_LABELS[report.issueType] || {
                    label: report.issueType,
                    icon: '⚠️',
                    colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
                  };

                  return (
                    <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 text-slate-500 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(report.timestamp).toLocaleDateString('fa-IR')}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(report.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 font-bold text-slate-800 dir-ltr text-right whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-1 rounded-lg text-[11px]">
                          {report.userId}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black border ${issueMeta.colorClass}`}>
                          <span>{issueMeta.icon}</span>
                          <span>{issueMeta.label}</span>
                        </span>
                      </td>

                      <td className="p-3.5 font-bold text-slate-900 max-w-xs truncate">
                        {report.question}
                      </td>

                      <td className="p-3.5 text-slate-600 max-w-xs truncate">
                        {report.explanation || <span className="text-slate-300 font-normal">بدون توضیح</span>}
                      </td>

                      <td className="p-3.5 text-center whitespace-nowrap">
                        {report.status === 'reviewed' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            بررسی‌شده
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                            <Clock className="w-3 h-3 text-amber-600" />
                            در انتظار
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setActiveReportDetail(report)}
                            className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
                            title="مشاهده جزئیات کامل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {report.status !== 'reviewed' && (
                            <button
                              onClick={() => handleAction(report.id, 'mark_reviewed')}
                              className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                              title="تایید و علامت به عنوان بررسی‌شده"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm('آیا از حذف این گزارش مطمئن هستید؟')) {
                                handleAction(report.id, 'delete');
                              }
                            }}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="حذف گزارش"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {activeReportDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 dir-rtl">
          <div className="bg-white rounded-3xl border-3 border-indigo-200 w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-lg text-indigo-950">جزئیات کامل گزارش</h3>
              </div>
              <button
                onClick={() => setActiveReportDetail(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-slate-100 px-3 py-1 rounded-xl text-slate-700 font-bold">
                کاربر: {activeReportDetail.userId}
              </span>
              <span className="bg-slate-100 px-3 py-1 rounded-xl text-slate-700 font-bold">
                زمان: {new Date(activeReportDetail.timestamp).toLocaleString('fa-IR')}
              </span>
              <span className={`px-3 py-1 rounded-xl font-bold border ${ISSUE_TYPE_LABELS[activeReportDetail.issueType]?.colorClass}`}>
                {ISSUE_TYPE_LABELS[activeReportDetail.issueType]?.icon} {ISSUE_TYPE_LABELS[activeReportDetail.issueType]?.label}
              </span>
            </div>

            {/* User Question */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500">سوال دانش‌آموز:</span>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs font-bold text-amber-950 leading-relaxed">
                {activeReportDetail.question}
              </div>
            </div>

            {/* AI Response */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500">پاسخ ثبت‌شده استاد دانا:</span>
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs font-medium text-slate-800 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line">
                {activeReportDetail.aiResponse}
              </div>
            </div>

            {/* User Explanation */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500">توضیحات گزارش‌دهنده:</span>
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl text-xs font-bold text-rose-950">
                {activeReportDetail.explanation || 'توضیحات اضافی ارائه نشده است.'}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t">
              <button
                onClick={() => {
                  if (confirm('آیا این گزارش حذف شود؟')) {
                    handleAction(activeReportDetail.id, 'delete');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف گزارش</span>
              </button>

              <div className="flex gap-2">
                {activeReportDetail.status !== 'reviewed' && (
                  <button
                    onClick={() => handleAction(activeReportDetail.id, 'mark_reviewed')}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تایید و علامت بررسی‌شده</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveReportDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
