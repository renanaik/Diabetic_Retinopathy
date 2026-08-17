import React from 'react';
import { ShieldAlert, Stethoscope, FileText, CheckCheck } from 'lucide-react';

export const ResponsibleAISection: React.FC = () => {
  return (
    <section className="section bg-[var(--color-bg)]">
      <div className="container-main">
        <div className="card p-8 md:p-12 border-l-4 border-l-brand-600 bg-[var(--color-surface)]">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4 text-brand-600 dark:text-brand-400">
              <ShieldAlert className="w-6 h-6" />
              <span className="font-display font-bold text-sm uppercase tracking-wide">Responsible AI in Healthcare</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-4">
              AI Assists, Doctors Decide
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed mb-6">
              RetinaCare AI is designed to support clinical workflows and academic inquiry. In compliance with medical AI safety guidelines:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                <Stethoscope className="w-5 h-5 text-brand-600 dark:text-brand-400 mb-2" />
                <h3 className="font-semibold text-xs text-[var(--color-text)] mb-1">Human-in-the-Loop</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Every screening requires a licensed doctor to review and validate results.</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mb-2" />
                <h3 className="font-semibold text-xs text-[var(--color-text)] mb-1">Clear Disclaimers</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Predictions are probabilistic estimates, not definitive medical verdicts.</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                <CheckCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
                <h3 className="font-semibold text-xs text-[var(--color-text)] mb-1">Auditable History</h3>
                <p className="text-xs text-[var(--color-text-muted)]">All predictions, reviews, and modifications are permanently logged.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
