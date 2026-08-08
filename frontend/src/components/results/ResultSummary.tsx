import React from 'react';
import type { ScreeningResult } from '../../types';
import { DR_STAGES } from '../../types';
import { SeverityBadge } from '../ui/Badge';
import { ConfidenceScore } from './ConfidenceScore';
import { Disclaimer } from '../ui/Disclaimer';
import { ClipboardCheck, Stethoscope } from 'lucide-react';

interface ResultSummaryProps {
  result: ScreeningResult;
  className?: string;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({
  result,
  className = '',
}) => {
  const stage = DR_STAGES[result.predictedStage];
  const pct = Math.round(result.confidence * 100);

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-md bg-navy-50 flex items-center justify-center flex-shrink-0">
          <ClipboardCheck size={18} className="text-navy-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-navy-800">AI Screening Summary</h3>
          <p className="text-xs text-clinical-muted mt-0.5">
            Generated from model prediction — not a clinical diagnosis
          </p>
        </div>
      </div>

      {/* Summary text */}
      <div className="p-4 bg-clinical-bg border border-clinical-border rounded-lg mb-4">
        <p className="text-sm text-navy-700 leading-relaxed">
          Model prediction indicates{' '}
          <span className={`font-semibold ${stage.color}`}>{stage.name}</span>{' '}
          with <span className="font-semibold text-navy-800">{pct}% confidence</span>.
        </p>
        <p className="mt-2 text-xs text-clinical-muted">
          Screening ID: <span className="font-mono font-medium">{result.screeningId}</span>
          &nbsp;·&nbsp;
          Eye: <span className="font-medium">{result.eye}</span>
          &nbsp;·&nbsp;
          Date:{' '}
          <span className="font-medium">
            {new Date(result.examinationDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </p>
      </div>

      {/* Recommendation */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
        <Stethoscope size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-800">Recommendation</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            {result.predictedStage >= 3
              ? 'Urgent professional ophthalmic evaluation is strongly recommended for clinical confirmation and appropriate management.'
              : result.predictedStage >= 2
              ? 'Professional ophthalmic evaluation is recommended for clinical confirmation.'
              : result.predictedStage >= 1
              ? 'Routine follow-up with an ophthalmologist is advised. Regular monitoring recommended.'
              : 'Continue routine screening. No significant model findings. Follow-up as clinically indicated.'}
          </p>
        </div>
      </div>

      <Disclaimer variant="inline" />
    </div>
  );
};
