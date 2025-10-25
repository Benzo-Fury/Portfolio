import { fetchGithubPosts, fetchGithubPost } from "./fetchGithubPosts";
import { posts as staticPosts } from "../content/posts";

export type ContentDomain = 'blog' | 'thoughts';

export type ContentOptions = {
  domain: ContentDomain;
  slug?: string; // for single post
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  readingTime: number;
  content?: string; // for single post
  htmlUrl?: string;
};

export type ThoughtPost = {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  slug?: string; // derived from title
};

export type ContentResult = {
  posts: (BlogPost | ThoughtPost)[];
  hasMore?: boolean;
  total?: number;
  error?: string;
};

export class ContentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ContentError';
  }
}

export async function fetchContent(options: ContentOptions): Promise<ContentResult> {
  try {
    if (options.domain === 'thoughts') {
      return await fetchThoughts(options);
    } else {
      return await fetchBlogPosts(options);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch content';
    const code = error instanceof ContentError ? error.code : 'FETCH_ERROR';
    throw new ContentError(message, code);
  }
}

async function fetchThoughts(options: ContentOptions): Promise<ContentResult> {
  // For now, return static posts. In the future, this could fetch from GitHub
  let filteredPosts = [...staticPosts];
  
  // Add slug to each post for consistency
  let postsWithSlug = filteredPosts.map(post => ({
    ...post,
    slug: post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }));

  // Apply search filter
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    postsWithSlug = postsWithSlug.filter(post => 
      post.title.toLowerCase().includes(searchLower) ||
      post.excerpt.toLowerCase().includes(searchLower)
    );
  }

  return {
    posts: postsWithSlug,
    total: postsWithSlug.length,
    hasMore: false
  };
}

async function fetchBlogPosts(options: ContentOptions): Promise<ContentResult> {
  if (options.slug) {
    // Fetch single post
    try {
      const post = await fetchGithubPost({ slug: options.slug });
      const parsed = parseFrontmatter(post.content);
      const frontmatter = parsed.frontmatter;
      
      const blogPost: BlogPost = {
        slug: options.slug,
        title: frontmatter.title || options.slug,
        date: frontmatter.date || new Date().toISOString().split('T')[0],
        summary: frontmatter.summary || '',
        tags: frontmatter.tags || [],
        readingTime: frontmatter.readingTime || 5,
        content: parsed.body,
        htmlUrl: post.htmlUrl
      };

      return {
        posts: [blogPost],
        total: 1,
        hasMore: false
      };
    } catch (error) {
      throw new ContentError(
        `Post '${options.slug}' not found`,
        'POST_NOT_FOUND',
        404
      );
    }
  } else {
    // Fetch multiple posts
    const result = await fetchGithubPosts({
      page: options.page || 1,
      maxAmount: options.limit || 10
    });

    const blogPosts: BlogPost[] = await Promise.all(
      result.posts.map(async (post) => {
        try {
          const content = await fetch(post.url).then(r => r.text());
          const parsed = parseFrontmatter(content);
          const frontmatter = parsed.frontmatter;
          
          return {
            slug: post.slug,
            title: frontmatter.title || post.slug,
            date: frontmatter.date || new Date().toISOString().split('T')[0],
            summary: frontmatter.summary || '',
            tags: frontmatter.tags || [],
            readingTime: frontmatter.readingTime || 5,
            htmlUrl: post.htmlUrl
          };
        } catch {
          // Fallback for posts that can't be parsed
          return {
            slug: post.slug,
            title: post.slug,
            date: new Date().toISOString().split('T')[0],
            summary: '',
            tags: [],
            readingTime: 5,
            htmlUrl: post.htmlUrl
          };
        }
      })
    );

    // Apply filters
    let filteredPosts = blogPosts;
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.summary.toLowerCase().includes(searchLower)
      );
    }

    if (options.tag) {
      filteredPosts = filteredPosts.filter(post => 
        post.tags.includes(options.tag!)
      );
    }

    return {
      posts: filteredPosts,
      total: filteredPosts.length,
      hasMore: result.hasMore
    };
  }
}

// Simple frontmatter parser (you may want to use a proper library)
function parseFrontmatter(content: string): { frontmatter: any; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const frontmatterText = match[1];
  const body = match[2];
  
  const frontmatter: any = {};
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Parse arrays (simple format: [item1, item2, item3])
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayContent = value.slice(1, -1);
        frontmatter[key] = arrayContent.split(',').map(item => item.trim().replace(/['"]/g, ''));
      } else {
        frontmatter[key] = value;
      }
    }
  });

  return { frontmatter, body };
}
