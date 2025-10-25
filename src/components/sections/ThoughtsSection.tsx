import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Section from "../Section";
import { ArrowRight } from "../icons/ArrowRight";
import Button from "../generic/Button";
import Card from "../generic/Card";
import Alert from "../generic/Alert";
import { fetchContent, ContentError, type ThoughtPost, type BlogPost } from "../../lib/contentService";

type Props = {
  registerRef: (index: number) => (el: HTMLElement | null) => void;
};

type ThoughtsState = {
  posts: ThoughtPost[];
  loading: boolean;
  error: string | null;
};

function ThoughtsSection({ registerRef }: Props) {
  const [state, setState] = useState<ThoughtsState>({
    posts: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    let cancelled = false;
    
    async function loadThoughts() {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const result = await fetchContent({ domain: 'blog' });
        
        if (!cancelled) {
          const blogPosts = (result.posts as BlogPost[]);
          const mapped: ThoughtPost[] = blogPosts.map((p) => ({
            title: p.title,
            excerpt: p.summary ?? "",
            date: new Date(p.date).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
            readTime: `${p.readingTime} min`,
            slug: p.slug,
          }));

          setState({ posts: mapped, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof ContentError ? error.message : 'Failed to load thoughts';
          setState(prev => ({
            ...prev,
            loading: false,
            error: message
          }));
        }
      }
    }

    loadThoughts();
    return () => { cancelled = true; };
  }, []);
  return (
    <Section
      id="thoughts"
      index={2}
      registerRef={registerRef}
      className="min-h-screen py-20 sm:py-32 opacity-0"
    >
      <div className="space-y-12 sm:space-y-16">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl sm:text-4xl font-light">Recent Thoughts</h2>
          <Button href="/blog">
            View All
          </Button>
        </div>

        {state.loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading thoughts...</p>
          </div>
        ) : state.error ? (
          <Alert
            variant="error"
            title="Failed to load thoughts"
            description={state.error}
            actionLabel="Try again"
            onAction={() => window.location.reload()}
          />
        ) : state.posts.length === 0 ? (
          <Alert
            variant="info"
            title="No thoughts available"
            description="Check back later for new thoughts and insights."
          />
        ) : (
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
            {state.posts.map((post, index) => (
              <ThoughtCard key={index} post={post} />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

export function ThoughtCard({ post }: { post: ThoughtPost }) {
  const content = (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>{post.date}</span>
          <span>{post.readTime}</span>
        </div>

        <h3 className="text-lg sm:text-xl font-medium group-hover:text-muted-foreground transition-colors duration-300">
          {post.title}
        </h3>

        <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
          <span>Read more</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </Card>
  );

  if (post.slug) {
    return (
      <Link to={`/blog/${post.slug}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export default ThoughtsSection;
