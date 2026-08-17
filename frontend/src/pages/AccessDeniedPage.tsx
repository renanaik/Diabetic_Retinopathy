import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';

export const AccessDeniedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] py-16 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-6 shadow-card">
          <ShieldX className="w-8 h-8" />
        </div>
        <h1 className="font-display text-3xl font-bold text-[var(--color-text)] mb-3">
          Access Denied
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          You do not have permission to view this page with your current account role.
        </p>
        <Link to="/" className="btn btn-primary btn-md inline-flex">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};
