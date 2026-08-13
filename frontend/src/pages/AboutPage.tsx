import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ArrowRight, Brain, ShieldCheck, Users, AlertTriangle } from 'lucide-react';
import { SectionWrapper } from '../components/common/SectionWrapper';
import { useScrollReveal } from '../hooks/useScrollReveal';

const PILLARS = [
  {
    icon: Brain,
    title: 'AI-Assisted Classification',
    description:
      'The AI model analyzes retinal fundus images and classifies them across five diabetic retinopathy severity stages. The model generates a predicted stage and a confidence distribution — not a clinical diagnosis.',
    color: 'text-brand-600 dark:text-brand-400',
    bg: 'bg-brand-50 dark:bg-brand-950/50',
  },
  {
    icon: Users,
    title: 'Doctor Involvement',
    description:
      'Doctors are at the center of the workflow. They initiate screenings, review AI-generated results, add clinical annotations, and decide whether to approve reports for their patients.',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/50',
  },
  {
    icon: Eye,
    title: 'Patient Monitoring',
    description:
      'Patients can access their approved screening reports and track their retinopathy history over time. Long-term monitoring helps both patients and doctors understand disease progression.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  {
    icon: ShieldCheck,
    title: 'Responsible AI Approach',
    description:
      'Every AI result requires human clinical review before it is presented to a patient. No automated diagnoses are made. The platform is designed to support, not supplant, healthcare professionals.',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/50',
  },
];

export const AboutPage: React.FC = () => {
  const introRef   = useScrollReveal<HTMLDivElement>();
  const pillarsRef = useScrollReveal<HTMLDivElement>();
  const motiveRef  = useScrollReveal<HTMLDivElement>();
  const disclaRef  = useScrollReveal<HTMLDivElement>();

  return (
    <>
      {/* ── Page Hero ── */}
      <section className="relative py-20 md:py-28 overflow-hidden" aria-label="About hero">
        <div className="absolute inset-0 bg-grid-pattern opacity-60" aria-hidden="true" />
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4f46e5, transparent)', transform: 'translate(30%, -30%)' }}
          aria-hidden="true"
        />
        <div className="container-main relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wide">
                About the Project
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[var(--color-text)] mb-6 leading-tight">
              About{' '}
              <span className="gradient-text">RetinaCare AI</span>
            </h1>
            <p className="text-xl text-[var(--color-text-muted)] leading-relaxed max-w-2xl">
              An academic platform exploring how artificial intelligence can support diabetic
              retinopathy screening alongside qualified healthcare professionals.
            </p>
          </div>
        </div>
      </section>

      {/* ── Introduction ── */}
      <SectionWrapper bg="surface">
        <div ref={introRef} className="reveal max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-4">
                What Is RetinaCare AI?
              </h2>
              <div className="space-y-4 text-[var(--color-text-muted)] leading-relaxed text-sm md:text-base">
                <p>
                  RetinaCare AI is an academic AI-assisted diabetic retinopathy screening and
                  monitoring platform. It is built as a research and learning project to
                  explore how modern deep learning models can assist healthcare professionals
                  in identifying retinal disease.
                </p>
                <p>
                  The platform is not a commercial medical device and is not approved for
                  clinical use. It is designed as an end-to-end proof of concept — from
                  patient registration and doctor-patient connection, through retinal image
                  analysis and AI classification, to clinical review and patient-facing reports.
                </p>
              </div>
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-4">
                The Problem It Addresses
              </h2>
              <div className="space-y-4 text-[var(--color-text-muted)] leading-relaxed text-sm md:text-base">
                <p>
                  Diabetic retinopathy (DR) is a complication of diabetes that affects the blood
                  vessels of the retina. It is one of the leading causes of preventable vision
                  loss worldwide. Early-stage DR often has no symptoms — making routine screening
                  critically important for people living with diabetes.
                </p>
                <p>
                  Despite this, access to timely retinal screening remains limited in many
                  healthcare settings. RetinaCare AI explores whether AI-assisted tools can
                  help identify cases earlier and support doctors in managing larger patient
                  panels more effectively.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── Why Screening Matters ── */}
      <SectionWrapper bg="default">
        <div ref={motiveRef} className="reveal max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-4">
              Why Retinal Screening Matters
            </h2>
            <p className="text-[var(--color-text-muted)] leading-relaxed max-w-2xl mx-auto">
              The retina is the only part of the central nervous system directly visible without
              surgery. Early retinopathy changes are detectable in retinal images long before a
              patient experiences symptoms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                stat: 'Early Detection',
                detail: 'Identifying DR in early stages dramatically increases the effectiveness of treatment and can prevent vision loss.',
              },
              {
                stat: 'Monitoring Progression',
                detail: 'Tracking changes across multiple screenings helps doctors understand how a patient\'s retinopathy is progressing over time.',
              },
              {
                stat: 'AI as a Support Tool',
                detail: 'AI classification can help prioritize cases for review and flag potential findings for clinical attention.',
              },
            ].map(({ stat, detail }) => (
              <div key={stat} className="card p-6">
                <h3 className="font-display font-bold text-brand-600 dark:text-brand-400 text-base mb-2">{stat}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ── Platform Pillars ── */}
      <SectionWrapper bg="surface">
        <div ref={pillarsRef} className="reveal">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-4">
              How the Platform Works
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">
              Four core pillars underpin the RetinaCare AI design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {PILLARS.map(({ icon: Icon, title, description, color, bg }) => (
              <div key={title} className="card card-hover p-6 flex gap-5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color} ${bg}`}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-[var(--color-text)] mb-2 text-base">{title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ── Medical Disclaimer ── */}
      <SectionWrapper bg="default">
        <div ref={disclaRef} className="reveal max-w-3xl mx-auto">
          <div className="card p-8 md:p-10 border-l-4 border-amber-400">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-display font-bold text-[var(--color-text)] text-xl mb-3">
                  Medical Disclaimer
                </h2>
                <div className="space-y-3 text-sm text-[var(--color-text-muted)] leading-relaxed">
                  <p>
                    RetinaCare AI is an <strong className="text-[var(--color-text)]">academic AI-assisted screening project</strong>.
                    It is not a registered medical device and has not been validated for clinical use.
                  </p>
                  <p>
                    AI-generated results are intended solely to support a screening workflow and
                    must be reviewed by a qualified healthcare professional. They are{' '}
                    <strong className="text-[var(--color-text)]">not a substitute for professional
                    medical diagnosis, advice, or treatment</strong>.
                  </p>
                  <p>
                    Always consult a licensed ophthalmologist or healthcare provider for any
                    concerns related to your vision or eye health.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/" className="btn btn-primary btn-md inline-flex" id="about-back-home-btn">
              Back to Home
            </Link>
            <Link to="/how-it-works" className="btn btn-outline btn-md inline-flex ml-3" id="about-how-it-works-btn">
              How It Works
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
};
