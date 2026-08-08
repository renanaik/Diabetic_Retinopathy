import React, { useState } from 'react';
import type { ScreeningResult } from '../../types';
import { RetinalImageViewer } from '../screening/RetinalImageViewer';
import { SeverityBadge } from '../ui/Badge';
import { AlertTriangle } from 'lucide-react';
import { DR_STAGES } from '../../types';

interface ImageComparisonProps {
  previous: ScreeningResult;
  current: ScreeningResult;
  className?: string;
}

type ViewMode = 'previous' | 'current' | 'side-by-side';

export const ImageComparison: React.FC<ImageComparisonProps> = ({
  previous,
  current,
  className = '',
}) => {
  const [mode, setMode] = useState<ViewMode>('side-by-side');

  const prevDate = new Date(previous.examinationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const currDate = new Date(current.examinationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const stageChange = current.predictedStage - previous.predictedStage;
  const prevStage = DR_STAGES[previous.predictedStage];
  const currStage = DR_STAGES[current.predictedStage];

  return (
    <div className={className}>
      {/* Mode switcher */}
      <div className="flex items-center gap-1 mb-4 border border-clinical-border rounded-lg p-1 bg-clinical-bg w-fit">
        {([
          { key: 'previous' as ViewMode, label: 'Previous' },
          { key: 'side-by-side' as ViewMode, label: 'Side by Side' },
          { key: 'current' as ViewMode, label: 'Current' },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={[
              'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
              mode === key
                ? 'bg-white text-navy-700 shadow-clinical border border-clinical-border'
                : 'text-clinical-muted hover:text-navy-600',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Image viewers */}
      {mode === 'side-by-side' ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-navy-700">Previous Examination</p>
              <p className="text-xs text-clinical-muted">{prevDate}</p>
            </div>
            <RetinalImageViewer label={previous.stageName} aspectRatio="portrait" className="w-full" />
            <div className="mt-2 flex items-center justify-between">
              <SeverityBadge stage={previous.predictedStage} size="sm" />
              <span className="text-xs text-clinical-muted">{Math.round(previous.confidence * 100)}% conf.</span>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-navy-700">Current Examination</p>
              <p className="text-xs text-clinical-muted">{currDate}</p>
            </div>
            <RetinalImageViewer label={current.stageName} aspectRatio="portrait" className="w-full" />
            <div className="mt-2 flex items-center justify-between">
              <SeverityBadge stage={current.predictedStage} size="sm" />
              <span className="text-xs text-clinical-muted">{Math.round(current.confidence * 100)}% conf.</span>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-navy-700">
              {mode === 'previous' ? 'Previous Examination' : 'Current Examination'}
            </p>
            <p className="text-xs text-clinical-muted">
              {mode === 'previous' ? prevDate : currDate}
            </p>
          </div>
          <RetinalImageViewer
            label={mode === 'previous' ? previous.stageName : current.stageName}
            aspectRatio="portrait"
            className="w-full max-w-md mx-auto"
          />
          <div className="mt-2 flex items-center gap-2 justify-center">
            <SeverityBadge stage={mode === 'previous' ? previous.predictedStage : current.predictedStage} size="sm" />
            <span className="text-xs text-clinical-muted">
              {Math.round((mode === 'previous' ? previous.confidence : current.confidence) * 100)}% conf.
            </span>
          </div>
        </div>
      )}

      {/* Progress Summary */}
      <div className="mt-5 p-4 bg-clinical-bg border border-clinical-border rounded-lg">
        <p className="text-xs font-semibold text-navy-800 mb-1.5">Progress Summary</p>
        <p className="text-sm text-navy-700">
          Model predictions changed from{' '}
          <span className={`font-semibold ${prevStage.color}`}>{prevStage.shortName}</span>
          {' '}to{' '}
          <span className={`font-semibold ${currStage.color}`}>{currStage.shortName}</span>
          {' '}between examinations
          {stageChange !== 0 && (
            <>
              {' '}
              <span className={stageChange > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                ({stageChange > 0 ? `+${stageChange}` : stageChange} stage{Math.abs(stageChange) > 1 ? 's' : ''})
              </span>
            </>
          )}
          .
        </p>
      </div>

      {/* Caution note */}
      <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
        <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          Changes shown here are based on AI model predictions and should be clinically reviewed by a qualified ophthalmologist before any medical decision.
        </p>
      </div>
    </div>
  );
};
