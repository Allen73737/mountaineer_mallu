import { useEffect } from 'react';
import { Renderer, Camera, Program, Mesh, Plane, Texture, Transform } from 'ogl';
import { cancelFrame, frame as frameloop } from 'framer-motion';
import { useLenis } from './SmoothScrollProvider';

const vertex = /* glsl */ `
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float uVelocity;
uniform vec2 uViewport;
varying vec2 vUv;
void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    // The strip bows like film pulled through a gate: the centre of the screen leads, the edges lag
    float nx = clamp(world.x / (uViewport.x * 0.5), -1.2, 1.2);
    world.y += uVelocity * cos(nx * 1.4) * 55.0;
    world.x -= uVelocity * sin(nx * 1.4) * 18.0 * (uv.y - 0.5);
    gl_Position = projectionMatrix * viewMatrix * world;
}`;

const fragment = /* glsl */ `
precision highp float;
uniform sampler2D tMap;
uniform vec2 uPlane;
uniform vec2 uImage;
uniform float uVelocity;
uniform float uHover;
uniform vec2 uMouse;
uniform float uTime;
uniform float uRadius;
varying vec2 vUv;

vec2 cover(vec2 uv) {
    vec2 ratio = vec2(
        min((uPlane.x / uPlane.y) / (uImage.x / uImage.y), 1.0),
        min((uPlane.y / uPlane.x) / (uImage.y / uImage.x), 1.0)
    );
    return uv * ratio + (1.0 - ratio) * 0.5;
}

void main() {
    // Rounded corners to match the DOM frame
    vec2 px = vUv * uPlane;
    vec2 q = abs(px - uPlane * 0.5) - (uPlane * 0.5 - uRadius);
    if (length(max(q, 0.0)) > uRadius) discard;

    vec2 uv = vUv;
    // Hover: a slow push-in plus ripples spreading from the pointer
    uv = (uv - 0.5) * (1.0 - 0.05 * uHover) + 0.5;
    vec2 toMouse = uv - uMouse;
    float d = length(toMouse);
    uv += normalize(toMouse + 1e-5) * sin(d * 38.0 - uTime * 5.0) * 0.0065 * uHover * smoothstep(0.45, 0.0, d);

    // Chromatic split along the direction of travel, stronger the faster the reel moves
    float shift = uVelocity * 0.012;
    vec2 c = cover(uv);
    float r = texture2D(tMap, cover(uv + vec2(shift, 0.0))).r;
    vec4 g = texture2D(tMap, c);
    float b = texture2D(tMap, cover(uv - vec2(shift, 0.0))).b;
    gl_FragColor = vec4(r, g.g, b, 1.0);
}`;

interface Item { img: HTMLImageElement; mesh: InstanceType<typeof Mesh>; program: InstanceType<typeof Program>; hover: number; ready: boolean }

/**
 * WebGL pass for the home gallery reel. Every still in the strip (img[data-reel-img] inside `track`) is
 * redrawn as a textured plane on one canvas behind the DOM frames, kept in register with the DOM
 * by reading each image's box every frame. The planes bow and split colour with the reel's speed
 * (scroll or drag) and ripple under the pointer. The DOM images are hidden only once their texture is
 * on screen; if WebGL is unavailable nothing changes. Video frames stay as DOM video.
 */
