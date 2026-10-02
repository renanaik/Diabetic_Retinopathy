import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Eye,
  Link2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Activity,
  Award,
  Calendar,
  Layers,
  Sparkles,
  FileBadge
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface DashboardStats {
  totals: {
    patients: number;
    doctors: number;
    superAdmins: number;
    totalUsers: number;
    screenings: number;
    connections: number;
  };
  screenings: {
    total: number;
    approved: number;
    pendingReview: number;
    rejected: number;
    stageBreakdown: Record<number, number>;
  };
  doctors: {
    total: number;
    pending: number;
    verified: number;
    rejected: number;
  };
  connections: {
    total: number;
    accepted: number;
    pending: number;
    rejected: number;
  };
  recentScreenings: Array<{
    id: string;
    patientName: string;
    patientId: string;
    doctorName: string;
    predictedLabel: string;
    predictedClass: number;
    referable: boolean;
    status: string;
    createdAt: string;
  }>;
  recentPendingDoctors: Array<{
    id: string;
    name: string;
    email: string;
    specialization: string;
    hospital: string;
    medicalCouncil: string;
    licenseNumber: string;
    yearsOfExperience: number;
    createdAt: string;
  }>;
}

export const AdminDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    const authToken = token || localStorage.getItem('retinacare_auth_token');
    if (!authToken) {
      setError('Authentication token missing. Please sign in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStats(data.data);
      } else {
        setError(data.message || 'Failed to fetch platform dashboard statistics.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network error while fetching dashboard statistics.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleQuickApproveDoctor = async (doctorId: string, doctorName: string) => {
    const authToken = token || localStorage.getItem('retinacare_auth_token');
    if (!authToken) return;

    setProcessingId(doctorId);
    try {
      const res = await fetch(`/api/admin/doctors/${doctorId}/approve`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showSuccessToast(`Dr. ${doctorName} has been verified successfully.`);
        fetchDashboardData();
      } else {
        showErrorToast(data.message || 'Failed to approve doctor.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network error during approval.';
      showErrorToast(errMsg);
    } finally {
      setProcessingId(null);
    }
  };

  const stageNames: Record<number, { label: string; color: string; badge: string }> = {
    0: { label: 'No DR', color: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    1: { label: 'Mild DR', color: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
    2: { label: 'Moderate DR', color: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    3: { label: 'Severe DR', color: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
    4: { label: 'Proliferative DR', color: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 rounded-full px-3 py-1 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span className="text-xs font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wide">
              Platform Administration
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
            Super Admin Control Center
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Real-time telemetry and oversight for registered doctors, patients, connections, and AI screenings.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="btn btn-outline btn-sm self-start sm:self-auto gap-2"
          id="refresh-admin-dashboard-btn"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Failed to load platform data</p>
            <p className="text-xs mt-0.5 opacity-90">{error}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="text-xs font-semibold underline hover:no-underline ml-auto"
          >
            Retry
          </button>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Patients */}
        <Link
          to="/admin/patients"
          className="card p-5 hover:border-brand-500/50 transition-all group"
          id="stat-card-patients"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              Total Patients
            </p>
            <p className="text-2xl font-bold text-[var(--color-text)] mt-1">
              {loading ? '—' : (stats?.totals.patients ?? 0)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Registered patient accounts
            </p>
          </div>
        </Link>

        {/* Total Doctors */}
        <Link
          to="/admin/doctors"
          className="card p-5 hover:border-violet-500/50 transition-all group"
          id="stat-card-doctors"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Total Doctors
              </p>
              {(stats?.doctors.pending ?? 0) > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-semibold animate-pulse">
                  {stats?.doctors.pending} pending
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-[var(--color-text)] mt-1">
              {loading ? '—' : (stats?.totals.doctors ?? 0)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {stats?.doctors.verified ?? 0} verified • {stats?.doctors.rejected ?? 0} rejected
            </p>
          </div>
        </Link>

        {/* Total Screenings */}
        <Link
          to="/admin/screenings"
          className="card p-5 hover:border-emerald-500/50 transition-all group"
          id="stat-card-screenings"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              Total Screenings
            </p>
            <p className="text-2xl font-bold text-[var(--color-text)] mt-1">
              {loading ? '—' : (stats?.totals.screenings ?? 0)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {stats?.screenings.approved ?? 0} approved • {stats?.screenings.pendingReview ?? 0} in review
            </p>
          </div>
        </Link>

        {/* Doctor-Patient Connections */}
        <Link
          to="/admin/connections"
          className="card p-5 hover:border-cyan-500/50 transition-all group"
          id="stat-card-connections"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Link2 className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              Active Connections
            </p>
            <p className="text-2xl font-bold text-[var(--color-text)] mt-1">
              {loading ? '—' : (stats?.connections.accepted ?? 0)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {stats?.connections.pending ?? 0} pending • {stats?.connections.total ?? 0} total requests
            </p>
          </div>
        </Link>
      </div>

      {/* Secondary Status & Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Verification Pipeline Card */}
        <div className="card p-5 border border-[var(--color-border)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-violet-500" />
              Doctor Credentialing Status
            </h3>
            <Link to="/admin/doctors" className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
              <span className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified & Practicing
              </span>
              <span className="text-xs font-bold text-[var(--color-text)]">
                {stats?.doctors.verified ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
              <span className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                Pending Verification
              </span>
              <span className="text-xs font-bold text-[var(--color-text)]">
                {stats?.doctors.pending ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
              <span className="flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400">
                <XCircle className="w-3.5 h-3.5" />
                Rejected / Ineligible
              </span>
              <span className="text-xs font-bold text-[var(--color-text)]">
                {stats?.doctors.rejected ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Screening Review Pipeline Card */}
        <div className="card p-5 border border-[var(--color-border)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-500" />
              Clinical Screening Pipeline
            </h3>
            <Link to="/admin/screenings" className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
              <span className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Doctor Approved & Released
              </span>
              <span className="text-xs font-bold text-[var(--color-text)]">
                {stats?.screenings.approved ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
              <span className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                Pending Doctor Review
              </span>
              <span className="text-xs font-bold text-[var(--color-text)]">
                {stats?.screenings.pendingReview ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
              <span className="flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400">
                <XCircle className="w-3.5 h-3.5" />
                Clinical Decision Rejected
              </span>
              <span className="text-xs font-bold text-[var(--color-text)]">
                {stats?.screenings.rejected ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Retinopathy Stage Distribution Card */}
        <div className="card p-5 border border-[var(--color-border)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-500" />
              Retinopathy Stage Breakdown
            </h3>
            <Link to="/admin/reports" className="text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline">
              Analytics
            </Link>
          </div>

          <div className="space-y-2 pt-1">
            {[0, 1, 2, 3, 4].map((stageNum) => {
              const count = stats?.screenings.stageBreakdown[stageNum] ?? 0;
              const total = stats?.screenings.total || 1;
              const pct = stats?.screenings.total ? Math.round((count / total) * 100) : 0;
              const stage = stageNames[stageNum];

              return (
                <div key={stageNum} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--color-text-muted)] font-medium">
                      {stage.label} (Stage {stageNum})
                    </span>
                    <span className="font-semibold text-[var(--color-text)]">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[var(--color-surface-elevated)] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pending Doctor Approvals Queue Section */}
      {(stats?.recentPendingDoctors?.length ?? 0) > 0 && (
        <div className="card p-6 border border-amber-200 dark:border-amber-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h2 className="font-display font-bold text-base text-[var(--color-text)]">
                Pending Doctor Verifications Action Required ({stats?.recentPendingDoctors.length})
              </h2>
            </div>
            <Link
              to="/admin/doctors"
              className="btn btn-outline btn-sm text-xs gap-1.5"
            >
              <span>Review All in Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.recentPendingDoctors.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-[var(--color-text)]">
                      {doc.name}
                    </h4>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{doc.email}</p>
                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs text-[var(--color-text-muted)]">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block opacity-70">Hospital</span>
                      <span className="font-medium text-[var(--color-text)] truncate block">{doc.hospital || 'Clinic'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block opacity-70">License</span>
                      <span className="font-mono font-medium text-[var(--color-text)] truncate block">{doc.licenseNumber || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => handleQuickApproveDoctor(doc.id, doc.name)}
                    disabled={processingId === doc.id}
                    className="btn btn-primary btn-sm flex-1 bg-emerald-600 hover:bg-emerald-500 border-emerald-600 text-white text-xs py-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {processingId === doc.id ? 'Approving…' : 'Quick Approve'}
                  </button>
                  <Link
                    to="/admin/doctors"
                    className="btn btn-outline btn-sm text-xs py-1.5"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent AI Screenings Table */}
      <div className="card p-6 border border-[var(--color-border)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-500" />
              Recent AI Fundus Screenings
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Live stream of recent retinopathy screenings and physician reviews.
            </p>
          </div>
          <Link
            to="/admin/screenings"
            className="btn btn-outline btn-sm text-xs gap-1.5"
          >
            <span>All Screenings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-[var(--color-text-muted)] animate-pulse">
            Loading latest screenings…
          </div>
        ) : !stats?.recentScreenings || stats.recentScreenings.length === 0 ? (
          <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
            No screening records found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Patient</th>
                  <th className="pb-3 px-4">Doctor</th>
                  <th className="pb-3 px-4">AI Prediction</th>
                  <th className="pb-3 px-4">Review Status</th>
                  <th className="pb-3 pl-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {stats.recentScreenings.map((scr) => {
                  const stage = stageNames[scr.predictedClass] || stageNames[0];

                  return (
                    <tr key={scr.id} className="hover:bg-[var(--color-surface-elevated)] transition-colors">
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-[var(--color-text)]">{scr.patientName}</p>
                        <span className="font-mono text-[10px] text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)] px-1.5 py-0.5 rounded border border-[var(--color-border)] inline-block mt-0.5">
                          {scr.patientId}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-[var(--color-text)]">{scr.doctorName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${stage.badge}`}>
                          <Sparkles className="w-3 h-3" />
                          {scr.predictedLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            scr.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : scr.status === 'rejected'
                              ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                          }`}
                        >
                          {scr.status === 'approved' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : scr.status === 'rejected' ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {scr.status === 'approved' ? 'Approved' : scr.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                        </span>
                      </td>
                      <td className="py-3 pl-4 text-right text-[var(--color-text-muted)]">
                        {new Date(scr.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
