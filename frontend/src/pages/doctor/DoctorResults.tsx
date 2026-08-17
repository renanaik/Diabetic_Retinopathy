import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  FileImage,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ClassProbabilities {
  '0': number;
  '1': number;
  '2': number;
  '3': number;
  '4': number;
}

interface AiResult {
  predictedClass: 0 | 1 | 2 | 3 | 4;
  predictedLabel: string;
  confidence: number;
  classProbabilities: ClassProbabilities;
  referable: boolean;
  referableProbability: number;
  disclaimer?: string;
}

interface DoctorReviewData {
  decision: 'approved' | 'rejected';
  doctorNotes?: string;
  reviewedAt: string;
  reviewedBy: string;
}

interface ScreeningItem {
  id: string;
  patientId: string;
  doctorId: string;
  status: 'pending_review' | 'approved' | 'rejected';
  image: {
    originalFilename: string;
    mimeType: string;
    size: number;
  };
  aiResult: AiResult;
  review?: DoctorReviewData;
  patient: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

const DR_COLORS: Record<number, { text: string; bg: string; border: string }> = {
  0: { text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800' },
  1: { text: 'text-yellow-700 dark:text-yellow-400',   bg: 'bg-yellow-50 dark:bg-yellow-950/30',   border: 'border-yellow-200 dark:border-yellow-800' },
  2: { text: 'text-amber-700 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-950/30',     border: 'border-amber-200 dark:border-amber-800' },
  3: { text: 'text-orange-700 dark:text-orange-400',   bg: 'bg-orange-50 dark:bg-orange-950/30',   border: 'border-orange-200 dark:border-orange-800' },
  4: { text: 'text-red-700 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-950/30',         border: 'border-red-200 dark:border-red-800' },
};

const CLASS_LABELS: Record<number, string> = {
  0: 'No DR',
  1: 'Mild',
  2: 'Moderate',
  3: 'Severe',
  4: 'Proliferative',
};

export const DoctorResults: React.FC = () => {
  const { token } = useAuth();
  const [screenings, setScreenings] = useState<ScreeningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending_review' | 'approved' | 'rejected'>('all');

  // Per-screening review state
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  const fetchScreenings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/screenings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setScreenings(data.data.screenings || []);
      } else {
        setError(data.message || 'Failed to load screenings.');
      }
    } catch {
      setError('Network error while loading screenings.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchScreenings();
  }, [fetchScreenings]);

