import React, { useState, useEffect, useCallback } from 'react';
import {
  Eye,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Sparkles,
  FileText,
  UserCheck,
  Users,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ScreeningItem {
  id: string;
  status: 'pending_review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  image: {
    originalFilename: string;
    size: number;
    mimeType: string;
  };
  aiResult: {
    predictedClass: number;
    predictedLabel: string;
    confidence: number;
    referable: boolean;
    referableProbability: number;
  };
  review?: {
    decision: 'approved' | 'rejected';
    doctorNotes: string;
    reviewedAt: string;
  } | null;
  doctor: {
    id: string;
    name: string;
    email: string;
    specialization: string;
    hospital: string;
  };
  patient: {
    id: string;
    name: string;
    email: string;
    patientId: string;
  };
}

export const AdminScreenings: React.FC = () => {
  const { token } = useAuth();
  const [screenings, setScreenings] = useState<ScreeningItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending_review' | 'rejected'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchScreenings = useCallback(async () => {
    const authToken = token || localStorage.getItem('retinacare_auth_token');
    if (!authToken) {
      setError('Authentication token missing. Please sign in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/screenings', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setScreenings(data.data?.screenings || []);
      } else {
        setError(data.message || 'Failed to fetch screenings.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network error while fetching screenings.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchScreenings();
  }, [fetchScreenings]);

  const filteredScreenings = screenings.filter((scr) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      scr.patient.name.toLowerCase().includes(q) ||
      scr.patient.patientId.toLowerCase().includes(q) ||
      scr.doctor.name.toLowerCase().includes(q) ||
      scr.aiResult.predictedLabel.toLowerCase().includes(q) ||
      scr.doctor.hospital.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all' || scr.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stageStyles: Record<number, { bg: string; text: string; border: string }> = {
    0: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
    1: { bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    2: { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
    3: { bg: 'bg-orange-50 dark:bg-orange-950/50', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
    4: { bg: 'bg-rose-50 dark:bg-rose-950/50', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full px-3 py-1 mb-2">
            <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
              Clinical Diagnostic Oversight
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
            AI Screenings & Diagnostic Archive
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Global log of retinal fundus screenings, EfficientNet-B4 classifications, and ophthalmologist reviews.
          </p>
        </div>

        <button
          onClick={fetchScreenings}
          disabled={loading}
          className="btn btn-outline btn-sm self-start sm:self-auto gap-2"
          id="refresh-screenings-btn"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Status Filter Tabs */}
        <div className="flex gap-2 p-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl self-start">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            All ({screenings.length})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Approved ({screenings.filter((s) => s.status === 'approved').length})
          </button>
          <button
            onClick={() => setStatusFilter('pending_review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'pending_review'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Clock className="w-3 h-3" />
            In Review ({screenings.filter((s) => s.status === 'pending_review').length})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'rejected'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <XCircle className="w-3 h-3" />
            Rejected ({screenings.filter((s) => s.status === 'rejected').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, ID, doctor, diagnosis…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Failed to load screenings</p>
            <p className="text-xs mt-0.5 opacity-90">{error}</p>
          </div>
          <button
            onClick={fetchScreenings}
            className="text-xs font-semibold underline hover:no-underline ml-auto"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5 border-[var(--color-border)] animate-pulse flex flex-col md:flex-row gap-4 justify-between">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredScreenings.length === 0 && (
        <div className="card p-12 text-center border-[var(--color-border)]">
          <Eye className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3 opacity-40" />
          <h3 className="font-display font-bold text-lg text-[var(--color-text)]">
            No Screenings Found
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto mt-1">
            {screenings.length === 0
              ? 'No retinal fundus screening records have been created yet.'
              : 'No screenings match your current filter or search criteria.'}
          </p>
        </div>
      )}

      {/* Screenings List */}
      {!loading && !error && filteredScreenings.length > 0 && (
        <div className="space-y-3">
          {filteredScreenings.map((scr) => {
            const isExpanded = expandedId === scr.id;
            const stage = stageStyles[scr.aiResult.predictedClass] || stageStyles[0];

            return (
              <div
                key={scr.id}
                className="card p-5 border border-[var(--color-border)] hover:border-emerald-500/40 transition-all"
                id={`screening-card-${scr.id}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Patient and Doctor info */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                    {/* Patient block */}
                    <div className="min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-brand-500" />
                        <h3 className="font-bold text-sm text-[var(--color-text)]">{scr.patient.name}</h3>
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                          {scr.patient.patientId}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{scr.patient.email}</p>
                    </div>

                    {/* Doctor block */}
                    <div className="min-w-[200px]">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                        <UserCheck className="w-3.5 h-3.5 text-violet-500" />
                        <span>Physician:</span>
                        <span className="font-semibold text-[var(--color-text)]">{scr.doctor.name}</span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{scr.doctor.hospital || 'Clinic'}</p>
                    </div>
                  </div>

                  {/* Middle: AI Diagnosis Badge */}
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${stage.bg} ${stage.text} ${stage.border}`}>
                      <Sparkles className="w-3 h-3" />
                      {scr.aiResult.predictedLabel}
                    </span>

                    {scr.aiResult.referable && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                        Referable
                      </span>
                    )}
                  </div>

                  {/* Right: Review Status & Action */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--color-border)]">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                        scr.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : scr.status === 'rejected'
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                      }`}
                    >
                      {scr.status === 'approved' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : scr.status === 'rejected' ? (
                        <XCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {scr.status === 'approved' ? 'Doctor Approved' : scr.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                    </span>

                    <button
                      onClick={() => toggleExpand(scr.id)}
                      className="btn btn-outline btn-sm text-xs gap-1 py-1 px-2.5"
                    >
                      <span>{isExpanded ? 'Hide' : 'Details'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Expandable Review & Image Info */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)] grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-50 duration-200">
                    <div className="p-3.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                      <h4 className="text-xs font-semibold text-[var(--color-text)] flex items-center gap-1.5 mb-2">
                        <FileText className="w-3.5 h-3.5 text-brand-500" />
                        Doctor Clinical Decision & Notes
                      </h4>
                      {scr.review ? (
                        <div className="space-y-1.5 text-xs">
                          <p className="text-[var(--color-text-muted)]">
                            <strong className="text-[var(--color-text)]">Decision:</strong> {scr.review.decision.toUpperCase()} on {new Date(scr.review.reviewedAt).toLocaleString()}
                          </p>
                          <p className="text-[var(--color-text-muted)] italic">
                            "{scr.review.doctorNotes || 'No notes provided by physician.'}"
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--color-text-muted)] italic">
                          Awaiting official review from Dr. {scr.doctor.name}.
                        </p>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                      <h4 className="text-xs font-semibold text-[var(--color-text)] flex items-center gap-1.5 mb-2">
                        <Activity className="w-3.5 h-3.5 text-cyan-500" />
                        Screening Telemetry & Image Metadata
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-text-muted)]">
                        <div>
                          <span className="text-[10px] uppercase block opacity-70">Image Name</span>
                          <span className="font-mono text-[11px] text-[var(--color-text)] truncate block">{scr.image.originalFilename}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase block opacity-70">Image Size</span>
                          <span className="text-[var(--color-text)] block">{(scr.image.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase block opacity-70">Screening Date</span>
                          <span className="text-[var(--color-text)] block">{new Date(scr.createdAt).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase block opacity-70">Record ID</span>
                          <span className="font-mono text-[10px] text-[var(--color-text)] truncate block">{scr.id}</span>
                        </div>
                      </div>
                    </div>
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
