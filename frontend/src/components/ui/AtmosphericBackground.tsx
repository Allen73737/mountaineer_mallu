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
    // One brand palette for the whole site: sections alternate between a cool glacier mood and a warm
    // alpenglow mood (navy / glacier / sunrise / pearl only), so nothing glows pink, green or neon behind them.
    hero: {
        dark: { color1: '#4F86BC', color2: '#7E74B0', speed: 0.38, scale: 1.5, brightness: 1.15 },
        light: { color1: '#cfe0ee', color2: '#dfe7ef', speed: 0.3, scale: 1.4, brightness: 0.75 }
    },
    mission: {
        dark: { color1: '#4A6A9C', color2: '#C9805A', speed: 0.38, scale: 1.4, brightness: 1.1 },
        light: { color1: '#f1dccb', color2: '#e6e9ee', speed: 0.3, scale: 1.3, brightness: 0.75 }
    },
    stories: {
        dark: { color1: '#4F86BC', color2: '#7E74B0', speed: 0.38, scale: 1.5, brightness: 1.15 },
        light: { color1: '#cfe0ee', color2: '#dfe7ef', speed: 0.3, scale: 1.4, brightness: 0.75 }
    },
    events: {
        dark: { color1: '#4A6A9C', color2: '#C9805A', speed: 0.38, scale: 1.4, brightness: 1.1 },
        light: { color1: '#f1dccb', color2: '#e6e9ee', speed: 0.3, scale: 1.3, brightness: 0.75 }
    },
    gallery: {
        dark: { color1: '#4F86BC', color2: '#7E74B0', speed: 0.38, scale: 1.5, brightness: 1.15 },
        light: { color1: '#A3C9E2', color2: '#4A6A8C', speed: 0.35, scale: 1.5, brightness: 0.9, isBlueLight: true }
    },
    community: {
        dark: { color1: '#4F86BC', color2: '#7E74B0', speed: 0.38, scale: 1.5, brightness: 1.15 },
        light: { color1: '#A3C9E2', color2: '#4A6A8C', speed: 0.35, scale: 1.5, brightness: 0.9, isBlueLight: true }
    },
    team: {
        dark: { color1: '#4A6A9C', color2: '#C9805A', speed: 0.38, scale: 1.4, brightness: 1.1 },
        light: { color1: '#f1dccb', color2: '#e6e9ee', speed: 0.3, scale: 1.3, brightness: 0.75 }
    },
    reviews: {
        dark: { color1: '#4F86BC', color2: '#7E74B0', speed: 0.38, scale: 1.5, brightness: 1.15 },
        light: { color1: '#cfe0ee', color2: '#dfe7ef', speed: 0.3, scale: 1.4, brightness: 0.75 }
    },
    merch: {
        dark: { color1: '#4A6A9C', color2: '#C9805A', speed: 0.38, scale: 1.4, brightness: 1.1 },
        light: { color1: '#f1dccb', color2: '#e6e9ee', speed: 0.3, scale: 1.3, brightness: 0.75 }
    },
    contact: {
        dark: { color1: '#4F86BC', color2: '#7E74B0', speed: 0.38, scale: 1.5, brightness: 1.15 },
        light: { color1: '#A3C9E2', color2: '#4A6A8C', speed: 0.35, scale: 1.5, brightness: 0.9, isBlueLight: true }
    },
    dashboard: {
        dark: { color1: '#4F86BC', color2: '#7E74B0', speed: 0.38, scale: 1.5, brightness: 1.15 },
        light: { color1: '#cfe0ee', color2: '#dfe7ef', speed: 0.3, scale: 1.4, brightness: 0.75 }
    },
    default: {
        dark: { color1: '#4F86BC', color2: '#7E74B0', speed: 0.38, scale: 1.5, brightness: 1.15 },
        light: { color1: '#cfe0ee', color2: '#dfe7ef', speed: 0.3, scale: 1.4, brightness: 0.75 }
    },
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
                        ? 'opacity-100' 
                        : isBlueBackground 
                            ? 'opacity-85' 
                            : 'opacity-55'
                }`}
            >
                <SoftAurora
                    speed={config.speed || 0.5}
                    scale={config.scale || 1.5}
                    brightness={config.brightness || 1.0}
                    color1={isDark ? (config.color1 || '#00c6ff') : (config.color1 || '#7EAACB')}
                    color2={isDark ? (config.color2 || '#7f00ff') : (config.color2 || '#9C93B5')}
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
