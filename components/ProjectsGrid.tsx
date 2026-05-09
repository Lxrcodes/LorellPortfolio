"use client";

import ProjectCard from "./ProjectCard";
import { projects } from "@/lib/projects";

export default function ProjectsGrid() {
  const featured = projects.find((p) => p.featured);
  const regularProjects = projects.filter((p) => !p.featured);

  return (
    <section id="work" className="px-6 md:px-12 py-24">
      <div className="max-w-[1400px] mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <div className="font-mono text-sm text-muted mb-4">01 — The work</div>
          <h2 className="font-display text-5xl md:text-7xl text-sand mb-6">BUILT TO LAST</h2>
          <p className="font-body text-lg text-muted max-w-[700px] leading-relaxed">
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
