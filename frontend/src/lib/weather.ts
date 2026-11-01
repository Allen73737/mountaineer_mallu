import { useStore, type AlpineWeather } from '../store/useStore';
import { peaksData } from '../data/peaks';

export type WeatherKind = 'clear' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm';

/** Today's featured peak — the same daily pick the hero and the preload use. */
export const todaysPeak = () => {
    const date = new Date();
    const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    return peaksData[dateSeed % peaksData.length];
};

const SNOW_CODES = [71, 73, 75, 77, 85, 86];

const conditionFor = (code: number) => {
    if (SNOW_CODES.includes(code)) return 'Snowing';
    if (code >= 95) return 'Thunderstorm';
    if (code >= 51 && code <= 67 || code >= 80 && code <= 82) return 'Raining/Freezing Rain';
    if (code >= 45 && code <= 48) return 'Foggy/low visibility';
    if (code >= 1 && code <= 3) return 'Partly cloudy';
    return 'Clear conditions';
};

// ?weather=snow|rain|fog|storm|clear previews a condition without waiting for it to happen on the mountain
const PREVIEW: Record<string, Partial<AlpineWeather>> = {
    clear: { code: 0, cloud: 5, visibility: 40000, wind: 6 },
    cloudy: { code: 3, cloud: 90, visibility: 20000, wind: 18 },
    fog: { code: 45, cloud: 100, visibility: 600, wind: 4 },
    rain: { code: 63, cloud: 100, visibility: 6000, wind: 22, precip: 2.5 },
    snow: { code: 73, cloud: 100, visibility: 3000, wind: 26, precip: 1.5, temp: -6 },
    storm: { code: 95, cloud: 100, visibility: 4000, wind: 48, precip: 6 },
};
const previewOverride = (): Partial<AlpineWeather> | null => {
    try {
        const key = new URLSearchParams(window.location.search).get('weather');
        return key && PREVIEW[key] ? PREVIEW[key] : null;
    } catch {
        return null;
    }
};

let inflight: Promise<void> | null = null;

/**
 * Live conditions at today's peak from Open-Meteo (no key needed), written to the store once per
 * visit. Concurrent callers share one request; a failure leaves temp null so the UI hides the reading.
 */
export const loadAlpineWeather = () => {
    if (useStore.getState().weatherLoaded) return Promise.resolve();
    if (inflight) return inflight;
    const { setWeather, setWeatherLoaded } = useStore.getState();
    const peak = todaysPeak();
    inflight = (async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${peak.lat}&longitude=${peak.lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,cloud_cover,visibility,precipitation`;
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            const c = (await response.json()).current;
            const live: AlpineWeather = {
                temp: c.temperature_2m,
                code: c.weather_code,
                condition: conditionFor(c.weather_code),
                isSnowing: SNOW_CODES.includes(c.weather_code),
                wind: c.wind_speed_10m,
                windDir: c.wind_direction_10m,
                cloud: c.cloud_cover,
                visibility: c.visibility,
                precip: c.precipitation,
            };
            const preview = previewOverride();
            const merged = preview ? { ...live, ...preview } : live;
            if (preview?.code !== undefined) {
                merged.condition = conditionFor(preview.code);
                merged.isSnowing = SNOW_CODES.includes(preview.code);
            }
            setWeather(merged);
        } catch (error) {
            console.error('Failed to fetch alpine weather:', error);
            const preview = previewOverride();
            setWeather(preview?.code !== undefined
                ? { temp: preview.temp ?? 2, condition: conditionFor(preview.code), isSnowing: SNOW_CODES.includes(preview.code), ...preview }
                : { temp: null, condition: '', isSnowing: false });
        } finally {
            setWeatherLoaded(true);
            inflight = null;
        }
    })();
    return inflight;
};

/** Collapse a reading into the one condition the atmosphere renders, with a 0–1 intensity. */
export const weatherKind = (w: AlpineWeather): { kind: WeatherKind; intensity: number } => {
    const code = w.code ?? (w.isSnowing ? 73 : 0);
    if (code >= 95) return { kind: 'storm', intensity: 1 };
    if (SNOW_CODES.includes(code)) return { kind: 'snow', intensity: code === 75 || code === 86 ? 1 : code === 71 || code === 77 || code === 85 ? 0.45 : 0.75 };
    if (code >= 51 && code <= 67 || code >= 80 && code <= 82) return { kind: 'rain', intensity: Math.min(1, 0.35 + (w.precip ?? 1) / 4) };
    if (code >= 45 && code <= 48 || (w.visibility !== undefined && w.visibility < 2000)) return { kind: 'fog', intensity: w.visibility !== undefined ? Math.min(1, Math.max(0.4, 1 - w.visibility / 2000)) : 0.8 };
    if ((w.cloud ?? 0) > 70) return { kind: 'cloudy', intensity: (w.cloud ?? 80) / 100 };
    return { kind: 'clear', intensity: 0 };
};

/** "Wind 24 km/h NE" — or null when we have no wind reading. */
export const windLabel = (w: AlpineWeather) => {
    if (w.wind === undefined) return null;
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const dir = w.windDir !== undefined ? ` ${dirs[Math.round(w.windDir / 45) % 8]}` : '';
    return `Wind ${Math.round(w.wind)} km/h${dir}`;
};
