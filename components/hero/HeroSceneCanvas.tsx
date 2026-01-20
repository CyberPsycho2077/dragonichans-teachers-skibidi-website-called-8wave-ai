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

const backgroundFragmentShader = `
  precision mediump float;

  varying vec2 vUv;
  uniform float uTime;

  void main() {
    vec3 top = vec3(0.90, 0.94, 0.98);
    vec3 mid = vec3(0.82, 0.90, 0.97);
    vec3 bottom = vec3(0.72, 0.86, 0.95);

    float blend = smoothstep(0.0, 1.0, vUv.y);
    vec3 color = mix(bottom, top, blend);

    float drift = sin(uTime * 0.08 + vUv.x * 2.0) * 0.015;
    color = mix(color, mid, 0.4 + drift);

    vec2 center = vUv - vec2(0.55, 0.5);
    float glow = exp(-dot(center, center) * 2.2);
    color = mix(color, vec3(0.90, 0.96, 1.0), glow * 0.18);

    float vignette = smoothstep(1.2, 0.3, length(vUv - 0.5));
    color *= 0.88 + 0.10 * vignette;
    color *= 0.94;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const seaFragmentShader = `
  precision mediump float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform sampler2D uBackground;

  uniform float uScale;
  uniform float uAx;
  uniform float uAy;
  uniform float uAz;
  uniform float uAw;
  uniform float uBx;
  uniform float uBy;

  uniform float uSeaLevel;
  uniform float uEdgeSoftness;
  uniform float uRefraction;

  uniform vec3 uColorDeep;
  uniform vec3 uColorShallow;
  uniform vec3 uColorFoam;
  uniform vec3 uColorSky;

  float cheapNoise(vec3 stp) {
    vec3 p = vec3(stp.st, stp.p);
    vec4 a = vec4(uAx, uAy, uAz, uAw);
    return mix(
      sin(p.z + p.x * a.x + cos(p.x * a.x - p.z)) *
      cos(p.z + p.y * a.y + cos(p.y * a.x + p.z)),
      sin(1. + p.x * a.z + p.z + cos(p.y * a.w - p.z)) *
      cos(1. + p.y * a.w + p.z + cos(p.x * a.x + p.z)),
      0.436
    );
  }

  float seaHeight(vec2 uv, float t) {
    vec2 aR = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 st = uv * aR * uScale;

    float S = sin(t * 0.18);
    float C = cos(t * 0.18);

    vec2 v1 = vec2(cheapNoise(vec3(st, 2.0)), cheapNoise(vec3(st, 1.0)));

    vec2 v2 = vec2(
      cheapNoise(vec3(st + uBx * v1 + vec2(C * 1.7, S * 9.2), 0.12 * t)),
      cheapNoise(vec3(st + uBy * v1 + vec2(S * 8.3, C * 2.8), 0.10 * t))
    );

    float n = 0.5 + 0.5 * cheapNoise(vec3(st + v2, 0.0));

    float swell = 0.5 + 0.5 * sin((uv.x * 2.2 + uv.y * 0.7) * 6.2831 + t * 0.28);
    float swell2 = 0.5 + 0.5 * sin((uv.x * -0.9 + uv.y * 1.8) * 6.2831 + t * 0.18 + 1.7);

    float h = n;
    h = mix(h, h * h, 0.35);
    h += (swell - 0.5) * 0.18;
    h += (swell2 - 0.5) * 0.10;

    return h;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float t = uTime * 0.06;

    float edgeField = seaHeight(vec2(uv.x, uSeaLevel), t);
    float boundary = uSeaLevel + (edgeField - 0.5) * 0.08;
    float mask = smoothstep(boundary + uEdgeSoftness, boundary - uEdgeSoftness, uv.y);

    if (mask < 0.001) {
      gl_FragColor = vec4(0.0);
      return;
    }

    float eps = 1.2 / max(uResolution.y, 1.0);

    float h = seaHeight(uv, t);
    float hx = seaHeight(uv + vec2(eps, 0.0), t);
    float hy = seaHeight(uv + vec2(0.0, eps), t);

    vec3 normal = normalize(vec3((hx - h) * 3.0, (hy - h) * 3.0, 1.0));

    vec3 bg = texture2D(uBackground, uv).rgb;
    vec2 refractUv = uv + normal.xy * uRefraction;
    vec3 refractedBg = texture2D(uBackground, refractUv).rgb;

    vec3 lightDir = normalize(vec3(0.55, 0.35, 1.0));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfDir = normalize(lightDir + viewDir);

    float ndl = clamp(dot(normal, lightDir), 0.0, 1.0);
    float spec = pow(clamp(dot(normal, halfDir), 0.0, 1.0), 100.0);
    float specTight = pow(clamp(dot(normal, halfDir), 0.0, 1.0), 220.0);
    float fresnel = pow(1.0 - clamp(dot(normal, viewDir), 0.0, 1.0), 3.2);

    float depth = clamp((boundary - uv.y) / max(boundary, 0.001), 0.0, 1.0);
    depth = pow(depth, 0.7);
    vec3 waterTint = mix(uColorShallow, uColorDeep, depth);

    vec3 color = mix(refractedBg, refractedBg * waterTint, 0.68);
    color = mix(color, uColorSky, fresnel * 0.28);

    color += vec3(1.0) * (spec * 0.55 + specTight * 0.65);
    color += vec3(0.45, 0.65, 0.80) * ndl * 0.10;

    float slope = length(vec2(hx - h, hy - h)) * 10.0;
    float crest = smoothstep(0.60, 0.85, h + slope * 0.30);
    float shore = smoothstep(boundary + 0.05, boundary - 0.04, uv.y);
    float foam = clamp(crest * 0.80 + shore * 0.30, 0.0, 1.0);
    color = mix(color, uColorFoam, foam * 0.40);

    color = color / (color + vec3(1.0));
    color = pow(color, vec3(0.96));

    float alpha = clamp(0.50 * mask + fresnel * 0.12, 0.0, 0.85);
    gl_FragColor = vec4(color, alpha);
  }
