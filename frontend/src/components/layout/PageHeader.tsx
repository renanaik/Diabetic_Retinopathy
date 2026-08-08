import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
  breadcrumb,
  className = '',
}) => (
  <div className={`mb-6 ${className}`}>
    {breadcrumb && breadcrumb.length > 0 && (
      <nav className="mb-2">
        <ol className="flex items-center gap-1.5 text-xs text-clinical-muted">
          {breadcrumb.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-navy-600 transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className={i === breadcrumb.length - 1 ? 'text-navy-600 font-medium' : ''}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </ol>
      </nav>
    )}
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold text-navy-800">{title}</h1>
          {badge && badge}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-clinical-muted">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  </div>
);
