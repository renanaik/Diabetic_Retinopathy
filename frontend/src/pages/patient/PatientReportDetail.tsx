import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Building2,
  Calendar,
  ArrowLeft,
  Printer,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ClassProbabilities {
  '0': number;
  '1': number;
  '2': number;
  '3': number;
  '4': number;
}

interface SingleReportData {
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

const CLASS_LABELS: Record<number, string> = {
  0: 'No Diabetic Retinopathy',
  1: 'Mild NPDR',
  2: 'Moderate NPDR',
  3: 'Severe NPDR',
  4: 'Proliferative DR',
};

export const PatientReportDetail: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { token, user } = useAuth();
  const [report, setReport] = useState<SingleReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!reportId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/patient/screenings/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReport(data.data.screening || null);
      } else {
        setError(data.message || 'Report not found or not yet reviewed by doctor.');
      }
    } catch {
      setError('Network error while loading report.');
    } finally {
      setLoading(false);
    }
  }, [reportId, token]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (loading) {
    return (
      <div className="card p-16 text-center flex flex-col items-center justify-center max-w-4xl mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 dark:text-brand-400 mb-3" />
        <p className="text-sm text-[var(--color-text-muted)]">Retrieving verified clinical report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="card p-10 text-center max-w-2xl mx-auto space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="font-display text-lg font-bold text-[var(--color-text)]">
          Report Unavailable
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          {error || 'This screening report is either unavailable or has not yet been reviewed by an ophthalmologist.'}
        </p>
        <Link to="/patient/reports" className="btn btn-primary btn-sm inline-flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Screening Reports</span>
        </Link>
      </div>
    );
  }

  const cls = report.aiResult.predictedClass;
  const colors = DR_COLORS[cls];
  const isApproved = report.status === 'approved';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Navigation and actions bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/patient/reports"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Reports</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="btn btn-secondary btn-sm inline-flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save Report</span>
        </button>
      </div>

      {/* Official Clinical Report Paper */}
      <div className="card p-8 md:p-10 border border-[var(--color-border)] shadow-md space-y-8 bg-[var(--color-surface)]">
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b-2 border-[var(--color-border)]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-600 to-cyan-600 flex items-center justify-center text-white font-bold text-xs">
                RC
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-[var(--color-text)]">
                RetinaCare <span className="text-brand-600 dark:text-brand-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Official Diagnostic Fundus Examination Report
            </p>
          </div>

          <div className="text-left sm:text-right space-y-0.5">
            <p className="font-mono text-xs font-bold text-[var(--color-text)]">
              REPORT REF: {report.id.slice(-10).toUpperCase()}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Date: {new Date(report.createdAt).toLocaleDateString()}
            </p>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 border ${
                isApproved
                  ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
              }`}
            >
              {isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              Doctor Verified: {isApproved ? 'Approved' : 'Rejected'}
            </span>
          </div>
        </div>

        {/* Patient & Doctor Clinical Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs">
          <div>
            <span className="font-semibold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1 text-[10px]">
              Patient Details
            </span>
            <p className="text-sm font-bold text-[var(--color-text)]">{user?.name || 'Patient'}</p>
            <p className="text-[var(--color-text-muted)]">{user?.email}</p>
          </div>

          <div>
            <span className="font-semibold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1 text-[10px]">
              Attending Ophthalmologist
            </span>
            <p className="text-sm font-bold text-[var(--color-text)]">Dr. {report.doctor?.name || 'Ophthalmologist'}</p>
            <p className="text-[var(--color-text-muted)]">{report.doctor?.specialization}</p>
            <p className="text-[var(--color-text-muted)]">{report.doctor?.hospital}</p>
          </div>
        </div>

        {/* Section 1: Doctor Clinical Review (Primary) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
            <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">
              Doctor Clinical Evaluation &amp; Recommendation
            </h3>
          </div>

          <div className="p-5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
              <span className="text-[var(--color-text-muted)]">
                Review Decision: <strong className="text-[var(--color-text)] capitalize">{report.review?.decision || report.status}</strong>
              </span>
              <span className="text-[var(--color-text-muted)]">
                Timestamp: {report.review?.reviewedAt ? new Date(report.review.reviewedAt).toLocaleString() : 'N/A'}
              </span>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">
                Clinical Diagnostic Notes
              </span>
              <p className="text-sm text-[var(--color-text)] leading-relaxed bg-[var(--color-surface)] p-3.5 rounded-lg border border-[var(--color-border)]">
                {report.review?.doctorNotes || 'Doctor confirmed AI classification. Continue routine diabetes glycemic control and schedule annual fundus checkup.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: AI Neural Network Inference Findings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">
              AI Deep Learning Inference (EfficientNet-B4)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-5 rounded-xl border ${colors.bg} ${colors.border} flex flex-col justify-between`}>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] block">
                  Predicted Retinopathy Severity
                </span>
                <p className={`font-display font-bold text-2xl ${colors.text} mt-1`}>
                  {report.aiResult.predictedLabel}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Stage {cls} / 4 Classification</p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">AI Model Confidence</span>
                <span className={`font-bold ${colors.text}`}>
                  {(report.aiResult.confidence * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] block">
                  Referable Diabetic Retinopathy Risk
                </span>
                <p className="text-lg font-bold text-[var(--color-text)] mt-1 flex items-center gap-2">
                  {report.aiResult.referable ? (
                    <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                      <XCircle className="w-5 h-5" /> High Risk — Specialist Followup Needed
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-5 h-5" /> Low / Non-Referable Risk
                    </span>
                  )}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
                <span>Referable Probability: {(report.aiResult.referableProbability * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Probability Distribution */}
          <div className="p-5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] space-y-3">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block">
              Multi-Class Probability Distribution
            </span>
            <div className="space-y-2">
              {([0, 1, 2, 3, 4] as const).map((c) => {
                const prob = report.aiResult.classProbabilities[String(c) as keyof ClassProbabilities] ?? 0;
                const isPred = c === cls;
                const barColors = DR_COLORS[c];
                return (
                  <div key={c} className="flex items-center gap-3 text-xs">
                    <span className={`w-36 shrink-0 font-medium ${isPred ? barColors.text : 'text-[var(--color-text-muted)]'}`}>
                      {CLASS_LABELS[c]}
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-[var(--color-border)] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isPred ? 'bg-brand-500' : 'bg-[var(--color-text-subtle)]'}`}
                        style={{ width: `${(prob * 100).toFixed(1)}%` }}
                      />
                    </div>
                    <span className={`w-14 text-right ${isPred ? barColors.text + ' font-bold' : 'text-[var(--color-text-muted)]'}`}>
                      {(prob * 100).toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Legal & Clinical Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-[var(--color-text-muted)] space-y-1">
          <p className="font-semibold text-amber-800 dark:text-amber-300">Important Medical Notice:</p>
          <p className="italic">
            {report.aiResult.disclaimer || 'This report is generated with AI screening assistance and reviewed by a licensed doctor. It is intended for early clinical detection and should be interpreted alongside comprehensive eye examination.'}
          </p>
        </div>
      </div>
    </div>
  );
};

