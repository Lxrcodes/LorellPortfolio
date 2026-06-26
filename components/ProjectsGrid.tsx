"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
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
  const deskContainerRef = useRef<HTMLDivElement>(null);
  const mobContainerRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [mobActiveIndex, setMobActiveIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [vpw, setVpw] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1440
  );
  const [vph, setVph] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 900
  );
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const update = () => {
      setVpw(window.innerWidth);
      setVph(window.innerHeight);
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── Desktop scroll ──
  const { scrollYProgress } = useScroll({
    target: deskContainerRef,
    offset: ["start start", "end end"],
  });

  // ── Mobile scroll ──
  const { scrollYProgress: mobScrollYProgress } = useScroll({
    target: mobContainerRef,
    offset: ["start start", "end end"],
  });

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const mobProgressWidth = useTransform(mobScrollYProgress, [0, 1], ["0%", "100%"]);

  // ── Desktop horizontal track (adapts to phone/desktop toggle) ──
  const deskItemFrac = showPhone ? 0.35 : 0.55;
  const deskSlotFrac = showPhone ? 0.40 : 0.60;
  const itemW = vpw * deskItemFrac;
  const slotW = vpw * deskSlotFrac;

  // Refs let the callback transform pick up new fracs without re-creating the hook
  const startXRef = useRef(0);
  const endXRef = useRef(0);
  startXRef.current = vpw / 2 - itemW / 2;
  endXRef.current = startXRef.current - (projects.length - 1) * slotW;

  const rawTrackX = useTransform(scrollYProgress, (v) => {
    if (isNaN(v)) return startXRef.current;
    return startXRef.current + (endXRef.current - startXRef.current) * v;
  });
  const springTrackX = useSpring(rawTrackX, { stiffness: 120, damping: 25, mass: 0.8 });
  const trackX = reduced ? rawTrackX : springTrackX;

  // Math.round(v * (N-1)) fires at the visual centre of each slot, not at its edge
  useEffect(() => {
    return scrollYProgress.on("change", (v: number) => {
      if (isNaN(v)) return;
      setActiveIndex(
        Math.max(0, Math.min(Math.round(v * (projects.length - 1)), projects.length - 1))
      );
    });
  }, [scrollYProgress]);

  // ── Mobile vertical track ──
  const mobSlotH = vph * 0.5;
  const mobItemW = vpw * (showPhone ? 0.65 : 0.85);

  const mobEndYRef = useRef(0);
  mobEndYRef.current = -(projects.length - 1) * mobSlotH;

  const rawMobTrackY = useTransform(mobScrollYProgress, (v) => {
    if (isNaN(v)) return 0;
    return mobEndYRef.current * v;
  });
  const springMobTrackY = useSpring(rawMobTrackY, { stiffness: 120, damping: 25, mass: 0.8 });
  const mobTrackY = reduced ? rawMobTrackY : springMobTrackY;

  useEffect(() => {
    return mobScrollYProgress.on("change", (v: number) => {
      if (isNaN(v)) return;
      setMobActiveIndex(
        Math.max(0, Math.min(Math.round(v * (projects.length - 1)), projects.length - 1))
      );
    });
  }, [mobScrollYProgress]);

  const active = projects[activeIndex];
  const mobActive = projects[mobActiveIndex];
  const dur = reduced ? 0 : 0.4;

  const DeviceToggle = ({ className = "" }: { className?: string }) => (
    <div className={`flex gap-1.5 ${className}`}>
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
  );

  return (
    <section id="work" className="py-24 relative">

      {/* ── Section header ── */}
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

      {/* ══════════════════════════════════════════
          DESKTOP — horizontal sliding track
      ══════════════════════════════════════════ */}
      <div
        ref={deskContainerRef}
        className="hidden md:block"
        style={{ height: `${projects.length * 100}vh` }}
      >
        <div className="sticky top-0 h-screen flex flex-col overflow-hidden">

          {/* Track — top 55% of sticky viewport */}
          <div className="relative flex-none h-[55%] overflow-hidden">

            <motion.div
              style={{ width: progressWidth }}
              className="absolute top-0 left-0 h-[2px] bg-coral z-10"
            />

            <motion.div
              style={{ x: trackX, gap: `${slotW - itemW}px` }}
              className="absolute inset-y-0 left-0 flex items-center"
            >
              {projects.map((p, i) => {
                const dist = Math.abs(i - activeIndex);
                const src = showPhone
                  ? (p.phoneImage ?? p.macbookImage ?? "")
                  : (p.macbookImage ?? "");

                return (
                  <motion.div
                    key={p.id}
                    animate={{
                      opacity: dist === 0 ? 1 : dist === 1 ? 0.4 : 0.18,
                      scale:   dist === 0 ? 1 : dist === 1 ? 0.88 : 0.76,
                    }}
                    transition={{ duration: dur, ease: "easeOut" }}
                    style={{ width: `${itemW}px`, flexShrink: 0 }}
                    className="relative h-full py-8"
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={src}
                        alt={`${p.name} ${showPhone ? "mobile" : "desktop"} mockup`}
                        fill
                        className="object-contain drop-shadow-2xl"
                        priority={i === 0}
                        sizes={showPhone ? "35vw" : "55vw"}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Odometer counter */}
            <div className="absolute bottom-4 left-6 z-10 flex items-center gap-2 font-mono text-sm text-muted">
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

            <DeviceToggle className="absolute bottom-4 right-6 z-10" />

            {/* Progress dots */}
            <div className="absolute top-1/2 -translate-y-1/2 right-6 flex flex-col gap-2 z-10">
              {projects.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex ? "w-1.5 h-1.5 bg-coral" : "w-1 h-1 bg-ink-3"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Info panel — bottom 45% */}
          <div className="relative flex-none h-[45%] border-t border-ink-3/40">
            <AnimatePresence>
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -12 }}
                transition={{ duration: dur, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col justify-center overflow-hidden px-10 md:px-14 lg:px-20 pr-24"
              >
                <div className="font-mono text-xs text-muted mb-2 uppercase tracking-widest">
                  {active.role}
                </div>
                <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-sand mb-3 leading-none uppercase">
                  {active.name}
                </h3>
                <p className="font-body text-base text-coral mb-2 leading-snug">
                  {active.headline}
                </p>
                <p className="font-body text-sm text-muted mb-4 leading-relaxed line-clamp-3">
                  {active.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
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

      {/* ══════════════════════════════════════════
          MOBILE — vertical sliding track
      ══════════════════════════════════════════ */}
      <div
        ref={mobContainerRef}
        className="md:hidden"
        style={{ height: `${projects.length * 100}vh` }}
      >
        <div className="sticky top-0 h-screen flex flex-col overflow-hidden">

          {/* Mockup area — top 50% */}
          <div className="relative flex-none h-[50%] overflow-hidden">

            <motion.div
              style={{ width: mobProgressWidth }}
              className="absolute top-0 left-0 h-[2px] bg-coral z-10"
            />

            {/* Progress dots — horizontal row at top */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-row gap-2 z-10">
              {projects.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === mobActiveIndex ? "w-1.5 h-1.5 bg-coral" : "w-1 h-1 bg-ink-3"
                  }`}
                />
              ))}
            </div>

            {/* Vertical sliding track */}
            <motion.div
              style={{ y: mobTrackY }}
              className="absolute inset-x-0 top-0 flex flex-col"
            >
              {projects.map((p, i) => {
                const dist = Math.abs(i - mobActiveIndex);
                const src = showPhone
                  ? (p.phoneImage ?? p.macbookImage ?? "")
                  : (p.macbookImage ?? "");

                return (
                  <motion.div
                    key={p.id}
                    animate={{
                      opacity: dist === 0 ? 1 : dist === 1 ? 0.35 : 0.15,
                      scale:   dist === 0 ? 1 : dist === 1 ? 0.90 : 0.78,
                    }}
                    transition={{ duration: dur, ease: "easeOut" }}
                    style={{ height: `${mobSlotH}px`, flexShrink: 0 }}
                    className="flex items-center justify-center"
                  >
                    <div
                      className="relative"
                      style={{
                        width: `${mobItemW}px`,
                        height: `${mobSlotH * 0.86}px`,
                      }}
                    >
                      <Image
                        src={src}
                        alt={`${p.name} ${showPhone ? "mobile" : "desktop"} mockup`}
                        fill
                        className="object-contain drop-shadow-2xl"
                        priority={i === 0}
                        sizes={showPhone ? "65vw" : "85vw"}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Odometer */}
            <div className="absolute bottom-3 left-4 z-10 flex items-center gap-2 font-mono text-sm text-muted">
              <div className="relative h-5 w-7 overflow-hidden">
                <AnimatePresence initial={false}>
                  <motion.span
                    key={mobActiveIndex}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: dur, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center"
                  >
                    {String(mobActiveIndex + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-ink-3">/</span>
              <span>{String(projects.length).padStart(2, "0")}</span>
            </div>

            <DeviceToggle className="absolute bottom-3 right-4 z-10" />
          </div>

          {/* Info panel — bottom 50% */}
          <div className="relative flex-none h-[50%] border-t border-ink-3/40">
            <AnimatePresence>
              <motion.div
                key={mobActiveIndex}
                initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -12 }}
                transition={{ duration: dur, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col justify-center overflow-hidden px-6 py-6"
              >
                <div className="font-mono text-xs text-muted mb-2 uppercase tracking-widest">
                  {mobActive.role}
                </div>
                <h3 className="font-display text-3xl text-sand mb-2 leading-none uppercase">
                  {mobActive.name}
                </h3>
                <p className="font-body text-sm text-coral mb-2 leading-snug">
                  {mobActive.headline}
                </p>
                <p className="font-body text-xs text-muted mb-3 leading-relaxed line-clamp-2">
                  {mobActive.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {mobActive.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs px-2 py-0.5 bg-ink-2 border border-ink-3 text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {mobActive.url && (
                  <a
                    href={mobActive.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-sm text-coral hover:text-coral-lt transition-colors"
                  >
                    View project <span aria-hidden="true">→</span>
                  </a>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Route canvas fade-out */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-48"
        style={{ background: "linear-gradient(to bottom, transparent, #0E0D0B)" }}
      />
    </section>
  );
}
