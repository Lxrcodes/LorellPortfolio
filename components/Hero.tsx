"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const WORDS = ["Developer", "Founder", "Runner", "Builder", "Maker"];
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function Hero() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayWord, setDisplayWord] = useState(WORDS[0]);
  const [isScrambling, setIsScrambling] = useState(false);
  const tagRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  // Kinetic word scramble effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsScrambling(true);
      const nextIndex = (currentWordIndex + 1) % WORDS.length;
      const targetWord = WORDS[nextIndex].toUpperCase();
      let iteration = 0;
      const maxIterations = 10;

      const scrambleInterval = setInterval(() => {
        setDisplayWord(
          targetWord
            .split("")
            .map((char, index) => {
              if (index < iteration) {
                return targetWord[index];
              }
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );

        iteration += 1 / 3;

        if (iteration >= targetWord.length) {
          clearInterval(scrambleInterval);
          setDisplayWord(targetWord);
          setCurrentWordIndex(nextIndex);
          setIsScrambling(false);
        }
      }, 30);
    }, 2400);

    return () => clearInterval(interval);
  }, [currentWordIndex]);

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        tagRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 }
      )
        .fromTo(
          nameRef.current,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1 },
          "-=0.4"
        )
        .fromTo(
          roleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.5"
        )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        )
        .fromTo(
          scrollHintRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.8 },
          "-=0.2"
        );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-end pb-24 px-6 md:px-12">
      {/* Tag line */}
      <div
        ref={tagRef}
        className="absolute top-28 left-6 md:left-12 font-mono text-sm text-coral opacity-0"
      >
        London-based · Available for projects
      </div>

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto w-full">
        {/* Display name */}
        <h1
          ref={nameRef}
          className="font-display text-[20vw] md:text-[13vw] leading-[0.85] text-sand mb-4 opacity-0"
        >
          LORELL
        </h1>

        {/* Kinetic word */}
        <div
          ref={roleRef}
          className="font-display text-4xl md:text-6xl text-sand mb-8 opacity-0"
        >
          I am a{" "}
          <span
            className={`text-coral transition-opacity duration-100 ${isScrambling ? "opacity-80" : "opacity-100"}`}
          >
            {displayWord}
          </span>
        </div>

        {/* Subheading */}
        <p
          ref={subRef}
          className="font-body text-lg md:text-xl text-muted max-w-2xl mb-12 opacity-0"
        >
          I build things that go the distance — for clients who need more than
          just a developer. You get someone who&apos;s founded a startup, run
          marathons, and shipped across four continents.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex flex-wrap gap-4 opacity-0">
          <a
            href="#work"
            className="inline-flex items-center justify-center px-8 py-4 bg-coral text-ink font-mono text-sm hover:bg-coral-lt transition-colors"
          >
            See the work
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-8 py-4 border border-sand text-sand font-mono text-sm hover:border-coral hover:text-coral transition-colors"
          >
            Let&apos;s talk
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        ref={scrollHintRef}
        className="absolute bottom-12 right-6 md:right-12 flex flex-col items-center gap-3 opacity-0"
      >
        <div className="w-[1px] h-12 bg-coral animate-scroll-line" />
        <span className="font-mono text-xs text-muted writing-mode-vertical rotate-180 tracking-wider"
          style={{ writingMode: "vertical-rl" }}>
          Scroll to run
        </span>
      </div>
    </section>
  );
}
