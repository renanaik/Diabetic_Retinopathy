import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  Eye,
  UserCheck,
  FileText,
  Activity,
  HeartPulse,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PatientItem {
  id: string;
  patientId: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  profile?: {
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    medicalHistory?: string;
    diabetesHistory?: string;
    eyeHistory?: string;
  } | null;
  connectedDoctors: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  connectedDoctorsCount: number;
  screeningsCount: number;
  latestScreening?: {
    id: string;
    date: string;
    stage: string;
    predictedClass: number;
    status: string;
    referable: boolean;
  } | null;
}

export const AdminPatients: React.FC = () => {
  const { token } = useAuth();
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    const authToken = token || localStorage.getItem('retinacare_auth_token');
    if (!authToken) {
      setError('Authentication token missing. Please sign in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/patients', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPatients(data.data?.patients || []);
      } else {
        setError(data.message || 'Failed to fetch patients list.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network error while fetching patients.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.patientId.toLowerCase().includes(q) ||
      (p.profile?.phone || '').toLowerCase().includes(q)
    );
  });

  const toggleExpand = (id: string) => {
    setExpandedPatientId(expandedPatientId === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-full px-3 py-1 mb-2">
            <Users className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wide">
              Patient Registry & Records
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
            Patients Directory
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Browse all registered patients, permanent Patient IDs, connected doctors, and screening histories.
          </p>
        </div>

        <button
          onClick={fetchPatients}
          disabled={loading}
          className="btn btn-outline btn-sm self-start sm:self-auto gap-2"
          id="refresh-patients-btn"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Registry
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Failed to load patients</p>
            <p className="text-xs mt-0.5 opacity-90">{error}</p>
          </div>
          <button
            onClick={fetchPatients}
            className="text-xs font-semibold underline hover:no-underline ml-auto"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Patient Name, ID (RC-...), email, or phone…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            id="search-patients-input"
          />
        </div>

        <div className="text-xs font-medium text-[var(--color-text-muted)] flex items-center gap-2">
          <span>Total Registered: <strong className="text-[var(--color-text)]">{patients.length}</strong></span>
          <span>•</span>
          <span>Showing: <strong className="text-[var(--color-text)]">{filteredPatients.length}</strong></span>
        </div>
      </div>

      {/* Loading state */}
      {loading && !error && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 border-[var(--color-border)] animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded" />
                <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded" />
                <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded" />
                <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredPatients.length === 0 && (
        <div className="card p-12 text-center border-[var(--color-border)]">
          <Users className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3 opacity-40" />
          <h3 className="font-display font-bold text-lg text-[var(--color-text)]">
            {patients.length === 0 ? 'No Patients Registered' : 'No Matching Patients'}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto mt-1">
            {patients.length === 0
              ? 'There are currently no patient profiles in the database.'
              : 'Try searching with a different name or Patient ID.'}
          </p>
        </div>
      )}

      {/* Patient Cards List */}
      {!loading && !error && filteredPatients.length > 0 && (
        <div className="space-y-4">
          {filteredPatients.map((patient) => {
            const isExpanded = expandedPatientId === patient.id;
            const profile = patient.profile;

            return (
              <div
                key={patient.id}
                className="card p-5 border border-[var(--color-border)] hover:border-brand-500/40 transition-all"
                id={`patient-card-${patient.patientId}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Patient Avatar & Primary Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold text-base flex items-center justify-center flex-shrink-0">
                      {patient.name.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display font-bold text-base text-[var(--color-text)]">
                          {patient.name}
                        </h3>
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                          {patient.patientId}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)] mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {patient.email}
                        </span>
                        {profile?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {profile.phone}
                          </span>
                        )}
                        {profile?.gender && (
                          <span className="capitalize">
                            Gender: {profile.gender}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Registered {new Date(patient.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Stats & Expand Button */}
                  <div className="flex items-center gap-4 self-end lg:self-auto">
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1 font-medium text-[var(--color-text)]">
                          <Eye className="w-3.5 h-3.5 text-emerald-500" />
                          {patient.screeningsCount} {patient.screeningsCount === 1 ? 'Screening' : 'Screenings'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-[var(--color-text)]">
                          <UserCheck className="w-3.5 h-3.5 text-violet-500" />
                          {patient.connectedDoctorsCount} {patient.connectedDoctorsCount === 1 ? 'Doctor' : 'Doctors'}
                        </span>
                      </div>
                      {patient.latestScreening && (
                        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                          Latest: <strong className="text-[var(--color-text)]">{patient.latestScreening.stage}</strong>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => toggleExpand(patient.id)}
                      className="btn btn-outline btn-sm gap-1 text-xs py-1.5 px-3"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View History'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-4 animate-in fade-in-50 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Medical History */}
                      <div className="p-3.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                        <h4 className="text-xs font-semibold text-[var(--color-text)] flex items-center gap-1.5 mb-1.5">
                          <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                          General Medical History
                        </h4>
                        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                          {profile?.medicalHistory || 'No general medical history recorded.'}
                        </p>
                      </div>

                      {/* Diabetes History */}
                      <div className="p-3.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                        <h4 className="text-xs font-semibold text-[var(--color-text)] flex items-center gap-1.5 mb-1.5">
                          <Activity className="w-3.5 h-3.5 text-amber-500" />
                          Diabetes Clinical Background
                        </h4>
                        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                          {profile?.diabetesHistory || 'No diabetes diagnosis duration recorded.'}
                        </p>
                      </div>

                      {/* Eye / Ocular History */}
                      <div className="p-3.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                        <h4 className="text-xs font-semibold text-[var(--color-text)] flex items-center gap-1.5 mb-1.5">
                          <Eye className="w-3.5 h-3.5 text-cyan-500" />
                          Ocular / Visual Symptoms
                        </h4>
                        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                          {profile?.eyeHistory || 'No prior visual history or treatments recorded.'}
                        </p>
                      </div>
                    </div>

                    {/* Connected Doctors List */}
                    {patient.connectedDoctors.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                        <h4 className="text-xs font-semibold text-[var(--color-text)] mb-2 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-violet-500" />
                          Active Doctor Relationships ({patient.connectedDoctors.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {patient.connectedDoctors.map((doc) => (
                            <span
                              key={doc.id}
                              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)]"
                            >
                              <span>{doc.name}</span>
                              <span className="text-[10px] text-[var(--color-text-muted)]">({doc.email})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
