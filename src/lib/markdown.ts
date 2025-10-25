export type Frontmatter = {
  title?: string;
  date?: string;
  summary?: string;
  tags?: string[];
  author?: string;
  readingTime?: number;
  draft?: boolean;
  ogImage?: string;
  [key: string]: unknown;
};

export type ParsedMarkdown = {
  frontmatter: Frontmatter;
  body: string;
};

export function parseFrontmatter(md: string): ParsedMarkdown {
  const fmMatch = md.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!fmMatch) {
    return { frontmatter: {}, body: md.trim() };
  }

  const raw = fmMatch[1];
  const body = md.slice(fmMatch[0].length).trim();
  const frontmatter: Frontmatter = {};

  // Naive YAML-ish parser for common primitives and arrays
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^([A-Za-z0-9_\-]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    let value = m[2].trim();
    if (value === "") continue;

    // booleans
    if (value === "true" || value === "false") {
      (frontmatter as any)[key] = value === "true";
      continue;
    }
    // numbers
    if (/^\d+(\.\d+)?$/.test(value)) {
      (frontmatter as any)[key] = Number(value);
      continue;
    }
    // quoted strings
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      (frontmatter as any)[key] = value.slice(1, -1);
      continue;
    }
    // JSON-like arrays e.g. ["a", "b"] or ['a', 'b']
    if (value.startsWith("[") && value.endsWith("]")) {
      const jsonish = value.replace(/'([^']*)'/g, '"$1"');
      try {
        (frontmatter as any)[key] = JSON.parse(jsonish);
        continue;
      } catch {
        // fallthrough to raw
      }
    }
    (frontmatter as any)[key] = value;
  }

  return { frontmatter, body };
}

export function estimateReadingTime(text: string, wordsPerMinute = 225): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}

export type TocItem = { level: number; text: string; id: string };

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function extractToc(md: string): TocItem[] {
  const lines = md.split(/\r?\n/);
  const toc: TocItem[] = [];
  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.+)$/);
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].trim();
    toc.push({ level, text, id: slugify(text) });
  }
  return toc;
}

export function renderBasicMarkdownToHtml(md: string): string {
  const lines = md.split(/\r?\n/);
  const html: string[] = [];
  let inCode = false;
  let inList = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```") && !inCode) {
      inCode = true;
      html.push("<pre><code>");
      continue;
    }
    if (line.startsWith("```") && inCode) {
      inCode = false;
      html.push("</code></pre>");
      continue;
    }
    if (inCode) {
      html.push(escapeHtml(line) + "\n");
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = slugify(text);
      html.push(`<h${level} id="${id}">${escapeInline(text)}</h${level}>`);
      continue;
    }

    const list = line.match(/^[-*]\s+(.+)$/);
    if (list) {
      if (!inList) {
        inList = true;
        html.push("<ul>");
      }
      html.push(`<li>${escapeInline(list[1].trim())}</li>`);
      // If next line isn't list, close list
      const next = lines[i + 1] ?? "";
      if (!/^[-*]\s+/.test(next)) {
        html.push("</ul>");
        inList = false;
      }
      continue;
    }

    if (line.trim() === "") {
      html.push("");
      continue;
    }

    html.push(`<p>${escapeInline(line.trim())}</p>`);
  }
  if (inList) html.push("</ul>");
  return html.join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeInline(s: string): string {
  // very naive: escape HTML, then handle **bold** and `code`
  const safe = escapeHtml(s);
  return safe
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}


