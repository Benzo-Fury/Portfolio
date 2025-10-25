import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Alert from "../components/generic/Alert";
import { fetchContent, ContentError, type BlogPost } from "../lib/contentService";
import { estimateReadingTime, extractToc, parseFrontmatter, renderBasicMarkdownToHtml } from "../lib/markdown";

type State = {
  loading: boolean;
  error?: string;
  post?: BlogPost;
  frontmatter?: {
    title?: string;
    date?: string;
    summary?: string;
    tags?: string[];
    author?: string;
    readingTime?: number;
  };
  toc?: { level: number; text: string; id: string }[];
  html?: string;
};

function toTitle(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<State>({ loading: true });

  const title = useMemo(() => {
    if (state.frontmatter?.title) return state.frontmatter.title;
    if (state.post?.title) return state.post.title;
    return slug ? toTitle(slug) : "Post";
  }, [slug, state.frontmatter?.title, state.post?.title]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!slug) return;
      setState({ loading: true });
      try {
        const result = await fetchContent({ domain: 'blog', slug });
        const post = result.posts[0] as BlogPost;
        
        if (!post || !post.content) {
          throw new ContentError('Post content not found', 'CONTENT_NOT_FOUND');
        }

        const parsed = parseFrontmatter(post.content);
        const fm = parsed.frontmatter;
        const reading = fm.readingTime ?? estimateReadingTime(parsed.body);
        const toc = extractToc(parsed.body);
        const html = renderBasicMarkdownToHtml(parsed.body);
        
        if (!cancelled) setState({
          loading: false,
          post,
          frontmatter: { ...fm, readingTime: reading },
          toc,
          html,
        });
      } catch (e) {
        const msg = e instanceof ContentError ? e.message : "Failed to load post";
        if (!cancelled) setState({ loading: false, error: msg });
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!slug) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-28">
          <Alert
            variant="error"
            title="Missing post"
            description="No post slug provided."
            actionLabel="Back to blog"
            onAction={() => window.location.href = '/blog'}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-28">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/blog" className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </Link>
            {state.post?.htmlUrl ? (
              <a href={state.post.htmlUrl} target="_blank" rel="noreferrer" className="text-sm underline text-muted-foreground hover:text-foreground">
                View on GitHub
              </a>
            ) : null}
          </div>

          <header className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight">{title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {state.frontmatter?.date ? (
                <time dateTime={state.frontmatter.date}>
                  {new Date(state.frontmatter.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </time>
              ) : null}
              {state.frontmatter?.readingTime ? (
                <>
                  <span>•</span>
                  <span>{state.frontmatter.readingTime} min read</span>
                </>
              ) : null}
              {state.frontmatter?.author ? (
                <>
                  <span>•</span>
                  <span>{state.frontmatter.author}</span>
                </>
              ) : null}
            </div>
            {state.frontmatter?.tags && state.frontmatter.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {state.frontmatter.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 text-xs border border-border rounded-full hover:border-muted-foreground/50 transition-colors duration-300">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </header>

          {state.loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : state.error ? (
            <Alert
              variant="error"
              title="Failed to load post"
              description={state.error}
              actionLabel="Try again"
              onAction={() => window.location.reload()}
            />
          ) : (
            <div className="grid lg:grid-cols-4 gap-12">
              <div className="lg:col-span-3">
                <article className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: state.html ?? "" }} />
              </div>
              {state.toc && state.toc.length > 0 ? (
                <aside className="lg:col-span-1 hidden lg:block">
                  <div className="sticky top-8">
                    <nav className="text-sm space-y-2">
                      {state.toc.map((item) => (
                        <a key={item.id} href={`#${item.id}`} className="block text-muted-foreground hover:text-foreground" style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
                          {item.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                </aside>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