`;

const haloFragmentShader = `
  precision mediump float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uCenter;
  uniform float uHaloRadius;
  uniform float uHaloWidth;
  uniform float uHaloIntensity;

  #define PI 3.14159265359

  // Simplified noise - faster than full 3D simplex
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float ringShape(float r, float w, float d) {
    float inner = smoothstep(r - w, r, d);
    float outer = smoothstep(r, r + w, d);
    return clamp(inner - outer, 0.0, 1.0);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    float aspect = uResolution.x / uResolution.y;
    p.x *= aspect;

    vec2 center = vec2(uCenter.x * aspect, uCenter.y);
    vec2 rp = p - center;
    float dist = length(rp);
    float angle = atan(rp.y, rp.x);

    float radiusNoise = noise(vec2(angle * 1.5, uTime * 0.10)) * 0.006;
    float breathe = sin(uTime * 0.15) * 0.003;
    float currentRadius = uHaloRadius + radiusNoise + breathe;

    float ring1 = ringShape(currentRadius, uHaloWidth * 0.50, dist);
    float ring2 = ringShape(currentRadius * 0.88, uHaloWidth * 0.32, dist) * 0.30;
    float ring3 = ringShape(currentRadius * 1.10, uHaloWidth * 0.25, dist) * 0.18;

    float ring = ring1 + ring2 + ring3;

    float innerGlow = exp(-dist * dist * 2.5) * 0.08;
    float outerGlow = exp(-(dist - currentRadius) * (dist - currentRadius) * 8.0) * 0.22;

    float noiseDetail = noise(rp * 4.0 + uTime * 0.22) * 0.10 + 0.90;
    float noiseDetail2 = noise(rp * 8.0 + uTime * 0.28) * 0.05 + 0.95;

    float pulse1 = sin(angle * 2.4 + uTime * 0.9) * 0.5 + 0.5;
    float pulse2 = sin(angle * 3.8 - uTime * 0.7) * 0.5 + 0.5;
    float pulses = mix(pulse1, pulse2, 0.5) * 0.10 + 0.90;

    float intensity = ring * noiseDetail * noiseDetail2 * pulses;
    intensity += innerGlow;
    intensity += outerGlow * noiseDetail;

    vec3 coreColor = vec3(0.96, 0.99, 1.0);
    vec3 midColor = vec3(0.55, 0.88, 1.0);
    vec3 edgeColor = vec3(0.22, 0.66, 0.98);

    float colorBlend = smoothstep(currentRadius - uHaloWidth, currentRadius + uHaloWidth, dist);
    vec3 glowColor = mix(coreColor, midColor, colorBlend);
    glowColor = mix(glowColor, edgeColor, colorBlend * colorBlend);

    glowColor.r += sin(angle * 1.4 + uTime * 0.4) * 0.015;
    glowColor.b += cos(angle * 2.0 - uTime * 0.3) * 0.025;

    float topFade = smoothstep(0.10, 0.85, p.y);
    float topDim = mix(1.0, 0.80, topFade);

    float alpha = intensity * uHaloIntensity * topDim;
    alpha = clamp(alpha, 0.0, 1.0);

    glowColor = mix(glowColor, glowColor * vec3(0.94, 0.96, 1.0), topFade * 0.30);

    gl_FragColor = vec4(glowColor, alpha);
  }
