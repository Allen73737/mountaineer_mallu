import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';

export const InteractiveParticles = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme, weather } = useStore();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let particles: Particle[] = [];
        let animationFrameId: number;

        // Determine Theme context for particle styles
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        const isFreezing = weather.isSnowing || (weather.temp !== null && weather.temp <= 0);
        
        // If it's dark OR freezing, we want a cool 'snow/bokeh' vibe. Else, a warm 'sun dust' vibe.
        const useCoolVibe = isDark || isFreezing;

        // Mouse coordinates for global parallax
        let mouseX = width / 2;
        let mouseY = height / 2;
        let targetMouseX = width / 2;
        let targetMouseY = height / 2;

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        };

        const handleMouseMove = (e: MouseEvent) => {
            targetMouseX = e.clientX;
            targetMouseY = e.clientY;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

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
                
                // Create soft glowing radial gradient for ultra-premium look
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                
                const rgb = useCoolVibe ? '255, 255, 255' : '226, 160, 113'; // White/Ice vs Warm Gold
                
                gradient.addColorStop(0, `rgba(${rgb}, ${this.baseAlpha})`);
                gradient.addColorStop(0.4, `rgba(${rgb}, ${this.baseAlpha * 0.5})`);
                gradient.addColorStop(1, `rgba(${rgb}, 0)`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }

            update() {
                // Smooth mouse interpolation
                mouseX += (targetMouseX - mouseX) * 0.05;
                mouseY += (targetMouseY - mouseY) * 0.05;

                // Parallax effect: closer particles move more relative to mouse
                const parallaxX = ((mouseX - width / 2) * -0.01) * this.z;
                const parallaxY = ((mouseY - height / 2) * -0.01) * this.z;

                // Sine wave drift
                this.angle += 0.01;
                const driftX = Math.sin(this.angle) * 0.2 * this.z;

                this.x += this.vx + parallaxX + driftX;
                this.y += this.vy + parallaxY;

                // Wrap around edges gracefully
                if (this.y < -this.size * 2) this.y = height + this.size * 2;
                if (this.y > height + this.size * 2) this.y = -this.size * 2;
                if (this.x < -this.size * 2) this.x = width + this.size * 2;
                if (this.x > width + this.size * 2) this.x = -this.size * 2;
            }
        }

        const initParticles = () => {
            particles = [];
            // Vastly reduced number of particles for elegance (clutter free)
            let numberOfParticles = window.innerWidth < 768 ? 20 : 45; 
            
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            if (!ctx) return;
            // Clear entire canvas explicitly without trail to maintain sharp gradients
            ctx.clearRect(0, 0, width, height);
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].draw();
                particles[i].update();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        initParticles();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme, weather]);

    return (
        <div className="fixed inset-0 z-[40] pointer-events-none overflow-hidden mix-blend-screen opacity-100">
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
};
