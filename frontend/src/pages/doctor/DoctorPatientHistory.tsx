import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Activity,
  User,
  PlusCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
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

export const DoctorPatientHistory: React.FC = () => {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patientId') || '';

  const [patients, setPatients] = useState<ConnectedPatient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId);
  const [screenings, setScreenings] = useState<DoctorScreeningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch connected patients
  useEffect(() => {
    async function loadPatients() {
      try {
        const res = await fetch('/api/connections/my-patients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const list = data.data.patients || [];
          setPatients(list);
          if (!selectedPatientId && list.length > 0 && list[0].patient) {
            setSelectedPatientId(list[0].patient.id);
          }
        }
      } catch {
        setError('Network error while loading connected patients.');
      }
    }
    loadPatients();
  }, [token, selectedPatientId]);

  // 2. Fetch screenings for selected patient (or all if none selected)
  const fetchScreenings = useCallback(async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = patientId
        ? `/api/screenings?patientId=${patientId}`
        : '/api/screenings';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Sort chronologically
        const sorted = (data.data.screenings || []).sort(
          (a: DoctorScreeningItem, b: DoctorScreeningItem) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setScreenings(sorted);
      } else {
        setError(data.message || 'Failed to load screening history.');
      }
    } catch {
      setError('Network error while fetching screening records.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (selectedPatientId) {
      fetchScreenings(selectedPatientId);
      setSearchParams({ patientId: selectedPatientId });
    } else {
      setLoading(false);
    }
  }, [selectedPatientId, fetchScreenings, setSearchParams]);

  const selectedPatientObj = patients.find((p) => p.patient?.id === selectedPatientId)?.patient || null;

  // Chart setup
  const count = screenings.length;
  const chartWidth = 680;
  const chartHeight = 220;
  const paddingX = 50;
  const paddingY = 25;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;

  const points = screenings.map((s, index) => {
    const x = count === 1 ? chartWidth / 2 : paddingX + (index / (count - 1)) * plotWidth;
    const y = paddingY + plotHeight - (s.aiResult.predictedClass / 4) * plotHeight;
    return { x, y, screening: s };
  });

  const pathD = points.length > 1
    ? points.reduce((acc, curr, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`, '')
    : '';

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)]">
            Patient Screening History &amp; Trajectory
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Track multi-visit longitudinal disease progression and historical diagnostic reports.
          </p>
        </div>

        <Link to="/doctor/new-screening" className="btn btn-primary btn-md inline-flex items-center gap-2 self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" />
          <span>New Screening</span>
        </Link>
      </div>

      {/* Patient Selector */}
      <div className="card p-5 border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
          <div>
            <label htmlFor="patient-history-select" className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider block">
              Select Connected Patient
            </label>
            <p className="text-xs text-[var(--color-text-muted)]">
              View individual longitudinal chart &amp; diagnostic logs
            </p>
          </div>
        </div>

        <select
          id="patient-history-select"
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm px-3 py-2 min-w-[260px] focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {patients.length === 0 ? (
            <option value="">No connected patients found</option>
          ) : (
            patients.map((p) =>
              p.patient ? (
                <option key={p.patient.id} value={p.patient.id}>
                  {p.patient.name} ({p.patient.email})
                </option>
              ) : null
            )
          )}
        </select>
      </div>

      {loading ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 dark:text-brand-400 mb-3" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading historical screening records...</p>
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-red-600 dark:text-red-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      ) : count === 0 ? (
        <div className="card p-12 text-center bg-[var(--color-surface)] space-y-3">
          <History className="w-12 h-12 text-[var(--color-text-subtle)] mx-auto mb-2" />
          <h3 className="font-display font-semibold text-lg text-[var(--color-text)]">
            No Historical Screenings Found
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-sm mx-auto">
            {selectedPatientObj
              ? `No retinal screenings have been recorded yet for ${selectedPatientObj.name}.`
              : 'Select a connected patient to view their screening history.'}
          </p>
          <div className="pt-2">
            <Link to="/doctor/new-screening" className="btn btn-primary btn-sm inline-flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4" />
              <span>Perform First Screening</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Longitudinal Chart */}
          <div className="card p-6 md:p-8 border border-[var(--color-border)] shadow-sm space-y-6 bg-[var(--color-surface)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[var(--color-border)]">
              <div>
                <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  Longitudinal Severity Trend — {selectedPatientObj?.name || 'Patient'}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Chronological progression of DR stage classifications ({count} total examinations).
                </p>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 self-start sm:self-auto">
                {count} Visit{count > 1 ? 's' : ''} Recorded
              </span>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[580px]">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
                  {/* Stage Grid Lines */}
                  {[0, 1, 2, 3, 4].map((stageIndex) => {
                    const y = paddingY + plotHeight - (stageIndex / 4) * plotHeight;
                    return (
                      <g key={stageIndex}>
                        <line
                          x1={paddingX - 10}
                          y1={y}
                          x2={chartWidth - paddingX + 10}
                          y2={y}
                          stroke="currentColor"
                          strokeDasharray="4 4"
                          className="text-[var(--color-border)]"
                          strokeWidth="1"
                        />
                        <text
                          x={paddingX - 14}
                          y={y + 4}
                          textAnchor="end"
                          className="text-[10px] font-medium fill-[var(--color-text-muted)]"
                        >
                          Stage {stageIndex} ({STAGE_NAMES[stageIndex].split(' ')[0]})
                        </text>
                      </g>
                    );
                  })}

                  {/* Connect Path */}
                  {points.length > 1 && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Data Points */}
                  {points.map((pt, idx) => {
                    const stage = pt.screening.aiResult.predictedClass;
                    const col = STAGE_COLORS[stage].fill;

                    return (
                      <g key={pt.screening.id}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="6"
                          fill={col}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <text
                          x={pt.x}
                          y={chartHeight - 6}
                          textAnchor="middle"
                          className="text-[9px] font-medium fill-[var(--color-text-muted)]"
                        >
                          {new Date(pt.screening.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </text>
                        <text
                          x={pt.x}
                          y={pt.y - 10}
                          textAnchor="middle"
                          className="text-[9px] font-bold fill-[var(--color-text)]"
                        >
                          V{idx + 1}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Chronological Screenings Timeline */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">
              Screening Examination Logs
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {screenings
                .slice()
                .reverse()
                .map((screening, idx) => {
                  const cls = screening.aiResult.predictedClass;
                  const colors = STAGE_COLORS[cls];
                  const isApproved = screening.status === 'approved';
                  const isPending = screening.status === 'pending_review';

                  return (
                    <div
                      key={screening.id}
                      className="card p-5 border border-[var(--color-border)] shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[var(--color-text)]">
                              Visit #{count - idx}
                            </span>
                            <span className="font-mono text-xs text-[var(--color-text-muted)]">
                              (ID: {screening.id.slice(-8).toUpperCase()})
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
                              {isApproved ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : isPending ? (
                                <Clock className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {screening.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                            Examined on {new Date(screening.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className={`text-base font-bold ${colors.text}`}>
                            {screening.aiResult.predictedLabel}
                          </span>
                          <span className="text-xs text-[var(--color-text-muted)] block">
                            Confidence: {(screening.aiResult.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Doctor review notes if available */}
                      {screening.review?.doctorNotes && (
                        <div className="p-3 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
                          <strong className="text-[var(--color-text)]">Doctor Notes:</strong> {screening.review.doctorNotes}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

