import React from 'react';

export const DoctorProgress: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Patient Progression Charts</h1>
      <div className="card p-6">
        <p className="text-sm text-[var(--color-text-muted)]">Select a patient to inspect their longitudinal retinopathy trajectory.</p>
      </div>
    </div>
  );
};
