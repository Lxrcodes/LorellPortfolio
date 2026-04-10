"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function FinishSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const tapeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        tapeRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: "power3.out" }
      ).fromTo(
        contentRef.current?.children || [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
        },
        "-=0.4"
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="min-h-screen flex flex-col justify-center px-6 md:px-12 py-24 relative"
    >
      {/* Checkered tape */}
      <div
        ref={tapeRef}
        className="absolute top-0 left-0 right-0 h-8 flex origin-left"
        style={{ transform: "scaleX(0)" }}
      >
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-full ${
              i % 2 === 0 ? "bg-sand" : "bg-coral"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div ref={contentRef} className="max-w-[800px] mx-auto text-center">
        {/* Label */}
        <div className="font-mono text-sm text-muted mb-6 opacity-0">
          Mile 26.2 — The finish line
        </div>

        {/* Heading */}
        <h2 className="font-display text-6xl md:text-8xl text-sand mb-8 opacity-0">
          LET&apos;S BUILD SOMETHING.
        </h2>

        {/* Availability badge */}
        <div className="inline-flex items-center gap-3 px-4 py-2 border border-ink-3 mb-8 opacity-0">
          <div className="w-2 h-2 bg-green rounded-full animate-green-pulse" />
          <span className="font-mono text-sm text-sand">
            Available for new projects
          </span>
        </div>

        {/* Subtext */}
        <p className="font-body text-lg text-muted max-w-xl mx-auto mb-12 opacity-0">
          Got a project that needs someone who ships? I take on a small number
          of clients at a time and work closely with each one. No handoffs, no
          black box.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4 opacity-0">
          <a
            href="mailto:hello@lorell.dev"
            className="inline-flex items-center justify-center px-8 py-4 bg-coral text-ink font-mono text-sm hover:bg-coral-lt transition-colors"
          >
            hello@lorell.dev
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center px-8 py-4 border border-sand text-sand font-mono text-sm hover:border-coral hover:text-coral transition-colors"
          >
            Download CV
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} Lorell. Built with Next.js.
        </p>
      </div>
    </section>
  );
}
