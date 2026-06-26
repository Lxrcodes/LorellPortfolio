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

// Each item occupies 55 % of the viewport; slot (item + gap) = 60 %
const ITEM_FRAC = 0.55;
const SLOT_FRAC = 0.60;

export default function ProjectsGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  // Pixel-based calculations require the live viewport width
  const [vpw, setVpw] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1440
  );
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const update = () => setVpw(window.innerWidth);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Coral progress bar
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Track translation: centres item[activeIndex] horizontally in the viewport
  const itemW = vpw * ITEM_FRAC;
  const slotW = vpw * SLOT_FRAC;
  const startX = vpw / 2 - itemW / 2;          // centres item 0
  const endX   = startX - (projects.length - 1) * slotW; // centres last item

  const rawTrackX = useTransform(scrollYProgress, [0, 1], [startX, endX]);
  // Spring adds physical momentum; bypassed when reduced-motion is on
  const springTrackX = useSpring(rawTrackX, { stiffness: 120, damping: 25, mass: 0.8 });
  const trackX = reduced ? rawTrackX : springTrackX;

  // Discrete active-project index derived from scroll
  useEffect(() => {
    return scrollYProgress.on("change", (v: number) => {
      if (isNaN(v)) return;
      setActiveIndex(
        Math.max(0, Math.min(Math.floor(v * projects.length), projects.length - 1))
      );
    });
  }, [scrollYProgress]);

  const active = projects[activeIndex];
  const dur = reduced ? 0 : 0.4;

  // Toggle buttons — rendered on both desktop and mobile
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
        ref={containerRef}
        className="hidden md:block"
        style={{ height: `${projects.length * 100}vh` }}
      >
        <div className="sticky top-0 h-screen flex flex-col overflow-hidden">

          {/* Track — top 55 % of sticky viewport */}
          <div className="relative flex-none h-[55%] overflow-hidden">

            {/* Scroll progress bar */}
            <motion.div
              style={{ width: progressWidth }}
              className="absolute top-0 left-0 h-[2px] bg-coral z-10"
            />

            {/* The sliding track: all mockups in a row, translated horizontally */}
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
                        sizes="60vw"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Odometer counter — bottom-left of track panel */}
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

            {/* Device toggle — bottom-right of track panel */}
            <DeviceToggle className="absolute bottom-4 right-6 z-10" />

            {/* Progress dots — right-centre of track panel */}
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

          {/* Info panel — bottom 45 % of sticky viewport */}
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
          MOBILE — stacked project cards
      ══════════════════════════════════════════ */}
      <div className="md:hidden">
        <div className="flex gap-2 px-6 mb-10">
          <DeviceToggle />
        </div>

        <div className="px-6 space-y-20">
          {projects.map((p) => {
            const src = showPhone
              ? (p.phoneImage ?? p.macbookImage ?? "")
              : (p.macbookImage ?? "");
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0 : 0.6, ease: "easeOut" }}
                viewport={{ once: true, margin: "-80px" }}
              >
                <div className="relative aspect-video mb-6 bg-ink-2 overflow-hidden">
                  <Image
                    src={src}
                    alt={`${p.name} mockup`}
                    fill
                    className="object-contain p-4"
                    sizes="100vw"
                  />
                </div>
                <div className="font-mono text-xs text-muted mb-2 uppercase tracking-widest">
                  {p.role}
                </div>
                <h3 className="font-display text-4xl text-sand mb-3 leading-none uppercase">
                  {p.name}
                </h3>
                <p className="font-body text-base text-coral mb-2 leading-snug">
                  {p.headline}
                </p>
                <p className="font-body text-sm text-muted mb-4 leading-relaxed">
                  {p.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs px-2.5 py-1 bg-ink-2 border border-ink-3 text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-sm text-coral hover:text-coral-lt transition-colors"
                  >
                    View project <span aria-hidden="true">→</span>
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Route canvas fade-out: dissolves fixed canvas before the running section */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-48"
        style={{ background: "linear-gradient(to bottom, transparent, #0E0D0B)" }}
      />
    </section>
  );
}
