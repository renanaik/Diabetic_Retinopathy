import React from 'react';

export const AdminReports: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">System Reports & Logs</h1>
      <div className="card p-6">
        <p className="text-sm text-[var(--color-text-muted)]">Audit logs, system statistics, and screening reports archive.</p>
      </div>
    </div>
  );
};
