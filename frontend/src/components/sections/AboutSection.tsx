import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section className="section bg-[var(--color-bg)]">
      <div className="container-main">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 rounded-full px-3.5 py-1 mb-4">
              <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 uppercase tracking-wide">
                Why RetinaCare AI
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-5 leading-tight">
              Bridging AI Innovation with Clinical Ophthalmology
            </h2>
            <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
              Diabetic Retinopathy is one of the leading causes of preventable blindness in adults worldwide. Early detection can prevent 95% of vision loss cases, yet millions miss regular eye screenings.
            </p>
            <div className="space-y-3 mb-8">
              {[
                'Automated screening pipeline with EfficientNet-B4 CNN architecture',
                'Seamless doctor review workflow before reports are finalized',
                'Patient portal for tracking disease trajectory and past screenings',
                'Doctor-patient connection network with verified medical profiles',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[var(--color-text)]">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/about" className="btn btn-outline btn-md inline-flex">
              Learn More About the Project
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="card p-8 bg-[var(--color-surface)] border-[var(--color-border)] shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-2xl" />
            <h3 className="font-display font-bold text-lg mb-4 text-[var(--color-text)]">Academic Project Highlights</h3>
            <div className="space-y-4 text-sm text-[var(--color-text-muted)]">
              <div className="p-4 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                <span className="font-semibold text-[var(--color-text)] block mb-1">State-of-the-Art ML Model</span>
                <p className="text-xs">PyTorch EfficientNet-B4 fine-tuned on fundus retinal images with preprocessing and augmentation.</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                <span className="font-semibold text-[var(--color-text)] block mb-1">Full-Stack Architecture</span>
                <p className="text-xs">Express + MongoDB + React 19 + TypeScript stack with JWT authentication and role-based security.</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                <span className="font-semibold text-[var(--color-text)] block mb-1">Human-in-the-Loop AI</span>
                <p className="text-xs">AI classifications require clinical verification, preventing autonomous unverified diagnoses.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
