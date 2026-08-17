import React from 'react';
import { Upload } from 'lucide-react';

export const DoctorNewScreening: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">New Retinal Screening</h1>
      <div className="card p-8 text-center border-dashed border-2 border-[var(--color-border)]">
        <Upload className="w-12 h-12 text-brand-600 dark:text-brand-400 mx-auto mb-4" />
        <h3 className="font-display font-semibold text-lg mb-2">Upload Retinal Fundus Image</h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Select or drag and drop JPEG/PNG fundus photograph for EfficientNet-B4 analysis.
        </p>
      </div>
    </div>
  );
};
