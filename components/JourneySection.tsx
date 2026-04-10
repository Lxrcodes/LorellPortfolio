"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface JourneySectionProps {
  number: string;
  label: string;
  heading: string;
  body: string;
  id?: string;
}

export default function JourneySection({
  number,
  label,
  heading,
  body,
  id,
}: JourneySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id={id}
      className="min-h-screen flex items-center px-6 md:px-12 py-24"
    >
      <div ref={contentRef} className="max-w-[700px] opacity-0">
        <div className="font-mono text-sm text-muted mb-6">
          {number} — {label}
        </div>
        <h2 className="font-display text-5xl md:text-7xl text-sand mb-8">
          {heading}
        </h2>
        <p className="font-body text-lg md:text-xl text-muted leading-relaxed">
          {body}
        </p>
      </div>
    </section>
  );
}
