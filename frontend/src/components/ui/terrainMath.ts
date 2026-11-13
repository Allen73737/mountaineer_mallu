/**
 * Pure terrain maths for the route scene (no three.js), shared by the main thread (route draping) and the
 * bake worker (geometry, sun shadows, ambient occlusion).
 */

const hash = (x: number, y: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
};
const fade = (t: number) => t * t * (3 - 2 * t);
export const smoothstep = (e0: number, e1: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
};
const noise = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    const u = fade(xf), v = fade(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const fbm = (x: number, y: number, octaves: number) => {
    let sum = 0, amp = 0.5, norm = 0;
    for (let o = 0; o < octaves; o++) {
        sum += noise(x, y) * amp;
        norm += amp;
        amp *= 0.5; x = x * 2.03 + 1.7; y = y * 2.03 + 9.2;
    }
    return sum / norm;
};
/** Ridged multifractal: sharp crests and V-shaped gullies, each octave weighted by the one before (0..1). */
const ridged = (x: number, y: number, octaves: number) => {
    let sum = 0, amp = 0.5, norm = 0, weight = 1;
    for (let o = 0; o < octaves; o++) {
        let n = 1 - Math.abs(noise(x, y) * 2 - 1);
        n *= n;
        sum += n * amp * weight;
        norm += amp;
        weight = Math.min(1, n * 1.6);
        amp *= 0.5; x = x * 2.07 + 3.1; y = y * 2.07 + 5.3;
    }
    return sum / norm;
};
const gauss = (dx: number, dz: number, s: number) => Math.exp(-(dx * dx + dz * dz) / s);

/**
 * An alpine massif: a steep pyramidal summit carved into three arêtes, subsidiary summits on its
 * shoulders, eroded spurs and gullies on the mid slopes, a rolling valley floor in front (where the
 * camera flies) and a snowy range behind it, away from the camera's arc.
 */
export const terrainHeight = (x: number, z: number) => {
    const wx = x + (noise(x * 0.3 + 3.1, z * 0.3 + 7.7) - 0.5) * 1.6;
    const wz = z + (noise(x * 0.3 + 11.3, z * 0.3 + 1.9) - 0.5) * 1.6;
    const r = Math.hypot(wx, wz);
    const theta = Math.atan2(wz, wx);

    const cone = Math.max(0, 1 - r / 7.4);
    const aretes = Math.pow(Math.abs(Math.cos(1.5 * theta + 0.4)), 3);
    const carve = 0.32 * (1 - aretes) * smoothstep(0.15, 2.6, r);
    const peak = 5.5 * Math.pow(cone, 1.7) * (1 - carve);

    const shoulders = 1.6 * gauss(x - 2.9, z + 2.0, 2.2) + 1.2 * gauss(x + 3.0, z + 0.6, 1.8) + 0.8 * gauss(x - 0.4, z - 3.6, 1.4);

    // The camera orbits over +z, so the backdrop range rises on the -z side and stays low in front
    const behind = 1 - smoothstep(-0.7, 0.2, Math.sin(Math.atan2(z, x)));
    const ring = smoothstep(5.5, 9.5, Math.hypot(x, z)) * (1 - smoothstep(17, 22, Math.hypot(x, z)));
    const range = Math.pow(ridged(x * 0.15 + 20, z * 0.15 + 3, 5), 1.6) * 6.2 * ring * (0.12 + 0.88 * behind);

    const midSlope = cone * (1 - cone) * 4;
    const massif = 1 - smoothstep(6.5, 10, r);
    const erosion = (ridged(x * 0.85 + 10, z * 0.85 + 10, 4) - 0.32) * (0.3 + 1.1 * midSlope) * massif;

    const floor = (fbm(x * 0.22, z * 0.22, 3) - 0.5) * 0.9;
    return peak + shoulders + range + erosion + floor - 0.8;
};

/** Plate coordinate remap: vertices are packed ~2x denser around the summit than at the far edges. */
const remap = (u: number, half: number) => half * (0.5 * u + 0.5 * u * u * u);

export interface TerrainBake { positions: Float32Array; light: Float32Array }

/**
 * Builds the vertex grid (same order as a PlaneGeometry rotated flat) plus, per vertex, a soft sun
 * shadow (ray-marched across a height grid) and an ambient-occlusion term (how far the surrounding
 * terrain rises above the point).
 */
export const bakeTerrain = (segments: number, size: number, sun: [number, number, number]): TerrainBake => {
    const half = size / 2;

    // Uniform height grid for fast lookups while ray marching
    const M = 300;
    const cell = size / (M - 1);
    const grid = new Float32Array(M * M);
    for (let j = 0; j < M; j++) for (let i = 0; i < M; i++) grid[j * M + i] = terrainHeight(-half + i * cell, -half + j * cell);
    const sample = (x: number, z: number) => {
        const gx = (x + half) / cell, gz = (z + half) / cell;
        if (gx < 0 || gz < 0 || gx >= M - 1 || gz >= M - 1) return -Infinity;
        const i = Math.floor(gx), j = Math.floor(gz), fx = gx - i, fz = gz - j;
        const k = j * M + i;
        const a = grid[k] + (grid[k + 1] - grid[k]) * fx;
        const b = grid[k + M] + (grid[k + M + 1] - grid[k + M]) * fx;
        return a + (b - a) * fz;
    };

    const len = Math.hypot(sun[0], sun[1], sun[2]);
    const lx = sun[0] / len, ly = sun[1] / len, lz = sun[2] / len;
    const horiz = Math.hypot(lx, lz);
    const dirX = lx / horiz, dirZ = lz / horiz, rise = ly / horiz; // height gained per unit of ground

    const n = segments + 1;
    const positions = new Float32Array(n * n * 3);
    const light = new Float32Array(n * n * 2);
    const AO_DIRS = 8;
    for (let iy = 0; iy < n; iy++) {
        const z = remap((iy / segments) * 2 - 1, half);
        for (let ix = 0; ix < n; ix++) {
            const x = remap((ix / segments) * 2 - 1, half);
            const h = terrainHeight(x, z);
            const v = iy * n + ix;
            positions[v * 3] = x; positions[v * 3 + 1] = h; positions[v * 3 + 2] = z;

            // Soft shadow: the closest the sun ray passes over the terrain, relative to distance travelled
            let shadow = 1, t = cell;
            for (let s = 0; s < 56; s++) {
                const ground = sample(x + dirX * t, z + dirZ * t);
                if (ground === -Infinity) break;
                const clearance = h + 0.03 + rise * t - ground;
                shadow = Math.min(shadow, (7 * clearance) / t);
                if (shadow <= 0) { shadow = 0; break; }
                t = t * 1.09 + cell * 0.6;
            }

            // Ambient occlusion: average elevation angle of the surroundings at two radii
            let occ = 0;
            for (let d = 0; d < AO_DIRS; d++) {
                const a = (d / AO_DIRS) * Math.PI * 2 + 0.3;
                const cx = Math.cos(a), cz = Math.sin(a);
                for (const rad of [0.45, 1.4]) {
                    const g = sample(x + cx * rad, z + cz * rad);
                    if (g !== -Infinity) occ += Math.min(1, Math.max(0, (g - h) / rad));
                }
            }
            light[v * 2] = Math.max(0, Math.min(1, shadow));
            light[v * 2 + 1] = 1 - Math.min(0.85, (occ / (AO_DIRS * 2)) * 1.6);
        }
    }
    return { positions, light };
};