export const useReelGL = (
    stage: React.RefObject<HTMLElement | null>,
    track: React.RefObject<HTMLElement | null>,
    canvasHost: React.RefObject<HTMLElement | null>,
    dragVelocity: React.MutableRefObject<number>,
    enabled: boolean,
    /** Changes when the frames change (live data replacing samples): rebuilds the planes for the new images */
    version = '',
) => {
    const { lenis } = useLenis();

    useEffect(() => {
        const stageEl = stage.current, trackEl = track.current, host = canvasHost.current;
        if (!enabled || !stageEl || !trackEl || !host) return;

        let renderer: InstanceType<typeof Renderer>;
        try {
            renderer = new Renderer({ alpha: true, dpr: Math.min(window.devicePixelRatio || 1, 1.75), antialias: true });
        } catch {
            return;
        }
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);
        gl.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
        host.appendChild(gl.canvas);

        const camera = new Camera(gl, { left: -1, right: 1, top: 1, bottom: -1, near: 1, far: 100 });
        camera.position.z = 10;
        const scene = new Transform();
        const geometry = new Plane(gl, { widthSegments: 24, heightSegments: 12 });

        let W = 0, H = 0;
        const resize = () => {
            W = host.clientWidth; H = host.clientHeight;
            renderer.setSize(W, H);
            camera.orthographic({ left: -W / 2, right: W / 2, top: H / 2, bottom: -H / 2, near: 1, far: 100 });
            items.forEach(it => { it.program.uniforms.uViewport.value = [W, H]; });
        };

        const items: Item[] = Array.from(trackEl.querySelectorAll<HTMLImageElement>('img[data-reel-img]')).map(img => {
            const texture = new Texture(gl, { generateMipmaps: false });
            const program = new Program(gl, {
                vertex, fragment, transparent: true,
                uniforms: {
                    tMap: { value: texture }, uPlane: { value: [1, 1] }, uImage: { value: [1, 1] },
                    uVelocity: { value: 0 }, uHover: { value: 0 }, uMouse: { value: [0.5, 0.5] },
                    uTime: { value: 0 }, uRadius: { value: 6 }, uViewport: { value: [1, 1] },
                },
            });
            const mesh = new Mesh(gl, { geometry, program });
            mesh.setParent(scene);
            mesh.visible = false;
            const item: Item = { img, mesh, program, hover: 0, ready: false };
            const upload = () => {
                try {
                    texture.image = img;
                    program.uniforms.uImage.value = [img.naturalWidth, img.naturalHeight];
                    item.ready = true;
                } catch { /* tainted or broken image: keep the DOM copy */ }
            };
            if (img.complete && img.naturalWidth) upload(); else img.addEventListener('load', upload, { once: true });
            return item;
        });
        resize();
        window.addEventListener('resize', resize, { passive: true });

        // Pointer for hover ripples
        let mouse = { x: -1, y: -1 };
        const onMove = (e: PointerEvent) => { mouse = { x: e.clientX, y: e.clientY }; };
        const onLeave = () => { mouse = { x: -1, y: -1 }; };
        stageEl.addEventListener('pointermove', onMove);
        stageEl.addEventListener('pointerleave', onLeave);

        let velocity = 0;
        let visible = true;
        const start = performance.now();
        let lastLayout = '';
        let drawnReady = -1;
        const loop = () => {
            const readyCount = items.reduce((n, it) => n + (it.ready ? 1 : 0), 0);
            if (!visible) return;
            const hostRect = host.getBoundingClientRect();
            const target = Math.max(-1, Math.min(1, ((lenis?.velocity ?? 0) / 45) + dragVelocity.current / 40));
            velocity += (target - velocity) * 0.12;
            dragVelocity.current *= 0.9;
            const t = (performance.now() - start) / 1000;

            let anyShown = false;
            // Skip the draw when nothing moved: frame positions, speed and hover all at rest
            let animating = Math.abs(velocity) > 0.001;
            let layout = `${W}x${H}`;
            for (const it of items) {
                if (!it.ready) continue;
                const r = it.img.getBoundingClientRect();
                const off = r.right < hostRect.left - 200 || r.left > hostRect.right + 200;
                it.mesh.visible = !off && r.width > 0;
                if (!it.mesh.visible) continue;
                anyShown = true;
                layout += `|${r.left.toFixed(1)},${r.top.toFixed(1)},${r.width.toFixed(1)}`;
                it.mesh.scale.set(r.width, r.height, 1);
                it.mesh.position.set(r.left - hostRect.left + r.width / 2 - W / 2, -(r.top - hostRect.top + r.height / 2 - H / 2), 0);
                const inside = mouse.x >= r.left && mouse.x <= r.right && mouse.y >= r.top && mouse.y <= r.bottom;
                it.hover += ((inside ? 1 : 0) - it.hover) * 0.08;
                // The hover ripple is time-based, so a hovered frame keeps drawing
                if (inside || it.hover > 0.002) animating = true;
                const u = it.program.uniforms;
                u.uPlane.value = [r.width, r.height];
                u.uVelocity.value = velocity;
                u.uHover.value = it.hover;
                u.uTime.value = t;
                if (inside) u.uMouse.value = [(mouse.x - r.left) / r.width, 1 - (mouse.y - r.top) / r.height];
                it.img.dataset.glHidden = '';
            }
            if (!animating && layout === lastLayout && readyCount === drawnReady) return;
            lastLayout = layout;
            drawnReady = readyCount;
            try {
                if (anyShown) renderer.render({ scene, camera });
            } catch {
                // A texture refused to upload (e.g. a CDN dropped CORS): give the frames back to the DOM and stop
                cancelFrame(loop);
                items.forEach(it => { delete it.img.dataset.glHidden; });
                gl.canvas.remove();
            }
        };
        // After framer-motion has written this frame's transforms (the reel's x, frame scales): the box reads
        // below then cost one layout that the browser needed anyway, and the planes match the DOM exactly
        frameloop.postRender(loop, true);

        const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '10% 0px' });
        io.observe(stageEl);

        return () => {
            cancelFrame(loop);
            io.disconnect();
            window.removeEventListener('resize', resize);
            stageEl.removeEventListener('pointermove', onMove);
            stageEl.removeEventListener('pointerleave', onLeave);
            items.forEach(it => { delete it.img.dataset.glHidden; });
            gl.getExtension('WEBGL_lose_context')?.loseContext();
            gl.canvas.remove();
        };
    }, [enabled, stage, track, canvasHost, dragVelocity, lenis, version]);
};
