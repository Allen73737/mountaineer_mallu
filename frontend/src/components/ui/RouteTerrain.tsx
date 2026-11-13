import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';
import { bakeTerrain, terrainHeight, type TerrainBake } from './terrainMath';

export interface RouteCamp { name: string; elevation: number; at: number }
export type RouteQuality = 'high' | 'medium' | 'low';

const SIZE = 44;
// Low first light from the left of the camera's arc: the summit catches it, the valleys stay in shade
const SUN: [number, number, number] = [-0.8, 0.36, 0.5];

/** Bakes geometry, shadows and occlusion in a worker (falls back to the main thread if workers fail). */
const useTerrainBake = (segments: number) => {
    const [bake, setBake] = useState<TerrainBake | null>(null);
    useEffect(() => {
        let cancelled = false;
        let worker: Worker | undefined;
        const done = (b: TerrainBake) => { if (!cancelled) setBake(b); };
        const inline = () => done(bakeTerrain(segments, SIZE, SUN));
        try {
            worker = new Worker(new URL('./terrainWorker.ts', import.meta.url), { type: 'module' });
            worker.onmessage = (e: MessageEvent<TerrainBake>) => done(e.data);
            worker.onerror = inline;
            worker.postMessage({ segments, size: SIZE, sun: SUN });
        } catch {
            inline();
        }
        return () => { cancelled = true; worker?.terminate(); };
    }, [segments]);
    return bake;
};

const terrainVertex = /* glsl */ `
attribute vec2 aLight;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vLight;
void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vLight = aLight;
    gl_Position = projectionMatrix * viewMatrix * world;
}`;

// Physically-motivated shading: baked sun shadow + occlusion, warm low sun, cold sky fill, snow that
// settles only where the slope lets it, rock strata, valley mist and aerial perspective. The far edge
// of the plate fades out (alpha) into the section background.
const terrainFragment = /* glsl */ `
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uSkyColor;
uniform vec3 uGroundColor;
uniform vec3 uRockA;
uniform vec3 uRockB;
uniform vec3 uScree;
uniform vec3 uSnow;
uniform vec3 uHaze;
uniform vec3 uMist;
uniform vec3 uClimber;
uniform float uPlate;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vLight;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm3(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
    return s / 0.875;
}

void main() {
    vec3 geoN = normalize(vNormal);
    vec3 n = geoN;
    float h = vWorld.y;
    float dist = distance(cameraPosition, vWorld);
    float grain = fbm3(vWorld.xz * 2.2 + vWorld.y * 0.9);

#if DETAIL
    // Fine rock texture as a bump on the normal (screen-space derivatives), fading out with distance
    float b = fbm3(vWorld.xz * 7.0 + vWorld.y * 3.0) * 0.6 + grain * 0.4;
    vec3 dpdx = dFdx(vWorld), dpdy = dFdy(vWorld);
    vec3 r1 = cross(dpdy, n), r2 = cross(n, dpdx);
    float det = dot(dpdx, r1);
    vec3 grad = sign(det) * (dFdx(b) * r1 + dFdy(b) * r2);
    n = normalize(abs(det) * n - grad * 0.11 * (1.0 - smoothstep(8.0, 20.0, dist)));
#endif

    // Snow: above a ragged snowline, on slopes gentle enough to hold it, lingering lower in sheltered gullies
    float slope = 1.0 - geoN.y;
    float snowLine = 1.5 + (grain - 0.5) * 1.6;
    float alt = smoothstep(snowLine - 0.3, snowLine + 0.3, h);
    float hold = 1.0 - smoothstep(0.24 + alt * 0.08, 0.42 + alt * 0.1, slope);
    float gully = (1.0 - vLight.y) * smoothstep(snowLine - 1.8, snowLine, h);
    float snow = smoothstep(0.35, 0.6, (alt + gully * 0.9) * hold);

    // Rock: banded strata on the faces, darker scree and moraine toward the valley floor
    float strata = vnoise(vec2(h * 5.0 + grain * 2.5, 3.7));
    vec3 rock = mix(uRockA, uRockB, smoothstep(0.25, 0.85, strata)) * (0.7 + 0.6 * grain);
    rock = mix(uScree, rock, smoothstep(-0.6, 0.8, h + slope * 1.5));
    vec3 albedo = mix(rock, uSnow, snow);

    vec3 L = normalize(uSunDir);
    float ndl = max(dot(n, L), 0.0);
    float shadow = vLight.x;
    float ao = vLight.y;
    // Higher ground catches more of the low sun (alpenglow); the valleys sit in the mountain's shade
    vec3 sun = uSunColor * mix(0.45, 1.0, smoothstep(-0.5, 3.5, h));
    vec3 color = albedo * (sun * ndl * shadow + mix(uGroundColor, uSkyColor, n.y * 0.5 + 0.5) * ao);

    vec3 V = normalize(cameraPosition - vWorld);
    color += uSunColor * pow(max(dot(n, normalize(L + V)), 0.0), 40.0) * 0.25 * snow * shadow;

    // The climber's headlamp: a small warm pool of light that travels up the route
    float dc = distance(vWorld, uClimber);
    color += albedo * vec3(1.0, 0.7, 0.42) * 1.4 / (1.0 + dc * dc * 45.0);

    // Mist pooling in the valleys, then aerial perspective with distance
    float mist = exp(-max(h + 0.4, 0.0) * 1.5) * smoothstep(5.0, 16.0, dist) * 0.8;
    color = mix(color, uMist, mist);
    color = mix(color, uHaze, 1.0 - exp(-max(dist - 9.0, 0.0) * 0.075));

    float alpha = 1.0 - smoothstep(uPlate * 0.32, uPlate * 0.46, length(vWorld.xz));
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}`;

