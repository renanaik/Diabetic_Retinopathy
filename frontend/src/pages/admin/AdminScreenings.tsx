import React from 'react';

export const AdminScreenings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">All Screenings</h1>
      <div className="card p-6">
        <p className="text-sm text-[var(--color-text-muted)]">Global list of all AI-assisted fundus screenings.</p>
      </div>
    </div>
  );
};
