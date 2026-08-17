import React from 'react';

export const DoctorPatientHistory: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Patient Screening History</h1>
      <div className="card p-6">
        <p className="text-sm text-[var(--color-text-muted)]">Historical screening logs and diagnostic reports.</p>
      </div>
    </div>
  );
};
