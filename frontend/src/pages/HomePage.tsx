import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Disclaimer } from '../components/ui/Disclaimer';
import { RetinalImageViewer } from '../components/screening/RetinalImageViewer';
import {
  ScanLine, TrendingUp, Layers, BarChart3,
  Upload, Brain, ChevronRight, Activity,
  ArrowRight, CheckCircle2,
} from 'lucide-react';

const FEATURES = [
  {
    icon: ScanLine,
    title: 'DR Detection',
    desc: 'Automated analysis of retinal fundus images to identify signs of diabetic retinopathy.',
  },
  {
    icon: Layers,
    title: '5-Stage Classification',
    desc: 'Model predicts the DR severity stage from No DR through Proliferative DR.',
  },
  {
    icon: Brain,
    title: 'Lesion Visualization',
    desc: "Grad-CAM attention maps highlight regions influencing the model's prediction.",
  },
  {
    icon: TrendingUp,
    title: 'Disease Progress Tracking',
    desc: 'Track AI-predicted changes across multiple retinal examinations over time.',
  },
];

const WORKFLOW = [
  { icon: Upload, label: 'Upload Image', desc: 'Retinal fundus photograph' },
  { icon: Brain, label: 'AI Analysis', desc: 'CNN feature extraction' },
  { icon: BarChart3, label: 'Stage Prediction', desc: 'DR severity classification' },
  { icon: Activity, label: 'Visual Explanation', desc: 'Grad-CAM attention map' },
  { icon: TrendingUp, label: 'Progress Tracking', desc: 'Longitudinal comparison' },
];

export const HomePage: React.FC = () => (
  <div className="min-h-screen bg-clinical-bg">
    <Navbar />

    {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 pulse-dot" />
            <span className="text-xs font-medium text-teal-700">Academic Research Prototype · Not for clinical use</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-navy-800 leading-tight">
            AI-Assisted Diabetic Retinopathy{' '}
            <span className="text-teal-600">Screening</span>
          </h1>

          <p className="mt-6 text-lg text-clinical-muted leading-relaxed max-w-lg">
            Analyze retinal fundus images, estimate diabetic retinopathy severity,
            visualize important retinal regions, and track changes across examinations.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/screening">
              <Button variant="primary" size="lg" icon={<ScanLine size={18} />}>
                Start Screening
              </Button>
            </Link>
            <Link to="/results/SCR-2026-002">
              <Button variant="outline" size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
                View Demo Result
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-5">
            {['ResNet50', 'DenseNet121', 'Grad-CAM', 'React + Vite'].map((tech) => (
              <div key={tech} className="flex items-center gap-1.5 text-sm text-clinical-muted">
                <CheckCircle2 size={14} className="text-teal-500" />
                {tech}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Retinal image display */}
        <div className="relative">
          <div className="relative mx-auto w-full max-w-sm">
            {/* Main image */}
            <div className="rounded-2xl overflow-hidden shadow-clinical-lg border border-clinical-border/50">
              <RetinalImageViewer
                aspectRatio="square"
                className="w-full"
              />
            </div>

            {/* Floating badge — Stage */}
            <div className="absolute -bottom-4 -left-4 bg-white border border-clinical-border rounded-xl shadow-clinical-md px-4 py-3">
              <p className="text-xs text-clinical-muted font-medium">Model Prediction</p>
              <p className="text-sm font-bold text-amber-700 mt-0.5">Moderate DR · Stage 2</p>
              <p className="text-xs text-clinical-muted">Confidence: 94.7%</p>
            </div>

            {/* Floating badge — Confidence */}
            <div className="absolute -top-4 -right-4 bg-white border border-clinical-border rounded-xl shadow-clinical-md px-4 py-3">
              <p className="text-xs text-clinical-muted font-medium">AI Screening</p>
              <p className="text-sm font-bold text-teal-700 mt-0.5">Analysis Ready</p>
              <div className="flex gap-1 mt-1">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={`h-1.5 w-4 rounded-full ${i <= 3 ? 'bg-teal-500' : 'bg-clinical-border'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ─── Features ─────────────────────────────────────────────────────────── */}
    <section className="bg-white border-y border-clinical-border py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-navy-800">Platform Capabilities</h2>
          <p className="mt-2 text-clinical-muted text-sm">
            End-to-end AI-assisted retinopathy screening pipeline
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="p-5 rounded-lg border border-clinical-border hover:border-teal-200 hover:shadow-clinical-md transition-all duration-200 group">
                <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center mb-4 group-hover:bg-teal-50 transition-colors">
                  <Icon size={20} className="text-navy-600 group-hover:text-teal-600 transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-navy-800 mb-1.5">{f.title}</h3>
                <p className="text-sm text-clinical-muted leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    {/* ─── Workflow ─────────────────────────────────────────────────────────── */}
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-navy-800">Screening Workflow</h2>
          <p className="mt-2 text-clinical-muted text-sm">
            From fundus image to AI prediction in seconds
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
          {WORKFLOW.map((step, i) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center text-center gap-2 min-w-[100px]">
                  <div className="w-12 h-12 rounded-xl bg-navy-700 flex items-center justify-center">
                    <Icon size={22} className="text-white" />
                  </div>
                  <p className="text-xs font-semibold text-navy-800">{step.label}</p>
                  <p className="text-xs text-clinical-muted">{step.desc}</p>
                </div>
                {i < WORKFLOW.length - 1 && (
                  <ChevronRight size={18} className="text-clinical-border flex-shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>

    {/* ─── Footer / Disclaimer ──────────────────────────────────────────────── */}
    <footer className="border-t border-clinical-border bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Disclaimer variant="banner" />
        <p className="text-xs text-clinical-muted text-center mt-4">
          RetinaCare AI — Academic Research Prototype &nbsp;·&nbsp; DR Screening Platform
        </p>
      </div>
    </footer>
  </div>
);
