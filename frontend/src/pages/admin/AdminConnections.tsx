import React from 'react';

export const AdminConnections: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Doctor-Patient Connections</h1>
      <div className="card p-6">
        <p className="text-sm text-[var(--color-text-muted)]">Global overview and management of all doctor-patient connections.</p>
      </div>
    </div>
  );
};
