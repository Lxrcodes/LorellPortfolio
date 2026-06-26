"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { projects } from "@/lib/projects";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function ProjectsGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Drives the thin progress bar across the top of the mockup panel
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    return scrollYProgress.on("change", (v: number) => {
      if (isNaN(v)) return;
      const idx = Math.max(
        0,
        Math.min(Math.floor(v * projects.length), projects.length - 1)
      );
      setActiveIndex(idx);
    });
  }, [scrollYProgress]);

  const active = projects[activeIndex];
  const dur = reduced ? 0 : 0.4;

  const mockupSrc = showPhone
    ? (active.phoneImage ?? active.macbookImage ?? "")
    : (active.macbookImage ?? "");

  return (
    <section id="work" className="py-24 relative">
      {/* Section header */}
      <div className="px-6 md:px-12 mb-16 max-w-[1400px] mx-auto">
        <div className="font-mono text-sm text-muted mb-4">01 — The work</div>
        <h2 className="font-display text-4xl sm:text-5xl md:text-7xl text-sand mb-6">
          BUILT TO LAST
        </h2>
        <p className="font-body text-lg text-muted max-w-[700px] leading-relaxed">
          From B2B marketplaces to e-commerce builds, brand identities and
          enterprise audits — every project gets the same obsessive attention I
          give to race day.
        </p>
      </div>

      {/* Scroll stage — each project gets one viewport of scroll distance */}
      <div
        ref={containerRef}
        style={{ height: `${projects.length * 100}vh` }}
        className="relative"
      >
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col md:flex-row">

          {/* ── Mockup panel (top on mobile, left on desktop) ── */}
          <div className="relative flex-none h-[45vh] md:h-full md:w-[55%] bg-ink-2 flex items-center justify-center">

            {/* Scroll progress bar */}
            <motion.div
              style={{ width: progressWidth }}
              className="absolute top-0 left-0 h-[2px] bg-coral origin-left z-10"
            />

            {/* Crossfading mockup image */}
            <AnimatePresence>
              <motion.div
                key={`${activeIndex}-${showPhone ? "phone" : "laptop"}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: dur, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center p-12 md:p-16 lg:p-24"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={mockupSrc}
                    alt={`${active.name} ${showPhone ? "mobile" : "desktop"} mockup`}
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority={activeIndex === 0 && !showPhone}
                    sizes="(max-width: 768px) 100vw, 55vw"
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Project counter — odometer style */}
            <div className="absolute bottom-5 left-5 z-10 flex items-center gap-2 font-mono text-sm text-muted">
              <div className="relative h-5 w-7 overflow-hidden">
                <AnimatePresence initial={false}>
                  <motion.span
                    key={activeIndex}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: dur, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center"
                  >
                    {String(activeIndex + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-ink-3">/</span>
              <span>{String(projects.length).padStart(2, "0")}</span>
            </div>

            {/* Desktop / Mobile view toggle */}
            <div className="absolute bottom-5 right-5 flex gap-1.5 z-10">
              {(["Desktop", "Mobile"] as const).map((label) => {
                const isActive = label === "Desktop" ? !showPhone : showPhone;
                return (
                  <button
                    key={label}
                    onClick={() => setShowPhone(label === "Mobile")}
                    className={`font-mono text-[11px] px-2.5 py-1 border transition-colors ${
                      isActive
                        ? "border-coral text-coral"
                        : "border-ink-3 text-muted hover:border-sand hover:text-sand"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Info panel (bottom on mobile, right on desktop) ── */}
          <div className="relative flex-none h-[55vh] md:h-full md:w-[45%]">

            {/* Progress dots — horizontal on mobile, vertical on desktop */}
            <div className="absolute top-5 right-5 md:top-1/2 md:-translate-y-1/2 md:right-7 flex md:flex-col gap-2 z-10">
              {projects.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-1.5 h-1.5 bg-coral"
                      : "w-1 h-1 bg-ink-3"
                  }`}
                />
              ))}
            </div>

            {/* Crossfading project info */}
            <AnimatePresence>
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: reduced ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -14 }}
                transition={{ duration: dur, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col justify-center overflow-hidden px-8 md:px-12 lg:px-14 pr-14"
              >
                <div className="font-mono text-xs text-muted mb-3 uppercase tracking-widest">
                  {active.role}
                </div>
                <h3 className="font-display text-4xl md:text-5xl lg:text-6xl text-sand mb-4 leading-none uppercase">
                  {active.name}
                </h3>
                <p className="font-body text-base md:text-lg text-coral mb-3 leading-snug">
                  {active.headline}
                </p>
                <p className="font-body text-sm md:text-base text-muted mb-6 leading-relaxed">
                  {active.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {active.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs px-2.5 py-1 bg-ink-2 border border-ink-3 text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {active.url && (
                  <a
                    href={active.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-sm text-coral hover:text-coral-lt transition-colors w-fit"
                  >
                    View project <span aria-hidden="true">→</span>
                  </a>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Route canvas fade-out: gradient overlay that dissolves the fixed canvas before the running section */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-48"
        style={{ background: "linear-gradient(to bottom, transparent, #0E0D0B)" }}
      />
    </section>
  );
}
