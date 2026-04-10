"use client";

import { useEffect, useRef } from "react";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 5}px)`;
      }
    };

    const animateRing = () => {
      // Lag effect for ring
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x - 18}px, ${ringPos.current.y - 18}px)`;
      }

      requestAnimationFrame(animateRing);
    };

    window.addEventListener("mousemove", handleMouseMove);
    const animationId = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      {/* Main dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-[10px] h-[10px] bg-coral rounded-full pointer-events-none z-[10000]"
        style={{ willChange: "transform" }}
      />
      {/* Lagging ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-[36px] h-[36px] border border-coral rounded-full pointer-events-none z-[10000] opacity-50"
        style={{ willChange: "transform" }}
      />
    </>
  );
}
