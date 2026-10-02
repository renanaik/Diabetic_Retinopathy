import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Calendar,
  Mail,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SafeUserItem {
  id: string;
  patientId?: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'super_admin';
  isActive: boolean;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
}

export const AdminUsers: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<SafeUserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'patient' | 'doctor' | 'super_admin'>('all');

  const fetchUsers = useCallback(async () => {
    const authToken = token || localStorage.getItem('retinacare_auth_token');
    if (!authToken) {
      setError('Authentication token missing. Please sign in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUsers(data.data?.users || []);
      } else {
        setError(data.message || 'Failed to fetch users list.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network error while fetching users.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.patientId || '').toLowerCase().includes(q);

    const matchesRole =
      roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const patientCount = users.filter((u) => u.role === 'patient').length;
  const doctorCount = users.filter((u) => u.role === 'doctor').length;
  const adminCount = users.filter((u) => u.role === 'super_admin').length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 rounded-full px-3 py-1 mb-2">
            <Users className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span className="text-xs font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wide">
              Identity & Access Management
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
            User Accounts Management
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Overview of all registered platform identities across patients, doctors, and system administrators.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="btn btn-outline btn-sm self-start sm:self-auto gap-2"
          id="refresh-users-btn"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Role Tabs */}
        <div className="flex gap-2 p-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl self-start">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              roleFilter === 'all'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            All Accounts ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('patient')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              roleFilter === 'patient'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Users className="w-3 h-3" />
            Patients ({patientCount})
          </button>
          <button
            onClick={() => setRoleFilter('doctor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              roleFilter === 'doctor'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            Doctors ({doctorCount})
          </button>
          <button
            onClick={() => setRoleFilter('super_admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              roleFilter === 'super_admin'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            Admins ({adminCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or Patient ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Failed to load users</p>
            <p className="text-xs mt-0.5 opacity-90">{error}</p>
          </div>
          <button
            onClick={fetchUsers}
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
            <div key={i} className="card p-4 border-[var(--color-border)] animate-pulse flex items-center justify-between">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredUsers.length === 0 && (
        <div className="card p-12 text-center border-[var(--color-border)]">
          <Users className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3 opacity-40" />
          <h3 className="font-display font-bold text-lg text-[var(--color-text)]">
            No Users Found
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto mt-1">
            No user accounts matched your current filter or search criteria.
          </p>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="card border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Identifier / Status</th>
                  <th className="py-3.5 px-4">Account State</th>
                  <th className="py-3.5 px-5 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredUsers.map((u) => {
                  const roleBadge = {
                    patient: 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 border-brand-200 dark:border-brand-800',
                    doctor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
                    super_admin: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
                  }[u.role];

                  return (
                    <tr key={u.id} className="hover:bg-[var(--color-surface-elevated)] transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center font-bold text-xs text-[var(--color-text)]">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[var(--color-text)]">{u.name}</p>
                            <p className="text-[var(--color-text-muted)] mt-0.5">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2.5 py-0.5 rounded-full border capitalize ${roleBadge}`}>
                          {u.role === 'super_admin' ? 'Super Admin' : u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.role === 'patient' && u.patientId ? (
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                            {u.patientId}
                          </span>
                        ) : u.role === 'doctor' ? (
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                              u.verificationStatus === 'verified'
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : u.verificationStatus === 'rejected'
                                ? 'text-red-700 dark:text-red-300'
                                : 'text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {u.verificationStatus === 'verified' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : u.verificationStatus === 'rejected' ? (
                              <XCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {u.verificationStatus}
                          </span>
                        ) : (
                          <span className="text-[var(--color-text-muted)]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right text-[var(--color-text-muted)]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
