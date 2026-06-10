"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectCard from "./ProjectCard";
import { projects } from "@/lib/projects";

export default function ProjectsGrid() {
  const featured = projects.find((p) => p.featured);
  const regularProjects = projects.filter((p) => !p.featured);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (!headerRef.current) return;
      const children = Array.from(headerRef.current.children);

      gsap.fromTo(
        children,
        { opacity: 0, y: 60, filter: "blur(10px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.2,
          stagger: 0.12,
          ease: "power4.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="work" className="px-6 md:px-12 py-24">
      <div className="max-w-[1400px] mx-auto">
        {/* Section header */}
        <div ref={headerRef} className="mb-16">
          <div className="font-mono text-sm text-muted mb-4 opacity-0">01 — The work</div>
          <h2 className="font-display text-5xl md:text-7xl text-sand mb-6 opacity-0">BUILT TO LAST</h2>
          <p className="font-body text-lg text-muted max-w-[700px] leading-relaxed opacity-0">
            From co-founding a B2B marketplace to e-commerce builds, brand identities and enterprise audits — every project gets the same obsessive attention I give to race day. No half-measures.
          </p>
        </div>

        {/* Featured project */}
        {featured && (
          <div className="mb-8">
            <ProjectCard project={featured} featured delay={0} />
          </div>
        )}

        {/* Regular projects grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {regularProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              delay={index + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
