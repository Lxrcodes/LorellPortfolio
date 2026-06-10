"use client";

import { useEffect, useRef, useState } from "react";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  // false until we confirm a fine pointer (mouse/trackpad) — prevents flash on mobile
  const [hasMouse, setHasMouse] = useState(false);
  // hidden until first mousemove so the dot doesn't sit at (0,0) on load
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    // pointer:fine = mouse or stylus; pointer:coarse = finger touch
    setHasMouse(window.matchMedia("(pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (!hasMouse) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!hasMoved) setHasMoved(true);
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 5}px)`;
      }
    };

    let animationId: number;
    const animateRing = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x - 18}px, ${ringPos.current.y - 18}px)`;
      }
      animationId = requestAnimationFrame(animateRing);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationId = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMouse]);

  if (!hasMouse) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-[10px] h-[10px] bg-coral rounded-full pointer-events-none z-[10000] transition-opacity duration-200"
        style={{ willChange: "transform", opacity: hasMoved ? 1 : 0 }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-[36px] h-[36px] border border-coral rounded-full pointer-events-none z-[10000] transition-opacity duration-200"
        style={{ willChange: "transform", opacity: hasMoved ? 0.5 : 0 }}
      />
    </>
  );
}
