// src/app/profile-analytics/page.tsx
import { ProfileLandingHero } from '@/components/profile/ProfileLandingHero';
import { ProfileFeaturesSection } from '@/components/profile/ProfileFeaturesSection';
import { ProfileHowItWorksSection } from '@/components/profile/ProfileHowItWorksSection';
import { ProfileCTASection } from '@/components/profile/ProfileCTASection';

export const metadata = {
    title: 'Profile Analysis | Traceon',
    description: 'Discover your Engineering DNA with Traceon AI.',
};

export default function ProfileLandingPage() {
    return (
        <main className="min-h-screen bg-surface-0 noise dot-matrix selection:bg-indigo/30 selection:text-indigo">
            <ProfileLandingHero />
            <ProfileFeaturesSection />
            <ProfileHowItWorksSection />
            <ProfileCTASection />
        </main>
    );
}
