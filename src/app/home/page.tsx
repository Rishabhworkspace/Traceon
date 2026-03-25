import { MasterHero } from '@/components/home/MasterHero';
import { InteractiveShowcase } from '@/components/home/InteractiveShowcase';
import { EcosystemMarquee } from '@/components/home/EcosystemMarquee';
import { UnifiedBento } from '@/components/home/UnifiedBento';
import { TerminalInteractCTA } from '@/components/home/TerminalInteractCTA';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Background that covers the entire scrolling page seamlessly */}
      <div className="fixed inset-0 noise dot-matrix z-0 pointer-events-none opacity-40 mix-blend-overlay" />
      
      <div className="relative z-10 flex flex-col gap-8 pb-32">
        <MasterHero />
        <InteractiveShowcase />
        <EcosystemMarquee />
        <UnifiedBento />
        <TerminalInteractCTA />
      </div>
    </div>
  );
}