// Light theme sits on the navy night section, dark theme on near-black: only the air colours change
const PALETTE = {
    light: { haze: '#0e1f36', mist: '#1b2d47', sky: '#4a6a98', ground: '#0e1522', fog: '#0a1628' },
    dark: { haze: '#0a0c11', mist: '#161b24', sky: '#3d5478', ground: '#0c0e13', fog: '#040506' },
};
type Palette = typeof PALETTE.dark;

const useTerrainMaterial = (palette: Palette, detail: boolean) => {
    const material = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: terrainVertex,
        fragmentShader: terrainFragment,
        transparent: true,
        defines: { DETAIL: detail ? 1 : 0 },
        uniforms: {
            uSunDir: { value: new THREE.Vector3(...SUN) },
            uSunColor: { value: new THREE.Color('#ffb47e').multiplyScalar(2.6) },
            uSkyColor: { value: new THREE.Color(palette.sky) },
            uGroundColor: { value: new THREE.Color(palette.ground) },
            uRockA: { value: new THREE.Color('#3a3633') },
            uRockB: { value: new THREE.Color('#5d554d') },
            uScree: { value: new THREE.Color('#22211f') },
            uSnow: { value: new THREE.Color('#f2f5fa') },
            uHaze: { value: new THREE.Color(palette.haze) },
            uMist: { value: new THREE.Color(palette.mist) },
            uClimber: { value: new THREE.Vector3(0, -100, 0) },
            uPlate: { value: SIZE },
        },
    }), [palette, detail]);
    useEffect(() => () => material.dispose(), [material]);
    return material;
};

const Terrain = ({ segments, material }: { segments: number; material: THREE.ShaderMaterial }) => {
    const bake = useTerrainBake(segments);
    const { gl, scene, camera, invalidate } = useThree();
    const geometry = useMemo(() => {
        if (!bake) return null;
        const g = new THREE.PlaneGeometry(SIZE, SIZE, segments, segments);
        g.rotateX(-Math.PI / 2);
        g.setAttribute('position', new THREE.BufferAttribute(bake.positions, 3));
        g.setAttribute('aLight', new THREE.BufferAttribute(bake.light, 2));
        g.computeVertexNormals();
        g.computeBoundingSphere();
        return g;
    }, [bake, segments]);
    useEffect(() => () => geometry?.dispose(), [geometry]);
    // Link the terrain shader as soon as the geometry exists, then draw
    useEffect(() => {
        if (!geometry) return;
        gl.compile(scene, camera);
        invalidate();
    }, [geometry, gl, scene, camera, invalidate]);
    return geometry ? <mesh geometry={geometry} material={material} renderOrder={-1} /> : null;
};

