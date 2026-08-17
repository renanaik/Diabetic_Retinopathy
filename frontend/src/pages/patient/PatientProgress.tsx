import React from 'react';
import { TrendingUp } from 'lucide-react';

export const PatientProgress: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Retinopathy Progress Tracker</h1>
      <div className="card p-8 text-center bg-[var(--color-surface)]">
        <TrendingUp className="w-10 h-10 text-[var(--color-text-subtle)] mx-auto mb-3" />
        <p className="text-sm text-[var(--color-text-muted)]">Progress tracking charts will appear after your first approved screening.</p>
      </div>
    </div>
  );
};
