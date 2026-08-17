import React from 'react';
import { useParams } from 'react-router-dom';

export const PatientReportDetail: React.FC = () => {
  const { reportId } = useParams();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Report Details</h1>
      <div className="card p-6">
        <p className="text-sm text-[var(--color-text-muted)]">Viewing report ID: {reportId}</p>
      </div>
    </div>
  );
};