const TUBE_SEGMENTS = 420;
const RADIAL = 6;

/** The route up the massif: switchbacks spiralling in from the valley floor to the summit. */
const useRouteCurve = () => useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const n = 12;
    for (let i = 0; i <= n; i++) {
        const t = i / n;
        const r = 5.6 * Math.pow(1 - t, 0.85) + 0.02;
        const a = 0.35 + t * 2.4 + (i % 2 ? 0.28 : -0.28) * (1 - t);
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        pts.push(new THREE.Vector3(x, terrainHeight(x, z) + 0.05, z));
    }
    const coarse = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    // Re-drape the smoothed line onto the ground so it never cuts through a ridge
    const draped = coarse.getSpacedPoints(160).map(p => new THREE.Vector3(p.x, terrainHeight(p.x, p.z) + 0.045, p.z));
    return new THREE.CatmullRomCurve3(draped, false, 'centripetal');
}, []);

const Scene = ({ progress, camps, segments, detail, active, dark }: { progress: MotionValue<number>; camps: RouteCamp[]; segments: number; detail: boolean; active: boolean; dark: boolean }) => {
    const palette = dark ? PALETTE.dark : PALETTE.light;
    const material = useTerrainMaterial(palette, detail);
    const curve = useRouteCurve();
    const trail = useMemo(() => new THREE.TubeGeometry(curve, TUBE_SEGMENTS, 0.028, RADIAL, false), [curve]);
    const ghost = useMemo(() => new THREE.TubeGeometry(curve, TUBE_SEGMENTS, 0.01, 4, false), [curve]);
    const climber = useRef<THREE.Group>(null);
    const campRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
    const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
    const look = useRef(new THREE.Vector3(0, 2.2, 0));
    const shown = useRef(0);
    const campPoints = useMemo(() => camps.map(c => curve.getPointAt(Math.min(0.999, c.at))), [camps, curve]);

    const { camera, size, invalidate, gl, scene } = useThree();

    // Compile every shader up front (the scene is mounted at idle time, before it's on screen), so the
    // first visible frame doesn't stall on program linking
    useEffect(() => { gl.compile(scene, camera); }, [gl, scene, camera]);

    // On-demand rendering: draw when the scroll position moves (and while the easing below settles)
    useEffect(() => {
        invalidate();
        return progress.on('change', () => invalidate());
    }, [progress, invalidate, active, dark]);

    // On wide screens the headline and camp list sit on the left: frame the massif right of centre
    useEffect(() => {
        const cam = camera as THREE.PerspectiveCamera;
        if (size.width >= 1024) cam.setViewOffset(size.width, size.height, -size.width * 0.16, 0, size.width, size.height);
        else cam.clearViewOffset();
        cam.updateProjectionMatrix();
    }, [camera, size.width, size.height]);

    useFrame(({ camera }, rawDelta) => {
        // After an idle stretch the clock delta is huge; clamp so the easing doesn't jump
        const delta = Math.min(rawDelta, 1 / 30);
        const target = THREE.MathUtils.clamp(progress.get(), 0, 1);
        // Ease the drawn length toward the scroll position so fast scrolls still read as a climb
        shown.current = THREE.MathUtils.damp(shown.current, target, 4, delta);
        const p = shown.current;
        trail.setDrawRange(0, Math.floor(p * TUBE_SEGMENTS) * RADIAL * 6);

        const head = curve.getPointAt(Math.min(0.999, Math.max(0.001, p)));
        climber.current?.position.copy(head);
        (material.uniforms.uClimber.value as THREE.Vector3).copy(head);

        campRefs.current.forEach((m, i) => {
            if (!m) return;
            const lit = p >= camps[i].at - 0.005;
            m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, lit ? 2.4 : 0.15, 6, delta);
            const label = labelRefs.current[i];
            if (label) label.dataset.lit = lit ? 'true' : 'false';
        });

        // Camera: low over the valley floor so the peak stands against the sky, orbiting and rising with
        // the climber
        const angle = 0.55 + p * 1.9;
        const radius = THREE.MathUtils.lerp(16, 10.5, p);
        const height = THREE.MathUtils.lerp(3.8, 6, p);
        const desired = new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
        camera.position.lerp(desired, 1 - Math.exp(-3 * delta));
        look.current.lerp(new THREE.Vector3(head.x * 0.35, THREE.MathUtils.lerp(2.2, head.y, 0.55), head.z * 0.35), 1 - Math.exp(-3 * delta));
        camera.lookAt(look.current);

        // Keep drawing until the climb, camera and camp lights have come to rest
        const settling = Math.abs(shown.current - target) > 1e-4
            || camera.position.distanceToSquared(desired) > 1e-5
            || campRefs.current.some((m, i) => m && Math.abs(m.emissiveIntensity - (p >= camps[i].at - 0.005 ? 2.4 : 0.15)) > 0.01);
        if (settling) invalidate();
    });

    return (
        <>
            <fog attach="fog" args={[palette.fog, 14, 34]} />
            <hemisphereLight args={['#9fbad8', palette.ground, 0.55]} />
            <directionalLight position={SUN} intensity={2.6} color="#ffcf9e" />

            <Terrain segments={segments} material={material} />

            <mesh geometry={ghost}>
                <meshBasicMaterial color="#ffffff" transparent opacity={0.28} fog={false} />
            </mesh>
            <mesh geometry={trail}>
                <meshBasicMaterial color="#E2A071" toneMapped={false} fog={false} />
            </mesh>

            {campPoints.map((pt, i) => (
                <group key={camps[i].name} position={pt}>
                    <mesh position={[0, 0.16, 0]}>
                        <cylinderGeometry args={[0.008, 0.008, 0.32, 6]} />
                        <meshBasicMaterial color="#F8FAF9" transparent opacity={0.6} />
                    </mesh>
                    <mesh position={[0, 0.34, 0]}>
                        <sphereGeometry args={[0.055, 16, 16]} />
                        <meshStandardMaterial ref={m => { campRefs.current[i] = m; }} color="#3a2a20" emissive="#E2A071" emissiveIntensity={0.15} toneMapped={false} />
                    </mesh>
                    <Html position={[0, 0.52, 0]} center distanceFactor={9} zIndexRange={[20, 0]}>
                        <div ref={el => { labelRefs.current[i] = el; }} data-lit="false" className="route-camp-label">
                            <span>{camps[i].name}</span>
                            <span>{camps[i].elevation.toLocaleString('en-US')} m</span>
                        </div>
                    </Html>
                </group>
            ))}

            <group ref={climber}>
                <mesh>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshBasicMaterial color="#FFF1D2" toneMapped={false} />
                </mesh>
                <pointLight color="#ffc27a" intensity={3} distance={2.2} decay={2} />
            </group>
        </>
    );
};

