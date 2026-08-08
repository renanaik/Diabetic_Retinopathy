import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { SeverityBadge } from '../components/ui/Badge';
import { ConfidenceScore } from '../components/results/ConfidenceScore';
import { ProbabilityChart } from '../components/results/ProbabilityChart';
import { StageScale } from '../components/results/StageScale';
import { AttentionMapViewer } from '../components/results/AttentionMapViewer';
import { ResultSummary } from '../components/results/ResultSummary';
import { Card } from '../components/ui/Card';
import { LoadingState, EmptyState } from '../components/ui/States';
import { getScreeningResult } from '../services/api';
import type { ScreeningResult } from '../types';
import { DR_STAGES } from '../types';
import {
  Eye, Calendar, AlertCircle, Info,
  Microscope, ArrowLeft, TrendingUp,
} from 'lucide-react';

const CONFIDENCE_BADGE_COLOR: Record<string, string> = {
  high:   'bg-teal-50 text-teal-700 border-teal-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low:    'bg-red-50 text-red-600 border-red-200',
};

function confidenceLevel(c: number) {
  if (c >= 0.9) return 'high';
  if (c >= 0.7) return 'medium';
  return 'low';
}

const FINDING_CONFIDENCE_COLORS: Record<string, string> = {
  high: 'text-red-600 bg-red-50 border-red-200',
  moderate: 'text-amber-600 bg-amber-50 border-amber-200',
  low: 'text-yellow-600 bg-yellow-50 border-yellow-200',
};

export const ResultsPage: React.FC = () => {
  const { screeningId } = useParams<{ screeningId?: string }>();
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = screeningId ?? 'SCR-2026-002';
    getScreeningResult(id).then((res) => {
      if (res.success) {
        setResult(res.data);
      } else {
        setError('Screening record not found.');
      }
      setLoading(false);
    });
  }, [screeningId]);

  if (loading) return <div className="p-6"><LoadingState message="Loading screening result…" /></div>;

  if (error || !result) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertCircle size={24} className="text-red-400" />}
          title="Result not found"
          description={error ?? 'The requested screening result could not be loaded.'}
          action={<Link to="/history"><button className="text-sm text-teal-600 underline">Back to History</button></Link>}
        />
      </div>
    );
  }

  const stage = DR_STAGES[result.predictedStage];
  const confLevel = confidenceLevel(result.confidence);
  const date = new Date(result.examinationDate).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="AI Screening Result"
        subtitle={`Screening ID: ${result.screeningId}`}
        breadcrumb={[
          { label: 'History', href: '/history' },
          { label: result.screeningId },
        ]}
        action={
          <Link to="/progress">
            <button className="flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
              <TrendingUp size={14} />
              View Progress
            </button>
          </Link>
        }
      />

      {/* ── Top: Summary strip ── */}
      <div className="bg-white border border-clinical-border rounded-lg shadow-clinical p-5 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Stage & badge */}
          <div className="flex-1">
            <p className="text-xs text-clinical-muted font-medium uppercase tracking-wide mb-1.5">
              Predicted Stage
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className={`text-2xl font-bold ${stage.color}`}>{stage.name}</h2>
              <SeverityBadge stage={result.predictedStage} size="lg" />
            </div>
            <p className="text-xs text-clinical-muted mt-1.5">
              Stage {result.predictedStage} of 4 &nbsp;·&nbsp;
              <Eye size={11} className="inline mr-0.5" /> {result.eye} Eye &nbsp;·&nbsp;
              <Calendar size={11} className="inline mr-0.5" /> {date}
            </p>
          </div>

          {/* Confidence ring */}
          <div className="flex items-center gap-6">
            <ConfidenceScore value={result.confidence} size="md" />
            <div className="hidden sm:block h-16 w-px bg-clinical-border" />
            {/* Stage scale */}
            <div className="w-52 hidden lg:block">
              <p className="text-xs text-clinical-muted mb-2 font-medium">Severity Scale</p>
              <StageScale predictedStage={result.predictedStage} />
            </div>
          </div>
        </div>

        {/* Mobile stage scale */}
        <div className="mt-4 lg:hidden">
          <p className="text-xs text-clinical-muted mb-2 font-medium">Severity Scale</p>
          <StageScale predictedStage={result.predictedStage} />
        </div>
      </div>

      {/* ── Two column layout ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Image viewer */}
        <div className="space-y-5">
          {/* Attention map viewer */}
          <Card padding="md">
            <div className="mb-3">
              <p className="text-sm font-semibold text-navy-800">Retinal Image Analysis</p>
              <p className="text-xs text-clinical-muted mt-0.5">
                Switch between original image and AI attention map.
              </p>
            </div>
            <AttentionMapViewer />
          </Card>

          {/* Potential findings */}
          {result.potentialFindings.length > 0 && (
            <Card padding="md">
              <div className="flex items-center gap-2 mb-4">
                <Microscope size={16} className="text-navy-600" />
                <div>
                  <p className="text-sm font-semibold text-navy-800">Potential Findings</p>
                  <p className="text-xs text-clinical-muted">
                    Model visualization outputs — not confirmed clinical findings
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {result.potentialFindings.map((finding, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-md border ${FINDING_CONFIDENCE_COLORS[finding.confidence]}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold">{finding.type}</p>
                      <span className={`text-xs rounded-full px-2 py-0.5 border font-medium capitalize ${FINDING_CONFIDENCE_COLORS[finding.confidence]}`}>
                        {finding.confidence}
                      </span>
                    </div>
                    <p className="text-xs mt-1 opacity-80">{finding.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <Info size={12} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  These are AI model outputs for visualization purposes only and require clinical verification.
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Right: Probability + Summary */}
        <div className="space-y-5">
          {/* Probability chart */}
          <Card padding="md">
            <div className="mb-4">
              <p className="text-sm font-semibold text-navy-800">Probability Distribution</p>
              <p className="text-xs text-clinical-muted mt-0.5">
                Model output probability across all DR stages
              </p>
            </div>
            <ProbabilityChart
              probabilities={result.probabilities}
              highlightedStage={result.predictedStage}
            />
          </Card>

          {/* Clinical summary */}
          <Card padding="md">
            <ResultSummary result={result} />
          </Card>
        </div>
      </div>
    </div>
  );
};
