import React, { useEffect, useRef } from 'react';

export const AlpineTopographyCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);
        let animId: number = 0;
        let time = 0;

        let mouseX = width / 2;
        let mouseY = height / 2;
        let prevMouseX = mouseX;
        let prevMouseY = mouseY;
        let mouseVelocity = 0;

        let targetMouseX = width / 2;
        let targetMouseY = height / 2;

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e: MouseEvent) => {
            targetMouseX = e.clientX;
            targetMouseY = e.clientY;
        };

        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        // Wireframe grid
        const cols = 32;
        const rows = 20;

        const draw = () => {
            if (document.hidden) { animId = 0; return; }

            ctx.clearRect(0, 0, width, height);
            time += 0.007;

            const dx = targetMouseX - prevMouseX;
            const dy = targetMouseY - prevMouseY;
            mouseVelocity += (Math.sqrt(dx * dx + dy * dy) - mouseVelocity) * 0.08;
            prevMouseX = targetMouseX;
            prevMouseY = targetMouseY;

            mouseX += (targetMouseX - mouseX) * 0.04;
            mouseY += (targetMouseY - mouseY) * 0.04;

            const gw = width * 1.25;
            const gh = height * 1.15;
            const cw = gw / cols;
            const ch = gh / rows;
            const sx = (width - gw) / 2;
            const sy = (height - gh) / 2;

            ctx.lineWidth = 0.8;

            // Horizontal contour waves — alpine-glacier color (#A3C9E2)
            for (let r = 0; r < rows; r++) {
                ctx.beginPath();
                for (let c = 0; c <= cols; c++) {
                    const px = sx + c * cw;
                    const py = sy + r * ch;

                    const dm = Math.hypot(px - mouseX, py - mouseY);
                    const ripple = Math.sin(dm * 0.025 - time * 3) * Math.max(0, 40 - dm * 0.08);
                    const mouseEl = Math.max(0, 75 - dm * 0.1) * (1 + mouseVelocity * 0.015);
                    const n1 = Math.sin(c * 0.24 + time) * Math.cos(r * 0.24 + time) * 22;
                    const n2 = Math.sin(c * 0.13 - time * 0.65) * 34;
                    const fy = py - (n1 + n2 + mouseEl + ripple);

                    c === 0 ? ctx.moveTo(px, fy) : ctx.lineTo(px, fy);
                }
                const a = Math.max(0.03, 0.18 - (r / rows) * 0.14);
                ctx.strokeStyle = `rgba(163, 201, 226, ${a})`;
                ctx.stroke();
            }

            // Vertical grid lines — very subtle
            for (let c = 0; c <= cols; c += 2) {
                ctx.beginPath();
                for (let r = 0; r <= rows; r++) {
                    const px = sx + c * cw;
                    const py = sy + r * ch;
                    const dm = Math.hypot(px - mouseX, py - mouseY);
                    const ripple = Math.sin(dm * 0.025 - time * 3) * Math.max(0, 40 - dm * 0.08);
                    const mouseEl = Math.max(0, 75 - dm * 0.1) * (1 + mouseVelocity * 0.015);
                    const n1 = Math.sin(c * 0.24 + time) * Math.cos(r * 0.24 + time) * 22;
                    const n2 = Math.sin(c * 0.13 - time * 0.65) * 34;
                    const fy = py - (n1 + n2 + mouseEl + ripple);

                    r === 0 ? ctx.moveTo(px, fy) : ctx.lineTo(px, fy);
                }
                ctx.strokeStyle = 'rgba(163, 201, 226, 0.04)';
                ctx.stroke();
            }

            // Summit markers
            for (let c = 3; c < cols; c += 5) {
                for (let r = 3; r < rows; r += 5) {
                    const px = sx + c * cw;
                    const py = sy + r * ch;
                    const n1 = Math.sin(c * 0.24 + time) * Math.cos(r * 0.24 + time) * 22;
                    ctx.fillStyle = 'rgba(163, 201, 226, 0.35)';
                    ctx.beginPath();
                    ctx.arc(px, py - n1, 1.3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            if (isIntersecting && !document.hidden) {
                animId = requestAnimationFrame(draw);
            } else {
                animId = 0;
            }
        };

        let isIntersecting = true;
        let observer: IntersectionObserver | null = null;

        if (typeof IntersectionObserver !== 'undefined' && canvas) {
            observer = new IntersectionObserver(([entry]) => {
                isIntersecting = entry.isIntersecting;
                if (isIntersecting && !document.hidden && !animId) {
                    animId = requestAnimationFrame(draw);
                } else if (!isIntersecting && animId) {
                    cancelAnimationFrame(animId);
                    animId = 0;
                }
            }, { threshold: 0.05 });
            observer.observe(canvas);
        }

        const handleVisibility = () => {
            if (document.hidden && animId) { cancelAnimationFrame(animId); animId = 0; }
            else if (!document.hidden && isIntersecting && !animId) { animId = requestAnimationFrame(draw); }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        animId = requestAnimationFrame(draw);

        return () => {
            if (observer) observer.disconnect();
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animId) cancelAnimationFrame(animId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0 mix-blend-screen opacity-50"
        />
    );
};