const SEGMENTS: Record<RouteQuality, number> = { high: 256, medium: 192, low: 150 };
const MAX_DPR: Record<RouteQuality, number> = { high: 1.5, medium: 1.1, low: 0.85 };

/**
 * WebGL terrain for the expedition route section: a procedurally generated alpine massif at first
 * light, the route drawn onto it as the visitor scrolls (progress 0 → 1), camps lighting up as the
 * climber passes them and a camera that orbits up toward the summit. Renders on demand (only while
 * scrolling or easing) and stops entirely whenever `active` is false. Mesh density and the rock
 * detail are fixed at mount (rebuilding mid-visit would hitch); resolution follows the quality tier.
 */
const RouteTerrain = ({ progress, camps, active, quality, dark }: { progress: MotionValue<number>; camps: RouteCamp[]; active: boolean; quality: RouteQuality; dark: boolean }) => {
    const [initial] = useState(quality);
    return (
        <Canvas
            frameloop={active ? 'demand' : 'never'}
            dpr={[Math.min(1, MAX_DPR[quality]), MAX_DPR[quality]]}
            camera={{ position: [13.6, 3.8, 8.4], fov: 38, near: 0.1, far: 80 }}
            gl={{ antialias: quality === 'high', alpha: true, powerPreference: 'high-performance' }}
        >
            <Scene progress={progress} camps={camps} active={active} dark={dark} segments={SEGMENTS[initial]} detail={initial === 'high'} />
        </Canvas>
    );
};

export default RouteTerrain;
