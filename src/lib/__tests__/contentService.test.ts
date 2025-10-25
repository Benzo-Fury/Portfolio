import { describe, test, expect, beforeEach, vi } from "bun:test";
import { fetchContent, ContentError } from "../contentService";

// Mock the GitHub API calls
vi.mock("../fetchGithubPosts", () => ({
  fetchGithubPosts: vi.fn(),
  fetchGithubPost: vi.fn(),
}));

// Mock the static posts
vi.mock("../../content/posts", () => ({
  posts: [
    {
      title: "Test Thought",
      excerpt: "A test thought",
      date: "Dec 2024",
      readTime: "5 min",
    },
  ],
}));

describe("ContentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchContent", () => {
    test("should fetch thoughts successfully", async () => {
      const result = await fetchContent({ domain: "thoughts" });
      
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0]).toMatchObject({
        title: "Test Thought",
        excerpt: "A test thought",
        date: "Dec 2024",
        readTime: "5 min",
        slug: "test-thought",
      });
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    test("should filter thoughts by search query", async () => {
      const result = await fetchContent({ 
        domain: "thoughts", 
        search: "test" 
      });
      
      expect(result.posts).toHaveLength(1);
    });

    test("should return empty results for non-matching search", async () => {
      const result = await fetchContent({ 
        domain: "thoughts", 
        search: "nonexistent" 
      });
      
      expect(result.posts).toHaveLength(0);
    });

    test("should handle blog domain requests", async () => {
      // This test will fail in the current setup since we don't have GitHub API configured
      // but it tests the error handling path
      await expect(fetchContent({ domain: "blog" }))
        .rejects
        .toThrow();
    });

    test("should handle single blog post requests", async () => {
      // This test will fail in the current setup since we don't have GitHub API configured
      // but it tests the error handling path
      await expect(fetchContent({ domain: "blog", slug: "test-post" }))
        .rejects
        .toThrow();
    });
  });
});
