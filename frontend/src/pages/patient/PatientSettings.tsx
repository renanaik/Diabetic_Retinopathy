import React from 'react';

export const PatientSettings: React.FC = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Account Settings</h1>
      <div className="card p-6">
        <p className="text-sm text-[var(--color-text-muted)]">Preferences and notification settings.</p>
      </div>
    </div>
  );
};
