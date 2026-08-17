import React, { useState, useEffect, useCallback } from 'react';
import { Users, PlusCircle, History, User, Activity, Eye, Phone, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ConnectedPatient {
  connectionId: string;
  connectedSince: string;
  patient: {
    id: string;
    name: string;
    email: string;
    profile: {
      dateOfBirth?: string;
      gender?: string;
      phone?: string;
      medicalHistory?: string;
      diabetesHistory?: string;
      eyeHistory?: string;
    } | null;
  } | null;
}

export const DoctorPatients: React.FC = () => {
  const { token } = useAuth();
  const [patients, setPatients] = useState<ConnectedPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/connections/my-patients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPatients(data.data.patients || []);
      } else {
        setError(data.message || 'Failed to load connected patients.');
      }
    } catch {
      setError('Network error while loading connected patients.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)]">
            Connected Patients
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Active patient roster authorized for fundus examinations and diabetic retinopathy management.
          </p>
        </div>

        <Link to="/doctor/new-screening" className="btn btn-primary btn-md inline-flex items-center gap-2 self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" />
          <span>New Retinal Screening</span>
        </Link>
      </div>

      {loading ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 dark:text-brand-400 mb-3" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading connected patients...</p>
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-red-600 dark:text-red-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchPatients}
            className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700"
          >
            Retry
          </button>
        </div>
      ) : patients.length === 0 ? (
        <div className="card p-12 text-center bg-[var(--color-surface)]">
          <Users className="w-12 h-12 text-[var(--color-text-subtle)] mx-auto mb-3" />
          <h3 className="font-display font-semibold text-lg text-[var(--color-text)]">
            No Connected Patients Yet
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto mt-1">
            When patients request your medical supervision and you accept their requests, they will appear here.
          </p>
          <div className="mt-5">
            <Link to="/doctor/requests" className="btn btn-secondary btn-sm inline-flex items-center gap-1.5">
              <span>View Pending Requests</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {patients.map((item) => {
            const p = item.patient;
            if (!p) return null;

            return (
              <div
                key={item.connectionId}
                className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4 hover:border-brand-500/40 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base text-[var(--color-text)]">
                          {p.name}
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)]">{p.email}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Connected
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
                    {p.profile?.gender && (
                      <div>
                        <span className="text-[10px] text-[var(--color-text-subtle)] block">Gender</span>
                        <span className="font-medium text-[var(--color-text)] capitalize">{p.profile.gender}</span>
                      </div>
                    )}
                    {p.profile?.phone && (
                      <div>
                        <span className="text-[10px] text-[var(--color-text-subtle)] block">Phone</span>
                        <span className="font-medium text-[var(--color-text)] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-brand-500" /> {p.profile.phone}
                        </span>
                      </div>
                    )}
                    {p.profile?.diabetesHistory && (
                      <div className="col-span-2">
                        <span className="text-[10px] text-[var(--color-text-subtle)] block">Diabetes History</span>
                        <span className="font-medium text-[var(--color-text)] flex items-center gap-1">
                          <Activity className="w-3 h-3 text-amber-500 shrink-0" /> {p.profile.diabetesHistory}
                        </span>
                      </div>
                    )}
                    {p.profile?.eyeHistory && (
                      <div className="col-span-2">
                        <span className="text-[10px] text-[var(--color-text-subtle)] block">Ocular History</span>
                        <span className="font-medium text-[var(--color-text)] flex items-center gap-1">
                          <Eye className="w-3 h-3 text-indigo-500 shrink-0" /> {p.profile.eyeHistory}
                        </span>
                      </div>
                    )}
                    <div className="col-span-2 flex items-center gap-1 text-[11px] text-[var(--color-text-subtle)] mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>Connected on {new Date(item.connectedSince).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
                  <Link
                    to={`/doctor/patient-history?patientId=${p.id}`}
                    className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-1.5"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View History</span>
                  </Link>
                  <Link
                    to="/doctor/new-screening"
                    className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Screening</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

