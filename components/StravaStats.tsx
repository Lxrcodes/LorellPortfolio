"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface StravaStatsProps {
  totalKm: number | null;
  totalRuns: number | null;
  longestRunKm: string | null;
  consecutiveWeeks: number | null;
  best5k: string;
  best10k: string;
  bestHalfMarathon: string;
  bestMarathon: string;
  marathonGoal: string;
  loading?: boolean;
  error?: boolean;
}

interface StatCardProps {
  value: string | number;
  label: string;
  subtitle?: string;
  isNumber?: boolean;
  delay?: number;
  accentSubtitle?: boolean;
}

function StatCard({
  value,
  label,
  subtitle,
  isNumber = false,
  delay = 0,
  accentSubtitle = false,
}: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState(isNumber ? 0 : value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: delay * 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      if (isNumber && !hasAnimated.current) {
        ScrollTrigger.create({
          trigger: cardRef.current,
          start: "top 85%",
          onEnter: () => {
            if (hasAnimated.current) return;
            hasAnimated.current = true;

            const numValue = typeof value === "number" ? value : parseFloat(String(value));
            if (isNaN(numValue)) return;

            const obj = { val: 0 };
            gsap.to(obj, {
              val: numValue,
              duration: 1.2,
              ease: "power3.out",
              onUpdate: () => {
                setDisplayValue(
                  numValue >= 100 ? Math.round(obj.val) : obj.val.toFixed(1)
                );
              },
            });
          },
        });
      }
    });

    return () => ctx.revert();
  }, [value, isNumber, delay]);

  return (
    <div ref={cardRef} className="bg-ink-2 border border-ink-3 p-6 opacity-0">
      <div className="font-mono text-xs text-muted mb-2 uppercase tracking-wider">
        {label}
      </div>
      <div className="font-display text-4xl md:text-5xl text-sand mb-2">
        {displayValue}
      </div>
      {subtitle && (
        <div className={`font-mono text-xs ${accentSubtitle ? "text-coral" : "text-muted"}`}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

export default function StravaStats({
  totalKm,
  totalRuns,
  longestRunKm,
  consecutiveWeeks,
  best5k,
  best10k,
  bestHalfMarathon,
  bestMarathon,
  marathonGoal,
  loading = false,
  error = false,
}: StravaStatsProps) {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  if (loading) {
    return (
      <section className="px-6 md:px-12 py-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-ink-2 border border-ink-3 p-6 animate-pulse">
                <div className="h-3 bg-ink-3 rounded w-20 mb-4" />
                <div className="h-12 bg-ink-3 rounded w-24 mb-2" />
                <div className="h-2 bg-ink-3 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-12 py-16">
      <div className="max-w-[1400px] mx-auto">
        {/* Strava header */}
        <div ref={headerRef} className="flex items-center gap-4 mb-8 opacity-0">
          <div className="w-8 h-8 bg-[#FC4C02] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
          </div>
          <span className="font-mono text-sm text-muted">Live training data</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green rounded-full animate-green-pulse" />
            <span className="font-mono text-xs text-green">Connected</span>
          </div>
        </div>

        {/* Row 1: Live stats from Strava */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StatCard
            label="Total distance"
            value={error ? "—" : totalKm ?? 0}
            subtitle="km all time"
            isNumber={!error && totalKm !== null}
            delay={0}
          />
          <StatCard
            label="Total runs"
            value={error ? "—" : totalRuns ?? 0}
            subtitle="all time"
            isNumber={!error && totalRuns !== null}
            delay={1}
          />
          <StatCard
            label="Longest run"
            value={error ? "—" : longestRunKm ?? "0"}
            subtitle="km"
            isNumber={false}
            delay={2}
          />
          <StatCard
            label="Run streak"
            value={error ? "—" : consecutiveWeeks ?? 0}
            subtitle="consecutive weeks"
            isNumber={!error && consecutiveWeeks !== null}
            delay={3}
          />
        </div>

        {/* Row 2: Personal bests */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Best 5K"
            value={best5k}
            subtitle="personal best"
            delay={4}
            accentSubtitle
          />
          <StatCard
            label="Best 10K"
            value={best10k}
            subtitle="personal best"
            delay={5}
            accentSubtitle
          />
          <StatCard
            label="Best Half"
            value={bestHalfMarathon}
            subtitle="21.1km"
            delay={6}
            accentSubtitle
          />
          <StatCard
            label="Best Marathon"
            value={bestMarathon}
            subtitle={marathonGoal}
            delay={7}
            accentSubtitle
          />
        </div>

        {error && (
          <p className="font-mono text-xs text-muted mt-4">
            Unable to load live Strava data. Showing personal bests only.
          </p>
        )}
      </div>
    </section>
  );
}
