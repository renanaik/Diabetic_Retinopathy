import React from 'react';
import { Shield, Brain, UserCheck, Lock } from 'lucide-react';

const values = [
  {
    icon: Brain,
    title: 'Deep Learning Precision',
    description: 'Trained on retinal fundus images with balanced classification across all 5 DR severity levels.',
  },
  {
    icon: UserCheck,
    title: 'Clinical Oversight',
    description: 'AI assists rather than replaces doctors. Every report is reviewed by qualified ophthalmologists.',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Role-based access control and patient data protection ensuring confidential screening records.',
  },
  {
    icon: Shield,
    title: 'Transparent Metrics',
    description: 'Probability distributions and confidence metrics provided alongside classification results.',
  },
];

export const TrustValuesSection: React.FC = () => {
  return (
    <section className="py-12 border-y border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="container-main">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-2 p-4 rounded-xl hover:bg-[var(--color-surface-elevated)] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-sm text-[var(--color-text)]">{title}</h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
