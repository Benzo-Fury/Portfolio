import { posts as staticThoughtPosts } from "../content/posts";

export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentError";
  }
}

export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  readingTime: number;
  tags: string[];
  author?: string;
};

export type ThoughtPost = {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  slug?: string;
};

type FetchArgs = {
  domain: "blog" | "thoughts";
  slug?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

type FetchListResult<T> = {
  posts: T[];
  total: number;
  hasMore: boolean;
};

type FetchBlogPostResult = {
  post: BlogPost | null;
};

type Frontmatter = {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  author?: string;
  readingTime?: number;
};

export async function fetchContent(args: FetchArgs): Promise<FetchListResult<BlogPost> | FetchListResult<ThoughtPost> | FetchBlogPostResult> {
  const { domain, slug, search, page = 1, pageSize = 20 } = args;

  if (domain === "thoughts") {
    const withSlugs: ThoughtPost[] = staticThoughtPosts.map((p) => ({
      ...p,
      slug: slugify(p.title),
    }));

    const filtered = (search
      ? withSlugs.filter(
          (p) =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.excerpt.toLowerCase().includes(search.toLowerCase())
        )
      : withSlugs);

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const slice = filtered.slice(start, end);

    return {
      posts: slice,
      total: filtered.length,
      hasMore: end < filtered.length,
    };
  }

  // Blog domain - fetch from GitHub
  if (slug) {
    const post = await fetchGithubPost(slug);
    return { post };
  }

  const allPosts = await fetchGithubPosts();
  
  const filtered = search
    ? allPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.summary.toLowerCase().includes(search.toLowerCase())
      )
    : allPosts;

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const slice = filtered.slice(start, end);

  return {
    posts: slice,
    total: filtered.length,
    hasMore: end < filtered.length,
  };
}

const GITHUB_API = "https://api.github.com";
const GITHUB_RAW = "https://raw.githubusercontent.com";
const GITHUB_OWNER = "Benzo-Fury";
const GITHUB_REPO = "Portfolio";
const GITHUB_BRANCH = "main";

async function fetchGithubPosts(): Promise<BlogPost[]> {
  try {
    // Fetch the directory listing from GitHub
    const response = await fetch(
      `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/src/content/blog`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new ContentError(`GitHub API error: ${response.status} - ${errorData}`);
    }

    const files = await response.json() as Array<{ name: string; path: string }>;
    const mdFiles = files.filter((f) => f.name.endsWith(".md"));

    const posts = await Promise.all(
      mdFiles.map(async (file) => {
        const slug = file.name.replace(".md", "");
        return await fetchGithubPost(slug);
      })
    );

    return posts
      .filter((p): p is BlogPost => p !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Failed to fetch blog posts from GitHub:", error);
    throw new ContentError("Failed to load blog posts");
  }
}

async function fetchGithubPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(
      `${GITHUB_RAW}/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/src/content/blog/${slug}.md`
    );

    if (!response.ok) {
      return null;
    }

    const content = await response.text();
    const parsed = parseFrontmatter(content);
    
    if (!parsed) return null;

    return {
      slug,
      title: parsed.frontmatter.title,
      summary: parsed.frontmatter.summary,
      content: parsed.content,
      date: parsed.frontmatter.date,
      readingTime: parsed.frontmatter.readingTime ?? calculateReadingTime(parsed.content),
      tags: parsed.frontmatter.tags,
      author: parsed.frontmatter.author,
    };
  } catch (error) {
    console.error(`Failed to fetch blog post ${slug}:`, error);
    return null;
  }
}

function parseFrontmatter(raw: string): { frontmatter: Frontmatter; content: string } | null {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match || !match[1] || !match[2]) return null;

  const frontmatterStr = match[1];
  const content = match[2];
  const frontmatter: Partial<Frontmatter> = {};

  for (const line of frontmatterStr.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    
    const key = line.slice(0, colonIndex).trim();
    let value: any = line.slice(colonIndex + 1).trim();
    
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    // Parse arrays
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((v: string) => v.trim().replace(/^["']|["']$/g, ""));
    }
    
    // Parse numbers
    if (key === "readingTime" && !Number.isNaN(Number(value))) {
      value = Number(value);
    }
    
    frontmatter[key as keyof Frontmatter] = value;
  }

  if (!frontmatter.title || !frontmatter.date || !frontmatter.summary) {
    return null;
  }

  return {
    frontmatter: {
      title: frontmatter.title,
      date: frontmatter.date,
      summary: frontmatter.summary,
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      author: frontmatter.author,
      readingTime: frontmatter.readingTime,
    },
    content,
  };
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}


