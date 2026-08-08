import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: React.ElementType;
}

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  as: Tag = 'div',
}) => {
  return (
    <Tag
      className={[
        'bg-white border border-clinical-border rounded-lg shadow-clinical',
        paddingClasses[padding],
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  icon,
  className = '',
}) => (
  <div className={`flex items-start justify-between mb-4 ${className}`}>
    <div className="flex items-center gap-2.5">
      {icon && (
        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-navy-50 flex items-center justify-center text-navy-600">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-navy-800">{title}</h3>
        {subtitle && <p className="text-xs text-clinical-muted mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="flex-shrink-0 ml-4">{action}</div>}
  </div>
);
