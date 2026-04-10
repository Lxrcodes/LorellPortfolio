"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/lib/projects";

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
  delay?: number;
}

export default function ProjectCard({
  project,
  featured = false,
  delay = 0,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
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

  const ProjectImage = () => {
    if (!project.image || imageError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-ink-3">
          <div className="text-center">
            <div className="font-display text-4xl text-ink-3 mb-2">
              {project.name.charAt(0)}
            </div>
            <span className="font-mono text-xs text-muted">
              {project.name}
            </span>
          </div>
        </div>
      );
    }

    return (
      <Image
        src={project.image}
        alt={`${project.name} project screenshot`}
        fill
        className="object-cover object-top"
        onError={() => setImageError(true)}
      />
    );
  };

  return (
    <div
      ref={cardRef}
      className={`bg-ink-2 border border-ink-3 p-6 md:p-8 opacity-0 ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      {featured ? (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Copy side */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs text-muted mb-3">
                {project.role}
              </div>
              <h3 className="font-display text-4xl md:text-5xl text-sand mb-4">
                {project.name}
              </h3>
              <p className="font-body text-lg text-coral mb-4">
                {project.headline}
              </p>
              <p className="font-body text-muted mb-6">{project.description}</p>
            </div>
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs px-3 py-1 bg-ink-3 text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {project.status && (
                <div className="font-mono text-xs text-coral mb-4">
                  {project.status}
                </div>
              )}
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-mono text-sm text-coral hover:text-coral-lt transition-colors"
                >
                  View project →
                </a>
              )}
            </div>
          </div>
          {/* Visual side */}
          <div className="relative aspect-video md:aspect-auto md:min-h-[300px] overflow-hidden bg-ink-3">
            <ProjectImage />
          </div>
        </div>
      ) : (
        <>
          {/* Project image for regular cards */}
          <div className="relative aspect-video mb-6 overflow-hidden bg-ink-3">
            <ProjectImage />
          </div>
          <div className="font-mono text-xs text-muted mb-3">{project.role}</div>
          <h3 className="font-display text-3xl md:text-4xl text-sand mb-3">
            {project.name}
          </h3>
          <p className="font-body text-coral mb-3">{project.headline}</p>
          <p className="font-body text-sm text-muted mb-6">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-xs px-2 py-1 bg-ink-3 text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 font-mono text-xs text-coral hover:text-coral-lt transition-colors"
            >
              View project →
            </a>
          )}
        </>
      )}
    </div>
  );
}
