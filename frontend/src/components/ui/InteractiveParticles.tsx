import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { getDeviceConfig } from '../../lib/deviceOptimization';

export const InteractiveParticles = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme, weather, isSnowEffectEnabled } = useStore();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let particles: Particle[] = [];
        let animationFrameId: number;

        // Determine weather condition for particle styles
        const isFreezingOrSnowing = weather.isSnowing || (weather.temp !== null && weather.temp <= 0);
        
        // Snow effect is based on featured peak weather OR toggled by user via hamburger menu button
        const useCoolVibe = isSnowEffectEnabled || isFreezingOrSnowing;

        // Create pre-rendered glowing sprites to avoid 5,400+ createRadialGradient calls per second!
        const createSprite = (rgb: string) => {
            const size = 64;
            const offCanvas = document.createElement('canvas');
            offCanvas.width = size * 2;
            offCanvas.height = size * 2;
            const offCtx = offCanvas.getContext('2d');
            if (offCtx) {
                const gradient = offCtx.createRadialGradient(size, size, 0, size, size, size);
                gradient.addColorStop(0, `rgba(${rgb}, 1)`);
                gradient.addColorStop(0.4, `rgba(${rgb}, 0.5)`);
                gradient.addColorStop(1, `rgba(${rgb}, 0)`);
                offCtx.fillStyle = gradient;
                offCtx.beginPath();
                offCtx.arc(size, size, size, 0, Math.PI * 2);
                offCtx.fill();
            }
            return offCanvas;
        };

        const whiteSprite = createSprite('255, 255, 255');
        const goldSprite = createSprite('226, 160, 113');

        // Mouse coordinates for global parallax
        let mouseX = width / 2;
        let mouseY = height / 2;
        let targetMouseX = width / 2;
        let targetMouseY = height / 2;

        let resizeTimeout: any = null;
        const handleResize = () => {
            const oldW = width || window.innerWidth;
            const oldH = height || window.innerHeight;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            if (oldW > 0 && oldH > 0 && particles.length > 0) {
                const rx = width / oldW;
                const ry = height / oldH;
                particles.forEach(p => { p.x *= rx; p.y *= ry; });
            }
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                initParticles();
            }, 200);
        };

        const handleMouseMove = (e: MouseEvent) => {
            targetMouseX = e.clientX;
            targetMouseY = e.clientY;
        };

        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        class Particle {
            x: number;
            y: number;
            z: number; // depth (1 to 5)
            size: number;
            baseAlpha: number;
            vx: number;
            vy: number;
            angle: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.z = Math.random() * 4 + 1; // 1 (far) to 5 (near)
                
                // Near particles are larger and more blurred. Far particles are smaller.
                this.size = this.z * (Math.random() * 1.5 + 1); 
                
                // Base drift speeds
                this.vx = (Math.random() - 0.5) * 0.1;
                
                if (useCoolVibe) {
                    // Snow falls down
                    this.vy = (Math.random() * 0.3 + 0.1) * this.z;
                } else {
                    // Dust drifts up
                    this.vy = -(Math.random() * 0.2 + 0.05) * this.z;
                }

                // Opacity varies by depth (closer is brighter but more blurred)
                this.baseAlpha = (Math.random() * 0.5 + 0.5) * (this.z / 5);
                this.angle = Math.random() * Math.PI * 2;
            }

            draw() {
                if (!ctx) return;
                const sprite = useCoolVibe ? whiteSprite : goldSprite;
                const parallaxX = ((mouseX - width / 2) * -0.005) * this.z;
                const parallaxY = ((mouseY - height / 2) * -0.005) * this.z;
                
                const renderX = this.x + parallaxX;
                const renderY = this.y + parallaxY;

                ctx.globalAlpha = this.baseAlpha;
                // Fast scrolling streaks the flakes along the motion, nearer ones more
                const stretch = 1 + Math.min(Math.abs(scrollVelocity) * 0.04 * this.z, 3);
                ctx.drawImage(sprite, renderX - this.size, renderY - this.size * stretch, this.size * 2, this.size * 2 * stretch);
            }

            update() {
                // Sine wave drift
                this.angle += 0.01;
                const driftX = Math.sin(this.angle) * 0.15 * this.z;

                this.x += this.vx + driftX;
                // Parallax against the page: scrolling down lifts the flakes, near ones faster
                this.y += this.vy - scrollVelocity * 0.12 * this.z;

                // Wrap around edges gracefully
                if (this.y < -this.size * 2) this.y = height + this.size * 2;
                if (this.y > height + this.size * 2) this.y = -this.size * 2;
                if (this.x < -this.size * 2) this.x = width + this.size * 2;
                if (this.x > width + this.size * 2) this.x = -this.size * 2;
            }
        }

        const initParticles = () => {
            particles = [];
            const deviceConfig = getDeviceConfig();
            if (deviceConfig.prefersReducedMotion) return;
            
            for (let i = 0; i < deviceConfig.particleCount; i++) {
                particles.push(new Particle());
            }
        };

        let isIntersecting = true;
        let observer: IntersectionObserver | null = null;

        let lastParticleTime = 0;
        let scrollVelocity = 0;
        let lastScrollY = window.scrollY;
        const animate = (time: number = 0) => {
            if (!ctx) return;
            if (document.hidden || !isIntersecting) {
                animationFrameId = 0;
                return;
            }

            const deviceConfig = getDeviceConfig();
            const isScrolling = typeof document !== 'undefined' && document.body.classList.contains('is-scrolling');
            const targetFpsInterval = isScrolling ? Math.max(33, deviceConfig.particleFpsInterval * 2) : deviceConfig.particleFpsInterval;

            if (time - lastParticleTime < targetFpsInterval) {
                animationFrameId = requestAnimationFrame(animate);
                return;
            }
            lastParticleTime = time;

            ctx.clearRect(0, 0, width, height);
            
            mouseX += (targetMouseX - mouseX) * 0.05;
            mouseY += (targetMouseY - mouseY) * 0.05;

            // Scroll speed in px per frame, eased so flakes settle smoothly once scrolling stops
            const sy = window.scrollY;
            scrollVelocity += ((sy - lastScrollY) - scrollVelocity) * 0.25;
            if (Math.abs(scrollVelocity) < 0.01) scrollVelocity = 0;
            lastScrollY = sy;

            for (let i = 0; i < particles.length; i++) {
                particles[i].draw();
                particles[i].update();
            }
            ctx.globalAlpha = 1.0;
            animationFrameId = requestAnimationFrame(animate);
        };

        if (typeof IntersectionObserver !== 'undefined' && canvas) {
            observer = new IntersectionObserver(([entry]) => {
                isIntersecting = entry.isIntersecting;
                if (isIntersecting && !document.hidden && !animationFrameId) {
                    animationFrameId = requestAnimationFrame(animate);
                } else if (!isIntersecting && animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = 0;
                }
            }, { threshold: 0.05 });
            observer.observe(canvas);
        }

        const handleVisibility = () => {
            if (document.hidden && animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = 0;
            } else if (!document.hidden && isIntersecting && !animationFrameId) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        initParticles();
        animate();

        return () => {
            if (observer) observer.disconnect();
            if (resizeTimeout) clearTimeout(resizeTimeout);
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [theme, weather, isSnowEffectEnabled]);

    return (
        <div className="fixed inset-0 z-[40] pointer-events-none overflow-hidden opacity-90">
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
};
