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
  uniform vec2 uMouse;
  uniform float uAspect;
  uniform vec3 uBgColor;

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

    vec2 mouseUv = vec2(uMouse.x * uAspect, uMouse.y);
    float mouseDist = distance(uv, mouseUv);
    float mouseStr = smoothstep(0.5, 0.0, mouseDist);

    float t = uTime;

    vec2 q = vec2(
      fbm(uv + vec2(0.0, 0.0) + t * 0.12),
      fbm(uv + vec2(5.2, 1.3) - t * 0.08)
    );

    vec2 r = vec2(
      fbm(uv + 1.2 * q + vec2(1.7, 9.2) + t * 0.06 + mouseStr * 0.4),
      fbm(uv + 1.2 * q + vec2(8.3, 2.8) - t * 0.04 + mouseStr * 0.3)
    );

    float f = fbm(uv + r);

    vec3 light = uBgColor + vec3(0.08, 0.075, 0.06);
    vec3 mid   = uBgColor + vec3(0.04, 0.037, 0.03);

    vec3 col = mix(uBgColor, mid, clamp(f * f * 2.5, 0.0, 1.0));
    col = mix(col, light, clamp((f - 0.5) * 1.5, 0.0, 1.0));

    // Coral warmth near cursor
    vec3 coral = vec3(0.91, 0.333, 0.235);
    col += coral * mouseStr * 0.07 * smoothstep(0.3, 0.6, f);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Chapter colors: very subtle atmospheric shifts per section (normalized 0–1)
const SECTION_COLORS: Record<string, [number, number, number]> = {
  hero:       [0.055, 0.051, 0.043], // pure ink
  about:      [0.067, 0.059, 0.047], // warm amber
  work:       [0.047, 0.051, 0.063], // cool blue
  running:    [0.071, 0.055, 0.043], // dawn warmth
  experience: [0.051, 0.063, 0.059], // cool green
  contact:    [0.055, 0.051, 0.043], // back to ink
};

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    // Renderer
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
        uTime:     { value: 0 },
        uMouse:    { value: new THREE.Vector2(0.5, 0.5) },
        uAspect:   { value: window.innerWidth / window.innerHeight },
        uBgColor:  { value: new THREE.Color(r, g, b) },
      },
    });
    scene.add(new THREE.Mesh(geometry, material));

    // Smooth cursor tracking
    const mouse    = { x: 0.5, y: 0.5 };
    const target   = { x: 0.5, y: 0.5 };

    const onMouseMove = (e: MouseEvent) => {
      target.x = e.clientX / window.innerWidth;
      target.y = 1 - e.clientY / window.innerHeight;
    };

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    // Section color transitions — GSAP animates the THREE.Color directly
    const sectionTriggers: ScrollTrigger[] = [];
    Object.entries(SECTION_COLORS).forEach(([id, [cr, cg, cb]]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 65%",
        onEnter: () =>
          gsap.to(material.uniforms.uBgColor.value, {
            r: cr, g: cg, b: cb,
            duration: 1.8,
            ease: "power2.inOut",
          }),
        onEnterBack: () =>
          gsap.to(material.uniforms.uBgColor.value, {
            r: cr, g: cg, b: cb,
            duration: 1.8,
            ease: "power2.inOut",
          }),
      });
      sectionTriggers.push(st);
    });

    // Render loop
    let frame: number;
    const animate = (time: number) => {
      frame = requestAnimationFrame(animate);
      mouse.x += (target.x - mouse.x) * 0.06;
      mouse.y += (target.y - mouse.y) * 0.06;
      material.uniforms.uTime.value = time * 0.0003;
      material.uniforms.uMouse.value.set(mouse.x, mouse.y);
      renderer.render(scene, camera);
    };
    animate(0);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
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
