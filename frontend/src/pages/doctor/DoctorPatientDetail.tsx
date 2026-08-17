import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  PlusCircle,
  History,
  Activity,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react';
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

interface ClassProbabilities {
  '0': number;
  '1': number;
  '2': number;
  '3': number;
  '4': number;
}

interface DoctorScreeningItem {
  id: string;
  patientId: string;
  doctorId: string;
  status: 'pending_review' | 'approved' | 'rejected';
  image: {
    originalFilename: string;
    mimeType: string;
    size: number;
  };
  aiResult: {
    predictedClass: 0 | 1 | 2 | 3 | 4;
    predictedLabel: string;
    confidence: number;
    classProbabilities: ClassProbabilities;
    referable: boolean;
    referableProbability: number;
    disclaimer?: string;
  };
  review?: {
    decision: 'approved' | 'rejected';
    doctorNotes?: string;
    reviewedAt: string;
    reviewedBy: string;
  };
  patient: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

const STAGE_NAMES = ['No DR', 'Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'Proliferative DR'];
const STAGE_COLORS = [
  { fill: '#10b981', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { fill: '#eab308', text: 'text-yellow-600 dark:text-yellow-400',   bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
  { fill: '#f59e0b', text: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { fill: '#f97316', text: 'text-orange-600 dark:text-orange-400',   bg: 'bg-orange-50 dark:bg-orange-950/30' },
  { fill: '#ef4444', text: 'text-red-600 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-950/30' },
];

export const DoctorPatientDetail: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { token } = useAuth();

  const [patientData, setPatientData] = useState<ConnectedPatient | null>(null);
  const [screenings, setScreenings] = useState<DoctorScreeningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Load patient profile
      const patRes = await fetch('/api/connections/my-patients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const patJson = await patRes.json();
      if (patRes.ok && patJson.success) {
        const found = (patJson.data.patients as ConnectedPatient[]).find(
          (p) => p.patient?.id === patientId
        );
        setPatientData(found || null);
      }

      // 2. Load screenings for this patient
      const scrRes = await fetch(`/api/screenings?patientId=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const scrJson = await scrRes.json();
      if (scrRes.ok && scrJson.success) {
        const sorted = (scrJson.data.screenings || []).sort(
          (a: DoctorScreeningItem, b: DoctorScreeningItem) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setScreenings(sorted);
      }
    } catch {
      setError('Network error while loading patient profile.');
    } finally {
      setLoading(false);
    }
  }, [patientId, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="card p-16 text-center flex flex-col items-center justify-center max-w-5xl mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 dark:text-brand-400 mb-3" />
        <p className="text-sm text-[var(--color-text-muted)]">Loading patient clinical profile...</p>
      </div>
    );
  }

  const p = patientData?.patient;
  const count = screenings.length;

  return (
    <div className="space-y-6 max-w-5xl pb-10">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/doctor/patients"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patients List</span>
        </Link>

        <Link
          to="/doctor/new-screening"
          className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Initiate Retinal Screening</span>
        </Link>
      </div>

      {/* Patient Profile Card */}
      {p ? (
        <div className="card p-6 md:p-8 border border-[var(--color-border)] shadow-sm space-y-5 bg-[var(--color-surface)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xl">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl text-[var(--color-text)]">
                  {p.name}
                </h1>
                <p className="text-xs text-[var(--color-text-muted)]">{p.email}</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active Connected Patient
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-[var(--color-text-muted)]">
            {p.profile?.gender && (
              <div className="p-3 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                <span className="text-[10px] text-[var(--color-text-subtle)] uppercase tracking-wider block">Gender</span>
                <span className="font-semibold text-sm text-[var(--color-text)] capitalize">{p.profile.gender}</span>
              </div>
            )}
            {p.profile?.phone && (
              <div className="p-3 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                <span className="text-[10px] text-[var(--color-text-subtle)] uppercase tracking-wider block">Phone</span>
                <span className="font-semibold text-sm text-[var(--color-text)] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-brand-500" /> {p.profile.phone}
                </span>
              </div>
            )}
            <div className="p-3 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] col-span-2">
              <span className="text-[10px] text-[var(--color-text-subtle)] uppercase tracking-wider block">Diabetes History</span>
              <span className="font-semibold text-sm text-[var(--color-text)] flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {p.profile?.diabetesHistory || 'No diabetes notes'}
              </span>
            </div>
            {p.profile?.eyeHistory && (
              <div className="p-3 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] col-span-full">
                <span className="text-[10px] text-[var(--color-text-subtle)] uppercase tracking-wider block">Ocular / Retinal History</span>
                <span className="font-semibold text-sm text-[var(--color-text)] flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> {p.profile.eyeHistory}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-6 text-center text-xs text-[var(--color-text-muted)]">
          Patient ID: {patientId}
        </div>
      )}

      {/* Screenings Timeline */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-lg text-[var(--color-text)]">
          Retinal Screening Records ({count})
        </h2>

        {count === 0 ? (
          <div className="card p-8 text-center bg-[var(--color-surface)]">
            <History className="w-10 h-10 text-[var(--color-text-subtle)] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[var(--color-text)]">No screenings on file yet</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Initiate a fundus screening examination to generate AI predictions and clinical reports.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {screenings
              .slice()
              .reverse()
              .map((s, idx) => {
                const cls = s.aiResult.predictedClass;
                const colors = STAGE_COLORS[cls];
                const isApproved = s.status === 'approved';
                const isPending = s.status === 'pending_review';

                return (
                  <div
                    key={s.id}
                    className="card p-5 border border-[var(--color-border)] shadow-sm space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[var(--color-border)]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[var(--color-text)]">
                          Visit #{count - idx}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${
                            isApproved
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : isPending
                              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                          }`}
                        >
                          {isApproved ? <CheckCircle2 className="w-3 h-3" /> : isPending ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {s.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-xs text-[var(--color-text-muted)]">
                        {new Date(s.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`text-base font-bold ${colors.text}`}>
                          {s.aiResult.predictedLabel}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)] block">
                          Confidence: {(s.aiResult.confidence * 100).toFixed(1)}% • Referable: {s.aiResult.referable ? 'Yes' : 'No'}
                        </span>
                      </div>

                      {s.review?.doctorNotes && (
                        <p className="text-xs text-[var(--color-text)] max-w-sm italic truncate">
                          "{s.review.doctorNotes}"
                        </p>
                      )}
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

