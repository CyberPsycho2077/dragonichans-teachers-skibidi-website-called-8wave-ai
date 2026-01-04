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
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;

  void main() {
    // Darker base so the halo/sea have contrast
    vec3 top = vec3(0.90, 0.94, 0.98);
    vec3 mid = vec3(0.82, 0.90, 0.97);
    vec3 bottom = vec3(0.72, 0.86, 0.95);

    float blend = smoothstep(0.0, 1.0, vUv.y);
    vec3 color = mix(bottom, top, blend);

    // Subtle animated gradient shift
    float drift = sin(uTime * 0.1 + vUv.x * 2.0) * 0.02;
    color = mix(color, mid, 0.4 + drift);

    // Soft radial glow from center-right
    vec2 center = vUv - vec2(0.55, 0.5);
    float glow = exp(-dot(center, center) * 2.5);
    color = mix(color, vec3(0.90, 0.96, 1.0), glow * 0.22);

    // Subtle vignette
    float vignette = smoothstep(1.2, 0.3, length(vUv - 0.5));
    color *= 0.88 + 0.10 * vignette;

    // Overall dim
    color *= 0.94;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const seaFragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform sampler2D uBackground;

  // Core (from the user-provided shader-art idea)
  uniform float uScale;
  uniform float uAx;
  uniform float uAy;
  uniform float uAz;
  uniform float uAw;
  uniform float uBx;
  uniform float uBy;

  // Sea controls
  uniform float uSeaLevel;
  uniform float uEdgeSoftness;
  uniform float uRefraction;

  // Colors (tuned toward ocean)
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

  // Domain warp like the reference, plus an extra swell layer for more "sea" feel.
  float seaHeight(vec2 uv, float t) {
    vec2 aR = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 st = uv * aR * uScale;

    // Keep motion smooth (slower)
    float S = sin(t * 0.22);
    float C = cos(t * 0.22);

    vec2 v1 = vec2(cheapNoise(vec3(st, 2.0)), cheapNoise(vec3(st, 1.0)));

    vec2 v2 = vec2(
      cheapNoise(vec3(st + uBx * v1 + vec2(C * 1.7, S * 9.2), 0.15 * t)),
      cheapNoise(vec3(st + uBy * v1 + vec2(S * 8.3, C * 2.8), 0.126 * t))
    );

    float n = 0.5 + 0.5 * cheapNoise(vec3(st + v2, 0.0));

    // Extra large-scale swell waves (directional, slower)
    float swell = 0.5 + 0.5 * sin((uv.x * 2.2 + uv.y * 0.7) * 6.2831 + t * 0.35);
    float swell2 = 0.5 + 0.5 * sin((uv.x * -0.9 + uv.y * 1.8) * 6.2831 + t * 0.22 + 1.7);

    // Combine: domain-warp detail + swell
    float h = n;
    h = mix(h, h * h, 0.35);
    h += (swell - 0.5) * 0.20;
    h += (swell2 - 0.5) * 0.12;

    return h;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    // Global slowdown factor
    float t = uTime * 0.07;

    // Flowing sea boundary (no straight line)
    float edgeField = seaHeight(vec2(uv.x, uSeaLevel), t);
    float boundary = uSeaLevel + (edgeField - 0.5) * 0.10;
    float mask = smoothstep(boundary + uEdgeSoftness, boundary - uEdgeSoftness, uv.y);

    if (mask < 0.001) {
      gl_FragColor = vec4(0.0);
      return;
    }

    float eps = 1.2 / max(uResolution.y, 1.0);

    float h = seaHeight(uv, t);
    float hx = seaHeight(uv + vec2(eps, 0.0), t);
    float hy = seaHeight(uv + vec2(0.0, eps), t);

    // Height -> normal
    vec3 normal = normalize(vec3((hx - h) * 3.4, (hy - h) * 3.4, 1.0));

    // Refraction from background
    vec3 bg = texture2D(uBackground, uv).rgb;
    vec2 refractUv = uv + normal.xy * uRefraction;
    vec3 refractedBg = texture2D(uBackground, refractUv).rgb;

    // Lighting
    vec3 lightDir = normalize(vec3(0.55, 0.35, 1.0));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfDir = normalize(lightDir + viewDir);

    float ndl = clamp(dot(normal, lightDir), 0.0, 1.0);
    float spec = pow(clamp(dot(normal, halfDir), 0.0, 1.0), 120.0);
    float specTight = pow(clamp(dot(normal, halfDir), 0.0, 1.0), 280.0);
    float fresnel = pow(1.0 - clamp(dot(normal, viewDir), 0.0, 1.0), 3.5);

    // Depth-ish blend
    float depth = clamp((boundary - uv.y) / max(boundary, 0.001), 0.0, 1.0);
    depth = pow(depth, 0.7);
    vec3 waterTint = mix(uColorShallow, uColorDeep, depth);

    // Base color: refracted background tinted by water (more watery tint)
    vec3 color = mix(refractedBg, refractedBg * waterTint, 0.72);

    // Sky reflection tint via fresnel
    color = mix(color, uColorSky, fresnel * 0.32);

    // Specular sun glints
    color += vec3(1.0) * (spec * 0.65 + specTight * 0.75);
    color += vec3(0.45, 0.65, 0.80) * ndl * 0.12;

    // Foam: appears on crests and near boundary
    float slope = length(vec2(hx - h, hy - h)) * 12.0;
    float crest = smoothstep(0.62, 0.88, h + slope * 0.35);
    float shore = smoothstep(boundary + 0.06, boundary - 0.05, uv.y);
    float foam = clamp(crest * 0.85 + shore * 0.35, 0.0, 1.0);
    color = mix(color, uColorFoam, foam * 0.45);

    // Mild tonemap
    color = color / (color + vec3(1.0));
    color = pow(color, vec3(0.96));

    float alpha = clamp(0.55 * mask + fresnel * 0.15, 0.0, 0.90);
    gl_FragColor = vec4(color, alpha);
  }
`;

const haloFragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uCenter;
  uniform float uHaloRadius;
  uniform float uHaloWidth;
  uniform float uHaloIntensity;

  #define PI 3.14159265359

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

  // Ring helper (robust ring: inner - outer)
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

    // Center the halo (uCenter is in clip-space, aspect corrected for distance math)
    vec2 center = vec2(uCenter.x * aspect, uCenter.y);
    vec2 rp = p - center;
    float dist = length(rp);
    float angle = atan(rp.y, rp.x);

    // Animated radius variation
    // Reduce fluctuations: lower noise amplitude + slower breathing
    float radiusNoise = snoise(vec3(angle * 0.9, uTime * 0.12, 0.0)) * 0.007;
    float breathe = sin(uTime * 0.18) * 0.004;
    float currentRadius = uHaloRadius + radiusNoise + breathe;

    // Multiple ring layers for depth
    float ring1 = ringShape(currentRadius, uHaloWidth * 0.55, dist);
    float ring2 = ringShape(currentRadius * 0.86, uHaloWidth * 0.35, dist) * 0.35;
    float ring3 = ringShape(currentRadius * 1.12, uHaloWidth * 0.28, dist) * 0.22;

    float ring = ring1 + ring2 + ring3;

    // Inner glow (kept subtle so it doesn't become a filled white disc)
    float innerGlow = exp(-dist * dist * 2.8) * 0.10;
    
    // Outer soft glow
    float outerGlow = exp(-(dist - currentRadius) * (dist - currentRadius) * 9.0) * 0.28;

    // Noise variation on the ring
    float noiseDetail = snoise(vec3(rp * 4.0, uTime * 0.28)) * 0.12 + 0.88;
    float noiseDetail2 = snoise(vec3(rp * 9.0, uTime * 0.34)) * 0.06 + 0.94;

    // Energy pulses along the ring
    float pulse1 = sin(angle * 2.6 + uTime * 1.1) * 0.5 + 0.5;
    float pulse2 = sin(angle * 4.1 - uTime * 0.9) * 0.5 + 0.5;
    float pulses = mix(pulse1, pulse2, 0.5) * 0.12 + 0.88;

    // Combine all effects
    float intensity = ring * noiseDetail * noiseDetail2 * pulses;
    intensity += innerGlow;
    intensity += outerGlow * noiseDetail;

    // Color gradient
    vec3 coreColor = vec3(0.96, 0.99, 1.0);
    vec3 midColor = vec3(0.55, 0.88, 1.0);
    vec3 edgeColor = vec3(0.22, 0.66, 0.98);

    float colorBlend = smoothstep(currentRadius - uHaloWidth, currentRadius + uHaloWidth, dist);
    vec3 glowColor = mix(coreColor, midColor, colorBlend);
    glowColor = mix(glowColor, edgeColor, colorBlend * colorBlend);

    // Subtle chromatic variation (reduced)
    glowColor.r += sin(angle * 1.5 + uTime * 0.5) * 0.02;
    glowColor.b += cos(angle * 2.2 - uTime * 0.35) * 0.03;

    // Slightly dim the top arc so it blends into the background
    // p is aspect-corrected NDC-ish coords, so higher p.y = higher on screen.
    float topFade = smoothstep(0.10, 0.85, p.y);
    float topDim = mix(1.0, 0.78, topFade);

    float alpha = intensity * uHaloIntensity * topDim;
    alpha = clamp(alpha, 0.0, 1.0);

    glowColor = mix(glowColor, glowColor * vec3(0.93, 0.95, 1.0), topFade * 0.35);

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
    
    // Particles should travel along the halo ring (tangential motion)
    float angle = aAngle + time;

    // Tiny radial shimmer (keeps them alive but not "planet halo")
    float radiusVariation = sin(uTime * 0.35 + aOffset + aOrbitOffset) * 0.010;
    float currentRadius = aRadius + radiusVariation;

    // Aspect-correct X so particles follow the same circular ring path
    // as the halo shader (which scales X by aspect for distance math).
    vec2 pos = vec2(
      (cos(angle) * currentRadius) / max(uAspect, 0.0001),
      sin(angle) * currentRadius
    );
    
    pos += uCenter;

    gl_Position = vec4(pos, 0.0, 1.0);

    // Multi-frequency twinkle
    float twinkle1 = sin(uTime * aTwinkle + aOffset) * 0.5 + 0.5;
    float twinkle2 = sin(uTime * aTwinkle * 1.7 + aOffset * 2.0) * 0.5 + 0.5;
    vTwinkle = mix(twinkle1, twinkle2, 0.3);
    
    vLayer = aLayer;
    vDist = currentRadius;
    
    // Size varies with twinkle and layer
    float layerScale = 0.6 + aLayer * 0.4;
    gl_PointSize = aSize * uPixelRatio * (0.5 + vTwinkle * 0.8) * layerScale;
  }
`;

const particleFragmentShader = `
  precision highp float;

  uniform float uHaloRadius;
  uniform float uHaloWidth;
  uniform float uHaloIntensity;

  varying float vTwinkle;
  varying float vLayer;
  varying float vDist;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center) * 2.0;
    
    // Soft circular particle with glow
    float core = 1.0 - smoothstep(0.0, 0.3, dist);
    float glow = 1.0 - smoothstep(0.0, 1.0, dist);
    glow = pow(glow, 2.0);
    
    float alpha = core * 0.75 + glow * 0.35;
    alpha *= 0.22 + vTwinkle * 0.38;

    // Particles belong to the halo: fade out away from the ring band
    float ringDist = abs(vDist - uHaloRadius);
    float ringMask = exp(-pow(ringDist / max(uHaloWidth * 0.75, 0.001), 2.0));
    alpha *= ringMask * uHaloIntensity * 0.30;
    
    // Color based on layer and twinkle
    vec3 coreColor = vec3(1.0, 1.0, 1.0);
    vec3 glowColor = vec3(0.6, 0.88, 1.0);
    vec3 deepColor = vec3(0.4, 0.7, 0.95);
    
    vec3 color = mix(glowColor, coreColor, core);
    color = mix(color, deepColor, (1.0 - vLayer) * 0.3);
    
    // Brighter at peak twinkle
    color = mix(color, vec3(1.0), vTwinkle * 0.4 * core);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Dust/ambient particles shader
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
    
    // Gentle floating motion
    float t = uTime * 0.15;
    pos.x += sin(t + aPhase) * 0.05 + aVelocity.x * t;
    pos.y += cos(t * 0.7 + aPhase * 1.3) * 0.03 + aVelocity.y * t;
    
    // Wrap around
    pos.x = mod(pos.x + 1.0, 2.0) - 1.0;
    pos.y = mod(pos.y + 1.0, 2.0) - 1.0;

    gl_Position = vec4(pos.xy, 0.0, 1.0);
    
    // Fade based on position and time
    float fade = sin(uTime * 0.5 + aPhase) * 0.3 + 0.7;
    vAlpha = aAlpha * fade;
    
    gl_PointSize = aSize * uPixelRatio;
  }
`;

const dustFragmentShader = `
  precision highp float;

  varying float vAlpha;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center) * 2.0;
    
    float alpha = 1.0 - smoothstep(0.0, 1.0, dist);
    alpha = pow(alpha, 1.5);
    alpha *= vAlpha;
    
    vec3 color = vec3(0.8, 0.92, 1.0);
    
    gl_FragColor = vec4(color, alpha * 0.5);
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
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0xffffff, 0);
    renderer.autoClear = false;

    const backgroundScene = new THREE.Scene();
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const plane = new THREE.PlaneGeometry(2, 2);

    // Background
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

    // Sea surface (domain-warped + refractive)
    const waterUniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uBackground: { value: null as unknown as THREE.Texture },

      // Based on the provided shader-art uniforms
      uScale: { value: 0.4 },
      uAx: { value: 5.0 },
      uAy: { value: 7.0 },
      uAz: { value: 9.0 },
      uAw: { value: 13.0 },
      uBx: { value: 1.0 },
      uBy: { value: 1.0 },

      // Sea tuning
      uSeaLevel: { value: 0.56 },
      uEdgeSoftness: { value: 0.10 },
      uRefraction: { value: 0.020 },

      // Colors (slightly more watery / teal)
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

    // Halo
    const haloUniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      // Clip-space center for ring placement (tuned to sit between label + headline)
      uCenter: { value: new THREE.Vector2(0.0, 0.18) },
      uHaloRadius: { value: 0.52 },
      uHaloWidth: { value: 0.12 },
      uHaloIntensity: { value: 1.35 },
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

    // Halo particles (must live inside the halo)
    const particleCount = 700;
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
      
      // Distribute particles across multiple orbit layers
      const layer = Math.floor(Math.random() * 3);
      layers[i] = layer / 2;
      
      const baseRadius = 0.52 + (layer - 1) * 0.018;
      radii[i] = baseRadius + (Math.random() - 0.5) * 0.020;
      
      speeds[i] = 0.04 + Math.random() * 0.08;
      sizes[i] = 3.0 + Math.random() * 6.0;
      twinkles[i] = 1.0 + Math.random() * 2.0;
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
      // Share center with halo so particles trace the exact same ring placement
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

    // Ambient dust particles
    const dustCount = 200;
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
      
      dustVelocities[idx] = (Math.random() - 0.5) * 0.02;
      dustVelocities[idx + 1] = Math.random() * 0.01;
      dustVelocities[idx + 2] = 0;
      
      dustSizes[i] = 1.5 + Math.random() * 2.5;
      dustAlphas[i] = 0.2 + Math.random() * 0.4;
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

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = mediaQuery.matches;

    const renderFrame = (time: number) => {
      bgUniforms.uTime.value = time;
      waterUniforms.uTime.value = time;
      haloUniforms.uTime.value = time;
      particleUniforms.uTime.value = time;
      dustUniforms.uTime.value = time;

      // 1) render background into offscreen texture for refraction
      renderer.setRenderTarget(renderTarget);
      renderer.clear();
      renderer.render(backgroundScene, camera);

      // 2) render background to screen
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(backgroundScene, camera);

      // 3) render effects on top
      renderer.render(scene, camera);
    };

    const animate = (now: number) => {
      if (isPaused) return;
      const time = (now - start) * 0.001;
      renderFrame(time);
      frameId = requestAnimationFrame(animate);
    };

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);

      renderTarget.setSize(Math.floor(width * dpr), Math.floor(height * dpr));

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
