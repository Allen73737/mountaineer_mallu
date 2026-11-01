import { useState, useEffect } from 'react';

export type DeviceTier = 'mobile' | 'tablet' | 'desktop';

export interface DeviceConfig {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isTouch: boolean;
    isLowPower: boolean;
    prefersReducedMotion: boolean;
    tier: DeviceTier;
    // Granular optimization thresholds
    particleCount: number;
    particleFpsInterval: number; // ms between frames
    auroraDpr: number;
    auroraFpsInterval: number;
    enableCustomCursor: boolean;
    enableHeavyBackdropBlur: boolean;
    enableComplexParallax: boolean;
}

/**
 * Pure function to inspect client environment and compute optimal device profile
 */
export function getDeviceConfig(): DeviceConfig {
    if (typeof window === 'undefined') {
        return {
            isMobile: false,
            isTablet: false,
            isDesktop: true,
            isTouch: false,
            isLowPower: false,
            prefersReducedMotion: false,
            tier: 'desktop',
            particleCount: 25,
            particleFpsInterval: 16,
            auroraDpr: 0.5,
            auroraFpsInterval: 16,
            enableCustomCursor: true,
            enableHeavyBackdropBlur: true,
            enableComplexParallax: true,
        };
    }

    const width = window.innerWidth;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches && window.matchMedia('(hover: hover)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect low-power devices via hardwareConcurrency / deviceMemory if available
    const nav = navigator as any;
    const cpuCores = nav.hardwareConcurrency || 8;
    const memory = nav.deviceMemory || 8;
    const isLowPower = cpuCores <= 4 || memory <= 4;

    let tier: DeviceTier = 'desktop';
    if (width < 768) {
        tier = 'mobile';
    } else if (width <= 1024) {
        tier = 'tablet';
    } else {
        tier = 'desktop';
    }

    const isMobile = tier === 'mobile';
    const isTablet = tier === 'tablet';
    const isDesktop = tier === 'desktop';

    // Tailored performance settings per device
    let particleCount = 25;
    let particleFpsInterval = 16;
    let auroraDpr = 0.5;
    let auroraFpsInterval = 16;
    let enableHeavyBackdropBlur = true;
    let enableComplexParallax = true;

    if (isMobile) {
        particleCount = isLowPower ? 4 : 6;
        particleFpsInterval = 33; // 30fps cap saves massive battery on phones
        auroraDpr = 0.35; // Cuts fill rate by > 50%
        auroraFpsInterval = 33;
        enableHeavyBackdropBlur = false;
        enableComplexParallax = false;
    } else if (isTablet) {
        particleCount = isLowPower ? 8 : 12;
        particleFpsInterval = 24; // ~40-45fps
        auroraDpr = 0.45;
        auroraFpsInterval = 24;
        enableHeavyBackdropBlur = !isLowPower;
        enableComplexParallax = true;
    } else {
        // Desktop
        particleCount = isLowPower ? 14 : 25;
        particleFpsInterval = isLowPower ? 24 : 16;
        auroraDpr = 0.5;
        auroraFpsInterval = 16;
        enableHeavyBackdropBlur = true;
        enableComplexParallax = true;
    }

    // Never show custom cursor on touch devices or small screens
    // Gate on the *primary* pointer: touchscreen laptops used with a mouse still get the cursor (it ignores
    // touch input itself), while phones / tablets whose main pointer is a finger do not
    const enableCustomCursor = isDesktop && hasFinePointer && !window.matchMedia('(pointer: coarse)').matches;

    return {
        isMobile,
        isTablet,
        isDesktop,
        isTouch,
        isLowPower,
        prefersReducedMotion,
        tier,
        particleCount: prefersReducedMotion ? 0 : particleCount,
        particleFpsInterval,
        auroraDpr,
        auroraFpsInterval: prefersReducedMotion ? 100 : auroraFpsInterval,
        enableCustomCursor,
        enableHeavyBackdropBlur,
        enableComplexParallax: !prefersReducedMotion && enableComplexParallax,
    };
}

/**
 * Hook to reactively track and adapt to device viewport and capability changes
 */
export function useDeviceOptimization(): DeviceConfig {
    const [config, setConfig] = useState<DeviceConfig>(getDeviceConfig);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;

        const handleResize = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setConfig(getDeviceConfig());
            }, 150);
        };

        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleMotionChange = () => setConfig(getDeviceConfig());

        window.addEventListener('resize', handleResize, { passive: true });
        motionQuery.addEventListener('change', handleMotionChange);

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
            motionQuery.removeEventListener('change', handleMotionChange);
        };
    }, []);

    return config;
}
