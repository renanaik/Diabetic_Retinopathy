import React from 'react';
import { LayoutDashboard, FileText, TrendingUp, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)]">
          Welcome back, {user?.name || 'Patient'}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Here is an overview of your retinal screening status and reports.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Total Screenings</p>
              <p className="text-xl font-bold text-[var(--color-text)]">0</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Connected Doctors</p>
              <p className="text-xl font-bold text-[var(--color-text)]">0</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Latest DR Status</p>
              <p className="text-sm font-semibold text-[var(--color-text)]">No Active Screening</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
