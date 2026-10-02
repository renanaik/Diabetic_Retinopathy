import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  RefreshCw,
  AlertCircle,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Percent,
  Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ReportsData {
  summary: {
    totalScreenings: number;
    approvedCount: number;
    rejectedCount: number;
    pendingCount: number;
    referableCount: number;
    nonReferableCount: number;
    approvalRate: number;
  };
  stageDistribution: Array<{
    stage: number;
    label: string;
    count: number;
    percentage: number;
  }>;
}

export const AdminReports: React.FC = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    const authToken = token || localStorage.getItem('retinacare_auth_token');
    if (!authToken) {
      setError('Authentication token missing. Please sign in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/reports', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setReports(data.data);
      } else {
        setError(data.message || 'Failed to fetch diagnostic reports analytics.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network error while fetching reports.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const stageColors: Record<number, { bg: string; text: string; fill: string; desc: string }> = {
    0: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-300', fill: 'bg-emerald-500', desc: 'No microaneurysms or retinal vascular abnormalities detected.' },
    1: { bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-300', fill: 'bg-blue-500', desc: 'Microaneurysms only present; routine annual follow-up recommended.' },
    2: { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-300', fill: 'bg-amber-500', desc: 'More than microaneurysms but less than severe; follow-up in 6-12 months.' },
    3: { bg: 'bg-orange-50 dark:bg-orange-950/50', text: 'text-orange-700 dark:text-orange-300', fill: 'bg-orange-500', desc: 'Severe hemorrhages, venous beading, or IRMA. Clinical referral required.' },
    4: { bg: 'bg-rose-50 dark:bg-rose-950/50', text: 'text-rose-700 dark:text-rose-300', fill: 'bg-rose-500', desc: 'Neovascularization or vitreous hemorrhage. Urgent ophthalmology intervention.' },
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-full px-3 py-1 mb-2">
            <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
              Clinical Quality & Analytics
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
            System Reports & Clinical Telemetry
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Statistical breakdown of AI screening predictions, clinical review agreement, and retinopathy prevalence.
          </p>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          className="btn btn-outline btn-sm self-start sm:self-auto gap-2"
          id="refresh-reports-btn"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Analytics
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Failed to load reports</p>
            <p className="text-xs mt-0.5 opacity-90">{error}</p>
          </div>
          <button
            onClick={fetchReports}
            className="text-xs font-semibold underline hover:no-underline ml-auto"
          >
            Retry
          </button>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card p-5 border border-[var(--color-border)]">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
            <Eye className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Total Fundus Screenings
          </p>
          <p className="text-2xl font-bold text-[var(--color-text)] mt-1">
            {loading ? '—' : (reports?.summary.totalScreenings ?? 0)}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            All AI-evaluated records
          </p>
        </div>

        <div className="card p-5 border border-[var(--color-border)]">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Physician Approval Rate
          </p>
          <p className="text-2xl font-bold text-[var(--color-text)] mt-1">
            {loading ? '—' : `${reports?.summary.approvalRate ?? 100}%`}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {reports?.summary.approvedCount ?? 0} confirmed / released
          </p>
        </div>

        <div className="card p-5 border border-[var(--color-border)]">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Referable DR Cases
          </p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {loading ? '—' : (reports?.summary.referableCount ?? 0)}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Moderate, Severe, or Proliferative
          </p>
        </div>

        <div className="card p-5 border border-[var(--color-border)]">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
            <Activity className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            In Review Queue
          </p>
          <p className="text-2xl font-bold text-[var(--color-text)] mt-1">
            {loading ? '—' : (reports?.summary.pendingCount ?? 0)}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Awaiting physician sign-off
          </p>
        </div>
      </div>

      {/* Retinopathy Stage Prevalence Distribution */}
      <div className="card p-6 border border-[var(--color-border)] space-y-6">
        <div>
          <h2 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-500" />
            Diabetic Retinopathy Stage Prevalence (ICDR Severity Scale)
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Distribution of classified retinal examinations across all standard clinical stages.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-900 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {reports?.stageDistribution.map((item) => {
              const cfg = stageColors[item.stage] || stageColors[0];

              return (
                <div
                  key={item.stage}
                  className="p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="font-bold text-sm text-[var(--color-text)]">
                        {item.label} (Stage {item.stage})
                      </span>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {cfg.desc}
                      </p>
                    </div>
                    <div className="text-right flex items-baseline sm:flex-col justify-between sm:justify-center">
                      <span className="font-bold text-sm text-[var(--color-text)]">
                        {item.count} {item.count === 1 ? 'Exam' : 'Exams'}
                      </span>
                      <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[var(--color-surface)] h-2 rounded-full overflow-hidden border border-[var(--color-border)]">
                    <div
                      className={`h-full ${cfg.fill} rounded-full transition-all duration-700`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
