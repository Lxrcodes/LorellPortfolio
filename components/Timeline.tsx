"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface TimelineItem {
  period: string;
  role: string;
  company: string;
  description: string;
  active?: boolean;
}

const timelineData: TimelineItem[] = [
  {
    period: "2026–Present",
    role: "Founder & CEO",
    company: "TipperConnect",
    description:
      "Building the UK's first construction haulage marketplace from zero — product, tech, sales and go-to-market.",
    active: true,
  },
  {
    period: "2025–Present",
    role: "Freelance Web Developer",
    company: "Independent",
    description:
      "E-commerce, landing pages, audits and full-stack builds for clients across London and beyond.",
    active: true,
  },
  {
    period: "2021–2025",
    role: "Software Engineer",
    company: "Vodafone",
    description:
      "Four years building internal tools and customer-facing features at enterprise scale across UK and European teams.",
    active: false,
  },
];

export default function Timeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      itemRefs.current.forEach((item, index) => {
        if (!item) return;

        gsap.fromTo(
          item,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            delay: index * 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="px-6 md:px-12 py-24"
    >
      <div className="max-w-[640px] mx-auto">
        {/* Section header */}
        <div className="mb-12">
          <div className="font-mono text-sm text-muted mb-4">
            03 — Experience
          </div>
          <h2 className="font-display text-5xl md:text-6xl text-sand">
            THE JOURNEY
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[5px] top-0 bottom-0 w-[1px] bg-ink-3" />

          {/* Items */}
          <div className="space-y-12">
            {timelineData.map((item, index) => (
              <div
                key={item.period}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className="relative pl-10 opacity-0"
              >
                {/* Dot */}
                <div
                  className={`absolute left-0 top-2 w-[11px] h-[11px] rounded-full border-2 ${
                    item.active
                      ? "bg-coral border-coral"
                      : "bg-ink border-muted"
                  }`}
                />

                {/* Content */}
                <div className="font-mono text-xs text-muted mb-2">
                  {item.period}
                </div>
                <div className="flex flex-wrap items-baseline gap-2 mb-2">
                  <h3 className="font-display text-2xl text-sand">
                    {item.role}
                  </h3>
                  <span className="font-mono text-sm text-coral">
                    {item.company}
                  </span>
                </div>
                <p className="font-body text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
