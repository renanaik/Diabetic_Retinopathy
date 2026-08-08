import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DisclaimerProps {
  variant?: 'inline' | 'banner' | 'compact';
  className?: string;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({
  variant = 'inline',
  className = '',
}) => {
  if (variant === 'compact') {
    return (
      <p className={`text-xs text-clinical-muted ${className}`}>
        <span className="font-medium text-amber-700">Note:</span> AI-assisted screening only. Not a substitute for professional medical examination.
      </p>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3 ${className}`}>
        <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-semibold">Important:</span> This tool is an AI-assisted screening prototype and is{' '}
          <span className="font-semibold">not a substitute for professional medical examination</span>.
          All results should be reviewed by a qualified ophthalmologist before clinical decisions are made.
        </p>
      </div>
    );
  }

  // inline (default)
  return (
    <div className={`border-t border-clinical-border pt-4 mt-4 flex items-start gap-2.5 ${className}`}>
      <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-clinical-muted leading-relaxed">
        This tool is an AI-assisted screening prototype and is not a substitute for professional medical examination.
        Outputs represent model predictions only and require clinical review by a qualified ophthalmologist.
      </p>
    </div>
  );
};
