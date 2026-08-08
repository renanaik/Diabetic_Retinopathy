import React from 'react';
import type { DRStageIndex } from '../../types';
import { DR_STAGES } from '../../types';

interface StageScaleProps {
  predictedStage: DRStageIndex;
  className?: string;
}

const STAGE_INDICATORS = [
  { bg: 'bg-green-500' },
  { bg: 'bg-yellow-400' },
  { bg: 'bg-amber-500' },
  { bg: 'bg-orange-500' },
  { bg: 'bg-red-500' },
];

export const StageScale: React.FC<StageScaleProps> = ({
  predictedStage,
  className = '',
}) => (
  <div className={className}>
    <div className="flex items-end gap-1.5">
      {DR_STAGES.map((stage) => {
        const isActive = stage.index === predictedStage;
        const isPast = stage.index < predictedStage;
        const ind = STAGE_INDICATORS[stage.index];
        const height = 8 + stage.index * 6; // Ascending bar height

        return (
          <div key={stage.index} className="flex flex-col items-center gap-1.5 flex-1">
            {/* Bar */}
            <div
              className={[
                'w-full rounded-t-sm transition-all duration-300',
                isActive
                  ? `${ind.bg} opacity-100`
                  : isPast
                  ? `${ind.bg} opacity-30`
                  : 'bg-clinical-border opacity-60',
              ].join(' ')}
              style={{ height: `${height}px` }}
            />

            {/* Stage dot + number */}
            <div className="flex flex-col items-center gap-0.5">
              <div
                className={[
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all',
                  isActive
                    ? `${ind.bg} border-transparent text-white shadow-md`
                    : isPast
                    ? 'border-clinical-border bg-clinical-bg text-clinical-muted'
                    : 'border-clinical-border bg-white text-clinical-muted',
                ].join(' ')}
              >
                {stage.index}
              </div>
              <p
                className={`text-xs text-center leading-tight font-medium ${
                  isActive ? 'text-navy-800' : 'text-clinical-muted'
                }`}
                style={{ fontSize: '10px' }}
              >
                {stage.shortName.replace(' DR', '').replace('No ', 'No\u00A0')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
