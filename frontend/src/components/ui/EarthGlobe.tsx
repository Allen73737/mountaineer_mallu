import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, useTexture, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const CinematicFrozenEarth = () => {
    const globeRef = useRef<THREE.Mesh>(null);
    const cloudsRef = useRef<THREE.Mesh>(null);
    const snowRef = useRef<THREE.Points>(null);

    // Using reliable high-res textures
    const [colorMap, bumpMap] = useTexture([
        'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
        'https://unpkg.com/three-globe/example/img/earth-topology.png'
    ]);

    // Generate 5000 3D snow particles swirling around the globe to create dynamic weather
    const { snowPositions } = useMemo(() => {
        const count = 5000;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
            // Random spherical distribution around the earth
            const r = 2.3 + Math.random() * 2.0;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            positions[i] = r * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = r * Math.cos(phi);
        }
        return { snowPositions: positions };
    }, []);

    useFrame((state, delta) => {
        if (globeRef.current) globeRef.current.rotation.y += delta * 0.03;
        
        // Clouds move slightly faster and on a tilted axis
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += delta * 0.04;
            cloudsRef.current.rotation.z += delta * 0.01;
        }
        
        // Massive snowstorm rotating around the earth
        if (snowRef.current) {
            snowRef.current.rotation.y -= delta * 0.08;
            snowRef.current.rotation.x -= delta * 0.03;
        }
    });

    return (
        <group>
            {/* Frozen Earth Core */}
            <Sphere ref={globeRef} args={[2.2, 64, 64]}>
                <meshStandardMaterial 
                    map={colorMap}
                    color="#BBE1FA" // Heavy icy blue/white tint to freeze the earth
                    bumpMap={bumpMap}
                    bumpScale={0.06}
                    roughness={0.6}
                    metalness={0.4} // Increases contrast for a premium look
                />
            </Sphere>

            {/* Dense Cinematic Clouds / Fog layer */}
            <Sphere ref={cloudsRef} args={[2.26, 64, 64]}>
                <meshPhysicalMaterial 
                    color="#ffffff"
                    transparent
                    opacity={0.3}
                    roughness={1}
                    transmission={0.4}
                    thickness={1}
                />
            </Sphere>
            
            {/* Outer Atmospheric Ice Glow */}
            <Sphere args={[2.45, 64, 64]}>
                <meshBasicMaterial 
                    color="#E0F7FA" 
                    transparent 
                    opacity={0.15} 
                    blending={THREE.AdditiveBlending} 
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* 3D Snowstorm Weather System */}
            <Points ref={snowRef} positions={snowPositions}>
                <PointMaterial
                    transparent
                    color="#ffffff"
                    size={0.025}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.7}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    );
};

export const EarthGlobe = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.05 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing">
            {isVisible && (
                <Canvas 
                    camera={{ position: [0, 0, 10], fov: 45 }} 
                    gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                    dpr={[1, 1.5]}
                    frameloop="always"
                >
                    <ambientLight intensity={0.8} color="#E0F7FA" />
                    <directionalLight position={[10, 5, 5]} intensity={4} color="#ffffff" />
                    <directionalLight position={[-10, -5, -5]} intensity={1.5} color="#81D4FA" />
                    
                    <React.Suspense fallback={null}>
                        <CinematicFrozenEarth />
                    </React.Suspense>
                    
                    <OrbitControls 
                        enableZoom={false} 
                        enablePan={false} 
                        rotateSpeed={0.3} 
                        autoRotate 
                        autoRotateSpeed={0.5} 
                    />
                </Canvas>
            )}
        </div>
    );
};