`;

const particleVertexShader = `
  attribute float aAngle;
  attribute float aRadius;
  attribute float aSpeed;
  attribute float aSize;
  attribute float aTwinkle;
  attribute float aOffset;
  attribute float aLayer;
  attribute float aOrbitOffset;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uCenter;
  uniform float uAspect;

  varying float vTwinkle;
  varying float vLayer;
  varying float vDist;

  void main() {
    float time = uTime * aSpeed;
    float angle = aAngle + time;

    float radiusVariation = sin(uTime * 0.30 + aOffset + aOrbitOffset) * 0.008;
    float currentRadius = aRadius + radiusVariation;

    vec2 pos = vec2(
      (cos(angle) * currentRadius) / max(uAspect, 0.0001),
      sin(angle) * currentRadius
    );
    
    pos += uCenter;

    gl_Position = vec4(pos, 0.0, 1.0);

    float twinkle1 = sin(uTime * aTwinkle + aOffset) * 0.5 + 0.5;
    float twinkle2 = sin(uTime * aTwinkle * 1.5 + aOffset * 2.0) * 0.5 + 0.5;
    vTwinkle = mix(twinkle1, twinkle2, 0.3);
    
    vLayer = aLayer;
    vDist = currentRadius;
    
    float layerScale = 0.6 + aLayer * 0.4;
    gl_PointSize = aSize * uPixelRatio * (0.5 + vTwinkle * 0.7) * layerScale;
  }
`;

const particleFragmentShader = `
  precision mediump float;

  uniform float uHaloRadius;
  uniform float uHaloWidth;
  uniform float uHaloIntensity;

  varying float vTwinkle;
  varying float vLayer;
  varying float vDist;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center) * 2.0;
    
    float core = 1.0 - smoothstep(0.0, 0.3, dist);
    float glow = 1.0 - smoothstep(0.0, 1.0, dist);
    glow = pow(glow, 2.0);
    
    float alpha = core * 0.70 + glow * 0.30;
    alpha *= 0.18 + vTwinkle * 0.32;

    float ringDist = abs(vDist - uHaloRadius);
    float ringMask = exp(-pow(ringDist / max(uHaloWidth * 0.70, 0.001), 2.0));
    alpha *= ringMask * uHaloIntensity * 0.25;
    
    vec3 coreColor = vec3(1.0, 1.0, 1.0);
    vec3 glowColor = vec3(0.6, 0.88, 1.0);
    vec3 deepColor = vec3(0.4, 0.7, 0.95);
    
    vec3 color = mix(glowColor, coreColor, core);
    color = mix(color, deepColor, (1.0 - vLayer) * 0.3);
    color = mix(color, vec3(1.0), vTwinkle * 0.35 * core);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

const dustVertexShader = `
  attribute vec3 aVelocity;
  attribute float aSize;
  attribute float aAlpha;
  attribute float aPhase;

  uniform float uTime;
  uniform float uPixelRatio;

  varying float vAlpha;

  void main() {
    vec3 pos = position;
    
    float t = uTime * 0.12;
    pos.x += sin(t + aPhase) * 0.04 + aVelocity.x * t;
    pos.y += cos(t * 0.6 + aPhase * 1.2) * 0.025 + aVelocity.y * t;
    
    pos.x = mod(pos.x + 1.0, 2.0) - 1.0;
    pos.y = mod(pos.y + 1.0, 2.0) - 1.0;

    gl_Position = vec4(pos.xy, 0.0, 1.0);
    
    float fade = sin(uTime * 0.4 + aPhase) * 0.25 + 0.75;
    vAlpha = aAlpha * fade;
    
    gl_PointSize = aSize * uPixelRatio;
  }
`;

