import { useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import Section from "../Section";
import DecodeText from "../effects/DecodeText";
import Reveal from "../effects/Reveal";
import CountUp from "../effects/CountUp";
import Collapse from "../effects/Collapse";
import ImageLightbox from "../effects/ImageLightbox";
import type { Project } from "../../content";
import { cn } from "../../lib/utils";

type Props = {
  registerRef: (index: number) => (el: HTMLElement | null) => void;
  projects: Project[];
};

/** Projects as an accordion: one row open at a time. */
function ProjectsSection({ registerRef, projects }: Props) {
  const [openName, setOpenName] = useState<string | null>(null);

  return (
    <Section
      id="projects"
      index={1}
      registerRef={registerRef}
      className="py-20 sm:py-32"
    >
      <div className="space-y-12 sm:space-y-16">
        <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl font-light">
            <DecodeText text="Projects" />
          </h2>
          <div className="text-sm text-muted-foreground font-mono">
            2020 — 2026
          </div>
        </Reveal>

        <div className="space-y-8 sm:space-y-12">
          {projects.map((item) => (
            <ProjectItem
              key={item.name}
              item={item}
              open={openName === item.name}
              onToggle={() => setOpenName((current) => (current === item.name ? null : item.name))}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}

type ProjectItemProps = {
  item: Project;
  open: boolean;
  onToggle: () => void;
};

/**
 * One project row. The name is the toggle button, stretched over the whole
 * header so the row is clickable anywhere, while staying a single tab stop.
 */
export function ProjectItem({ item, open, onToggle }: ProjectItemProps) {
  const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const buttonId = `project-${slug}-toggle`;
  const panelId = `project-${slug}-details`;

  return (
    <div
      className={cn(
        "border-b transition-colors duration-500",
        open ? "border-border" : "border-border/50 hover:border-border",
      )}
    >
      <Reveal stagger className="group relative grid lg:grid-cols-12 gap-4 sm:gap-8 py-6 sm:py-8">
        <div className="lg:col-span-2">
          <CountUp
            value={Number(item.year)}
            className={cn(
              "block text-xl sm:text-2xl font-light transition-colors duration-500",
              open ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
            )}
          />
        </div>

        <div className="lg:col-span-6 space-y-3">
          <h3 className="text-lg sm:text-xl font-medium">
            <button
              id={buttonId}
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={onToggle}
              className="flex cursor-pointer items-center gap-2 text-left outline-none after:absolute after:-inset-x-2 after:inset-y-1 after:rounded-lg after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-ring"
            >
              {item.name}
              <Plus
                aria-hidden="true"
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:text-foreground",
                  open && "rotate-45 text-foreground",
                )}
              />
            </button>
          </h3>
          <p className="text-muted-foreground leading-relaxed max-w-lg">{item.description}</p>
        </div>

        <div className="lg:col-span-4 flex flex-wrap gap-2 lg:justify-end mt-2 lg:mt-0">
          {item.tech.map((tech) => (
            <span key={tech} className="px-2 py-1 text-xs text-muted-foreground rounded">
              {tech}
            </span>
          ))}
        </div>
      </Reveal>

      <Collapse open={open} id={panelId} labelledBy={buttonId}>
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-8 pb-8 sm:pb-10">
          <ProjectDetails item={item} className="lg:col-start-3 lg:col-span-10" />
        </div>
      </Collapse>
    </div>
  );
}

/** Expanded content: images beside the summary, highlights and links. */
function ProjectDetails({ item, className }: { item: Project; className?: string }) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-5 md:gap-8", className)}>
      <div
        className={cn(
          "md:col-span-3",
          // Phone screenshots sit side by side; wide ones stack
          item.images.every((image) => image.height > image.width)
            ? "grid grid-cols-3 gap-3"
            : "space-y-3",
        )}
      >
        {item.images.map((image) => (
          <ImageLightbox
            key={image.src}
            image={image}
            className="h-auto w-full rounded-lg border border-border bg-muted"
          />
        ))}
      </div>

      <div className="md:col-span-2 space-y-5">
        <p className="text-muted-foreground leading-relaxed">{item.summary}</p>

        <ul className="space-y-2.5 text-sm">
          {item.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-3">
              <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-signal" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-4">
          {item.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="group/link inline-flex items-center gap-1.5 text-sm text-foreground hover:text-muted-foreground transition-colors duration-300"
            >
              {link.label}
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProjectsSection;
