import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity, Eye, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" aria-hidden="true" />
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, #4f46e5 0%, #0891b2 50%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="container-main relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 rounded-full px-4 py-1.5 mb-6 animate-fade-up">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wide">
              AI-Powered Retinal Screening
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--color-text)] mb-6 leading-tight animate-fade-up delay-100">
            Intelligent Diabetic Retinopathy <span className="gradient-text">Screening & Monitoring</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[var(--color-text-muted)] leading-relaxed mb-8 max-w-2xl mx-auto animate-fade-up delay-200">
            Empowering doctors with deep learning for fundus image analysis and helping patients track retinal health across 5 severity stages.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up delay-300">
            <Link to="/signup" className="btn btn-primary btn-lg shadow-glow" id="hero-get-started-btn">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/how-it-works" className="btn btn-outline btn-lg" id="hero-how-it-works-btn">
              How It Works
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--color-text-muted)]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Doctor-Verified Results</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-brand-500" />
              <span>EfficientNet-B4 AI Architecture</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-cyan-500" />
              <span>5-Stage Severity Classification</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
