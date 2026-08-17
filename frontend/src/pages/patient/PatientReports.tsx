import React from 'react';
import { FileText } from 'lucide-react';

export const PatientReports: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">My Screening Reports</h1>
      <div className="card p-8 text-center bg-[var(--color-surface)]">
        <FileText className="w-10 h-10 text-[var(--color-text-subtle)] mx-auto mb-3" />
        <p className="text-sm text-[var(--color-text-muted)]">No screening reports available yet.</p>
      </div>
    </div>
  );
};
