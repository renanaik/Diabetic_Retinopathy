import React from 'react';

interface ConfidenceScoreProps {
  value: number; // 0–1
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm:  { r: 28, stroke: 5, dim: 70,  font: 'text-sm',  label: 'text-xs' },
  md:  { r: 40, stroke: 7, dim: 100, font: 'text-lg',  label: 'text-xs' },
  lg:  { r: 55, stroke: 9, dim: 130, font: 'text-2xl', label: 'text-sm' },
};

function confidenceColor(v: number) {
  if (v >= 0.9) return { stroke: '#0d9488', text: 'text-teal-700' };
  if (v >= 0.7) return { stroke: '#d97706', text: 'text-amber-700' };
  return { stroke: '#dc2626', text: 'text-red-600' };
}

export const ConfidenceScore: React.FC<ConfidenceScoreProps> = ({
  value,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const cfg = SIZE_CONFIG[size];
  const { stroke: strokeColor, text: textColor } = confidenceColor(value);
  const pct = Math.round(value * 100);
  const circumference = 2 * Math.PI * cfg.r;
  const offset = circumference * (1 - value);
  const center = cfg.dim / 2;

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div className="relative" style={{ width: cfg.dim, height: cfg.dim }}>
        <svg
          width={cfg.dim}
          height={cfg.dim}
          viewBox={`0 0 ${cfg.dim} ${cfg.dim}`}
          style={{ transform: 'rotate(-90deg)' }}
          aria-label={`Confidence: ${pct}%`}
        >
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={cfg.r}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={cfg.stroke}
          />
          {/* Fill */}
          <circle
            cx={center}
            cy={center}
            r={cfg.r}
            fill="none"
            stroke={strokeColor}
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        {/* Label in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold leading-none ${cfg.font} ${textColor}`}>{pct}%</span>
        </div>
      </div>
      {showLabel && (
        <p className={`text-clinical-muted font-medium ${cfg.label}`}>Confidence</p>
      )}
    </div>
  );
};
