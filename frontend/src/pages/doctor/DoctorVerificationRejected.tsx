import React from 'react';
import { XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DoctorVerificationRejected: React.FC = () => {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] py-16 px-4">
      <div className="card max-w-md w-full p-8 text-center shadow-lg border-[var(--color-border)]">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-6 shadow-card">
          <XCircle className="w-8 h-8" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-3">
          Verification Rejected
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
          Your credentials could not be verified by the admin team. Please contact the administrator or support team for further assistance.
        </p>
        <button
          onClick={logout}
          className="btn btn-outline btn-md w-full justify-center"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
