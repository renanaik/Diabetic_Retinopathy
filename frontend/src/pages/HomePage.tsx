import React from 'react';
import { HeroSection } from '../components/sections/HeroSection';
import { TrustValuesSection } from '../components/sections/TrustValuesSection';
import { AboutSection } from '../components/sections/AboutSection';
import { HowItWorksSection } from '../components/sections/HowItWorksSection';
import { DRStagesSection } from '../components/sections/DRStagesSection';
import { FeaturesSection } from '../components/sections/FeaturesSection';
import { ResponsibleAISection } from '../components/sections/ResponsibleAISection';
import { CTASection } from '../components/sections/CTASection';

export const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <TrustValuesSection />
      <AboutSection />
      <HowItWorksSection />
      <DRStagesSection />
      <FeaturesSection />
      <ResponsibleAISection />
      <CTASection />
    </>
  );
};
