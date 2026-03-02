import { HeroSection } from '@/components/home/HeroSection';
import { LanguageTicker } from '@/components/home/LanguageTicker';
import { StatsSection } from '@/components/home/StatsSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { InstallSection } from '@/components/home/InstallSection';
import { CTASection } from '@/components/home/CTASection';
import { TechStackSection } from '@/components/home/TechStackSection';

export default function LandingPage() {
  return (
    <div className="noise dot-matrix">
      <HeroSection />
      <LanguageTicker />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <InstallSection />
      <CTASection />
      <TechStackSection />
    </div>
  );
}
