import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-6 shadow-card">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="font-display text-4xl font-bold text-[var(--color-text)] mb-3">
          404 - Page Not Found
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary btn-md inline-flex">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};
