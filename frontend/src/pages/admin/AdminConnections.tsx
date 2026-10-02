import React, { useState, useEffect, useCallback } from 'react';
import {
  Link2,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Building,
  UserCheck,
  Users,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ConnectionItem {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  doctor: {
    id: string;
    name: string;
    email: string;
    specialization: string;
    hospital: string;
    verificationStatus: string;
  };
  patient: {
    id: string;
    name: string;
    email: string;
    patientId: string;
    phone: string;
  };
}

export const AdminConnections: React.FC = () => {
  const { token } = useAuth();
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'accepted' | 'pending' | 'rejected'>('all');

  const fetchConnections = useCallback(async () => {
    const authToken = token || localStorage.getItem('retinacare_auth_token');
    if (!authToken) {
      setError('Authentication token missing. Please sign in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/connections', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setConnections(data.data?.connections || []);
      } else {
        setError(data.message || 'Failed to fetch connections.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network error while fetching connections.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const filteredConnections = connections.filter((conn) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      conn.doctor.name.toLowerCase().includes(q) ||
      conn.doctor.email.toLowerCase().includes(q) ||
      conn.patient.name.toLowerCase().includes(q) ||
      conn.patient.email.toLowerCase().includes(q) ||
      conn.patient.patientId.toLowerCase().includes(q) ||
      conn.doctor.hospital.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all' || conn.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const acceptedCount = connections.filter((c) => c.status === 'accepted').length;
  const pendingCount = connections.filter((c) => c.status === 'pending').length;
  const rejectedCount = connections.filter((c) => c.status === 'rejected').length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 rounded-full px-3 py-1 mb-2">
            <Link2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 uppercase tracking-wide">
              Clinical Relationships
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
            Doctor-Patient Connections
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Track and monitor patient-doctor assignments, care relationships, and authorization status.
          </p>
        </div>

        <button
          onClick={fetchConnections}
          disabled={loading}
          className="btn btn-outline btn-sm self-start sm:self-auto gap-2"
          id="refresh-connections-btn"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Status Filter Tabs */}
        <div className="flex gap-2 p-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl self-start">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            All ({connections.length})
          </button>
          <button
            onClick={() => setStatusFilter('accepted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'accepted'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Active ({acceptedCount})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Clock className="w-3 h-3" />
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'rejected'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <XCircle className="w-3 h-3" />
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by doctor, patient, ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Failed to load connections</p>
            <p className="text-xs mt-0.5 opacity-90">{error}</p>
          </div>
          <button
            onClick={fetchConnections}
            className="text-xs font-semibold underline hover:no-underline ml-auto"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5 border-[var(--color-border)] animate-pulse flex items-center justify-between">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredConnections.length === 0 && (
        <div className="card p-12 text-center border-[var(--color-border)]">
          <Link2 className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3 opacity-40" />
          <h3 className="font-display font-bold text-lg text-[var(--color-text)]">
            No Connections Found
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto mt-1">
            {connections.length === 0
              ? 'There are currently no doctor-patient connection requests recorded.'
              : 'No connections match your active filter or search query.'}
          </p>
        </div>
      )}

      {/* Connection List */}
      {!loading && !error && filteredConnections.length > 0 && (
        <div className="space-y-3">
          {filteredConnections.map((conn) => {
            const statusConfig = {
              accepted: {
                label: 'Connected & Active',
                icon: CheckCircle2,
                badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
              },
              pending: {
                label: 'Awaiting Doctor Acceptance',
                icon: Clock,
                badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
              },
              rejected: {
                label: 'Connection Rejected',
                icon: XCircle,
                badge: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800',
              },
            }[conn.status];

            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={conn.id}
                className="card p-5 border border-[var(--color-border)] hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Doctor & Patient Link Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  {/* Doctor box */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-bold flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[var(--color-text)]">{conn.doctor.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)] truncate max-w-[180px]">{conn.doctor.hospital || conn.doctor.specialization}</p>
                    </div>
                  </div>

                  {/* Relationship Arrow */}
                  <div className="hidden sm:flex items-center justify-center px-2 text-[var(--color-text-muted)]">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  {/* Patient box */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm text-[var(--color-text)]">{conn.patient.name}</p>
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                          {conn.patient.patientId}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)]">{conn.patient.email}</p>
                    </div>
                  </div>
                </div>

                {/* Status Badge & Timestamp */}
                <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--color-border)]">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" />
                      {new Date(conn.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${statusConfig.badge}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
