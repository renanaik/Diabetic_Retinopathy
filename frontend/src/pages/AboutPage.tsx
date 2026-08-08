import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Disclaimer } from '../components/ui/Disclaimer';
import {
  Brain, Layers, Activity, BarChart3,
  ChevronRight, Info, FlaskConical,
  Eye, Cpu, Zap, FileSearch,
} from 'lucide-react';

const PIPELINE_STEPS = [
  { icon: Eye,        label: 'Fundus Image',      desc: 'Color retinal photograph input' },
  { icon: Activity,   label: 'Preprocessing',      desc: 'Resize, normalize, augment' },
  { icon: Cpu,        label: 'CNN Model',           desc: 'ResNet50 or DenseNet121' },
  { icon: Brain,      label: 'Feature Extraction', desc: 'Deep spatial features' },
  { icon: Layers,     label: 'DR Stage Prediction',desc: 'Softmax classification head' },
  { icon: BarChart3,  label: 'Confidence Score',   desc: 'Max class probability' },
  { icon: FileSearch, label: 'Visual Explanation',  desc: 'Grad-CAM attention map' },
];

const METRICS = ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'Training Time'];

export const AboutPage: React.FC = () => (
  <div className="p-6 max-w-4xl mx-auto">
    <PageHeader
      title="Model Information"
      subtitle="Technical overview of the AI screening system and deep learning pipeline."
      breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Model Information' }]}
    />

    {/* ── Pipeline ─────────────────────────────────────────────────────────── */}
    <Card padding="lg" className="mb-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-navy-800 flex items-center gap-2">
          <Activity size={16} className="text-teal-600" />
          How the AI Works
        </h2>
        <p className="text-xs text-clinical-muted mt-1">
          End-to-end deep learning pipeline from retinal image to DR stage prediction.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {PIPELINE_STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center text-center gap-1.5 min-w-[80px]">
                <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
                  <Icon size={18} className="text-navy-600" />
                </div>
                <p className="text-xs font-semibold text-navy-800 leading-tight">{step.label}</p>
                <p className="text-xs text-clinical-muted leading-tight">{step.desc}</p>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <ChevronRight size={14} className="text-clinical-border flex-shrink-0 hidden sm:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </Card>

    {/* ── Models ──────────────────────────────────────────────────────────── */}
    <div className="grid sm:grid-cols-2 gap-5 mb-6">
      {/* ResNet50 */}
      <Card padding="md">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-lg bg-navy-700 flex items-center justify-center flex-shrink-0">
            <Cpu size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-navy-800">ResNet50</p>
            <p className="text-xs text-clinical-muted">Primary candidate model</p>
          </div>
        </div>
        <ul className="text-xs text-clinical-muted space-y-1.5 leading-relaxed">
          <li className="flex items-start gap-1.5">
            <span className="text-teal-500 mt-0.5">→</span>
            50-layer deep residual network architecture
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-teal-500 mt-0.5">→</span>
            Residual/skip connections prevent vanishing gradients
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-teal-500 mt-0.5">→</span>
            Transfer learning from ImageNet weights
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-teal-500 mt-0.5">→</span>
            Fine-tuned on DR fundus dataset
          </li>
        </ul>
      </Card>

      {/* DenseNet121 */}
      <Card padding="md">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
            <Layers size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-navy-800">DenseNet121</p>
            <p className="text-xs text-clinical-muted">Comparison model</p>
          </div>
        </div>
        <ul className="text-xs text-clinical-muted space-y-1.5 leading-relaxed">
          <li className="flex items-start gap-1.5">
            <span className="text-teal-500 mt-0.5">→</span>
            121-layer dense connection architecture
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-teal-500 mt-0.5">→</span>
            Each layer connected to all preceding layers
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-teal-500 mt-0.5">→</span>
            Strong feature reuse and gradient flow
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-teal-500 mt-0.5">→</span>
            Transfer learning from ImageNet weights
          </li>
        </ul>
      </Card>
    </div>

    {/* Model selection note */}
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
      <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-blue-800 leading-relaxed">
        <span className="font-semibold">Model Selection:</span> This project evaluates both ResNet50 and DenseNet121 architectures.
        The better-performing model, based on validation and test set metrics (accuracy, F1 score, recall), will be selected
        as the primary screening model. Final model selection is subject to experimental evaluation.
      </p>
    </div>

    {/* ── Performance table ────────────────────────────────────────────────── */}
    <Card padding="md" className="mb-6">
      <div className="mb-4 flex items-center gap-2">
        <FlaskConical size={16} className="text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-navy-800">Model Performance Comparison</p>
          <p className="text-xs text-clinical-muted">Results pending evaluation — to be updated upon training completion</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-clinical-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-clinical-bg border-b border-clinical-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-clinical-muted uppercase tracking-wide">
                Metric
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-navy-700 uppercase tracking-wide">
                ResNet50
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wide">
                DenseNet121
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-clinical-border">
            {METRICS.map((metric) => (
              <tr key={metric} className="hover:bg-clinical-bg/50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-navy-700">{metric}</td>
                <td className="px-4 py-3">
                  <span className="text-xs text-clinical-muted italic bg-clinical-bg px-2 py-1 rounded border border-clinical-border">
                    Pending evaluation
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-clinical-muted italic bg-clinical-bg px-2 py-1 rounded border border-clinical-border">
                    Pending evaluation
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>

    {/* ── Grad-CAM ─────────────────────────────────────────────────────────── */}
    <Card padding="md" className="mb-6">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
          <Zap size={18} className="text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-navy-800">Grad-CAM — Visual Explanation</p>
          <p className="text-xs text-clinical-muted">Gradient-weighted Class Activation Mapping</p>
        </div>
      </div>

      <p className="text-sm text-clinical-muted leading-relaxed mb-3">
        <span className="font-medium text-navy-700">Grad-CAM</span> is an explainability technique that produces
        heatmap visualizations by computing the gradient of the model's predicted class score with respect to
        the feature maps of the final convolutional layer.
      </p>
      <p className="text-sm text-clinical-muted leading-relaxed mb-3">
        Regions with higher gradient magnitudes contribute more strongly to the model's prediction and are
        highlighted in warmer colors (red/orange). These maps help us understand which areas of the retinal
        image the model focuses on when predicting a particular DR stage.
      </p>
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
        <p className="text-xs text-amber-800 font-medium">Important Limitation</p>
        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
          Grad-CAM attention regions should not be interpreted as definitive lesion boundaries or confirmed
          clinical findings. They are model visualization outputs intended for interpretability research,
          not clinical diagnostic guidance.
        </p>
      </div>
    </Card>

    <Disclaimer variant="banner" />
  </div>
);
