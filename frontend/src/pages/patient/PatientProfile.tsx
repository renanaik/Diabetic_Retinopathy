import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const PatientProfile: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Patient Profile</h1>
      <div className="card p-6 space-y-4">
        <div>
          <span className="text-xs text-[var(--color-text-muted)] block">Name</span>
          <span className="text-sm font-semibold">{user?.name}</span>
        </div>
        <div>
          <span className="text-xs text-[var(--color-text-muted)] block">Email</span>
          <span className="text-sm font-semibold">{user?.email}</span>
        </div>
        <div>
          <span className="text-xs text-[var(--color-text-muted)] block">Account Type</span>
          <span className="text-sm font-semibold capitalize">{user?.role}</span>
        </div>
      </div>
    </div>
  );
};
