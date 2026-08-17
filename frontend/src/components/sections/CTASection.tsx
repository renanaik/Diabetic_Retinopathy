import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CTASection: React.FC = () => {
  return (
    <section className="section bg-gradient-to-br from-brand-50/70 via-[var(--color-surface)] to-cyan-50/70 dark:from-brand-950/60 dark:via-slate-900 dark:to-cyan-950/60 border-t border-[var(--color-border)] text-[var(--color-text)] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-10 pointer-events-none" aria-hidden="true" />
      <div className="container-main relative text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 rounded-full px-3.5 py-1 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wide">
            Ready to Explore?
          </span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[var(--color-text)] mb-6 leading-tight">
          Join the Future of Retinal Health Monitoring
        </h2>
        <p className="text-base sm:text-lg text-[var(--color-text-muted)] mb-8 max-w-xl mx-auto">
          Sign up today as a patient to track your reports or as a doctor to start conducting AI-assisted screenings.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/signup" className="btn btn-primary btn-lg shadow-card" id="cta-signup-btn">
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="btn btn-outline btn-lg" id="cta-login-btn">
            Sign In to Existing Account
          </Link>
        </div>
      </div>
    </section>
  );
};
