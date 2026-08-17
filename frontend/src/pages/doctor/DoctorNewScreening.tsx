import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Upload, FileImage, Loader2, AlertCircle, CheckCircle2, XCircle, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface AiResult {
  predictedClass: 0 | 1 | 2 | 3 | 4;
  predictedLabel: string;
  confidence: number;
  classProbabilities: ClassProbabilities;
  referable: boolean;
  referableProbability: number;
  disclaimer?: string;
}

interface ScreeningResult {
  id: string;
  patientId: string;
  doctorId: string;
  status: 'pending_review' | 'approved' | 'rejected';
  aiResult: AiResult;
  image: { originalFilename: string; mimeType: string; size: number };
  patient: { id: string; name: string; email: string } | null;
  doctor: { id: string; name: string } | null;
  createdAt: string;
}

// ─── Severity colour map ──────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export const DoctorNewScreening: React.FC = () => {
  const { token } = useAuth();

  // Patient list state
  const [patients, setPatients]               = useState<ConnectedPatient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError]     = useState<string | null>(null);

  // Selection state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedFile, setSelectedFile]           = useState<File | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [result, setResult]             = useState<ScreeningResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch connected patients from /api/connections/my-patients ────────────
  const fetchPatients = useCallback(async () => {
    setPatientsLoading(true);
    setPatientsError(null);
    try {
      const res = await fetch('/api/connections/my-patients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPatients(data.data.patients as ConnectedPatient[]);
      } else {
        setPatientsError(data.message || 'Failed to load connected patients.');
      }
    } catch {
      setPatientsError('Network error while loading patients.');
    } finally {
      setPatientsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // ── File picker handler (existing behaviour, unchanged) ───────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setResult(null);
    setSubmitError(null);
  }

  // ── Submit: POST /api/screenings with multipart FormData ──────────────────
  async function handleSubmit() {
    if (!selectedPatientId || !selectedFile || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('patientId', selectedPatientId);   // text field
      formData.append('file', selectedFile, selectedFile.name); // binary field

      const res = await fetch('/api/screenings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },  // NO Content-Type — browser sets multipart boundary
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult(data.data.screening as ScreeningResult);
      } else {
        let msg = data.message || 'Screening failed.';
        if (res.status === 401) msg = 'Session expired. Please log in again.';
        if (res.status === 403) msg = data.message || 'No accepted connection with this patient.';
        if (res.status === 503) msg = 'AI inference service is temporarily unavailable. Please try again shortly.';
        setSubmitError(msg);
      }
    } catch {
      setSubmitError('Network error — could not reach the server. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit = Boolean(selectedPatientId && selectedFile && !isSubmitting);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">New Retinal Screening</h1>

      {/* ── Step 1: Patient Selection ──────────────────────────────────────── */}
      <div className="card p-6 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <h2 className="font-semibold text-sm text-[var(--color-text)]">Step 1 — Select Patient</h2>
        </div>

        {patientsLoading ? (
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading connected patients…
          </div>
        ) : patientsError ? (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{patientsError}</span>
            <button onClick={fetchPatients} className="ml-auto text-xs underline hover:no-underline">
              Retry
            </button>
          </div>
        ) : patients.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            No connected patients found. Ask a patient to send you a connection request.
          </p>
        ) : (
          <select
            id="patient-select"
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              setResult(null);
              setSubmitError(null);
            }}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">— Select a connected patient —</option>
            {patients.map((item) =>
              item.patient ? (
                <option key={item.patient.id} value={item.patient.id}>
                  {item.patient.name} ({item.patient.email})
                </option>
              ) : null
            )}
          </select>
        )}
      </div>

      {/* ── Step 2: Image Upload (existing file picker behaviour, unchanged) ── */}
      <div className="card p-6 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Upload className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <h2 className="font-semibold text-sm text-[var(--color-text)]">Step 2 — Upload Retinal Image</h2>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Visible upload box — click triggers hidden input */}
        <div
          className="card p-8 text-center border-dashed border-2 border-[var(--color-border)] cursor-pointer hover:border-brand-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-brand-600 dark:text-brand-400 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg mb-2">Upload Retinal Fundus Image</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Select or drag and drop JPEG/PNG fundus photograph for EfficientNet-B4 analysis.
          </p>

          {selectedFile && (
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-brand-600 dark:text-brand-400 font-medium">
              <FileImage className="w-4 h-4" />
              <span>{selectedFile.name}</span>
              <span className="text-[var(--color-text-muted)] font-normal">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Step 3: Submit ─────────────────────────────────────────────────── */}
      <button
        id="run-screening-btn"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="btn btn-primary btn-md w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing retinal image…
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Run AI Screening
          </>
        )}
      </button>

      {!selectedPatientId && !patientsLoading && patients.length > 0 && (
        <p className="text-xs text-[var(--color-text-muted)] text-center -mt-3">
          Select a patient and an image above to enable screening.
        </p>
      )}

      {/* ── Error Banner ───────────────────────────────────────────────────── */}
      {submitError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{submitError}</p>
        </div>
      )}

      {/* ── AI Result Panel ────────────────────────────────────────────────── */}
      {result && (() => {
        const cls    = result.aiResult.predictedClass;
        const colors = DR_COLORS[cls];
        return (
          <div className="card p-6 space-y-5 border border-[var(--color-border)]">

            {/* Header row */}
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="font-semibold text-[var(--color-text)]">Screening Complete</p>
                <p className="text-xs text-[var(--color-text-muted)] font-mono">ID: {result.id}</p>
              </div>
              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-medium border border-amber-200 dark:border-amber-800">
                {result.status.replace('_', ' ')}
              </span>
            </div>

            {/* Patient */}
            {result.patient && (
              <p className="text-sm text-[var(--color-text-muted)]">
                Patient:{' '}
                <span className="font-medium text-[var(--color-text)]">{result.patient.name}</span>
                {' '}— {result.patient.email}
              </p>
            )}

            {/* Predicted class badge */}
            <div className={`rounded-lg border p-4 ${colors.bg} ${colors.border}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`font-display font-bold text-xl ${colors.text}`}>
                  {result.aiResult.predictedLabel}
                </span>
                <span className={`text-sm font-semibold ${colors.text}`}>
                  Class {cls}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Confidence</span>
                <span className={`font-semibold ${colors.text}`}>
                  {(result.aiResult.confidence * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Referable status */}
            <div className="flex items-center gap-2 text-sm">
              {result.aiResult.referable ? (
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
              <span className="text-[var(--color-text)]">
                <span className="font-medium">Referable DR:</span>{' '}
                {result.aiResult.referable ? 'Yes' : 'No'}{' '}
                <span className="text-[var(--color-text-muted)]">
                  ({(result.aiResult.referableProbability * 100).toFixed(1)}% probability)
                </span>
              </span>
            </div>

            {/* Class probability bars */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                Class Probabilities
              </p>
              {([0, 1, 2, 3, 4] as const).map((c) => {
                const prob       = result.aiResult.classProbabilities[String(c) as keyof ClassProbabilities] ?? 0;
                const isPred     = c === cls;
                const barColors  = DR_COLORS[c];
                return (
                  <div key={c} className="flex items-center gap-2 text-xs">
                    <span className={`w-24 shrink-0 font-medium ${isPred ? barColors.text : 'text-[var(--color-text-muted)]'}`}>
                      {CLASS_LABELS[c]}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isPred ? 'bg-brand-500' : 'bg-[var(--color-text-subtle)]'}`}
                        style={{ width: `${(prob * 100).toFixed(1)}%` }}
                      />
                    </div>
                    <span className={`w-14 text-right ${isPred ? barColors.text + ' font-semibold' : 'text-[var(--color-text-muted)]'}`}>
                      {(prob * 100).toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Disclaimer */}
            {result.aiResult.disclaimer && (
              <p className="text-xs text-[var(--color-text-muted)] italic border-t border-[var(--color-border)] pt-3">
                {result.aiResult.disclaimer}
              </p>
            )}

            {/* Pending review notice */}
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              This screening is saved as <strong className="mx-1">pending_review</strong>.
              Review it in the <strong>Results &amp; Reviews</strong> section before it becomes visible to the patient.
            </div>
          </div>
        );
      })()}
    </div>
  );
};


