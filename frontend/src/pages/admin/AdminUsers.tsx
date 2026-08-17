import React from 'react';

export const AdminUsers: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">User Management</h1>
      <div className="card p-6">
        <p className="text-sm text-[var(--color-text-muted)]">Manage registered patients, doctors, and system administrators.</p>
      </div>
    </div>
  );
};
