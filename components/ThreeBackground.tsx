"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uMouse;   // cursor / touch focal point (0-1)
  uniform vec2  uTilt;    // device orientation (-1 to 1)
  uniform float uAspect;
  uniform vec3  uBgColor;

  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p * 2.1;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    uv.x *= uAspect;

    // Cursor / touch bloom
    vec2 mouseUv = vec2(uMouse.x * uAspect, uMouse.y);
    float mouseDist = distance(uv, mouseUv);
    float mouseStr  = smoothstep(0.55, 0.0, mouseDist);

    float t = uTime;

    vec2 q = vec2(
      fbm(uv + vec2(0.0, 0.0) + t * 0.12),
      fbm(uv + vec2(5.2, 1.3) - t * 0.08)
    );

    // uTilt shifts the domain-warp seed — tilting the phone "leans" the paint
    vec2 tiltShift = uTilt * 0.28;

    vec2 r = vec2(
      fbm(uv + 1.2 * q + vec2(1.7, 9.2) + t * 0.06 + mouseStr * 0.4 + tiltShift),
      fbm(uv + 1.2 * q + vec2(8.3, 2.8) - t * 0.04 + mouseStr * 0.3 + tiltShift.yx)
    );

    float f = fbm(uv + r);

    vec3 light = uBgColor + vec3(0.08, 0.075, 0.06);
    vec3 mid   = uBgColor + vec3(0.04, 0.037, 0.03);

    vec3 col = mix(uBgColor, mid, clamp(f * f * 2.5, 0.0, 1.0));
    col = mix(col, light, clamp((f - 0.5) * 1.5, 0.0, 1.0));

    // Coral warmth at cursor / touch point
    vec3 coral = vec3(0.91, 0.333, 0.235);
    col += coral * mouseStr * 0.07 * smoothstep(0.3, 0.6, f);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const SECTION_COLORS: Record<string, [number, number, number]> = {
  hero:       [0.055, 0.051, 0.043],
  about:      [0.067, 0.059, 0.047],
  work:       [0.047, 0.051, 0.063],
  running:    [0.071, 0.055, 0.043],
  experience: [0.051, 0.063, 0.059],
  contact:    [0.055, 0.051, 0.043],
};

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const [r, g, b] = SECTION_COLORS.hero;
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime:    { value: 0 },
        uMouse:   { value: new THREE.Vector2(0.5, 0.5) },
        uTilt:    { value: new THREE.Vector2(0, 0) },
        uAspect:  { value: window.innerWidth / window.innerHeight },
        uBgColor: { value: new THREE.Color(r, g, b) },
      },
    });
    scene.add(new THREE.Mesh(geometry, material));

    // On touch devices start the bloom off-screen so it only appears on touch
    const isTouchDevice = "ontouchstart" in window;
    const mouse  = { x: 0.5, y: isTouchDevice ? -0.5 : 0.5 };
    const target = { x: 0.5, y: isTouchDevice ? -0.5 : 0.5 };
    const tilt        = { x: 0, y: 0 };
    const tiltTarget  = { x: 0, y: 0 };

    // ── Mouse (desktop) ──────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      target.x = e.clientX / window.innerWidth;
      target.y = 1 - e.clientY / window.innerHeight;
    };

    // ── Touch ────────────────────────────────────────────────────────────────
    const onTouchMove = (e: TouchEvent) => {
      const t0 = e.touches[0];
      if (!t0) return;
      target.x = t0.clientX / window.innerWidth;
      target.y = 1 - t0.clientY / window.innerHeight;
    };

    const onTouchEnd = () => {
      // Slide bloom off the bottom so it fades away smoothly
      target.x = 0.5;
      target.y = -0.5;
    };

    // ── Device orientation (gyroscope) ───────────────────────────────────────
    const TILT_RANGE = 25; // degrees mapped to ±1
    const NATURAL_BETA = 50; // typical portrait hold angle

    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma ?? 0;
      const beta  = (e.beta ?? NATURAL_BETA) - NATURAL_BETA;
      tiltTarget.x = Math.max(-1, Math.min(1, gamma / TILT_RANGE));
      tiltTarget.y = Math.max(-1, Math.min(1, beta  / TILT_RANGE));
    };

    // Request iOS 13+ permission on first touch, then attach listener
    let orientationAttached = false;
    const attachOrientation = () => {
      if (orientationAttached) return;
      orientationAttached = true;

      const attach = () =>
        window.addEventListener("deviceorientation", onDeviceOrientation);

      const DOE = DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
      if (typeof DOE.requestPermission === "function") {
        DOE.requestPermission()
          .then((state) => { if (state === "granted") attach(); })
          .catch(() => {});
      } else {
        attach();
      }
    };

    const onTouchStart = () => {
      attachOrientation();
      // Only need this once
      window.removeEventListener("touchstart", onTouchStart);
    };

    // ── Resize ───────────────────────────────────────────────────────────────
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend",  onTouchEnd,  { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("resize", onResize);

    // ── Section color transitions ────────────────────────────────────────────
    const sectionTriggers: ScrollTrigger[] = [];
    Object.entries(SECTION_COLORS).forEach(([id, [cr, cg, cb]]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const animate = () =>
        gsap.to(material.uniforms.uBgColor.value, {
          r: cr, g: cg, b: cb,
          duration: 1.8,
          ease: "power2.inOut",
        });
      sectionTriggers.push(
        ScrollTrigger.create({ trigger: el, start: "top 65%", onEnter: animate, onEnterBack: animate })
      );
    });

    // ── Render loop ──────────────────────────────────────────────────────────
    let frame: number;
    const animate = (time: number) => {
      frame = requestAnimationFrame(animate);

      // Cursor / touch — fast lerp for responsive feel
      mouse.x += (target.x - mouse.x) * 0.06;
      mouse.y += (target.y - mouse.y) * 0.06;

      // Tilt — slow lerp for smooth gyro feel
      tilt.x += (tiltTarget.x - tilt.x) * 0.03;
      tilt.y += (tiltTarget.y - tilt.y) * 0.03;

      material.uniforms.uTime.value = time * 0.0003;
      material.uniforms.uMouse.value.set(mouse.x, mouse.y);
      material.uniforms.uTilt.value.set(tilt.x, tilt.y);
      renderer.render(scene, camera);
    };
    animate(0);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend",  onTouchEnd);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("deviceorientation", onDeviceOrientation);
      sectionTriggers.forEach((st) => st.kill());
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
}
