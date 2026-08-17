import React from 'react';
import { DR_STAGES } from '../types';
import { SectionWrapper } from '../components/common/SectionWrapper';
import { Disclaimer } from '../components/ui/Disclaimer';

export const DRStagesPage: React.FC = () => {
  return (
    <>
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="container-main relative max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wide">
              Pathology Reference
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[var(--color-text)] mb-6 leading-tight">
            Diabetic Retinopathy <span className="gradient-text">Stages</span>
          </h1>
          <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
            Understanding the 5 stages of Diabetic Retinopathy used in our clinical AI classification model.
          </p>
        </div>
      </section>

      <SectionWrapper bg="surface">
        <div className="max-w-4xl mx-auto space-y-6">
          {DR_STAGES.map(stage => (
            <div key={stage.index} className="card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] min-w-[100px]">
                <span className="text-2xl font-bold font-mono text-[var(--color-text)]">Stage {stage.index}</span>
                <span className={`text-xs font-semibold mt-1 ${stage.color}`}>{stage.shortName}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl font-bold text-[var(--color-text)] mb-2">{stage.name}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4">{stage.description}</p>
              </div>
            </div>
          ))}

          <div className="mt-8">
            <Disclaimer />
          </div>
        </div>
      </SectionWrapper>
    </>
  );
};
