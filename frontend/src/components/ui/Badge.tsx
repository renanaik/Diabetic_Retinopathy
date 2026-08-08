import React from 'react';
import type { DRStageIndex } from '../../types';
import { DR_STAGES } from '../../types';

type BadgeVariant = 'stage' | 'status' | 'eye';

interface SeverityBadgeProps {
  stage: DRStageIndex;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const dotColors: Record<DRStageIndex, string> = {
  0: 'bg-green-500',
  1: 'bg-yellow-500',
  2: 'bg-amber-500',
  3: 'bg-orange-500',
  4: 'bg-red-500',
};

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  stage,
  size = 'md',
  showIcon = true,
}) => {
  const stageInfo = DR_STAGES[stage];
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';
  const dotSize = size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2';
  const padding = size === 'lg' ? 'px-3 py-1.5' : 'px-2.5 py-1';

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        stageInfo.bgColor,
        stageInfo.color,
        stageInfo.borderColor,
        padding,
        textSize,
      ].join(' ')}
    >
      {showIcon && (
        <span className={`${dotColors[stage]} ${dotSize} rounded-full flex-shrink-0`} />
      )}
      {stageInfo.shortName}
    </span>
  );
};

interface StatusBadgeProps {
  status: 'Pending Review' | 'Reviewed' | 'Flagged';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    'Reviewed': {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      dot: 'bg-green-500',
    },
    'Pending Review': {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    'Flagged': {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      dot: 'bg-red-500',
    },
  };

  const c = config[status];
  const textSize = size === 'sm' ? 'text-xs' : 'text-xs';
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        c.bg, c.text, c.border, textSize, padding,
      ].join(' ')}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {status}
    </span>
  );
};
