export type Project = {
  year: string;
  name: string;
  description: string;
  tech: string[];
};

export const projects: Project[] = [
  {
    year: "2025",
    name: "Unionize",
    description:
      "Large scale Discord bot for creating humerous & silly families within Discord.",
    tech: ["Bun", "TypeScript", "MongoDB", "Neo4j"],
  },
  {
    year: "2025",
    name: "Inboxer",
    description:
      "Open-source AI assistant to label, archive, and draft email responses automatically.",
    tech: ["AI", "Google Cloud", "Pub/Sub", "Bun", "TypeScript", "MongoDB"],
  },
  {
    year: "2024",
    name: "ProxE",
    description:
      "Lightweight, Python-based proxy server designed for speed, simplicity, and control.",
    tech: ["Python", "Tunneling", "Encryption"],
  },
];


