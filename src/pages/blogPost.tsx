import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Prose } from "../components/Pose";
import { MarkdownContent, parseMarkdown } from "../components/Markdown";
import Alert from "../components/generic/Alert";
import { fetchContent, ContentError, type BlogPost as BlogPostType } from "../lib/contentService.ts";

type BlogPostState = {
  post: BlogPostType | null;
  html: string;
  loading: boolean;
  error: string | null;
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<BlogPostState>({
    post: null,
    html: "",
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug) return;
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const result: any = await fetchContent({ domain: "blog", slug });
        const post: BlogPostType | null = result.post ?? (result.posts?.[0] ?? null);

        if (!cancelled) {
          if (!post) {
            setState((prev) => ({ ...prev, loading: false, error: "Post not found" }));
            return;
          }
          const html = await parseMarkdown(post.content ?? "");
          setState({ post, html, loading: false, error: null });
        }
      } catch (error: unknown) {
        if (!cancelled) {
          let message = "Failed to load post";
          if (error instanceof ContentError) {
            message = error.message;
          } else if (error && typeof error === "object" && "message" in (error as any)) {
            message = String((error as any).message);
          }
          setState((prev) => ({ ...prev, loading: false, error: message }));
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-32">
          <p className="text-muted-foreground">Loading post...</p>
        </main>
      </div>
    );
  }

  if (state.error || !state.post) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-32">
          <Alert
            variant="error"
            title="Failed to load post"
            description={state.error ?? "Post not found"}
            actionLabel="Back to blog"
            onAction={() => (window.location.href = "/blog")}
          />
        </main>
      </div>
    );
  }

  const post = state.post;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-32">
        <article className="space-y-12">
          <div className="space-y-6">
            <Link
              to="/blog"
              className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back to all posts</span>
            </Link>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-balance">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {post.date && (
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                )}
                {typeof post.readingTime !== "undefined" && (
                  <>
                    <span>•</span>
                    <span>{post.readingTime} min read</span>
                  </>
                )}
              </div>

              {Array.isArray(post.tags) && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {post.tags.map((tag: string, idx: number) => (
                    <span
                      key={`${tag}-${idx}`}
                      className="px-3 py-1 text-xs border border-border rounded-full hover:border-muted-foreground/50 transition-colors duration-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-12">
            <div className="lg:col-span-3">
              <Prose>
                <MarkdownContent html={state.html} />
              </Prose>
            </div>

            <aside className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-8">
                <TableOfContents content={post.content ?? ""} />
              </div>
            </aside>
          </div>
        </article>
      </main>
    </div>
  );
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const headingElements = Array.from(
      document.querySelectorAll("article h2, article h3")
    );
    const headingData = headingElements.map((heading) => ({
      id: heading.id,
      text: heading.textContent || "",
      level: Number.parseInt(heading.tagName.substring(1)),
    }));
    setHeadings(headingData);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -80% 0px" }
    );

    headingElements.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-4">
      <div className="text-sm text-muted-foreground font-mono">
        TABLE OF CONTENTS
      </div>
      <ul className="space-y-2 text-sm">
        {headings.map((heading, idx) => (
          <li
            key={heading.id || `${heading.text}-${idx}`}
            style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
          >
            <a
              href={`#${heading.id}`}
              className={`block py-1 transition-colors duration-300 ${
                activeId === heading.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(heading.id)
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
