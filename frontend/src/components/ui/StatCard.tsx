import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  iconColor = 'text-teal-600',
  iconBg = 'bg-teal-50',
  trend,
  className = '',
}) => (
  <div className={`bg-white border border-clinical-border rounded-lg p-5 shadow-clinical ${className}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-clinical-muted uppercase tracking-wide">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold text-navy-800">{value}</p>
        {trend && (
          <p className={`mt-1 text-xs font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
    </div>
  </div>
);
