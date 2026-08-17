import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Activity,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  AlertCircle,
  Stethoscope,
  Info,
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

const STAGE_NAMES = [
  'No DR',
  'Mild NPDR',
  'Moderate NPDR',
  'Severe NPDR',
  'Proliferative DR',
];

const STAGE_COLORS = [
  { fill: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' }, // 0
  { fill: '#eab308', bg: 'bg-yellow-500',  text: 'text-yellow-600 dark:text-yellow-400' },   // 1
  { fill: '#f59e0b', bg: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400' },     // 2
  { fill: '#f97316', bg: 'bg-orange-500',  text: 'text-orange-600 dark:text-orange-400' },   // 3
  { fill: '#ef4444', bg: 'bg-red-500',     text: 'text-red-600 dark:text-red-400' },         // 4
];

export const PatientProgress: React.FC = () => {
  const { token } = useAuth();
  const [screenings, setScreenings] = useState<PatientScreeningReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<PatientScreeningReport | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/patient/screenings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Sort chronologically (oldest to newest) for longitudinal charting
        const sorted = (data.data.screenings || []).sort(
          (a: PatientScreeningReport, b: PatientScreeningReport) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setScreenings(sorted);
      } else {
        setError(data.message || 'Failed to load historical screening progress.');
      }
    } catch {
      setError('Network error while connecting to server.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="card p-16 text-center flex flex-col items-center justify-center max-w-5xl mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 dark:text-brand-400 mb-3" />
        <p className="text-sm text-[var(--color-text-muted)]">Loading longitudinal retinopathy records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center max-w-2xl mx-auto text-red-600 dark:text-red-400">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchHistory}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const count = screenings.length;
  const latestScreening = count > 0 ? screenings[count - 1] : null;
  const initialScreening = count > 0 ? screenings[0] : null;

  let trajectoryText = 'Initial Baseline';
  let trajectoryColor = 'text-brand-600 dark:text-brand-400';

  if (count > 1 && latestScreening && initialScreening) {
    const delta = latestScreening.aiResult.predictedClass - initialScreening.aiResult.predictedClass;
    if (delta > 0) {
      trajectoryText = `Progression (+${delta} Stage${delta > 1 ? 's' : ''})`;
      trajectoryColor = 'text-amber-600 dark:text-amber-400';
    } else if (delta < 0) {
      trajectoryText = `Improvement (${delta} Stage${Math.abs(delta) > 1 ? 's' : ''})`;
      trajectoryColor = 'text-emerald-600 dark:text-emerald-400';
    } else {
      trajectoryText = 'Stable (No Stage Change)';
      trajectoryColor = 'text-cyan-600 dark:text-cyan-400';
    }
  }

  // SVG Chart Dimensions
  const chartWidth = 680;
  const chartHeight = 240;
  const paddingX = 60;
  const paddingY = 30;
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
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)]">
          Retinopathy Progression Tracker
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Longitudinal visualization of your fundus screening classifications across clinical visits.
        </p>
      </div>

      {count === 0 ? (
        <div className="card p-12 text-center space-y-4 bg-[var(--color-surface)]">
          <TrendingUp className="w-12 h-12 text-[var(--color-text-subtle)] mx-auto mb-2" />
          <h3 className="font-display font-semibold text-lg text-[var(--color-text)]">
            No Longitudinal Data Yet
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
            Progress tracking plots become active once your connected ophthalmologist conducts and verifies fundus examinations over time.
          </p>
          <div>
            <Link to="/patient/my-doctor" className="btn btn-primary btn-sm inline-flex items-center gap-1.5">
              <span>View Connected Doctor</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-5 border border-[var(--color-border)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] block">
                Total Screenings
              </span>
              <p className="text-2xl font-display font-bold text-[var(--color-text)] mt-1">{count}</p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Verified Clinical Reports</p>
            </div>

            <div className="card p-5 border border-[var(--color-border)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] block">
                Latest Status
              </span>
              <p className={`text-lg font-display font-bold ${STAGE_COLORS[latestScreening!.aiResult.predictedClass].text} mt-1`}>
                {latestScreening?.aiResult.predictedLabel}
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                Class {latestScreening?.aiResult.predictedClass} ({(latestScreening!.aiResult.confidence * 100).toFixed(0)}% Conf)
              </p>
            </div>

            <div className="card p-5 border border-[var(--color-border)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] block">
                Baseline (Visit 1)
              </span>
              <p className={`text-lg font-display font-bold ${STAGE_COLORS[initialScreening!.aiResult.predictedClass].text} mt-1`}>
                {initialScreening?.aiResult.predictedLabel}
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                {new Date(initialScreening!.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="card p-5 border border-[var(--color-border)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] block">
                DR Severity Trajectory
              </span>
              <p className={`text-base font-display font-bold ${trajectoryColor} mt-1`}>
                {trajectoryText}
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                {count > 1 ? 'Comparative Stage Trend' : 'Single Baseline Recorded'}
              </p>
            </div>
          </div>

          {/* SVG Longitudinal Progress Chart */}
          <div className="card p-6 md:p-8 border border-[var(--color-border)] shadow-sm space-y-6 bg-[var(--color-surface)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[var(--color-border)]">
              <div>
                <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  Diabetic Retinopathy Stage Progression Over Time
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Vertical axis indicates DR severity stage (0 = No DR, 4 = Proliferative). Hover over points to inspect clinical details.
                </p>
              </div>

              {latestScreening?.aiResult.referable && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-1 self-start sm:self-auto">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Referable Risk Detected
                </span>
              )}
            </div>

            {/* Chart Canvas Area */}
            <div className="overflow-x-auto">
              <div className="min-w-[620px] relative">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
                  {/* Background Grid Lines & Severity Bands */}
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
                          x={paddingX - 16}
                          y={y + 4}
                          textAnchor="end"
                          className="text-[10px] font-medium fill-[var(--color-text-muted)]"
                        >
                          Stage {stageIndex} ({STAGE_NAMES[stageIndex].split(' ')[0]})
                        </text>
                      </g>
                    );
                  })}

                  {/* Line Connection Path */}
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
                    const isHovered = hoveredPoint?.id === pt.screening.id;
                    const col = STAGE_COLORS[stage].fill;

                    return (
                      <g key={pt.screening.id} className="cursor-pointer">
                        {/* Hover halo */}
                        {isHovered && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="12"
                            fill={col}
                            opacity="0.25"
                          />
                        )}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? '7' : '5.5'}
                          fill={col}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          onMouseEnter={() => setHoveredPoint(pt.screening)}
                          onClick={() => setHoveredPoint(pt.screening)}
                        />
                        {/* X-axis date label */}
                        <text
                          x={pt.x}
                          y={chartHeight - 8}
                          textAnchor="middle"
                          className="text-[9px] font-medium fill-[var(--color-text-muted)]"
                        >
                          {new Date(pt.screening.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </text>
                        {/* Visit marker */}
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

                {/* Interactive Tooltip Card */}
                {hoveredPoint && (
                  <div className="mt-4 p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--color-text)]">
                          {hoveredPoint.aiResult.predictedLabel}
                        </span>
                        <span className={`px-2 py-0.2 rounded-md font-bold text-[10px] ${STAGE_COLORS[hoveredPoint.aiResult.predictedClass].text}`}>
                          Stage {hoveredPoint.aiResult.predictedClass}
                        </span>
                        <span className="text-[var(--color-text-muted)]">
                          • {(hoveredPoint.aiResult.confidence * 100).toFixed(1)}% Confidence
                        </span>
                      </div>
                      <p className="text-[var(--color-text-muted)]">
                        Screening Date: {new Date(hoveredPoint.createdAt).toLocaleString()} • Attending: Dr. {hoveredPoint.doctor?.name || 'Doctor'}
                      </p>
                      {hoveredPoint.review?.doctorNotes && (
                        <p className="text-[var(--color-text)] italic pt-1">
                          "{hoveredPoint.review.doctorNotes}"
                        </p>
                      )}
                    </div>

                    <Link
                      to={`/patient/reports/${hoveredPoint.id}`}
                      className="btn btn-primary btn-sm inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                    >
                      <span>View Official Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Severity Legend */}
            <div className="pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
              <span className="font-semibold text-[var(--color-text)]">Clinical Severity Legend:</span>
              <div className="flex flex-wrap items-center gap-4">
                {STAGE_NAMES.map((name, i) => (
                  <div key={name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STAGE_COLORS[i].fill }} />
                    <span className="text-[11px]">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Historical Visits Table */}
          <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">
              Historical Screening Records ({screenings.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Visit #</th>
                    <th className="py-2.5 px-3">Screening Date</th>
                    <th className="py-2.5 px-3">DR Stage &amp; Diagnosis</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Reviewing Doctor</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {screenings.map((s, idx) => {
                    const st = s.aiResult.predictedClass;
                    return (
                      <tr key={s.id} className="hover:bg-[var(--color-surface-elevated)] transition-colors">
                        <td className="py-3 px-3 font-semibold text-[var(--color-text)]">
                          Visit #{idx + 1}
                        </td>
                        <td className="py-3 px-3 text-[var(--color-text-muted)]">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-semibold ${STAGE_COLORS[st].text}`}>
                            {s.aiResult.predictedLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[var(--color-text-muted)]">
                          {(s.aiResult.confidence * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-[var(--color-text)]">
                          Dr. {s.doctor?.name || 'Attending'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={`/patient/reports/${s.id}`}
                            className="text-brand-600 dark:text-brand-400 font-medium hover:underline inline-flex items-center gap-1"
                          >
                            <span>Report</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

