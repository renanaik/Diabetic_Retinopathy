import React from 'react';
import type { ScreeningResult } from '../../types';
import { DR_STAGES } from '../../types';
import { SeverityBadge } from '../ui/Badge';
import { RetinalImageViewer } from '../screening/RetinalImageViewer';
import { Eye, Calendar, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProgressTimelineProps {
  results: ScreeningResult[];
  className?: string;
}

function stageDiff(a: ScreeningResult, b: ScreeningResult) {
  const diff = b.predictedStage - a.predictedStage;
  if (diff > 0) return { icon: TrendingUp, color: 'text-red-500', label: `+${diff} stage${diff > 1 ? 's' : ''}` };
  if (diff < 0) return { icon: TrendingDown, color: 'text-green-500', label: `${diff} stage${Math.abs(diff) > 1 ? 's' : ''}` };
  return { icon: Minus, color: 'text-clinical-muted', label: 'Stable' };
}

export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  results,
  className = '',
}) => {
  const sorted = [...results].sort(
    (a, b) => new Date(a.examinationDate).getTime() - new Date(b.examinationDate).getTime()
  );

  if (!sorted.length) {
    return (
      <div className={`text-center py-12 text-sm text-clinical-muted ${className}`}>
        No examination records found for this patient.
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Vertical line */}
      <div className="absolute left-[26px] top-6 bottom-6 w-0.5 bg-clinical-border" />

      <div className="space-y-6">
        {sorted.map((result, i) => {
          const diff = i > 0 ? stageDiff(sorted[i - 1], result) : null;
          const DiffIcon = diff?.icon;
          const date = new Date(result.examinationDate);
          const formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

          const isLatest = i === sorted.length - 1;

          return (
            <div key={result.screeningId} className="relative flex gap-5">
              {/* Timeline dot */}
              <div
                className={[
                  'relative z-10 w-[52px] h-[52px] rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                  isLatest
                    ? 'bg-navy-700 border-navy-700'
                    : 'bg-white border-clinical-border',
                ].join(' ')}
              >
                <Calendar
                  size={18}
                  className={isLatest ? 'text-white' : 'text-clinical-muted'}
                />
              </div>

              {/* Card */}
              <div className="flex-1 bg-white border border-clinical-border rounded-lg shadow-clinical overflow-hidden">
                <div className="flex items-start p-4 gap-3">
                  {/* Retinal thumbnail */}
                  <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                    <RetinalImageViewer className="w-full h-full" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-navy-800">{formattedDate}</p>
                      {isLatest && (
                        <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-2 py-0.5 font-medium">
                          Latest
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <SeverityBadge stage={result.predictedStage} size="sm" />
                      <span className="text-xs text-clinical-muted">
                        <Eye size={11} className="inline mr-0.5" /> {result.eye}
                      </span>
                      <span className="text-xs text-clinical-muted">
                        {Math.round(result.confidence * 100)}% conf.
                      </span>
                    </div>

                    {/* Change indicator */}
                    {diff && DiffIcon && (
                      <div className={`flex items-center gap-1 mt-1.5 ${diff.color}`}>
                        <DiffIcon size={12} />
                        <span className="text-xs font-medium">{diff.label} vs. previous</span>
                      </div>
                    )}
                  </div>

                  {/* View link */}
                  <Link
                    to={`/results/${result.screeningId}`}
                    className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors mt-0.5"
                  >
                    <ExternalLink size={12} />
                    <span className="hidden sm:inline">View</span>
                  </Link>
                </div>

                {/* Screening ID */}
                <div className="px-4 pb-2 border-t border-clinical-border/50 pt-2">
                  <p className="text-xs text-clinical-muted font-mono">{result.screeningId}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
