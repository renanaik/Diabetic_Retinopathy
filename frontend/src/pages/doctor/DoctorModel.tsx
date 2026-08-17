import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';

export const DoctorModel: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">AI Model Architecture & Metrics</h1>
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Cpu className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          <h2 className="font-display font-semibold text-lg">EfficientNet-B4 Convolutional Neural Network</h2>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
          The deep learning model is fine-tuned on fundus retinal images to classify 5 Diabetic Retinopathy stages (No DR, Mild, Moderate, Severe, Proliferative).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[var(--color-border)]">
          <div className="p-3 rounded-lg bg-[var(--color-surface-elevated)]">
            <span className="text-xs text-[var(--color-text-muted)] block">Input Resolution</span>
            <span className="text-sm font-semibold">380 × 380 px</span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--color-surface-elevated)]">
            <span className="text-xs text-[var(--color-text-muted)] block">ML Service Port</span>
            <span className="text-sm font-semibold">:5002 (PyTorch/Flask)</span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--color-surface-elevated)]">
            <span className="text-xs text-[var(--color-text-muted)] block">Output Format</span>
            <span className="text-sm font-semibold">5-Class Softmax</span>
          </div>
        </div>
      </div>
    </div>
  );
};
