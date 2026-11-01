import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';

export interface RouteCamp { name: string; elevation: number; at: number }

// ── Procedural massif: one dominant summit, ridges falling away, foothills from fractal noise ──
const hash = (x: number, y: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
};
const smooth = (t: number) => t * t * (3 - 2 * t);
const noise = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    const u = smooth(xf), v = smooth(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const ridged = (x: number, y: number) => {
    let sum = 0, amp = 0.5, freq = 0.55;
    for (let o = 0; o < 5; o++) {
        sum += (1 - Math.abs(noise(x * freq, y * freq) * 2 - 1)) * amp;
        amp *= 0.5; freq *= 2.1;
    }
    return sum;
};
export const terrainHeight = (x: number, z: number) => {
    const r2 = x * x + z * z;
    const summit = 3.3 * Math.exp(-r2 / (2 * 1.7 * 1.7));
    const shoulders = 1.1 * Math.exp(-((x - 2.4) ** 2 + (z + 1.2) ** 2) / 3) + 0.9 * Math.exp(-((x + 2.1) ** 2 + (z - 2) ** 2) / 2.6);
    const falloff = Math.max(0, 1 - Math.sqrt(r2) / 7.5);
    return summit + shoulders + ridged(x + 10, z + 10) * 1.35 * falloff - 0.4;
};

const SIZE = 20;

const Terrain = ({ segments, horizon }: { segments: number; horizon: string }) => {
    const geometry = useMemo(() => {
        const g = new THREE.PlaneGeometry(SIZE, SIZE, segments, segments);
        g.rotateX(-Math.PI / 2);
        const pos = g.attributes.position as THREE.BufferAttribute;
        // Ground sinks away toward the edges so the square plane never shows against the sky
        const edgeFade = (x: number, z: number) => THREE.MathUtils.smoothstep(Math.hypot(x, z), SIZE * 0.32, SIZE * 0.5);
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i), z = pos.getZ(i);
            pos.setY(i, terrainHeight(x, z) - edgeFade(x, z) * 6);
        }
        g.computeVertexNormals();
        // Colour by height and slope: forest and scree low, bare rock on steep faces, snow on high and gentle ground
        const normals = g.attributes.normal as THREE.BufferAttribute;
        const colors = new Float32Array(pos.count * 3);
        const night = new THREE.Color(horizon);
        const forest = new THREE.Color('#1b2a2c'), rock = new THREE.Color('#4b566a'), dark = new THREE.Color('#2a3140'), snow = new THREE.Color('#eef3f8');
        const c = new THREE.Color();
        for (let i = 0; i < pos.count; i++) {
            const h = pos.getY(i), flat = normals.getY(i);
            c.copy(forest).lerp(rock, THREE.MathUtils.smoothstep(h, 0.2, 1.4));
            if (flat < 0.72) c.lerp(dark, 0.55);
            const snowLine = 1.75 - (flat - 0.6) * 1.6;
            c.lerp(snow, THREE.MathUtils.smoothstep(h, snowLine, snowLine + 0.45) * THREE.MathUtils.smoothstep(flat, 0.5, 0.75));
            c.lerp(night, edgeFade(pos.getX(i), pos.getZ(i)));
            c.toArray(colors, i * 3);
        }
        g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        return g;
    }, [segments, horizon]);

    return (
        <mesh geometry={geometry} receiveShadow>
            <meshStandardMaterial vertexColors roughness={0.92} metalness={0} />
        </mesh>
    );
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

// Night sky behind the massif: navy in light mode, near-black in dark mode (matches the section background)
const PALETTE = {
    light: { fog: '#0a1628', horizon: '#12233a', ground: '#141b26' },
    dark: { fog: '#040506', horizon: '#08090c', ground: '#0a0b0e' },
};

