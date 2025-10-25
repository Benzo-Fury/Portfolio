import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

// Configure marked with syntax highlighting
marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);

// Configure marked options
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: false,
});

function normalizeFencedBackticks(input: string): string {
  // Unescape escaped opening fenced code blocks: "\\```lang" -> "```lang"
  const openUnescaped = input.replace(/(^|\n)([ \t]*)\\```([^\n]*)/g, function (_m, start, ws, rest) {
    return start + ws + "```" + rest;
  });
  // Unescape escaped closing fenced code blocks: "\\```" at line end -> "```"
  const closeUnescaped = openUnescaped.replace(/(^|\n)([ \t]*)\\```([ \t]*)(?=\n|$)/g, function (_m, start, ws, rest) {
    return start + ws + "```" + rest;
  });
  return closeUnescaped;
}

export async function parseMarkdown(content: string): Promise<string> {
  const normalized = normalizeFencedBackticks(content);
  return marked.parse(normalized) as Promise<string>;
}

interface MarkdownContentProps {
  html: string;
}

export function MarkdownContent({ html }: MarkdownContentProps) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
