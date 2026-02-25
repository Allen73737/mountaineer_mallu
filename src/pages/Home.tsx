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

export const Home = () => {
    return (
        <main className="relative w-full overflow-hidden">
            <HeroSection />
            <MissionVision />
            <Stories />
            <CommunityPreview />
            <Events />
            <Gallery />
            <Pillars />
            <Reviews />
            <Merch />
            <Contact />
        </main>
    );
};
