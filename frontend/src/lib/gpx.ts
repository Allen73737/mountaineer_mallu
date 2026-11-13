/** GPX → compact route summary for stories. Runs entirely in the browser. */
export interface StoryRoute {
    points: [number, number, number | null][]; // lat, lon, elevation (m)
    distanceKm: number;
    gainM: number;
    maxElevationM: number;
    name?: string;
}

const MAX_POINTS = 600;
const R = 6371; // km

export const haversineKm = (a: [number, number], b: [number, number]) => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(b[0] - a[0]);
    const dLon = toRad(b[1] - a[1]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};

export const parseGpx = (xml: string): StoryRoute => {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('This file is not valid GPX.');

    // Tracks first, then routes, then bare waypoints
    let nodes = Array.from(doc.getElementsByTagName('trkpt'));
    if (nodes.length < 2) nodes = Array.from(doc.getElementsByTagName('rtept'));
    if (nodes.length < 2) nodes = Array.from(doc.getElementsByTagName('wpt'));
    const raw = nodes
        .map(n => {
            const lat = parseFloat(n.getAttribute('lat') || '');
            const lon = parseFloat(n.getAttribute('lon') || '');
            const eleText = n.getElementsByTagName('ele')[0]?.textContent;
            const ele = eleText != null && eleText !== '' ? parseFloat(eleText) : null;
            return [lat, lon, Number.isFinite(ele as number) ? ele : null] as [number, number, number | null];
        })
        .filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1]));
    if (raw.length < 2) throw new Error('No track points found in this GPX file.');

    // Totals from the full-resolution track
    let distanceKm = 0;
    let gainM = 0;
    let maxElevationM = -Infinity;
    let lastEle: number | null = null;
    for (let i = 0; i < raw.length; i++) {
        if (i) distanceKm += haversineKm([raw[i - 1][0], raw[i - 1][1]], [raw[i][0], raw[i][1]]);
        const e = raw[i][2];
        if (e != null) {
            maxElevationM = Math.max(maxElevationM, e);
            // 3 m hysteresis filters GPS altitude noise that would inflate the climb
            if (lastEle == null) lastEle = e;
            else if (e - lastEle > 3) { gainM += e - lastEle; lastEle = e; }
            else if (lastEle - e > 3) lastEle = e;
        }
    }

    // Evenly sample down to MAX_POINTS, always keeping start and finish
    const step = Math.max(1, (raw.length - 1) / (MAX_POINTS - 1));
    const points: StoryRoute['points'] = [];
    for (let f = 0; Math.round(f) < raw.length; f += step) points.push(raw[Math.round(f)]);
    if (points[points.length - 1] !== raw[raw.length - 1]) points.push(raw[raw.length - 1]);

    const name = (doc.querySelector('trk > name') || doc.querySelector('metadata > name') || doc.querySelector('name'))?.textContent?.trim();
    return {
        points: points.slice(0, 800).map(([la, lo, e]) => [+la.toFixed(6), +lo.toFixed(6), e == null ? null : Math.round(e)]),
        distanceKm: Math.round(distanceKm * 10) / 10,
        gainM: Math.round(gainM),
        maxElevationM: Number.isFinite(maxElevationM) ? Math.round(maxElevationM) : 0,
        name: name?.slice(0, 120),
    };
};
