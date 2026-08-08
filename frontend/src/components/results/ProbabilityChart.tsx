import React from 'react';
import type { ProbabilityDistribution } from '../../types';
import { DR_STAGES } from '../../types';

interface ProbabilityChartProps {
  probabilities: ProbabilityDistribution;
  highlightedStage?: number;
  className?: string;
}

const PROB_ENTRIES = [
  { key: 'noDR' as const,          label: 'No DR',          stageIdx: 0 },
  { key: 'mild' as const,          label: 'Mild',           stageIdx: 1 },
  { key: 'moderate' as const,      label: 'Moderate',       stageIdx: 2 },
  { key: 'severe' as const,        label: 'Severe',         stageIdx: 3 },
  { key: 'proliferative' as const, label: 'Proliferative',  stageIdx: 4 },
];

const BAR_COLORS = [
  { bar: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
  { bar: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
  { bar: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50' },
  { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
];

export const ProbabilityChart: React.FC<ProbabilityChartProps> = ({
  probabilities,
  highlightedStage,
  className = '',
}) => (
  <div className={`space-y-3 ${className}`}>
    {PROB_ENTRIES.map(({ key, label, stageIdx }) => {
      const prob = probabilities[key];
      const pct = (prob * 100).toFixed(1);
      const widthPct = Math.max(prob * 100, 0.5);
      const colors = BAR_COLORS[stageIdx];
      const isHighlighted = highlightedStage === stageIdx;

      return (
        <div
          key={key}
          className={[
            'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
            isHighlighted ? colors.bg + ' border border-current/10' : '',
          ].join(' ')}
        >
          <div className="w-20 flex-shrink-0">
            <p className={`text-xs font-medium ${isHighlighted ? colors.text : 'text-clinical-muted'}`}>
              {label}
            </p>
          </div>
          <div className="flex-1 h-2 bg-clinical-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full progress-bar ${colors.bar}`}
              style={{ width: `${widthPct}%` }}
            />
          </div>
          <div className="w-12 flex-shrink-0 text-right">
            <p className={`text-xs font-semibold tabular-nums ${isHighlighted ? colors.text : 'text-clinical-muted'}`}>
              {pct}%
            </p>
          </div>
        </div>
      );
    })}
  </div>
);
