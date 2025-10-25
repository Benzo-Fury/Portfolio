export type GithubPostStub = {
  slug: string;
  name: string;
  path: string;
  url: string; // raw content URL
  htmlUrl: string;
  sha: string;
  size: number;
};

export type FetchGithubPostsOptions = {
  owner?: string;
  repo?: string;
  branch?: string; // default: main
  directory?: string; // default: src/content/blog
  page?: number; // 1-based
  maxAmount?: number; // cap at 5
  slug?: string; // if provided, fetch only this specific post
  token?: string; // optional GitHub token (server-side only)
};

export type FetchGithubPostsResult = {
  posts: GithubPostStub[];
  hasMore: boolean;
  total: number;
};

export type FetchGithubPostResult = {
  name: string;
  path: string;
  htmlUrl: string;
  url: string;
  sha: string;
  size: number;
  content: string; // raw text content
};

const DEFAULT_BRANCH = "main";
const DEFAULT_DIRECTORY = "src/content/blog";
const MAX_CAP = 5;

import { getPublicEnv } from "./env";

export async function fetchGithubPosts(options: FetchGithubPostsOptions = {}): Promise<FetchGithubPostsResult> {
  const owner = options.owner ?? getPublicEnv("BUN_PUBLIC_GITHUB_OWNER");
  const repo = options.repo ?? getPublicEnv("BUN_PUBLIC_GITHUB_REPO");
  const branch = options.branch ?? DEFAULT_BRANCH;
  const directory = options.directory ?? DEFAULT_DIRECTORY;
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(Math.max(1, options.maxAmount ?? MAX_CAP), MAX_CAP);

  if (!owner || !repo) {
    throw new Error(
      "fetchGithubPosts: Missing GitHub owner/repo. Provide via options or BUN_PUBLIC_GITHUB_OWNER/BUN_PUBLIC_GITHUB_REPO."
    );
  }

  const url = new URL(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(
      directory
    )}`
  );
  url.searchParams.set("ref", branch);

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  // Only attach token if explicitly provided (recommended server-side)
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    throw new Error(
      `fetchGithubPosts: GitHub API error ${res.status} ${res.statusText}`
    );
  }

  const data = (await res.json()) as Array<{
    name: string;
    path: string;
    sha: string;
    size: number;
    type: string;
    html_url: string;
    download_url: string | null;
  }>;

  let files = (Array.isArray(data) ? data : [])
    .filter((item) => item.type === "file")
    .filter((item) => /\.(md|mdx)$/i.test(item.name));

  // If slug is provided, filter to only that specific post
  if (options.slug) {
    const candidates = [
      `${options.slug}.mdx`,
      `${options.slug}.md`,
    ];
    files = files.filter((file) => candidates.includes(file.name));
  }

  // Fallback sort: newest-looking first by name (commonly prefixed with date or slug)
  files.sort((a, b) => b.name.localeCompare(a.name, undefined, { numeric: true }));

  const total = files.length;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const slice = start < total ? files.slice(start, Math.min(end, total)) : [];

  const posts: GithubPostStub[] = slice.map((f) => ({
    slug: f.name.replace(/\.(md|mdx)$/i, ""),
    name: f.name,
    path: f.path,
    url: f.download_url ?? "",
    htmlUrl: f.html_url,
    sha: f.sha,
    size: f.size,
  }));

  return {
    posts,
    hasMore: end < total,
    total,
  };
}

export async function fetchGithubPost(options: { slug: string } & Omit<FetchGithubPostsOptions, 'slug'>): Promise<FetchGithubPostResult> {
  const result = await fetchGithubPosts({ ...options, maxAmount: 1 });
  
  if (result.posts.length === 0) {
    throw new Error(`fetchGithubPost: File for slug '${options.slug}' not found`);
  }

  const post = result.posts[0];
  
  // Fetch the content
  let content = "";
  if (post.url) {
    const res = await fetch(post.url);
    if (!res.ok) {
      throw new Error(`fetchGithubPost: Unable to download file content (${res.status})`);
    }
    content = await res.text();
  } else {
    throw new Error("fetchGithubPost: No content available for file");
  }

  return {
    name: post.name,
    path: post.path,
    htmlUrl: post.htmlUrl,
    url: post.url,
    sha: post.sha,
    size: post.size,
    content,
  };
}


