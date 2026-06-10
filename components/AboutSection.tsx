"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const trigger = {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none reverse",
      };

      gsap.fromTo(
        photoRef.current,
        { opacity: 0, x: -60, scale: 0.96, filter: "blur(10px)" },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.3,
          ease: "power4.out",
          scrollTrigger: trigger,
        }
      );

      gsap.fromTo(
        textRef.current,
        { opacity: 0, x: 60, scale: 0.97, filter: "blur(10px)" },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.3,
          delay: 0.1,
          ease: "power4.out",
          scrollTrigger: trigger,
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="px-6 md:px-12 py-24">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">

          {/* Photo */}
          <div ref={photoRef} className="opacity-0">
            <div className="relative aspect-[3/4] max-w-sm mx-auto md:mx-0 overflow-hidden">
              <Image
                src="/images/me/lorell_celebrate.JPG"
                alt="Lorell Scott"
                fill
                className="object-cover"
                style={{ objectPosition: "center 20%" }}
              />
              {/* Coral accent border */}
              <div className="absolute bottom-0 left-0 w-16 h-1 bg-coral" />
            </div>
          </div>

          {/* Text */}
          <div ref={textRef} className="opacity-0">
            <div className="font-mono text-xs text-coral mb-4 uppercase tracking-widest">
              About
            </div>
            <h2 className="font-display text-5xl md:text-6xl text-sand mb-6 leading-tight">
              DEVELOPER.<br />FOUNDER.<br />RUNNER.
            </h2>
            <div className="space-y-4 font-body text-muted text-lg">
              <p>
                I&apos;m Lorell — a London-based developer and founder who builds
                digital products that actually work. From B2B marketplaces to
                e-commerce stores, client portals to fleet management tools, I
                take projects from idea to launch with the same relentlessness
                I bring to marathon day.
              </p>
              <p>
                I also co-founded TipperConnect, the UK&apos;s first two-sided
                marketplace for construction waste haulage — handling everything
                from developing the app to Stripe Connect integrations and
                DEFRA compliance APIs.
              </p>
              <p>
                Outside of building, I also run. Three marathons in, with a 3:40
                personal best. The discipline it takes to train through early
                mornings and bad weather is the same discipline I bring to every
                client project.
              </p>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-3 gap-4 mt-10 pt-10 border-t border-ink-3">
              <div>
                <div className="font-display text-3xl text-coral">3</div>
                <div className="font-mono text-xs text-muted mt-1">Marathons run</div>
              </div>
              <div>
                <div className="font-display text-3xl text-coral">3:40</div>
                <div className="font-mono text-xs text-muted mt-1">Marathon PB</div>
              </div>
              <div>
                <div className="font-display text-3xl text-coral">10+</div>
                <div className="font-mono text-xs text-muted mt-1">Projects shipped</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
