import cilicaAssistant from "../public/projects/cilica-assistant.jpg";
import cilicaTranscript from "../public/projects/cilica-transcript.jpg";
import cilicaSearch from "../public/projects/cilica-search.jpg";
import cilicaTasks from "../public/projects/cilica-tasks.jpg";
import crmHome from "../public/projects/crm-home.jpg";
import crmLeads from "../public/projects/crm-leads.jpg";
import meetRoom from "../public/projects/meet-room.jpg";
import meetSetup from "../public/projects/meet-setup.jpg";
import meetChat from "../public/projects/meet-chat.jpg";
import riptideLibrary from "../public/projects/riptide-library.jpg";
import riptideFiles from "../public/projects/riptide-files.jpg";
import riptideSwarm from "../public/projects/riptide-swarm.jpg";
import sistaToday from "../public/projects/sista-today.jpg";
import sistaOnboarding from "../public/projects/sista-onboarding.jpg";
import sistaArticle from "../public/projects/sista-article.jpg";

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
    year: "2026",
    name: "Cilica",
    description:
      "Local-first desktop notes app with an AI assistant and a bot-free meeting summariser.",
    tech: ["Rust", "Tauri", "TypeScript", "React", "Whisper"],
    summary:
      "A free, open-source alternative to Granola. You write in Markdown, and Cilica, the built-in assistant, can read and edit every note. On calls it records your mic and system audio with no bot joining, transcribes on-device and writes a summary with decisions and action items.",
    highlights: [
      "Assistant that sorts, summarises and rewrites notes, with undo and diffs for every change",
      "On-device Whisper transcription with speaker labels and voice recognition",
      "Bring your own AI provider, including local models via Ollama or LM Studio",
      "Imports from 45 apps, including Obsidian, Notion, Apple Notes and Granola",
    ],
    images: [
      { src: cilicaAssistant, alt: "A meeting note with the Cilica assistant open after moving a note into a category", width: 1600, height: 1000 },
      { src: cilicaTranscript, alt: "Meeting transcript with speaker labels and key quotes", width: 1600, height: 1000 },
      { src: cilicaSearch, alt: "Search across notes with an option to ask Cilica", width: 1600, height: 1000 },
      { src: cilicaTasks, alt: "Scheduled tasks for a notes review and weekly digest", width: 1600, height: 1000 },
    ],
    links: [{ label: "GitHub", url: "https://github.com/Benzo-Fury/cilica" }],
  },
  {
    year: "2026",
    name: "POL CRM",
    description:
      "Custom sales CRM built for a US company, serving almost 10,000 users.",
    tech: ["TypeScript", "React", "PostgreSQL", "AI"],
    summary:
      "A purpose-built CRM that replaced off-the-shelf tooling for a US sales organisation. Reps open it to a daily brief of the leads that need them, then work the pipeline from one fast, keyboard-driven table.",
    highlights: [
      "Serves almost 10,000 users",
      "Home brief with pipeline, response time and win-rate metrics",
      "Ask-anything AI bar for querying leads and drafting follow-ups",
      "Lead table with filters, scoring and a side panel for activity, emails and tasks",
    ],
    images: [
      { src: crmHome, alt: "CRM home screen with daily lead brief, metrics and leads needing attention", width: 1600, height: 1098 },
      { src: crmLeads, alt: "CRM lead table with a lead's details and activity open in a side panel", width: 1600, height: 1000 },
    ],
    links: [],
  },
  {
    year: "2026",
    name: "Riptide",
    description:
      "Desktop BitTorrent client running on a Rust engine I wrote from scratch, benchmarked faster than qBittorrent.",
    tech: ["Rust", "TypeScript", "React", "Electrobun"],
    summary:
      "A modern alternative to qBittorrent and Transmission. Under the clean interface is Undercurrent, my own BitTorrent engine in under 8,000 lines of Rust, which outpaced every engine it was benchmarked against.",
    highlights: [
      "Custom Rust engine, faster than libtorrent in head-to-head benchmarks",
      "Seeds at up to 88 Gbit/s locally, versus 54 Gbit/s for qBittorrent",
      "Locks all traffic to a VPN and stops the moment it drops",
      "Pick exactly which files to download before any data moves",
    ],
    images: [
      { src: riptideLibrary, alt: "Riptide torrent list with several downloads in progress", width: 1600, height: 1000 },
      { src: riptideFiles, alt: "A torrent's file list with checkboxes to choose what to download", width: 1600, height: 1000 },
      { src: riptideSwarm, alt: "Swarm view showing peers by round-trip time", width: 1600, height: 1000 },
    ],
    links: [{ label: "GitHub", url: "https://github.com/Benzo-Fury/Riptide" }],
  },
  {
    year: "2026",
    name: "Private Video Conferencing",
    description:
      "Zoom-style video conferencing built into a company portal, so meetings can't leak through shareable links.",
    tech: ["Next.js", "Zoom Video SDK", "PostgreSQL", "TypeScript"],
    summary:
      "A small company was running its events over plain Zoom links that anyone could forward. This replaces them with a branded meeting room inside their own portal, where only members and registered guests get in and hosts control who's admitted.",
    highlights: [
      "Meetings only reachable by invited members and guests",
      "Everything people expect from Zoom, inside the company's own portal",
      "Hosts stay in control of who joins and what happens in the room",
      "Fully branded experience with no third-party links to share",
    ],
    images: [
      { src: meetRoom, alt: "Live session room in speaker view with the meeting toolbar", width: 800, height: 500 },
      { src: meetSetup, alt: "Pre-join setup screen with camera preview and device pickers", width: 800, height: 500 },
      { src: meetChat, alt: "Live session with the chat panel open", width: 800, height: 500 },
    ],
    links: [],
  },
  {
    year: "2026",
    name: "Sista",
    description:
      "Women's cycle tracking app with predictions, symptom logging and personalised insights.",
    tech: ["React Native", "Expo", "TypeScript"],
    summary:
      "A calm, dark-first cycle tracker. Sista predicts periods and ovulation, makes logging flow, symptoms and mood a single tap, and turns what you log into articles tied to your own cycle.",
    highlights: [
      "Today view with a cycle curve showing where you are and what's next",
      "Quick logging for flow, symptoms and mood",
      "Onboarding tailored to goals, including fertility and perimenopause",
      "Learn articles personalised with patterns from your past cycles",
    ],
    images: [
      { src: sistaToday, alt: "Sista today screen showing ovulation likely today on a cycle curve", width: 794, height: 1600 },
      { src: sistaOnboarding, alt: "Sista onboarding asking what the app should help with", width: 791, height: 1600 },
      { src: sistaArticle, alt: "Sista article on why sleep shifts before your period", width: 799, height: 1600 },
    ],
    links: [],
  },
];
