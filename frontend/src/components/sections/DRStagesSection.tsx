import React from 'react';
import { DR_STAGES } from '../../types';

export const DRStagesSection: React.FC = () => {
  return (
    <section className="section bg-[var(--color-bg)]">
      <div className="container-main">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 rounded-full px-3.5 py-1 mb-3">
            <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wide">
              Clinical Classification
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-4">
            Diabetic Retinopathy Stages
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm sm:text-base">
            The platform classifies retinal fundus images across standard clinical stages (0 to 4).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {DR_STAGES.map(stage => (
            <div
              key={stage.index}
              className="card p-5 border rounded-xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                    Stage {stage.index}
                  </span>
                  <span className={`text-xs font-semibold ${stage.color}`}>{stage.shortName}</span>
                </div>
                <h3 className="font-display font-semibold text-sm text-[var(--color-text)] mb-2">
                  {stage.name}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
