import React from 'react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading…',
  size = 'md',
  className = '',
}) => {
  const spinnerSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';

  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}>
      <svg
        className={`animate-spin text-teal-600 ${spinnerSize}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {message && (
        <p className="text-sm text-clinical-muted animate-pulse">{message}</p>
      )}
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center gap-3 py-16 text-center ${className}`}>
    {icon && (
      <div className="w-14 h-14 rounded-full bg-clinical-bg flex items-center justify-center text-clinical-muted">
        {icon}
      </div>
    )}
    <div>
      <p className="text-sm font-medium text-navy-700">{title}</p>
      {description && <p className="text-sm text-clinical-muted mt-1 max-w-xs">{description}</p>}
    </div>
    {action && <div className="mt-1">{action}</div>}
  </div>
);
