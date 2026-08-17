import React from 'react';
import { BarChart3 } from 'lucide-react';

export const DoctorResults: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Screening Results & Review Queue</h1>
      <div className="card p-8 text-center bg-[var(--color-surface)]">
        <BarChart3 className="w-10 h-10 text-[var(--color-text-subtle)] mx-auto mb-3" />
        <p className="text-sm text-[var(--color-text-muted)]">No pending screening reviews in queue.</p>
      </div>
    </div>
  );
};
