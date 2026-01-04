"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const haloFragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uIntensity;
  
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    float aspect = uResolution.x / uResolution.y;
    p.x *= aspect;
    
    float dist = length(p);
    float angle = atan(p.y, p.x);
    
    // Animated glow ring
    float radiusNoise = snoise(vec3(angle * 1.2, uTime * 0.15, 0.0)) * 0.008;
    float breathe = sin(uTime * 0.2) * 0.006;
    float baseRadius = 0.65 + radiusNoise + breathe;
    
    // Soft ring
    float ring = exp(-pow(abs(dist - baseRadius) * 6.0, 2.0));
    
    // Inner glow
    float glow = exp(-dist * dist * 1.8) * 0.25;
    
    // Outer aura
    float aura = exp(-(dist - baseRadius) * (dist - baseRadius) * 4.0) * 0.5;
    
    float intensity = ring + glow + aura;
    
    // Color gradient
    vec3 coreColor = vec3(0.92, 0.97, 1.0);
    vec3 midColor = vec3(0.5, 0.85, 1.0);
    vec3 edgeColor = vec3(0.2, 0.65, 0.95);
    
    float colorBlend = smoothstep(0.4, 0.8, dist);
    vec3 color = mix(coreColor, midColor, colorBlend);
    color = mix(color, edgeColor, colorBlend * colorBlend);
    
    float alpha = intensity * uIntensity;
    alpha = clamp(alpha, 0.0, 1.0);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

const particleVertexShader = `
  attribute float aAngle;
  attribute float aRadius;
  attribute float aSpeed;
  attribute float aSize;
  attribute float aOffset;
  
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uAspect;
  
  varying float vAlpha;
  
  void main() {
    float time = uTime * aSpeed;
    float angle = aAngle + time;
    
    float radiusVar = sin(uTime * 0.4 + aOffset) * 0.012;
    float currentRadius = aRadius + radiusVar;
    
    vec2 pos = vec2(
      (cos(angle) * currentRadius) / max(uAspect, 0.0001),
      sin(angle) * currentRadius
    );
    
    gl_Position = vec4(pos, 0.0, 1.0);
    
    float fade = sin(uTime * 1.5 + aOffset) * 0.3 + 0.7;
    vAlpha = fade;
    
    gl_PointSize = aSize * uPixelRatio * (0.6 + fade * 0.4);
  }
`;

const particleFragmentShader = `
  precision highp float;
  varying float vAlpha;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center) * 2.0;
    
    float alpha = 1.0 - smoothstep(0.0, 1.0, dist);
    alpha = pow(alpha, 1.5);
    alpha *= vAlpha * 0.4;
    
    vec3 color = vec3(0.7, 0.9, 1.0);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

type MiniHaloCanvasProps = {
  className?: string;
};

export default function MiniHaloCanvas({ className = "" }: MiniHaloCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0xffffff, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const plane = new THREE.PlaneGeometry(2, 2);

    // Halo
    const haloUniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uIntensity: { value: 0.8 },
    };

    const haloMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: haloFragmentShader,
      uniforms: haloUniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    const haloMesh = new THREE.Mesh(plane, haloMaterial);
    scene.add(haloMesh);

    // Particles
    const particleCount = 120;
    const positions = new Float32Array(particleCount * 3);
    const angles = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const offsets = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      positions[idx] = 0;
      positions[idx + 1] = 0;
      positions[idx + 2] = 0;

      angles[i] = Math.random() * Math.PI * 2;
      radii[i] = 0.65 + (Math.random() - 0.5) * 0.025;
      speeds[i] = 0.05 + Math.random() * 0.1;
      sizes[i] = 2.5 + Math.random() * 4.0;
      offsets[i] = Math.random() * Math.PI * 2;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("aAngle", new THREE.BufferAttribute(angles, 1));
    particleGeometry.setAttribute("aRadius", new THREE.BufferAttribute(radii, 1));
    particleGeometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    particleGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    particleGeometry.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));

    const particleUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uAspect: { value: 1 },
    };

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: particleUniforms,
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    let frameId: number | null = null;
    let start = performance.now();
    let isPaused = false;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = mediaQuery.matches;

    const renderFrame = (time: number) => {
      haloUniforms.uTime.value = time;
      particleUniforms.uTime.value = time;
      renderer.render(scene, camera);
    };

    const animate = (now: number) => {
      if (isPaused) return;
      const time = (now - start) * 0.001;
      renderFrame(time);
      frameId = requestAnimationFrame(animate);
    };

    const resize = () => {
      const size = canvas.parentElement?.clientWidth || 200;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      renderer.setPixelRatio(dpr);
      renderer.setSize(size, size, false);

      haloUniforms.uResolution.value.set(size * dpr, size * dpr);
      particleUniforms.uPixelRatio.value = dpr;
      particleUniforms.uAspect.value = 1;

      if (prefersReducedMotion) {
        renderFrame(0);
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        isPaused = true;
        if (frameId) {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
        return;
      }

      isPaused = false;
      start = performance.now();
      if (!prefersReducedMotion) {
        frameId = requestAnimationFrame(animate);
      } else {
        renderFrame(0);
      }
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion = event.matches;
      if (prefersReducedMotion) {
        if (frameId) {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
        renderFrame(0);
        return;
      }

      start = performance.now();
      frameId = requestAnimationFrame(animate);
    };

    resize();

    if (!prefersReducedMotion) {
      frameId = requestAnimationFrame(animate);
    } else {
      renderFrame(0);
    }

    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    document.addEventListener("visibilitychange", handleVisibility);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMotionChange);
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMotionChange);
      }

      plane.dispose();
      particleGeometry.dispose();
      haloMaterial.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={`${className}`} />;
}
