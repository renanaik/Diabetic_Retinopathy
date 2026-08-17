import React from 'react';
import { Clock } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const DoctorVerificationPending: React.FC = () => {
  const { user, logout } = useAuth();

  // If the doctor is verified, automatically redirect to the doctor workspace
  if (user?.role === 'doctor' && user.verificationStatus === 'verified') {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  // If the doctor is rejected, redirect to the rejection notice
  if (user?.role === 'doctor' && user.verificationStatus === 'rejected') {
    return <Navigate to="/doctor/verification-rejected" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] py-16 px-4">
      <div className="card max-w-md w-full p-8 text-center shadow-lg border-[var(--color-border)]">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-card">
          <Clock className="w-8 h-8" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-3">
          Verification Pending
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
          Your doctor registration has been submitted. An administrator is currently reviewing your medical license credentials. You will be able to access the doctor workspace once verified.
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
