import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Building2,
  Calendar,
  ArrowRight,
  Loader2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ClassProbabilities {
  '0': number;
  '1': number;
  '2': number;
  '3': number;
  '4': number;
}

interface PatientScreeningReport {
  id: string;
  patientId: string;
  doctorId: string;
  doctor: {
    id: string;
    name: string;
    specialization: string;
    hospital: string;
  } | null;
  image: {
    originalFilename: string;
    mimeType: string;
    size: number;
  };
  status: 'approved' | 'rejected';
  aiResult: {
    predictedClass: 0 | 1 | 2 | 3 | 4;
    predictedLabel: string;
    confidence: number;
    classProbabilities: ClassProbabilities;
    referable: boolean;
    referableProbability: number;
    disclaimer: string;
  };
  review: {
    decision: 'approved' | 'rejected';
    doctorNotes?: string;
    reviewedAt: string;
    reviewedBy: string;
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

export const PatientReports: React.FC = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState<PatientScreeningReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/patient/screenings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReports(data.data.screenings || []);
      } else {
        setError(data.message || 'Failed to load screening reports.');
      }
    } catch {
      setError('Network error while connecting to server.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)]">
            My Retinal Screening Reports
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Official diagnostic reports reviewed and verified by your ophthalmologist.
          </p>
        </div>

        {reports.length > 1 && (
          <Link
            to="/patient/progress"
            className="btn btn-secondary btn-md inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <TrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>View Progress Tracker</span>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 dark:text-brand-400 mb-3" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading clinical reports...</p>
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-red-600 dark:text-red-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchReports}
            className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700"
          >
            Retry
          </button>
        </div>
      ) : reports.length === 0 ? (
        <div className="card p-12 text-center space-y-4 bg-[var(--color-surface)]">
          <div className="w-14 h-14 mx-auto rounded-full bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-[var(--color-text)]">
              No Screening Reports Available Yet
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto mt-1">
              Once your connected doctor performs a retinal fundus examination and verifies the AI findings, your official clinical reports will appear here.
            </p>
          </div>
          <div>
            <Link to="/patient/my-doctor" className="btn btn-primary btn-sm inline-flex items-center gap-1.5">
              <span>Check Connected Doctor</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Diagnostic Reports ({reports.length})
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => {
              const cls = report.aiResult.predictedClass;
              const colors = DR_COLORS[cls];
              const isApproved = report.status === 'approved';

              return (
                <div
                  key={report.id}
                  className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4 hover:border-brand-500/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-base text-[var(--color-text)]">
                            Report #{report.id.slice(-8).toUpperCase()}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${
                              isApproved
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                            }`}
                          >
                            {isApproved ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            Doctor {isApproved ? 'Approved' : 'Rejected'}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>Screening Date: {new Date(report.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/patient/reports/${report.id}`}
                      className="btn btn-primary btn-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <span>View Full Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    {/* Finding badge */}
                    <div className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)] block">
                        Verified Clinical Classification
                      </span>
                      <p className={`font-display font-bold text-lg ${colors.text} mt-0.5`}>
                        {report.aiResult.predictedLabel}
                      </p>
                      <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-black/10 dark:border-white/10">
                        <span className="text-[var(--color-text-muted)]">Confidence</span>
                        <span className={`font-bold ${colors.text}`}>
                          {(report.aiResult.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Reviewing Doctor info */}
                    <div className="p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex flex-col justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)] block">
                          Reviewing Specialist
                        </span>
                        <p className="font-semibold text-sm text-[var(--color-text)] flex items-center gap-1 mt-0.5">
                          <Stethoscope className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                          Dr. {report.doctor?.name || 'Verified Doctor'}
                        </p>
                        {report.doctor?.hospital && (
                          <p className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 mt-1">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span>{report.doctor.hospital}</span>
                          </p>
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--color-text-subtle)] pt-2 border-t border-[var(--color-border)] mt-2">
                        <span>Reviewed: {report.review?.reviewedAt ? new Date(report.review.reviewedAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>

                    {/* Doctor notes summary */}
                    <div className="p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex flex-col justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)] block">
                          Doctor Diagnostic Notes
                        </span>
                        <p className="text-xs text-[var(--color-text)] mt-1 line-clamp-2">
                          {report.review?.doctorNotes || 'No specific clinical notes entered. Follow regular screening regimen.'}
                        </p>
                      </div>
                      <div className="text-[10px] text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)] mt-2">
                        <span>Referable DR: <strong>{report.aiResult.referable ? 'Yes' : 'No'}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

