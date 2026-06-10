"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.3,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    } as ConstructorParameters<typeof Lenis>[0]);

    lenis.on("scroll", () => ScrollTrigger.update());

    const rafFn = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(rafFn);
    gsap.ticker.lagSmoothing(0);

    // Let all child ScrollTrigger instances recalculate after Lenis is live
    const id = setTimeout(() => ScrollTrigger.refresh(), 100);

    return () => {
      clearTimeout(id);
      lenis.destroy();
      gsap.ticker.remove(rafFn);
    };
  }, []);

  return <>{children}</>;
}
