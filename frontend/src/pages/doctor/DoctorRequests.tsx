import React from 'react';
import { Inbox } from 'lucide-react';

export const DoctorRequests: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Connection Requests</h1>
      <div className="card p-8 text-center bg-[var(--color-surface)]">
        <Inbox className="w-10 h-10 text-[var(--color-text-subtle)] mx-auto mb-3" />
        <p className="text-sm text-[var(--color-text-muted)]">No pending connection requests from patients.</p>
      </div>
    </div>
  );
};
