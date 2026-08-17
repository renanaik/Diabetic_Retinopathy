import React, { useState, useEffect, useCallback } from 'react';
import { Stethoscope, Building2, Award, Mail, Calendar, CheckCircle2, Clock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface DoctorConnection {
  id: string;
  doctorId: string;
  patientId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  doctor: {
    id: string;
    name: string;
    email: string;
    verificationStatus: string;
    profile: {
      licenseNumber?: string;
      medicalCouncil?: string;
      specialization?: string;
      hospital?: string;
      yearsOfExperience?: number;
    } | null;
  } | null;
}

export const PatientMyDoctor: React.FC = () => {
  const { token } = useAuth();
  const [connections, setConnections] = useState<DoctorConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/connections/my-doctors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConnections(data.data.connections || []);
      } else {
        setError(data.message || 'Failed to load doctor connections.');
      }
    } catch {
      setError('Network error while connecting to server.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMyDoctors();
  }, [fetchMyDoctors]);

  const acceptedConnections = connections.filter((c) => c.status === 'accepted');
  const pendingConnections = connections.filter((c) => c.status === 'pending');

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)]">
          My Primary Doctor & Clinical Care Team
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Review your connected ophthalmologists authorized to perform and verify retinal screenings.
        </p>
      </div>

      {loading ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 dark:text-brand-400 mb-3" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading clinical connections...</p>
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-red-600 dark:text-red-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchMyDoctors}
            className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700"
          >
            Retry
          </button>
        </div>
      ) : acceptedConnections.length === 0 && pendingConnections.length === 0 ? (
        <div className="card p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-[var(--color-text)]">
              No Primary Doctor Connected
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto mt-1">
              Connect with a verified retina specialist to initiate AI-assisted fundus examinations and receive official diagnostic reports.
            </p>
          </div>
          <Link
            to="/patient/doctors"
            className="btn btn-primary btn-md inline-flex items-center gap-2"
          >
            <span>Find &amp; Connect with a Doctor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Connected Doctors */}
          {acceptedConnections.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Active Doctor Connections ({acceptedConnections.length})
              </h2>
              <div className="grid grid-cols-1 gap-5">
                {acceptedConnections.map((conn) => {
                  const doc = conn.doctor;
                  if (!doc) return null;
                  return (
                    <div
                      key={conn.id}
                      className="card p-6 border border-[var(--color-border)] shadow-sm space-y-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-display font-bold text-lg">
                            Dr
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-display font-bold text-lg text-[var(--color-text)]">
                                Dr. {doc.name}
                              </h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Active Connection
                              </span>
                            </div>
                            <p className="text-sm text-brand-600 dark:text-brand-400 font-medium">
                              {doc.profile?.specialization || 'Ophthalmologist'}
                            </p>
                          </div>
                        </div>

                        <Link
                          to="/patient/reports"
                          className="btn btn-secondary btn-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
                        >
                          <span>View Screening Reports</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
                        {doc.profile?.hospital && (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-brand-500 shrink-0" />
                            <div>
                              <p className="font-medium text-[var(--color-text)]">{doc.profile.hospital}</p>
                              <p className="text-[10px]">Affiliated Clinic</p>
                            </div>
                          </div>
                        )}
                        {doc.profile?.yearsOfExperience !== undefined && (
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-500 shrink-0" />
                            <div>
                              <p className="font-medium text-[var(--color-text)]">{doc.profile.yearsOfExperience} Years</p>
                              <p className="text-[10px]">Clinical Experience</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-cyan-500 shrink-0" />
                          <div>
                            <p className="font-medium text-[var(--color-text)] truncate max-w-[140px]">{doc.email}</p>
                            <p className="text-[10px]">Verified Email</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                          <div>
                            <p className="font-medium text-[var(--color-text)]">
                              {new Date(conn.updatedAt).toLocaleDateString()}
                            </p>
                            <p className="text-[10px]">Connected Since</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pending Connection Requests */}
          {pendingConnections.length > 0 && (
            <div className="space-y-4 pt-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Pending Approval ({pendingConnections.length})
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {pendingConnections.map((conn) => {
                  const doc = conn.doctor;
                  if (!doc) return null;
                  return (
                    <div
                      key={conn.id}
                      className="card p-5 border border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[var(--color-text)]">
                            Dr. {doc.name}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {doc.profile?.specialization || 'Ophthalmology'} • Requested on {new Date(conn.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Awaiting Doctor Acceptance
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

