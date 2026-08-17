import React from 'react';

export const PatientMyDoctor: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">My Primary Doctor</h1>
      <div className="card p-6">
        <p className="text-sm text-[var(--color-text-muted)]">No primary doctor assigned yet.</p>
      </div>
    </div>
  );
};
