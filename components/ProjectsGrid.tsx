"use client";

import ProjectCard from "./ProjectCard";
import { projects } from "@/lib/projects";

export default function ProjectsGrid() {
  const featured = projects.find((p) => p.featured);
  const regularProjects = projects.filter((p) => !p.featured);

  return (
    <section id="work" className="px-6 md:px-12 py-24">
      <div className="max-w-[1400px] mx-auto">
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
