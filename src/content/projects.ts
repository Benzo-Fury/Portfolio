import unionizeBanner from "../public/projects/unionize.jpg";
import inboxerBanner from "../public/projects/inboxer.jpg";
import proxeBanner from "../public/projects/proxe.jpg";

export type ProjectImage = {
  src: string;
  alt: string;
  /** Intrinsic size, so the page reserves space before the image loads */
  width: number;
  height: number;
};

export type ProjectLink = {
  label: string;
  url: string;
};

export type Project = {
  year: string;
  name: string;
  /** One line, shown in the collapsed row */
  description: string;
  tech: string[];
  /** Longer description, shown when the row is expanded */
  summary: string;
  highlights: string[];
  images: ProjectImage[];
  links: ProjectLink[];
};

export const projects: Project[] = [
  {
    year: "2025",
    name: "Unionize",
    description:
      "Large scale Discord bot for creating humorous & silly families within Discord.",
    tech: ["Bun", "TypeScript", "MongoDB", "Neo4j"],
    summary:
      "A free, modern Discord bot for building families: proposals, marriages and adoptions, including poly relationships, with family trees you can pull up in any server.",
    highlights: [
      "Relationships live in a Neo4j graph; everything else in MongoDB",
      "Commands work through typed models and never touch raw Cypher",
      "/tree draws a member's whole family tree on demand",
      "Built on the sern framework with versioned feature flags",
    ],
    images: [
      { src: unionizeBanner, alt: "Unionize logo with heart accents and a diamond ring", width: 1600, height: 640 },
    ],
    links: [{ label: "GitHub", url: "https://github.com/Benzo-Fury/Unionize" }],
  },
  {
    year: "2025",
    name: "Inboxer",
    description:
      "Open-source AI assistant to label, archive, and draft email responses automatically.",
    tech: ["AI", "Google Cloud", "Pub/Sub", "Bun", "TypeScript", "MongoDB"],
    summary:
      "Connect a Gmail account and Inboxer sorts new mail into labels and drafts replies the moment it arrives, so the inbox is triaged before you open it.",
    highlights: [
      "Real-time processing from Gmail push notifications over Pub/Sub",
      "AI-generated draft replies and automatic labelling",
      "Quota-aware Gmail client with a concurrency-safe pipeline",
      "Built-in OAuth server for connecting accounts",
    ],
    images: [
      { src: inboxerBanner, alt: "Inboxer wordmark over a pattern of envelopes", width: 1600, height: 1066 },
    ],
    links: [{ label: "GitHub", url: "https://github.com/Benzo-Fury/Inboxer" }],
  },
  {
    year: "2024",
    name: "ProxE",
    description:
      "Lightweight, Python-based proxy server designed for speed, simplicity, and control.",
    tech: ["Python", "Tunneling", "Encryption"],
    summary:
      "A small proxy server that gives you control over every byte: HTTP and HTTPS tunnelling, per-user authentication and a full request log, with no external services.",
    highlights: [
      "HTTP proxying and HTTPS tunnelling via CONNECT",
      "Request logging and user authentication in an embedded TinyDB",
      "Event-based structure that is easy to extend",
      "Configured by file or command-line flags",
    ],
    images: [
      { src: proxeBanner, alt: "ProxE wordmark in pixel type over a dark globe grid", width: 960, height: 540 },
    ],
    links: [{ label: "GitHub", url: "https://github.com/Benzo-Fury/ProxE" }],
  },
];
