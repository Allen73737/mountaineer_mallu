import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import SoftAurora from './SoftAurora';
import { DriftingClouds } from './DriftingClouds';

interface SectionConfig {
    dark: {
        color1: string;
        color2: string;
        speed?: number;
        scale?: number;
        brightness?: number;
    };
    light: {
        color1: string;
        color2: string;
        speed?: number;
        scale?: number;
        brightness?: number;
        isBlueLight?: boolean;
    };
}

const THEME_PALETTES: Record<string, SectionConfig> = {
    hero: {
        dark: { color1: '#00F2FE', color2: '#6A11CB', speed: 0.5, scale: 1.6, brightness: 1.1 }, // Radiant Glacier Sapphire & Aurora Violet
        light: { color1: '#38bdf8', color2: '#818cf8', speed: 0.4, scale: 1.5, brightness: 1.0, isBlueLight: true }
    },
    mission: {
        dark: { color1: '#FF007F', color2: '#7F00FF', speed: 0.5, scale: 1.4, brightness: 1.05 }, // Rose & Deep Violet
        light: { color1: '#ffc3a0', color2: '#ffafbd', speed: 0.4, scale: 1.3, brightness: 0.85 }  // Rose Gold & Peach Sunrise
    },
    stories: {
        dark: { color1: '#00F2FE', color2: '#4FACFE', speed: 0.6, scale: 1.6, brightness: 1.1 }, // Glacier Sky & Sapphire
        light: { color1: '#a1c4fd', color2: '#c2e9fb', speed: 0.45, scale: 1.4, brightness: 0.9 }  // Crisp Ice Blue
    },
    events: {
        dark: { color1: '#43E97B', color2: '#38F9D7', speed: 0.55, scale: 1.5, brightness: 1.0 }, // Aurora Green & Teal
        light: { color1: '#d4fc79', color2: '#96e6a1', speed: 0.4, scale: 1.3, brightness: 0.85 }  // Fresh Alpine Dew
    },
    gallery: {
        dark: { color1: '#FA709A', color2: '#FEE140', speed: 0.45, scale: 1.3, brightness: 1.0 }, // Alpenglow Pink & Sunset Gold
        light: { color1: '#38bdf8', color2: '#818cf8', speed: 0.5, scale: 1.5, brightness: 1.15, isBlueLight: true } // Cyan & Sapphire over Navy
    },
    community: {
        dark: { color1: '#6A11CB', color2: '#2575FC', speed: 0.6, scale: 1.5, brightness: 1.1 }, // Deep Space Violet & Blue
        light: { color1: '#00f2fe', color2: '#4facfe', speed: 0.5, scale: 1.5, brightness: 1.15, isBlueLight: true } // Glacier Blue over Navy
    },
    team: {
        dark: { color1: '#1a2a6c', color2: '#fdbb2d', speed: 0.5, scale: 1.4, brightness: 1.0 }, // Deep Alpine Blue & Sunrise Gold
        light: { color1: '#fddb92', color2: '#d1fdff', speed: 0.35, scale: 1.2, brightness: 0.8 }  // Morning Mist Gold
    },
    reviews: {
        dark: { color1: '#4b6cb7', color2: '#f857a6', speed: 0.6, scale: 1.5, brightness: 1.0 }, // Cosmic Indigo & Pink
        light: { color1: '#ffc3a0', color2: '#ffafbd', speed: 0.4, scale: 1.3, brightness: 0.85 }  // Soft Peach & Rose Amber
    },
    merch: {
        dark: { color1: '#ff0844', color2: '#43e97b', speed: 0.65, scale: 1.6, brightness: 1.05 }, // Neon Coral & Sea Green
        light: { color1: '#ff9a9e', color2: '#ffecd2', speed: 0.45, scale: 1.4, brightness: 0.85 }  // Champagne Bloom & Sunrise Pink
    },
    contact: {
        dark: { color1: '#00c6ff', color2: '#7f00ff', speed: 0.6, scale: 1.5, brightness: 1.1 }, // Electric Teal & Deep Violet
        light: { color1: '#38bdf8', color2: '#c084fc', speed: 0.5, scale: 1.5, brightness: 1.15, isBlueLight: true } // Glacier Starburst & Cyan over Navy
    },
    dashboard: {
        dark: { color1: '#00F2FE', color2: '#4FACFE', speed: 0.55, scale: 1.4, brightness: 1.15 }, // Tactical Sapphire & Electric Ice
        light: { color1: '#e0f2fe', color2: '#c4b5fd', speed: 0.4, scale: 1.3, brightness: 0.9 }
    },
    default: {
        dark: { color1: '#3A29FF', color2: '#FF94B4', speed: 0.6, scale: 1.5, brightness: 1.0 }, // React Bits Default Aurora
        light: { color1: '#ffe259', color2: '#ffa751', speed: 0.4, scale: 1.3, brightness: 0.85 }
    }
};

