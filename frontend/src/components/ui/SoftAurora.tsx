import { Renderer, Program, Mesh, Triangle } from 'ogl';
import React, { useEffect, useRef } from 'react';
import { getDeviceConfig } from '../../lib/deviceOptimization';
import './SoftAurora.css';

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  ];
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uScale;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform float uBandHeight;
uniform float uBandSpread;
uniform float uOctaveDecay;
uniform float uLayerOffset;
uniform float uColorSpeed;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;

#define TAU 6.28318530718

// Ultra-fast hash without trigonometric acos/sin/cos bottlenecks
float fastHash(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

// Fast 3D smooth noise
float fastNoise3D(vec3 x) {
  vec3 p = floor(x);
  vec3 w = fract(x);
  vec3 u = w * w * (3.0 - 2.0 * w);

  float a = fastHash(p + vec3(0.0, 0.0, 0.0));
  float b = fastHash(p + vec3(1.0, 0.0, 0.0));
  float c = fastHash(p + vec3(0.0, 1.0, 0.0));
  float d = fastHash(p + vec3(1.0, 1.0, 0.0));
  float e = fastHash(p + vec3(0.0, 0.0, 1.0));
  float f = fastHash(p + vec3(1.0, 0.0, 1.0));
  float g = fastHash(p + vec3(0.0, 1.0, 1.0));
  float h = fastHash(p + vec3(1.0, 1.0, 1.0));

  return mix(
    mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
    mix(mix(e, f, u.x), mix(g, h, u.x), u.y),
    u.z
  ) * 2.0 - 1.0;
}

vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

float auroraGlow(float t, vec2 shift) {
  vec2 uv = gl_FragCoord.xy / uResolution.y;
  uv += shift;

  vec2 samplePos = uv * uScale;
  float noiseVal = fastNoise3D(vec3(samplePos * uNoiseFreq, t)) * uNoiseAmp;
  noiseVal += fastNoise3D(vec3(samplePos * (uNoiseFreq * 2.0), t * 1.5)) * (uNoiseAmp * uOctaveDecay);

  float yBand = uv.y * 10.0 - uBandHeight * 10.0;
  return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * abs(noiseVal + yBand))), 0.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float t = uSpeed * 0.35 * uTime;

  vec2 shift = vec2(0.0);
  if (uEnableMouse) {
    shift = (uMouse - 0.5) * uMouseInfluence;
  }

  vec3 col = vec3(0.0);
  col += 0.95 * auroraGlow(t, shift) * cosineGradient(uv.x + uTime * uSpeed * 0.15 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20)) * uColor1;
  col += 0.95 * auroraGlow(t + uLayerOffset, shift) * cosineGradient(uv.x + uTime * uSpeed * 0.08 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25)) * uColor2;

  col *= uBrightness;
  float alpha = clamp(length(col), 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`;

export interface SoftAuroraProps {
  speed?: number;
  scale?: number;
  brightness?: number;
  color1?: string;
  color2?: string;
  noiseFrequency?: number;
  noiseAmplitude?: number;
  bandHeight?: number;
  bandSpread?: number;
  octaveDecay?: number;
  layerOffset?: number;
  colorSpeed?: number;
  enableMouseInteraction?: boolean;
  mouseInfluence?: number;
  paused?: boolean;
}

export default function SoftAurora({
  speed = 0.6,
  scale = 1.5,
  brightness = 1.0,
  color1 = '#f7f7f7',
  color2 = '#e100ff',
  noiseFrequency = 2.5,
  noiseAmplitude = 1.0,
  bandHeight = 0.5,
  bandSpread = 1.0,
  octaveDecay = 0.1,
  layerOffset = 0,
  colorSpeed = 1.0,
  enableMouseInteraction = true,
  mouseInfluence = 0.25,
  paused = false
}: SoftAuroraProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetColor1Ref = useRef<[number, number, number]>(hexToVec3(color1));
  const targetColor2Ref = useRef<[number, number, number]>(hexToVec3(color2));
  const propsRef = useRef({
    speed,
    scale,
    brightness,
    noiseFrequency,
    noiseAmplitude,
    bandHeight,
    bandSpread,
    octaveDecay,
    layerOffset,
    colorSpeed,
    enableMouseInteraction,
    mouseInfluence,
    paused
  });

  useEffect(() => {
    targetColor1Ref.current = hexToVec3(color1);
    targetColor2Ref.current = hexToVec3(color2);
    propsRef.current = {
      speed,
      scale,
      brightness,
      noiseFrequency,
      noiseAmplitude,
      bandHeight,
      bandSpread,
      octaveDecay,
      layerOffset,
      colorSpeed,
      enableMouseInteraction,
      mouseInfluence,
      paused
    };
  }, [color1, color2, speed, scale, brightness, noiseFrequency, noiseAmplitude, bandHeight, bandSpread, octaveDecay, layerOffset, colorSpeed, enableMouseInteraction, mouseInfluence, paused]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const deviceConfig = getDeviceConfig();
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false, dpr: deviceConfig.auroraDpr });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';

    let program: any;
    let currentMouse = [0.5, 0.5];
    let targetMouse = [0.5, 0.5];
    let currentColor1 = [...hexToVec3(color1)];
    let currentColor2 = [...hexToVec3(color2)];
    let canvasRect = gl.canvas.getBoundingClientRect();

    function handleMouseMove(e: MouseEvent) {
      if (!canvasRect || canvasRect.width === 0) return;
      targetMouse = [
        (e.clientX - canvasRect.left) / canvasRect.width,
        1.0 - (e.clientY - canvasRect.top) / canvasRect.height
      ];
    }

    function handleMouseLeave() {
      targetMouse = [0.5, 0.5];
    }

    function resize() {
      if (!container) return;
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';
      canvasRect = gl.canvas.getBoundingClientRect();
      if (program) {
        program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];
      }
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },
        uSpeed: { value: speed },
        uScale: { value: scale },
        uBrightness: { value: brightness },
        uColor1: { value: currentColor1 },
        uColor2: { value: currentColor2 },
        uNoiseFreq: { value: noiseFrequency },
        uNoiseAmp: { value: noiseAmplitude },
        uBandHeight: { value: bandHeight },
        uBandSpread: { value: bandSpread },
        uOctaveDecay: { value: octaveDecay },
        uLayerOffset: { value: layerOffset },
        uColorSpeed: { value: colorSpeed },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseInfluence: { value: mouseInfluence },
        uEnableMouse: { value: enableMouseInteraction }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    container.appendChild(gl.canvas);

    if (enableMouseInteraction) {
      gl.canvas.addEventListener('mousemove', handleMouseMove);
      gl.canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    let animationFrameId: number | null = null;
    let lastTime = 0;

    function update(time: number) {
      if (propsRef.current.paused || document.hidden) {
        animationFrameId = null;
        return;
      }

      const isScrolling = typeof document !== 'undefined' && document.body.classList.contains('is-scrolling');
      const targetFpsInterval = isScrolling ? Math.max(33, deviceConfig.auroraFpsInterval * 2) : deviceConfig.auroraFpsInterval;

      if (time - lastTime < targetFpsInterval) {
        animationFrameId = requestAnimationFrame(update);
        return;
      }
      lastTime = time;

      program.uniforms.uTime.value = time * 0.001;

      // Smooth color LERP for seamless section-to-section color shifting
      currentColor1[0] += 0.04 * (targetColor1Ref.current[0] - currentColor1[0]);
      currentColor1[1] += 0.04 * (targetColor1Ref.current[1] - currentColor1[1]);
      currentColor1[2] += 0.04 * (targetColor1Ref.current[2] - currentColor1[2]);

      currentColor2[0] += 0.04 * (targetColor2Ref.current[0] - currentColor2[0]);
      currentColor2[1] += 0.04 * (targetColor2Ref.current[1] - currentColor2[1]);
      currentColor2[2] += 0.04 * (targetColor2Ref.current[2] - currentColor2[2]);

      program.uniforms.uColor1.value = currentColor1;
      program.uniforms.uColor2.value = currentColor2;

      // Update dynamic props from ref without recreating context
      const p = propsRef.current;
      program.uniforms.uSpeed.value = p.speed;
      program.uniforms.uScale.value = p.scale;
      program.uniforms.uBrightness.value = p.brightness;
      program.uniforms.uNoiseFreq.value = p.noiseFrequency;
      program.uniforms.uNoiseAmp.value = p.noiseAmplitude;
      program.uniforms.uBandHeight.value = p.bandHeight;
      program.uniforms.uBandSpread.value = p.bandSpread;
      program.uniforms.uOctaveDecay.value = p.octaveDecay;
      program.uniforms.uLayerOffset.value = p.layerOffset;
      program.uniforms.uColorSpeed.value = p.colorSpeed;
      program.uniforms.uMouseInfluence.value = p.mouseInfluence;
      program.uniforms.uEnableMouse.value = p.enableMouseInteraction;

      if (p.enableMouseInteraction) {
        currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
      } else {
        program.uniforms.uMouse.value[0] = 0.5;
        program.uniforms.uMouse.value[1] = 0.5;
      }

      renderer.render({ scene: mesh });
      animationFrameId = requestAnimationFrame(update);
    }

    let isVisibleInViewport = true;
    let observer: IntersectionObserver | null = null;

    const startLoop = () => {
      if (!animationFrameId && !propsRef.current.paused && !document.hidden && isVisibleInViewport) {
        animationFrameId = requestAnimationFrame(update);
      }
    };

    const stopLoop = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => {
        isVisibleInViewport = entry.isIntersecting;
        if (isVisibleInViewport) {
          startLoop();
        } else {
          stopLoop();
        }
      }, { threshold: 0.05 });
      observer.observe(container);
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startLoop();

    return () => {
      stopLoop();
      if (observer) observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', resize);
      if (propsRef.current.enableMouseInteraction) {
        gl.canvas.removeEventListener('mousemove', handleMouseMove);
        gl.canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return <div ref={containerRef} className="soft-aurora-container" />;
}
