import React from 'react';
import { LayoutDashboard, Users, UserCheck, ShieldCheck } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)]">
        Super Admin Control Panel
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card p-5">
          <p className="text-xs text-[var(--color-text-muted)]">Registered Users</p>
          <p className="text-xl font-bold text-[var(--color-text)] mt-1">0</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-[var(--color-text-muted)]">Pending Doctor Approvals</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">0</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-[var(--color-text-muted)]">Total Screenings</p>
          <p className="text-xl font-bold text-[var(--color-text)] mt-1">0</p>
        </div>
      </div>
    </div>
  );
};
