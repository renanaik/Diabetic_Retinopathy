import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Upload, Cpu, FileCheck, History, CheckCircle2 } from 'lucide-react';
import { SectionWrapper } from '../components/common/SectionWrapper';

export const HowItWorksPage: React.FC = () => {
  return (
    <>
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="container-main relative max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wide">
              Workflow Overview
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[var(--color-text)] mb-6 leading-tight">
            How <span className="gradient-text">RetinaCare AI</span> Works
          </h1>
          <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
            A comprehensive overview of our human-in-the-loop screening pipeline from raw retinal image to finalized clinical report.
          </p>
        </div>
      </section>

      <SectionWrapper bg="surface">
        <div className="max-w-4xl mx-auto space-y-12">
          {[
            {
              step: 'Step 1',
              title: 'Fundus Image Acquisition & Upload',
              desc: 'The doctor captures retinal photography using a digital fundus camera. The image is uploaded securely through the doctor screening workspace.',
              icon: Upload,
            },
            {
              step: 'Step 2',
              title: 'Deep Learning Model Inference',
              desc: 'The image is preprocessed (normalized, resized to 380x380) and passed through our PyTorch EfficientNet-B4 neural network. The model predicts the probability of each DR severity stage.',
              icon: Cpu,
            },
            {
              step: 'Step 3',
              title: 'Clinical Review & Validation',
              desc: 'The doctor reviews the AI prediction alongside the original fundus photo, enters diagnostic notes, and officially approves or adjusts the findings.',
              icon: FileCheck,
            },
            {
              step: 'Step 4',
              title: 'Report Distribution & Longitudinal Tracking',
              desc: 'Once approved, the patient receives access to the formal screening report. Historical screenings are plotted over time to identify disease progression.',
              icon: History,
            },
          ].map(({ step, title, desc, icon: Icon }) => (
            <div key={step} className="card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide block mb-1">
                  {step}
                </span>
                <h3 className="font-display text-xl font-bold text-[var(--color-text)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
};