export const AtmosphericBackground: React.FC = () => {
    const { theme } = useStore();
    const location = useLocation();
    const [activeSectionKey, setActiveSectionKey] = useState<string>('default');
    const [isHeroVisible, setIsHeroVisible] = useState<boolean>(false);
    const [isBlueSection, setIsBlueSection] = useState<boolean>(false);

    // Determine if dark mode is active
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    useEffect(() => {
        const pathname = location.pathname;

        // Non-homepage routes (e.g. /stories, /gallery, /events)
        if (pathname !== '/' && pathname !== '') {
            setIsHeroVisible(false);

            if (pathname.startsWith('/stories')) {
                setActiveSectionKey('stories');
                setIsBlueSection(false);
            } else if (pathname.startsWith('/events')) {
                setActiveSectionKey('events');
                setIsBlueSection(false);
            } else if (pathname.startsWith('/gallery')) {
                setActiveSectionKey('gallery');
                setIsBlueSection(true);
            } else if (pathname.startsWith('/community')) {
                setActiveSectionKey('community');
                setIsBlueSection(true);
            } else if (pathname.startsWith('/team')) {
                setActiveSectionKey('team');
                setIsBlueSection(false);
            } else if (pathname.startsWith('/reviews')) {
                setActiveSectionKey('reviews');
                setIsBlueSection(false);
            } else if (pathname.startsWith('/shop')) {
                setActiveSectionKey('merch');
                setIsBlueSection(false);
            } else if (pathname.startsWith('/contact')) {
                setActiveSectionKey('contact');
                setIsBlueSection(true);
            } else if (pathname.startsWith('/portal') || pathname.startsWith('/dashboard') || pathname.startsWith('/user')) {
                setActiveSectionKey('dashboard');
                setIsBlueSection(false);
            } else {
                setActiveSectionKey('default');
                setIsBlueSection(false);
            }
            return;
        }

        // Homepage: Use IntersectionObserver for zero-reflow smooth section switching
        const sections = document.querySelectorAll('section');
        if (!sections.length) return;

        const visibleMap = new Map<string, { ratio: number; element: Element }>();

        const evaluateActiveSection = () => {
            let maxRatio = 0;
            let activeSec: Element | null = null;

            visibleMap.forEach((data) => {
                if (data.ratio > maxRatio) {
                    maxRatio = data.ratio;
                    activeSec = data.element;
                }
            });

            if (!activeSec) {
                if (window.scrollY < window.innerHeight * 0.7) {
                    setIsHeroVisible(true);
                    setActiveSectionKey('hero');
                    setIsBlueSection(false);
                }
                return;
            }

            const sec = activeSec as HTMLElement;
            const id = sec.id || '';
            let foundKey = 'default';
            let foundBlue = false;

            if (id && THEME_PALETTES[id]) {
                foundKey = id;
            } else if (sec.classList.contains('hero-section-cursor')) {
                foundKey = 'hero';
            } else if (id === 'mission' || id === 'vision') {
                foundKey = 'mission';
            } else if (id === 'team' || id === 'leadership') {
                foundKey = 'team';
            } else if (id === 'reviews' || id === 'testimonials') {
                foundKey = 'reviews';
            } else if (id === 'community' || id === 'altitude') {
                foundKey = 'community';
            }

            if (
                sec.classList.contains('bg-alpine-navy') ||
                id === 'gallery' ||
                id === 'contact' ||
                id === 'community' ||
                THEME_PALETTES[foundKey]?.light?.isBlueLight
            ) {
                foundBlue = true;
            }

            setIsHeroVisible(foundKey === 'hero');
            setActiveSectionKey(foundKey);
            setIsBlueSection(foundBlue);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const target = entry.target;
                    const id = target.id || target.className;
                    if (entry.isIntersecting) {
                        visibleMap.set(id, { ratio: entry.intersectionRatio, element: target });
                    } else {
                        visibleMap.delete(id);
                    }
                });
                evaluateActiveSection();
            },
            { threshold: [0.3, 0.6] }
        );

        sections.forEach((sec) => observer.observe(sec));

        // Initial check for top of page hero
        if (window.scrollY < window.innerHeight * 0.5) {
            setIsHeroVisible(true);
            setActiveSectionKey('hero');
            setIsBlueSection(false);
        }

        return () => {
            observer.disconnect();
        };
    }, [location.pathname]);

    const currentPalette = THEME_PALETTES[activeSectionKey] || THEME_PALETTES.default;
    const config = isDark ? currentPalette.dark : currentPalette.light;
    const isBlueBackground = !isDark && (isBlueSection || currentPalette.light.isBlueLight);

    return (
        <div 
            className="fixed inset-0 pointer-events-none z-[0] overflow-hidden transition-opacity duration-1000"
        >
            <div 
                className={`w-full h-full transition-opacity duration-1000 ${
                    isDark 
                        ? 'opacity-80' 
                        : isBlueBackground 
                            ? 'opacity-85' 
                            : 'opacity-55'
                }`}
            >
                <SoftAurora
                    speed={config.speed || 0.5}
                    scale={config.scale || 1.5}
                    brightness={config.brightness || 1.0}
                    color1={isDark ? (config.color1 || '#00c6ff') : (config.color1 || '#38bdf8')}
                    color2={isDark ? (config.color2 || '#7f00ff') : (config.color2 || '#818cf8')}
                    noiseFrequency={2.5}
                    noiseAmplitude={1.0}
                    bandHeight={0.5}
                    bandSpread={1.0}
                    octaveDecay={0.1}
                    layerOffset={0}
                    colorSpeed={1.0}
                    enableMouseInteraction={true}
                    mouseInfluence={0.25}
                    paused={false}
                />
            </div>
        </div>
    );
};
