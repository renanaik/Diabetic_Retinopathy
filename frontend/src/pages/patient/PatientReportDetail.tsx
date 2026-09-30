import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Stethoscope,
  ArrowLeft,
  Printer,
  Download,
  Loader2,
  AlertCircle,
  HelpCircle,
  CheckSquare,
  Info,
  IdCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DR_STAGES, DR_CLASS_MAPPING } from '../../types';
import {
  printStandaloneReport,
  downloadStandaloneReport,
  StandaloneReportData,
} from '../../utils/reportGenerator';

interface SingleReportData {
  id: string;
  patientId: string;
  doctorId: string;
  patient?: {
    id: string;
    name: string;
    email: string;
    patientId: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
  } | null;
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
  status: 'approved';
  aiResult: {
    predictedClass: 0 | 1 | 2 | 3 | 4;
    predictedLabel: string;
    referable: boolean;
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
  const colors = DR_COLORS[cls] || DR_COLORS[0];
  const stageInfo = DR_STAGES.find((s) => s.index === cls);
  const fullDiagnosis = DR_CLASS_MAPPING[cls] || report.aiResult.predictedLabel;

  const patientIdDisplay = report.patient?.patientId || user?.patientId || 'RC-000000';

  const handlePrintReport = () => {
    if (!report) return;
    const standaloneData: StandaloneReportData = {
      reportId: report.id,
      createdAt: report.createdAt,
      patient: {
        name: report.patient?.name || user?.name || 'Patient',
        patientId: patientIdDisplay,
        email: report.patient?.email || user?.email,
        dateOfBirth: report.patient?.dateOfBirth,
        gender: report.patient?.gender,
        phone: report.patient?.phone,
      },
      doctor: report.doctor,
      image: report.image,
      aiResult: report.aiResult,
      review: report.review,
    };
    printStandaloneReport(standaloneData);
  };

  const handleDownloadReport = () => {
    if (!report) return;
    const standaloneData: StandaloneReportData = {
      reportId: report.id,
      createdAt: report.createdAt,
      patient: {
        name: report.patient?.name || user?.name || 'Patient',
        patientId: patientIdDisplay,
        email: report.patient?.email || user?.email,
        dateOfBirth: report.patient?.dateOfBirth,
        gender: report.patient?.gender,
        phone: report.patient?.phone,
      },
      doctor: report.doctor,
      image: report.image,
      aiResult: report.aiResult,
      review: report.review,
    };
    downloadStandaloneReport(standaloneData);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Navigation and actions bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/patient/reports"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Reports</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadReport}
            className="btn btn-secondary btn-sm inline-flex items-center gap-1.5"
            title="Download standalone medical report file"
          >
            <Download className="w-4 h-4" />
            <span>Download Standalone Report</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
            title="Print or save report as PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Official Patient Examination Report */}
      <div className="card p-8 md:p-10 border border-[var(--color-border)] shadow-md space-y-8 bg-[var(--color-surface)]">
        {/* 1. REPORT HEADER */}
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
              Patient Diagnostic Examination Report
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
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 border bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Doctor Verified: Approved
            </span>
          </div>
        </div>

        {/* 2. PATIENT & DOCTOR DETAILS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs">
          <div className="space-y-1.5">
            <span className="font-semibold uppercase tracking-wider text-[var(--color-text-muted)] block text-[10px]">
              Patient Details
            </span>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-[var(--color-text)]">{report.patient?.name || user?.name || 'Patient'}</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                <IdCard className="w-3 h-3" />
                {patientIdDisplay}
              </span>
            </div>
            <p className="text-[var(--color-text-muted)]">{report.patient?.email || user?.email}</p>
            {report.patient?.dateOfBirth && (
              <p className="text-[var(--color-text-muted)]">DOB: {report.patient.dateOfBirth}</p>
            )}
          </div>

          <div className="space-y-1">
            <span className="font-semibold uppercase tracking-wider text-[var(--color-text-muted)] block text-[10px]">
              Attending Ophthalmologist
            </span>
            <p className="text-sm font-bold text-[var(--color-text)]">Dr. {report.doctor?.name || 'Ophthalmologist'}</p>
            <p className="text-[var(--color-text-muted)]">{report.doctor?.specialization || 'Ophthalmology'}</p>
            <p className="text-[var(--color-text-muted)]">{report.doctor?.hospital || 'RetinaCare Partner Clinic'}</p>
          </div>
        </div>

        {/* 3. FINAL DIAGNOSIS */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
            <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">
              Final Diagnosis
            </h3>
          </div>

          <div className={`p-5 rounded-xl border ${colors.bg} ${colors.border}`}>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] block">
              Diagnosed Severity
            </span>
            <p className={`font-display font-bold text-2xl ${colors.text} mt-1`}>
              {fullDiagnosis}
            </p>
          </div>
        </div>

        {/* 4. WHAT THE RESULT MEANS */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
            <HelpCircle className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">
              What The Result Means
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-sm text-[var(--color-text)] leading-relaxed">
            {stageInfo?.description || 'No detailed explanation available for this stage.'}
          </div>
        </div>

        {/* 5. DOCTOR'S ASSESSMENT */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
            <Stethoscope className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">
              Doctor&apos;s Assessment
            </h3>
          </div>

          <div className="p-5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] space-y-3">
            {report.review?.reviewedAt && (
              <div className="text-xs text-[var(--color-text-muted)]">
                Reviewed on {new Date(report.review.reviewedAt).toLocaleDateString()}
              </div>
            )}
            <p className="text-sm text-[var(--color-text)] leading-relaxed bg-[var(--color-surface)] p-3.5 rounded-lg border border-[var(--color-border)]">
              {report.review?.doctorNotes || 'Doctor reviewed and confirmed the screening result. Continue regular eye health monitoring.'}
            </p>
          </div>
        </div>

        {/* 6. RECOMMENDED NEXT STEPS */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
            <CheckSquare className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">
              Recommended Next Steps
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-sm text-[var(--color-text)] space-y-2">
            <ul className="list-disc list-inside space-y-1 text-[var(--color-text)]">
              <li>Review the doctor&apos;s assessment and recommendations above carefully.</li>
              <li>
                {report.aiResult.referable
                  ? 'Schedule a follow-up consultation with your attending ophthalmologist or retina specialist for further evaluation.'
                  : 'Schedule regular follow-up eye examinations as advised by your ophthalmologist.'}
              </li>
              <li>Maintain routine blood sugar control and overall diabetes management.</li>
            </ul>
          </div>
        </div>

        {/* 7. MEDICAL NOTICE */}
        <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-[var(--color-text-muted)] space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
            <Info className="w-4 h-4" />
            <span>Important Medical Notice</span>
          </div>
          <p className="italic">
            {report.aiResult.disclaimer || 'This report is generated with AI-assisted screening and reviewed by a licensed doctor. It is intended for early clinical screening and is not a substitute for a comprehensive in-person medical diagnosis.'}
          </p>
        </div>
      </div>
    </div>
  );
};
