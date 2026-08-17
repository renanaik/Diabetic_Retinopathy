import React from 'react';
import { Layers, Stethoscope, LineChart, FileSpreadsheet, LockKeyhole, UserCheck2 } from 'lucide-react';

const features = [
  {
    icon: Stethoscope,
    title: 'Doctor Screening Workspace',
    description: 'Upload retinal images, inspect automated AI inference, write clinical annotations, and issue official reports.',
  },
  {
    icon: LineChart,
    title: 'Longitudinal Tracking',
    description: 'Track DR progression over time with historical screening charts and stage change metrics.',
  },
  {
    icon: Layers,
    title: 'Multi-Stage Detection',
    description: 'Comprehensive 5-class categorization with probability breakdown and confidence estimates.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Structured Reports',
    description: 'Exportable clinical summaries complete with diagnosis summary, notes, and recommendation guidelines.',
  },
  {
    icon: UserCheck2,
    title: 'Doctor-Patient Connections',
    description: 'Secure link between patients and certified doctors enabling direct report sharing and communication.',
  },
  {
    icon: LockKeyhole,
    title: 'Admin Verification',
    description: 'Super Admin panel for verifying doctor credentials and monitoring platform usage metrics.',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="section bg-[var(--color-surface)] border-y border-[var(--color-border)]">
      <div className="container-main">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 rounded-full px-3.5 py-1 mb-3">
            <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 uppercase tracking-wide">
              Capabilities
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-4">
            Comprehensive Platform Features
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm sm:text-base">
            Designed for clinical efficiency, patient empowerment, and rigorous research standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card card-hover p-6">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-[var(--color-text)] mb-2">{title}</h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