  async function handleReview(screeningId: string, decision: 'approved' | 'rejected') {
    setReviewingId(screeningId);
    setActionMessage(null);
    const doctorNotes = notesState[screeningId] || '';

    try {
      const res = await fetch(`/api/screenings/${screeningId}/review`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ decision, doctorNotes }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({
          type: 'success',
          text: `Screening ${screeningId.slice(-6)} successfully ${decision}.`,
        });
        setScreenings((prev) =>
          prev.map((s) =>
            s.id === screeningId
              ? {
                  ...s,
                  status: decision,
                  review: {
                    decision,
                    doctorNotes,
                    reviewedAt: new Date().toISOString(),
                    reviewedBy: s.doctorId,
                  },
                }
              : s
          )
        );
      } else {
        setActionMessage({
          type: 'error',
          text: data.message || `Failed to submit ${decision} decision.`,
        });
      }
    } catch {
      setActionMessage({
        type: 'error',
        text: 'Network error while submitting clinical review.',
      });
    } finally {
      setReviewingId(null);
    }
  }

  const toggleDetails = (id: string) => {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredScreenings = screenings.filter((s) => {
    if (filterStatus === 'all') return true;
    return s.status === filterStatus;
  });

  const pendingCount = screenings.filter((s) => s.status === 'pending_review').length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)]">
            Screening Results &amp; Review Queue
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Clinical validation workflow for AI fundus predictions. Approve or reject screenings before releasing reports to patients.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] self-start sm:self-auto text-xs">
          {(['all', 'pending_review', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${
                filterStatus === st
                  ? 'bg-brand-600 text-white dark:bg-brand-500'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {st === 'all'
                ? `All (${screenings.length})`
                : st === 'pending_review'
                ? `Pending (${pendingCount})`
                : st}
            </button>
          ))}
        </div>
      </div>

      {/* Action feedback banner */}
      {actionMessage && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm">{actionMessage.text}</span>
        </div>
      )}

      {loading ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 dark:text-brand-400 mb-3" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading screening reviews...</p>
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-red-600 dark:text-red-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchScreenings}
            className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700"
          >
            Retry
          </button>
        </div>
      ) : filteredScreenings.length === 0 ? (
        <div className="card p-12 text-center bg-[var(--color-surface)]">
          <BarChart3 className="w-12 h-12 text-[var(--color-text-subtle)] mx-auto mb-3" />
          <h3 className="font-display font-semibold text-lg text-[var(--color-text)]">
            No Screenings Found
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-sm mx-auto mt-1">
            {filterStatus === 'pending_review'
              ? 'All fundus screenings have been clinically reviewed.'
              : 'No screenings match the selected status filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredScreenings.map((screening) => {
            const cls = screening.aiResult.predictedClass;
            const colors = DR_COLORS[cls];
            const isPending = screening.status === 'pending_review';
            const isApproved = screening.status === 'approved';
            const isRejected = screening.status === 'rejected';
            const isReviewing = reviewingId === screening.id;
            const isExpanded = expandedDetails[screening.id] ?? isPending;

            return (
              <div
                key={screening.id}
                className="card p-6 border border-[var(--color-border)] shadow-sm space-y-5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-base text-[var(--color-text)]">
                          {screening.patient?.name || 'Patient'}
                        </h3>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          ({screening.patient?.email})
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-subtle)] font-mono">
                        Screening ID: {screening.id} • {new Date(screening.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPending ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Review
                      </span>
                    ) : isApproved ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Prediction Summary Badge */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`rounded-xl border p-4 col-span-2 ${colors.bg} ${colors.border}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider block">
                          AI Neural Network Classification
                        </span>
                        <span className={`font-display font-bold text-xl ${colors.text}`}>
                          {screening.aiResult.predictedLabel}
                        </span>
                      </div>
                      <span className={`text-sm font-bold px-2.5 py-1 rounded-lg bg-white/60 dark:bg-black/40 ${colors.text}`}>
                        Class {cls}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-black/10 dark:border-white/10">
                      <span className="text-[var(--color-text-muted)]">Model Confidence</span>
                      <span className={`font-bold ${colors.text}`}>
                        {(screening.aiResult.confidence * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="card p-4 flex flex-col justify-between bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                    <div>
                      <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">
                        Referable Retinopathy
                      </span>
                      <div className="flex items-center gap-1.5">
                        {screening.aiResult.referable ? (
                          <span className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Yes (Action Required)
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> No (Routine Care)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
                      <span>Prob: {(screening.aiResult.referableProbability * 100).toFixed(1)}%</span>
                      <span className="block truncate text-[10px] text-[var(--color-text-subtle)]">
                        File: {screening.image?.originalFilename || 'fundus.png'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expandable Probabilities & Disclaimer */}
                <div>
                  <button
                    onClick={() => toggleDetails(screening.id)}
                    className="text-xs font-medium text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline mb-2"
                  >
                    <span>{isExpanded ? 'Hide Probability Distribution' : 'Show Probability Distribution & Disclaimer'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] space-y-3">
                      <div className="space-y-1.5">
                        {([0, 1, 2, 3, 4] as const).map((c) => {
                          const prob = screening.aiResult.classProbabilities[String(c) as keyof ClassProbabilities] ?? 0;
                          const isPred = c === cls;
                          const barColors = DR_COLORS[c];
                          return (
                            <div key={c} className="flex items-center gap-2 text-xs">
                              <span className={`w-24 shrink-0 font-medium ${isPred ? barColors.text : 'text-[var(--color-text-muted)]'}`}>
                                {CLASS_LABELS[c]}
                              </span>
                              <div className="flex-1 h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isPred ? 'bg-brand-500' : 'bg-[var(--color-text-subtle)]'}`}
                                  style={{ width: `${(prob * 100).toFixed(1)}%` }}
                                />
                              </div>
                              <span className={`w-12 text-right ${isPred ? barColors.text + ' font-bold' : 'text-[var(--color-text-muted)]'}`}>
                                {(prob * 100).toFixed(1)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {screening.aiResult.disclaimer && (
                        <p className="text-[11px] text-[var(--color-text-muted)] italic pt-2 border-t border-[var(--color-border)]">
                          {screening.aiResult.disclaimer}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Doctor Review Section */}
                <div className="pt-4 border-t border-[var(--color-border)]">
                  {isPending ? (
                    <div className="space-y-3 bg-amber-50/40 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h4 className="font-semibold text-xs text-[var(--color-text)] uppercase tracking-wider">
                          Doctor Clinical Evaluation &amp; Release
                        </h4>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[var(--color-text)] mb-1">
                          Diagnostic Notes &amp; Clinical Recommendations (optional)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Enter clinical observations, recommended follow-up schedule, or notes for the patient report..."
                          value={notesState[screening.id] || ''}
                          onChange={(e) =>
                            setNotesState((prev) => ({ ...prev, [screening.id]: e.target.value }))
                          }
                          className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2.5 pt-1">
                        <button
                          onClick={() => handleReview(screening.id, 'rejected')}
                          disabled={isReviewing}
                          className="btn btn-outline btn-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject Finding</span>
                        </button>
                        <button
                          onClick={() => handleReview(screening.id, 'approved')}
                          disabled={isReviewing}
                          className="btn btn-primary btn-sm flex items-center gap-1.5"
                        >
                          {isReviewing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Submitting Review...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve &amp; Release Report</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[var(--color-text)] flex items-center gap-1.5">
                          {isApproved ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          Clinical Decision: <strong className="capitalize">{screening.review?.decision || screening.status}</strong>
                        </span>
                        {screening.review?.reviewedAt && (
                          <span className="text-[var(--color-text-muted)]">
                            Reviewed on {new Date(screening.review.reviewedAt).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {screening.review?.doctorNotes ? (
                        <p className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] p-2.5 rounded-lg border border-[var(--color-border)]">
                          <strong>Doctor Notes:</strong> {screening.review.doctorNotes}
                        </p>
                      ) : (
                        <p className="text-xs text-[var(--color-text-muted)] italic">
                          No additional doctor notes recorded.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

