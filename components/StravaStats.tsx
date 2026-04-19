"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface StravaStatsProps {
  totalKm: number | null;
  totalRuns: number | null;
  best5k: string;
  best10k: string;
  bestHalfMarathon: string;
  bestMarathon: string;
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

const CHARS = "0123456789:";

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

const LABEL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Cycling best efforts card with scramble animation
function CyclingBestEffortCard({
  efforts,
  delay = 0,
}: {
  efforts: { label: string; time: string; distance: string }[];
  delay?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayTime, setDisplayTime] = useState(efforts[0].time);
  const [displayLabel, setDisplayLabel] = useState(efforts[0].label);
  const [displaySubtitle, setDisplaySubtitle] = useState(efforts[0].distance);
  const [isScrambling, setIsScrambling] = useState(false);
  const [progress, setProgress] = useState(100);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);

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
    });

    return () => ctx.revert();
  }, [delay]);

  // Start countdown, then scramble, then restart
  useEffect(() => {
    const countdownDuration = 3000;
    const countdownInterval = 30;
    const step = (countdownInterval / countdownDuration) * 100;

    const startCountdown = () => {
      setProgress(100);

      progressTimerRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - step;
          if (newProgress <= 0) {
            // Stop countdown at 0
            if (progressTimerRef.current) {
              clearInterval(progressTimerRef.current);
            }
            // Start scramble animation
            runScramble();
            return 0;
          }
          return newProgress;
        });
      }, countdownInterval);
    };

    const runScramble = () => {
      setIsScrambling(true);
      const nextIndex = (currentIndexRef.current + 1) % efforts.length;
      const targetTime = efforts[nextIndex].time;
      const targetLabel = efforts[nextIndex].label;
      const targetSubtitle = efforts[nextIndex].distance;
      let iteration = 0;
      const maxIterations = Math.max(targetTime.length, targetLabel.length, targetSubtitle.length);

      const scrambleInterval = setInterval(() => {
        setDisplayTime(
          targetTime
            .split("")
            .map((char, index) => {
              if (char === ":") return ":";
              if (index < iteration) return targetTime[index];
              return CHARS[Math.floor(Math.random() * 10)];
            })
            .join("")
        );

        setDisplayLabel(
          targetLabel
            .split("")
            .map((char, index) => {
              if (index < iteration) return targetLabel[index];
              return LABEL_CHARS[Math.floor(Math.random() * LABEL_CHARS.length)];
            })
            .join("")
        );

        setDisplaySubtitle(
          targetSubtitle
            .split("")
            .map((char, index) => {
              if (char === "." || char === "k" || char === "m") {
                if (index < iteration) return targetSubtitle[index];
                return char;
              }
              if (index < iteration) return targetSubtitle[index];
              return CHARS[Math.floor(Math.random() * 10)];
            })
            .join("")
        );

        iteration += 0.5;

        if (iteration >= maxIterations) {
          clearInterval(scrambleInterval);
          setDisplayTime(targetTime);
          setDisplayLabel(targetLabel);
          setDisplaySubtitle(targetSubtitle);
          currentIndexRef.current = nextIndex;
          setCurrentIndex(nextIndex);
          setIsScrambling(false);
          // Restart countdown after scramble completes
          startCountdown();
        }
      }, 40);
    };

    startCountdown();

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []); // Only run once on mount

  return (
    <div ref={cardRef} className="bg-ink-2 border border-ink-3 p-6 opacity-0 relative overflow-hidden">
      <div
        className={`font-mono text-xs text-muted mb-2 uppercase tracking-wider transition-opacity duration-100 ${
          isScrambling ? "opacity-80" : "opacity-100"
        }`}
      >
        <span className="block md:inline">Best</span>
        <span className="md:ml-1">{displayLabel}</span>
      </div>
      <div
        className={`font-display md:text-5xl text-sand mb-2 transition-opacity duration-100 ${
          isScrambling ? "opacity-80" : "opacity-100"
        } ${
          (displayTime.match(/:/g) || []).length >= 2 ? "text-2xl sm:text-4xl" : "text-4xl"
        }`}
      >
        {displayTime}
      </div>
      <div
        className={`font-mono text-xs text-coral transition-opacity duration-100 ${
          isScrambling ? "opacity-80" : "opacity-100"
        }`}
      >
        {displaySubtitle}
      </div>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-ink-3">
        <div
          className="h-full bg-coral"
          style={{ width: `${progress}%`, transition: isScrambling ? "none" : "width 30ms linear" }}
        />
      </div>
    </div>
  );
}

export default function StravaStats({
  totalKm,
  totalRuns,
  best5k,
  best10k,
  bestHalfMarathon,
  bestMarathon,
  loading = false,
  error = false,
}: StravaStatsProps) {
  const headerRef = useRef<HTMLDivElement>(null);

  const bestEfforts = [
    { label: "5K", time: best5k, distance: "5km" },
    { label: "10K", time: best10k, distance: "10km" },
    { label: "Half", time: bestHalfMarathon, distance: "21.1km" },
    { label: "Marathon", time: bestMarathon, distance: "42.2km" },
  ];

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
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
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

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Total distance"
            value={error ? "—" : totalKm ?? 0}
            subtitle="km all time"
            isNumber={!error && totalKm !== null}
            delay={0}
          />
          <CyclingBestEffortCard efforts={bestEfforts} delay={1} />
          <StatCard
            label="Total runs"
            value={error ? "—" : totalRuns ?? 0}
            subtitle="all time"
            isNumber={!error && totalRuns !== null}
            delay={2}
          />
        </div>

        {error && (
          <p className="font-mono text-xs text-muted mt-4">
            Unable to load some live Strava data.
          </p>
        )}
      </div>
    </section>
  );
}
