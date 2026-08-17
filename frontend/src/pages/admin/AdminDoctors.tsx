import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Award, 
  Building, 
  Calendar, 
  Mail, 
  FileBadge,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface DoctorProfileData {
  licenseNumber?: string;
  medicalCouncil?: string;
  specialization?: string;
  hospital?: string;
  yearsOfExperience?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface PendingDoctor {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
  profile?: DoctorProfileData | null;
}

export const AdminDoctors: React.FC = () => {
  const { token } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [doctors, setDoctors] = useState<PendingDoctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingDoctors = useCallback(async () => {
    const authToken = token || localStorage.getItem('retinacare_auth_token');
    if (!authToken) {
      setError('Authentication token missing. Please sign in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/doctors/pending', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setDoctors(data.data?.doctors || []);
      } else {
        setError(data.message || 'Failed to fetch pending doctor verifications.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network error while fetching pending doctors.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPendingDoctors();
  }, [fetchPendingDoctors]);

  const handleApprove = async (doctor: PendingDoctor) => {
    const authToken = token || localStorage.getItem('retinacare_auth_token');
    if (!authToken) return;

    setProcessingId(doctor.id);
    try {
      const res = await fetch(`/api/admin/doctors/${doctor.id}/approve`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showSuccessToast(data.message || `Dr. ${doctor.name} has been verified successfully.`);
        // Remove approved doctor from the pending queue
        setDoctors((prev) => prev.filter((d) => d.id !== doctor.id));
      } else {
        showErrorToast(data.message || `Failed to approve Dr. ${doctor.name}.`);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network error during approval.';
      showErrorToast(errMsg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (doctor: PendingDoctor) => {
    const authToken = token || localStorage.getItem('retinacare_auth_token');
    if (!authToken) return;

    if (!window.confirm(`Are you sure you want to reject the verification request for Dr. ${doctor.name}?`)) {
      return;
    }

    setProcessingId(doctor.id);
    try {
      const res = await fetch(`/api/admin/doctors/${doctor.id}/reject`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showSuccessToast(data.message || `Dr. ${doctor.name} verification request rejected.`);
        // Remove rejected doctor from the pending queue
        setDoctors((prev) => prev.filter((d) => d.id !== doctor.id));
      } else {
        showErrorToast(data.message || `Failed to reject Dr. ${doctor.name}.`);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network error during rejection.';
      showErrorToast(errMsg);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-full px-3 py-1 mb-2">
            <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
              Medical Credential Review
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
            Doctor Verification Queue
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Review medical licenses, councils, and practice credentials before granting doctor portal access.
          </p>
        </div>

        <button
          onClick={fetchPendingDoctors}
          disabled={loading}
          className="btn btn-outline btn-sm self-start sm:self-auto gap-2"
          id="refresh-doctors-btn"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Failed to load verification requests</p>
            <p className="text-xs mt-0.5 opacity-90">{error}</p>
          </div>
          <button
            onClick={fetchPendingDoctors}
            className="text-xs font-semibold underline hover:no-underline ml-auto"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card p-6 border-[var(--color-border)] animate-pulse flex flex-col md:flex-row gap-6 justify-between"
            >
              <div className="space-y-3 flex-1">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="h-12 bg-slate-100 dark:bg-slate-900 rounded" />
                  <div className="h-12 bg-slate-100 dark:bg-slate-900 rounded" />
                  <div className="h-12 bg-slate-100 dark:bg-slate-900 rounded" />
                  <div className="h-12 bg-slate-100 dark:bg-slate-900 rounded" />
                </div>
              </div>
              <div className="flex md:flex-col gap-2 justify-end w-32">
                <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && doctors.length === 0 && (
        <div className="card p-12 text-center border-[var(--color-border)]">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="font-display font-bold text-lg text-[var(--color-text)]">
            Queue is All Caught Up
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto mt-1.5">
            There are currently no doctor verification requests pending review. All registered doctors have been evaluated.
          </p>
        </div>
      )}

      {/* Doctor Cards */}
      {!loading && !error && doctors.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Pending Requests ({doctors.length})
            </span>
          </div>

          {doctors.map((doctor) => {
            const isProcessing = processingId === doctor.id;
            const profile = doctor.profile;

            return (
              <div
                key={doctor.id}
                className="card p-6 border-[var(--color-border)] hover:border-violet-500/40 transition-all duration-200"
                id={`doctor-card-${doctor.id}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Doctor Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
                        {doctor.name.replace(/^Dr\.\s*/i, '').charAt(0) || 'D'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-lg text-[var(--color-text)]">
                            {doctor.name}
                          </h3>
                          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            <Clock className="w-3 h-3" />
                            Pending Review
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {doctor.email}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Registered {new Date(doctor.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Medical Credentials Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                          <FileBadge className="w-3.5 h-3.5 text-violet-500" />
                          License Number
                        </div>
                        <p className="font-mono text-xs font-bold text-[var(--color-text)]">
                          {profile?.licenseNumber || 'Not provided'}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                          <Award className="w-3.5 h-3.5 text-indigo-500" />
                          Medical Council
                        </div>
                        <p className="text-xs font-medium text-[var(--color-text)] truncate" title={profile?.medicalCouncil}>
                          {profile?.medicalCouncil || 'Not provided'}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                          Specialization
                        </div>
                        <p className="text-xs font-medium text-[var(--color-text)] truncate">
                          {profile?.specialization || 'Ophthalmology'}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                          <Building className="w-3.5 h-3.5 text-emerald-500" />
                          Hospital / Experience
                        </div>
                        <p className="text-xs font-medium text-[var(--color-text)] truncate" title={profile?.hospital}>
                          {profile?.hospital || 'Clinic'} {profile?.yearsOfExperience ? `(${profile.yearsOfExperience} yrs)` : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-row lg:flex-col gap-2.5 lg:w-44 justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--color-border)]">
                    <button
                      onClick={() => handleApprove(doctor)}
                      disabled={isProcessing}
                      className="btn btn-primary btn-md flex-1 lg:flex-none justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 border-emerald-600 text-white shadow-xs"
                      id={`approve-btn-${doctor.id}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isProcessing ? 'Processing…' : 'Approve'}
                    </button>

                    <button
                      onClick={() => handleReject(doctor)}
                      disabled={isProcessing}
                      className="btn btn-outline btn-md flex-1 lg:flex-none justify-center gap-2 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/30"
                      id={`reject-btn-${doctor.id}`}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
