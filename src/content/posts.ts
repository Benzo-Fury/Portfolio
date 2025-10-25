export type ThoughtPost = {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
};

export const posts: ThoughtPost[] = [
  {
    title: "The Future of Web Development",
    excerpt:
      "Exploring how AI and automation are reshaping the way we build for the web.",
    date: "Dec 2024",
    readTime: "5 min",
  },
  {
    title: "Design Systems at Scale",
    excerpt:
      "Lessons learned from building and maintaining design systems across multiple products.",
    date: "Nov 2024",
    readTime: "8 min",
  },
  {
    title: "Performance-First Development",
    excerpt:
      "Why performance should be a first-class citizen in your development workflow.",
    date: "Oct 2024",
    readTime: "6 min",
  },
  {
    title: "The Art of Code Review",
    excerpt:
      "Building better software through thoughtful and constructive code reviews.",
    date: "Sep 2024",
    readTime: "4 min",
  },
];


