import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/generic/Card";
import Alert from "../components/generic/Alert";
import { fetchContent, ContentError, type BlogPost } from "../lib/contentService";

type BlogState = {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  allTags: string[];
};

function BackLink() {
  return (
    <Link
      to="/"
      className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
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
      <span>Back</span>
    </Link>
  );
}

type SearchInputProps = {
  value: string;
  onChange: (v: string) => void;
};

function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search posts"
      className="w-full px-4 py-3 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-muted-foreground/30"
    />
  );
}

type TagFilterProps = {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
};

function TagFilter({ tags, selectedTag, onTagSelect }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onTagSelect(null)}
        className={`px-3 py-1 rounded-full border transition-colors ${
          selectedTag === null
            ? "bg-foreground text-background border-foreground"
            : "border-border hover:border-muted-foreground/60"
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onTagSelect(tag)}
          className={`px-3 py-1 rounded-full border transition-colors ${
            selectedTag === tag
              ? "bg-foreground text-background border-foreground"
              : "border-border hover:border-muted-foreground/60"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Card as="a" href={`/blog/${post.slug}`} className="space-y-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{new Date(post.date).toLocaleDateString(undefined, { year: "numeric", month: "short" })}</span>
        <span>{post.readingTime} min read</span>
      </div>
      <h3 className="text-xl font-medium tracking-tight">{post.title}</h3>
      <p className="text-muted-foreground leading-relaxed">{post.summary}</p>
      <div className="flex flex-wrap gap-2 pt-2">
        {post.tags.map((t) => (
          <span
            key={t}
            className="px-2 py-0.5 text-xs rounded-full border border-border text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
    </Card>
  );
}

export default function Blog() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [state, setState] = useState<BlogState>({
    posts: [],
    loading: true,
    error: null,
    allTags: []
  });

  // Load posts on mount
  useEffect(() => {
    let cancelled = false;
    
    async function loadPosts() {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const result = await fetchContent({ domain: 'blog' });
        
        if (!cancelled) {
          const allTags = Array.from(new Set(result.posts.flatMap((p) => 'tags' in p ? p.tags : []))).sort();
          setState({
            posts: result.posts as BlogPost[],
            loading: false,
            error: null,
            allTags
          });
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof ContentError ? error.message : 'Failed to load posts';
          setState(prev => ({
            ...prev,
            loading: false,
            error: message
          }));
        }
      }
    }

    loadPosts();
    return () => { cancelled = true; };
  }, []);

  const filteredPosts = useMemo(() => {
    return state.posts.filter((post) => {
      const matchesTag = !selectedTag || post.tags.includes(selectedTag);
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTag && matchesSearch;
    });
  }, [state.posts, selectedTag, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-32">
        <div className="space-y-12 sm:space-y-16">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <BackLink />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-light tracking-tight">Blog</h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                Writing about web development, design systems, and building better software.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <SearchInput value={searchQuery} onChange={setSearchQuery} />
            <TagFilter tags={state.allTags} selectedTag={selectedTag} onTagSelect={setSelectedTag} />
          </div>

          {state.loading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          ) : state.error ? (
            <Alert
              variant="error"
              title="Failed to load posts"
              description={state.error}
              actionLabel="Try again"
              onAction={() => window.location.reload()}
            />
          ) : filteredPosts.length === 0 ? (
            <Alert
              variant="info"
              title="No posts found"
              description={searchQuery || selectedTag ? "Try adjusting your search or filters." : "No blog posts are available yet."}
              actionLabel={searchQuery || selectedTag ? "Clear filters" : undefined}
              onAction={searchQuery || selectedTag ? () => {
                setSearchQuery("");
                setSelectedTag(null);
              } : undefined}
            />
          ) : (
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
              {filteredPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