const Scene = ({ progress, camps, segments, active, dark }: { progress: MotionValue<number>; camps: RouteCamp[]; segments: number; active: boolean; dark: boolean }) => {
    const palette = dark ? PALETTE.dark : PALETTE.light;
    const curve = useRouteCurve();
    const trail = useMemo(() => new THREE.TubeGeometry(curve, TUBE_SEGMENTS, 0.03, RADIAL, false), [curve]);
    const ghost = useMemo(() => new THREE.TubeGeometry(curve, TUBE_SEGMENTS, 0.012, 4, false), [curve]);
    const climber = useRef<THREE.Group>(null);
    const campRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
    const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
    const look = useRef(new THREE.Vector3(0, 1.5, 0));
    const shown = useRef(0);
    const campPoints = useMemo(() => camps.map(c => curve.getPointAt(Math.min(0.999, c.at))), [camps, curve]);

    // On wide screens the headline and camp list sit on the left: frame the massif right of centre
    const { camera, size, invalidate, gl, scene } = useThree();

    // Compile every shader up front (the scene is mounted at idle time, before it's on screen), so the
    // first visible frame doesn't stall on program linking
    useEffect(() => { gl.compile(scene, camera); }, [gl, scene, camera]);

    // On-demand rendering: draw when the scroll position moves (and while the easing below settles)
    useEffect(() => {
        invalidate();
        return progress.on('change', () => invalidate());
    }, [progress, invalidate, active, dark]);

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

        campRefs.current.forEach((m, i) => {
            if (!m) return;
            const lit = p >= camps[i].at - 0.005;
            m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, lit ? 2.4 : 0.15, 6, delta);
            const label = labelRefs.current[i];
            if (label) label.dataset.lit = lit ? 'true' : 'false';
        });

        // Camera: a slow orbit that closes in on the climber as the route rises
        const angle = 0.55 + p * 1.9;
        const radius = THREE.MathUtils.lerp(15, 9.5, p);
        const height = THREE.MathUtils.lerp(8.6, 7.2, p);
        const desired = new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
        camera.position.lerp(desired, 1 - Math.exp(-3 * delta));
        look.current.lerp(new THREE.Vector3(head.x * 0.45, THREE.MathUtils.lerp(1.6, head.y, 0.5), head.z * 0.45), 1 - Math.exp(-3 * delta));
        camera.lookAt(look.current);

        // Keep drawing until the climb, camera and camp lights have come to rest
        const settling = Math.abs(shown.current - target) > 1e-4
            || camera.position.distanceToSquared(desired) > 1e-5
            || campRefs.current.some((m, i) => m && Math.abs(m.emissiveIntensity - (p >= camps[i].at - 0.005 ? 2.4 : 0.15)) > 0.01);
        if (settling) invalidate();
    });

    return (
        <>
            <fog attach="fog" args={[palette.fog, 12, 32]} />
            <hemisphereLight args={['#9fbad8', palette.ground, 0.55]} />
            <directionalLight position={[-6, 4.5, 3]} intensity={2.6} color="#ffcf9e" />
            <directionalLight position={[5, 6, -4]} intensity={0.45} color="#a3c9e2" />

            <Terrain segments={segments} horizon={palette.horizon} />

            <mesh geometry={ghost}>
                <meshBasicMaterial color="#ffffff" transparent opacity={0.22} fog={false} />
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
                    <sphereGeometry args={[0.06, 16, 16]} />
                    <meshBasicMaterial color="#FFF1D2" toneMapped={false} />
                </mesh>
                <pointLight color="#ffc27a" intensity={3} distance={2.2} decay={2} />
            </group>
        </>
    );
};

/**
 * WebGL terrain for the expedition route section: a procedurally generated massif, the route drawn
 * onto it as the visitor scrolls (progress 0 → 1), camps lighting up as the climber passes them and
 * a camera that orbits in toward the summit. Renders on demand (only while scrolling or easing) and
 * stops entirely whenever `active` is false.
 */
const RouteTerrain = ({ progress, camps, active, quality, dark }: { progress: MotionValue<number>; camps: RouteCamp[]; active: boolean; quality: 'high' | 'medium'; dark: boolean }) => (
    <Canvas
        frameloop={active ? 'demand' : 'never'}
        dpr={[1, quality === 'high' ? 1.75 : 1.2]}
        camera={{ position: [8, 7, 9], fov: 38, near: 0.1, far: 60 }}
        gl={{ antialias: quality === 'high', alpha: true, powerPreference: 'high-performance' }}
    >
        <Scene progress={progress} camps={camps} active={active} dark={dark} segments={quality === 'high' ? 220 : 140} />
    </Canvas>
);

export default RouteTerrain;