const dustFragmentShader = `
  precision mediump float;

  varying float vAlpha;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center) * 2.0;
    
    float alpha = 1.0 - smoothstep(0.0, 1.0, dist);
    alpha = pow(alpha, 1.5);
    alpha *= vAlpha;
    
    vec3 color = vec3(0.8, 0.92, 1.0);
    
    gl_FragColor = vec4(color, alpha * 0.45);
  }
`;

type HeroSceneCanvasProps = {
  className?: string;
};

export default function HeroSceneCanvas({ className = "" }: HeroSceneCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false, // Disabled for performance
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0xffffff, 0);
    renderer.autoClear = false;

    const backgroundScene = new THREE.Scene();
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const plane = new THREE.PlaneGeometry(2, 2);

    const bgUniforms = {
      uTime: { value: 0 },
    };
    const backgroundMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: backgroundFragmentShader,
      uniforms: bgUniforms,
      depthWrite: false,
      depthTest: false,
    });

    const waterUniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uBackground: { value: null as unknown as THREE.Texture },

      uScale: { value: 0.4 },
      uAx: { value: 5.0 },
      uAy: { value: 7.0 },
      uAz: { value: 9.0 },
      uAw: { value: 13.0 },
      uBx: { value: 1.0 },
      uBy: { value: 1.0 },

      uSeaLevel: { value: 0.56 },
      uEdgeSoftness: { value: 0.10 },
      uRefraction: { value: 0.018 },

      uColorDeep: { value: new THREE.Color("#033a7a") },
      uColorShallow: { value: new THREE.Color("#31c5e8") },
      uColorFoam: { value: new THREE.Color("#f5fbff") },
      uColorSky: { value: new THREE.Color("#d9f2ff") },
    };
    const waterMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: seaFragmentShader,
      uniforms: waterUniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const haloUniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uCenter: { value: new THREE.Vector2(0.0, 0.18) },
      uHaloRadius: { value: 0.52 },
      uHaloWidth: { value: 0.12 },
      uHaloIntensity: { value: 1.30 },
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

    const backgroundMesh = new THREE.Mesh(plane, backgroundMaterial);
    const waterMesh = new THREE.Mesh(plane, waterMaterial);
    const haloMesh = new THREE.Mesh(plane, haloMaterial);

    backgroundScene.add(backgroundMesh);
    scene.add(waterMesh, haloMesh);

    const renderTarget = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      depthBuffer: false,
      stencilBuffer: false,
    });
    waterUniforms.uBackground.value = renderTarget.texture;

    // Reduced particle count
    const particleCount = 450;
    const positions = new Float32Array(particleCount * 3);
    const angles = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const twinkles = new Float32Array(particleCount);
    const offsets = new Float32Array(particleCount);
    const layers = new Float32Array(particleCount);
    const orbitOffsets = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      positions[idx] = 0;
      positions[idx + 1] = 0;
      positions[idx + 2] = 0;
      
      angles[i] = Math.random() * Math.PI * 2;
      
      const layer = Math.floor(Math.random() * 3);
      layers[i] = layer / 2;
      
      const baseRadius = 0.52 + (layer - 1) * 0.016;
      radii[i] = baseRadius + (Math.random() - 0.5) * 0.018;
      
      speeds[i] = 0.035 + Math.random() * 0.065;
      sizes[i] = 2.8 + Math.random() * 5.2;
      twinkles[i] = 0.9 + Math.random() * 1.8;
      offsets[i] = Math.random() * Math.PI * 2;
      orbitOffsets[i] = Math.random() * Math.PI * 2;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("aAngle", new THREE.BufferAttribute(angles, 1));
    particleGeometry.setAttribute("aRadius", new THREE.BufferAttribute(radii, 1));
    particleGeometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    particleGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    particleGeometry.setAttribute("aTwinkle", new THREE.BufferAttribute(twinkles, 1));
    particleGeometry.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));
    particleGeometry.setAttribute("aLayer", new THREE.BufferAttribute(layers, 1));
    particleGeometry.setAttribute("aOrbitOffset", new THREE.BufferAttribute(orbitOffsets, 1));

    const particleUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uCenter: { value: haloUniforms.uCenter.value },
      uAspect: { value: 1 },
      uHaloRadius: { value: haloUniforms.uHaloRadius.value },
      uHaloWidth: { value: haloUniforms.uHaloWidth.value },
      uHaloIntensity: { value: haloUniforms.uHaloIntensity.value },
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

    // Reduced dust count
    const dustCount = 120;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustVelocities = new Float32Array(dustCount * 3);
    const dustSizes = new Float32Array(dustCount);
    const dustAlphas = new Float32Array(dustCount);
    const dustPhases = new Float32Array(dustCount);

    for (let i = 0; i < dustCount; i++) {
      const idx = i * 3;
      dustPositions[idx] = (Math.random() - 0.5) * 2;
      dustPositions[idx + 1] = (Math.random() - 0.5) * 2;
      dustPositions[idx + 2] = 0;
      
      dustVelocities[idx] = (Math.random() - 0.5) * 0.015;
      dustVelocities[idx + 1] = Math.random() * 0.008;
      dustVelocities[idx + 2] = 0;
      
      dustSizes[i] = 1.4 + Math.random() * 2.2;
      dustAlphas[i] = 0.18 + Math.random() * 0.35;
      dustPhases[i] = Math.random() * Math.PI * 2;
    }

    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute("aVelocity", new THREE.BufferAttribute(dustVelocities, 3));
    dustGeometry.setAttribute("aSize", new THREE.BufferAttribute(dustSizes, 1));
    dustGeometry.setAttribute("aAlpha", new THREE.BufferAttribute(dustAlphas, 1));
    dustGeometry.setAttribute("aPhase", new THREE.BufferAttribute(dustPhases, 1));

    const dustUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
    };

    const dustMaterial = new THREE.ShaderMaterial({
      uniforms: dustUniforms,
      vertexShader: dustVertexShader,
      fragmentShader: dustFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);

    let frameId: number | null = null;
    let start = performance.now();
    let isPaused = false;
    let lastFrameTime = start;
    const targetFPS = 30; // Target 30fps for better performance
    const frameInterval = 1000 / targetFPS;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = mediaQuery.matches;

    const renderFrame = (time: number) => {
      bgUniforms.uTime.value = time;
      waterUniforms.uTime.value = time;
      haloUniforms.uTime.value = time;
      particleUniforms.uTime.value = time;
      dustUniforms.uTime.value = time;

      renderer.setRenderTarget(renderTarget);
      renderer.clear();
      renderer.render(backgroundScene, camera);

      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(backgroundScene, camera);

      renderer.render(scene, camera);
    };

    const animate = (now: number) => {
      if (isPaused) return;
      
      // Frame rate limiting
      const elapsed = now - lastFrameTime;
      if (elapsed < frameInterval) {
        frameId = requestAnimationFrame(animate);
        return;
      }
      
      lastFrameTime = now - (elapsed % frameInterval);
      const time = (now - start) * 0.001;
      renderFrame(time);
      frameId = requestAnimationFrame(animate);
    };

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Cap DPR at 1.5 for performance
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);

      // Lower resolution render target
      const rtWidth = Math.floor(width * dpr * 0.75);
      const rtHeight = Math.floor(height * dpr * 0.75);
      renderTarget.setSize(rtWidth, rtHeight);

      waterUniforms.uResolution.value.set(width * dpr, height * dpr);
      haloUniforms.uResolution.value.set(width * dpr, height * dpr);
      particleUniforms.uPixelRatio.value = dpr;
      particleUniforms.uAspect.value = width / Math.max(height, 1);
      dustUniforms.uPixelRatio.value = dpr;

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
      lastFrameTime = start;
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
      lastFrameTime = start;
      frameId = requestAnimationFrame(animate);
    };

    resize();

    if (!prefersReducedMotion) {
      frameId = requestAnimationFrame(animate);
    } else {
      renderFrame(0);
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMotionChange);
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMotionChange);
      }

      plane.dispose();
      particleGeometry.dispose();
      dustGeometry.dispose();
      backgroundMaterial.dispose();
      waterMaterial.dispose();
      haloMaterial.dispose();
      particleMaterial.dispose();
      dustMaterial.dispose();
      renderTarget.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full ${className}`} />;
}