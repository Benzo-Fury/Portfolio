import Section from "../Section";
import type { Project } from "../../content";

type Props = {
  registerRef: (index: number) => (el: HTMLElement | null) => void;
  projects: Project[];
};

function ProjectsSection({ registerRef, projects }: Props) {
  return (
    <Section
      id="projects"
      index={1}
      registerRef={registerRef}
      className="min-h-screen py-20 sm:py-32 opacity-0"
    >
      <div className="space-y-12 sm:space-y-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl font-light">Projects</h2>
          <div className="text-sm text-muted-foreground font-mono">
            2020 — 2025
          </div>
        </div>

        <div className="space-y-8 sm:space-y-12">
          {projects.map((item, index) => (
            <ProjectItem key={index} item={item} />
          ))}
        </div>
      </div>
    </Section>
  );
}

export function ProjectItem({ item }: { item: Project }) {
  return (
    <div className="group grid lg:grid-cols-12 gap-4 sm:gap-8 py-6 sm:py-8 border-b border-border/50 hover:border-border transition-colors duration-500">
      <div className="lg:col-span-2">
        <div className="text-xl sm:text-2xl font-light text-muted-foreground group-hover:text-foreground transition-colors duration-500">
          {item.year}
        </div>
      </div>

      <div className="lg:col-span-6 space-y-3">
        <div>
          <h3 className="text-lg sm:text-xl font-medium">{item.name}</h3>
        </div>
        <p className="text-muted-foreground leading-relaxed max-w-lg">
          {item.description}
        </p>
      </div>

      <div className="lg:col-span-4 flex flex-wrap gap-2 lg:justify-end mt-2 lg:mt-0">
        {item.tech.map((tech) => (
          <span
            key={tech}
            className="px-2 py-1 text-xs text-muted-foreground rounded group-hover:border-muted-foreground/50 transition-colors duration-500"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ProjectsSection;
