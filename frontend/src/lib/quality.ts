import { create } from 'zustand';
import { getDeviceConfig } from './deviceOptimization';

export type QualityTier = 'high' | 'medium' | 'low';

const ORDER: QualityTier[] = ['low', 'medium', 'high'];
const OVERRIDE_KEY = 'mm-quality';

interface QualityState {
    tier: QualityTier;
    /** True when the tier came from ?quality= or a saved override: the FPS probe leaves it alone. */
    pinned: boolean;
    setTier: (tier: QualityTier, pinned?: boolean) => void;
}

/** Software rasterisers and old integrated GPUs, read from the unmasked WebGL renderer string. */
const gpuTier = (): QualityTier | null => {
    try {
        const gl = document.createElement('canvas').getContext('webgl');
        if (!gl) return 'low';
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)).toLowerCase();
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        if (/swiftshader|llvmpipe|softpipe|basic render|software/.test(renderer)) return 'low';
        if (/intel.*(hd|uhd) graphics [2-6]\d{2}\b|mali-[gt]?[1-7]\d\b|adreno.*[1-5]\d{2}\b|powervr/.test(renderer)) return 'medium';
        return null;
    } catch {
        return null;
    }
};

const readOverride = (): QualityTier | null => {
    try {
        const fromUrl = new URLSearchParams(window.location.search).get('quality');
        if (fromUrl && (ORDER as string[]).includes(fromUrl)) {
            localStorage.setItem(OVERRIDE_KEY, fromUrl);
            return fromUrl as QualityTier;
        }
        if (fromUrl === 'auto') localStorage.removeItem(OVERRIDE_KEY);
        const saved = localStorage.getItem(OVERRIDE_KEY);
        return saved && (ORDER as string[]).includes(saved) ? saved as QualityTier : null;
    } catch {
        return null;
    }
};

const detect = (): QualityTier => {
    if (typeof window === 'undefined') return 'high';
    const device = getDeviceConfig();
    if (device.prefersReducedMotion) return 'low';
    let tier: QualityTier = device.isMobile ? 'medium' : device.isTablet ? (device.isLowPower ? 'low' : 'medium') : (device.isLowPower ? 'medium' : 'high');
    const gpu = gpuTier();
    if (gpu && ORDER.indexOf(gpu) < ORDER.indexOf(tier)) tier = gpu;
    return tier;
};

const applyToDocument = (tier: QualityTier) => {
    if (typeof document !== 'undefined') document.documentElement.dataset.quality = tier;
};

const initialOverride = typeof window === 'undefined' ? null : readOverride();
const initialTier = initialOverride ?? detect();
applyToDocument(initialTier);

/**
 * One quality tier for every decorative effect (WebGL scenes, lens FX, weather, colour grade).
 * Starts from device + GPU heuristics, then a frame-rate probe steps it down if the page can't hold
 * ~40fps. `?quality=high|medium|low` pins a tier (remembered in this browser); `?quality=auto` clears it.
 * Exposed to CSS as `html[data-quality]`.
 */
export const useQuality = create<QualityState>(set => ({
    tier: initialTier,
    pinned: initialOverride !== null,
    setTier: (tier, pinned = false) => {
        applyToDocument(tier);
        set({ tier, pinned });
    },
}));

export const atLeast = (tier: QualityTier, min: QualityTier) => ORDER.indexOf(tier) >= ORDER.indexOf(min);

/**
 * Frame-rate watchdog. Measures average frame time over 4 s windows while the tab is visible; two
 * slow windows (under 40 fps) in a row step the tier down one notch. Never steps up
 * (an upgrade mid-visit would just thrash). Returns a stop function.
 */
export const startQualityProbe = () => {
    let frame = 0;
    let windowStart = 0;
    let frames = 0;
    let last = 0;
    let slowWindows = 0;

    const tick = (now: number) => {
        frame = requestAnimationFrame(tick);
        if (document.visibilityState !== 'visible') { windowStart = 0; return; }
        // A long gap means the tab was throttled or the main thread was blocked by a one-off task: restart the window
        if (last && now - last > 250) windowStart = 0;
        last = now;
        if (!windowStart) { windowStart = now; frames = 0; return; }
        frames++;
        const elapsed = now - windowStart;
        if (elapsed < 4000) return;

        const fps = (frames * 1000) / elapsed;
        windowStart = 0;
        const { tier, pinned, setTier } = useQuality.getState();
        if (pinned || tier === 'low') return;
        slowWindows = fps < 40 ? slowWindows + 1 : 0;
        if (slowWindows >= 2) {
            slowWindows = 0;
            setTier(ORDER[ORDER.indexOf(tier) - 1]);
        }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
};
