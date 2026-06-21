import React from 'react';
import { HeroSection } from '../components/sections/HeroSection';
import { MissionVision } from '../components/sections/MissionVision';
import { Stories } from '../components/sections/Stories';
import { Events } from '../components/sections/Events';
import { Gallery } from '../components/sections/Gallery';
import { Pillars } from '../components/sections/Pillars';
import { Reviews } from '../components/sections/Reviews';
import { Contact } from '../components/sections/Contact';
import { Merch } from '../components/sections/Merch';
import { CommunityPreview } from '../components/sections/CommunityPreview';
import { AltitudeNetwork } from '../components/sections/AltitudeNetwork';
import { ComingSoon } from '../components/ui/ComingSoon';
import { AltitudeTracker } from '../components/ui/AltitudeTracker';
import { AmbientFrost } from '../components/ui/AmbientFrost';
import { useSiteSettings } from '../store/useSiteSettings';

const SectionDivider = () => (
    <div className="relative py-1">
        <div className="section-divider" />
    </div>
);

/** Render a section based on its visibility status */
const Section = ({ sectionKey, label, children }: { sectionKey: string; label: string; children: React.ReactNode }) => {
    const { settings } = useSiteSettings();
    const config = settings.sections[sectionKey];
    if (!config) return <>{children}</>; // Fallback if not loaded
    const status = config.status || 'visible';
    
    if (status === 'hidden') return null;
    if (status === 'coming_soon') return <ComingSoon sectionName={label} sectionId={sectionKey} />;
    return <>{children}</>;
};

export const Home = () => {
    return (
        <main className="relative w-full overflow-hidden">
            <AmbientFrost />
            <HeroSection />
            <AltitudeTracker />
            <MissionVision />
            <SectionDivider />

            <Section sectionKey="stories" label="Stories">
                <Stories />
            </Section>

            <Section sectionKey="community" label="Community">
                <CommunityPreview />
            </Section>

            <SectionDivider />

            <Section sectionKey="events" label="Events">
                <Events />
            </Section>

            <AltitudeNetwork />

            <Section sectionKey="gallery" label="Gallery">
                <Gallery />
            </Section>

            <SectionDivider />
            
            <Section sectionKey="team" label="Team">
                <Pillars />
            </Section>

            <Section sectionKey="reviews" label="Reviews">
                <Reviews />
            </Section>

            <SectionDivider />

            <Section sectionKey="shop" label="Merchandise">
                <Merch />
            </Section>

            <Section sectionKey="contact" label="Contact">
                <Contact />
            </Section>
        </main>
    );
};
