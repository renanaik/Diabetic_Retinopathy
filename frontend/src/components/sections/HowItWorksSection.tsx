import React from 'react';
import { Upload, Cpu, FileCheck, History } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Retinal Image',
    desc: 'The doctor captures and uploads high-resolution fundus retinal photographs of the patient.',
  },
  {
    step: '02',
    icon: Cpu,
    title: 'AI Classification',
    desc: 'The EfficientNet-B4 model analyzes the image and generates probabilities across 5 DR stages.',
  },
  {
    step: '03',
    icon: FileCheck,
    title: 'Doctor Clinical Review',
    desc: 'The doctor examines AI predictions, adds clinical notes, and approves or modifies the report.',
  },
  {
    step: '04',
    icon: History,
    title: 'Patient Access & Tracking',
    desc: 'The patient views verified reports and monitors disease progression over time.',
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="section bg-[var(--color-surface)] border-y border-[var(--color-border)]">
      <div className="container-main">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 rounded-full px-3.5 py-1 mb-3">
            <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wide">
              Step-by-Step
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-4">
            How RetinaCare AI Works
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm sm:text-base">
            From image upload to verified clinical report, experience a seamless 4-step workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="card p-6 relative flex flex-col justify-between hover:shadow-lg transition-all duration-200">
              <span className="font-mono text-3xl font-bold text-brand-500/20 mb-4">{step}</span>
              <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-[var(--color-text)] mb-2">{title}</h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
