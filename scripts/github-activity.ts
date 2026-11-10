/**
 * Fetches a year of public GitHub activity and writes it to
 * `src/content/github-activity.json` for the Activity section.
 *
 * Runs at build time (locally via `bun run activity`, and in the Pages workflow).
 * Set `GITHUB_TOKEN` or `GH_TOKEN` to lift the API rate limit from 60 to 1,000+ requests an hour.
 *
 * If the calendar can't be fetched, the existing snapshot is left untouched and the
 * script exits successfully, so a GitHub outage never breaks a deploy.
 */
import type {
  ActivityData,
  ActivityDay,
  ActivityItem,
  CommitActivity,
  EventActivity,
} from "../src/content/activity.types";

// ---------- GitHub API shapes ---------- //

/** The subset of a commit search result this script reads. */
type ApiSearchCommit = {
  commit: { message: string; author: { date: string } | null };
  repository: { full_name: string; html_url: string };
};

/** The subset of a public event this script reads. Payloads vary by `type`. */
type ApiEvent = {
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    action?: string;
    ref?: string | null;
    ref_type?: string;
    release?: { tag_name?: string; html_url?: string };
    pull_request?: { number?: number; title?: string; html_url?: string };
    issue?: { number?: number; title?: string; html_url?: string };
    forkee?: { html_url?: string };
  };
};

// ---------- Fetcher ---------- //

/**
 * Collects the contribution calendar, the user's public commits (via commit search),
 * and the public event feed, then merges them into one `ActivityData`.
 *
 * Commit details cover the full year; other events only reach back as far as
 * GitHub's public feed does (about 90 days, 300 events). Contributions to private
 * repositories appear in the calendar counts only, never in details.
 */
class GithubActivityFetcher {
  /** Most commit messages kept per repository per day */
  private static readonly MESSAGES_PER_DAY = 4;

  /** Commit search returns at most 1,000 results (10 pages of 100) per query */
  private static readonly MAX_SEARCH_PAGES = 10;

  private readonly since: Date;

  constructor(
    private readonly user: string,
    private readonly token: string | undefined,
  ) {
    this.since = new Date();
    this.since.setUTCFullYear(this.since.getUTCFullYear() - 1);
  }

  /**
   * Builds the snapshot and writes it to `outPath`.
   * Details are best-effort: a failure there still writes the calendar.
   */
  async run(outPath: string): Promise<void> {
    // Calendar is required; without it there's nothing to show
    let days: ActivityDay[];
    try {
      days = await this.fetchCalendar();
    } catch (error) {
      console.warn(`[activity] Calendar fetch failed, keeping existing snapshot: ${String(error)}`);
      return;
    }

    // Commits and events are optional extras
    const details: Record<string, ActivityItem[]> = {};
    try {
      for (const [date, items] of await this.fetchCommitDetails()) this.append(details, date, items);
    } catch (error) {
      console.warn(`[activity] Commit details skipped: ${String(error)}`);
    }
    try {
      for (const [date, items] of await this.fetchEventDetails()) this.append(details, date, items);
    } catch (error) {
      console.warn(`[activity] Event details skipped: ${String(error)}`);
    }

    // Drop pushes already covered by that day's commit details
    for (const [date, items] of Object.entries(details)) {
      const committed = new Set(items.filter((i) => i.kind === "commits").map((i) => i.repo));
      details[date] = items.filter((i) => i.kind !== "push" || !committed.has(i.repo));
    }

    // Write snapshot
    const data: ActivityData = {
      user: this.user,
      generatedAt: new Date().toISOString(),
      total: days.reduce((sum, day) => sum + day.count, 0),
      days,
      details,
    };
    await Bun.write(outPath, JSON.stringify(data) + "\n");
    console.log(
      `[activity] Wrote ${days.length} days, ${data.total} contributions, ${Object.keys(details).length} days with details`,
    );
  }

  /**
   * Scrapes the public contributions calendar. GitHub has no unauthenticated API
   * for it, but this HTML fragment is what the profile page itself loads.
   */
  private async fetchCalendar(): Promise<ActivityDay[]> {
    // Download calendar fragment
    const res = await fetch(`https://github.com/users/${this.user}/contributions`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Map tooltip ids to their contribution counts ("No contributions" / "1 contribution" / "12 contributions")
    const counts = new Map<string, number>();
    for (const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>\s*(No|\d+) contributions?/g)) {
      counts.set(m[1]!, m[2] === "No" ? 0 : Number(m[2]));
    }

    // Read each day cell
    const days: ActivityDay[] = [];
    for (const m of html.matchAll(/<td\b[^>]*\bdata-date="([\d-]+)"[^>]*>/g)) {
      const tag = m[0];
      const id = /\bid="([^"]+)"/.exec(tag)?.[1];
      const level = Number(/\bdata-level="(\d)"/.exec(tag)?.[1] ?? 0);
      days.push({
        date: m[1]!,
        count: (id && counts.get(id)) || 0,
        level: Math.min(4, Math.max(0, level)) as ActivityDay["level"],
      });
    }
    if (days.length === 0) throw new Error("No calendar days found; the page format may have changed");

    return days.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Groups the user's public commits by day and repository, including commits to
   * other people's public repositories.
   *
   * The `is:public` qualifier is essential: an authenticated search also returns
   * private repositories the token can read, which must never reach the site.
   */
  private async fetchCommitDetails(): Promise<Map<string, ActivityItem[]>> {
    const since = this.since.toISOString().slice(0, 10);
    const query = encodeURIComponent(`author:${this.user} is:public author-date:>=${since}`);

    // Page through search results, newest first
    const commits: ApiSearchCommit[] = [];
    for (let page = 1; page <= GithubActivityFetcher.MAX_SEARCH_PAGES; page++) {
      const res = await this.api<{ items: ApiSearchCommit[] }>(
        `/search/commits?q=${query}&sort=author-date&order=desc&per_page=100&page=${page}`,
      );
      commits.push(...res.items);
      if (res.items.length < 100) break;
    }

    // Bucket into one entry per day per repository
    const entries = new Map<string, CommitActivity>();
    const byDay = new Map<string, ActivityItem[]>();
    for (const { commit, repository } of commits) {
      const when = commit.author?.date;
      if (!when) continue;
      const date = new Date(when).toISOString().slice(0, 10);
      const key = `${date} ${repository.full_name}`;

      // Create the day's entry for this repository on first sight
      let entry = entries.get(key);
      if (!entry) {
        entry = { kind: "commits", repo: repository.full_name, url: repository.html_url, count: 0, messages: [] };
        entries.set(key, entry);
        this.append(byDay, date, [entry]);
      }

      // Count every commit, keep the first few messages
      entry.count++;
      if (entry.messages.length < GithubActivityFetcher.MESSAGES_PER_DAY) {
        entry.messages.push(commit.message.split("\n")[0]!.trim());
      }
    }
    return byDay;
  }

  /** Converts the public event feed into per-day items, skipping event types with nothing to show. */
  private async fetchEventDetails(): Promise<Map<string, ActivityItem[]>> {
    // Read every page the feed offers (max 3 × 100)
    const events: ApiEvent[] = [];
    for (let page = 1; page <= 3; page++) {
      const batch = await this.api<ApiEvent[]>(`/users/${this.user}/events/public?per_page=100&page=${page}`);
      events.push(...batch);
      if (batch.length < 100) break;
    }

    // Convert and bucket by UTC day, oldest first so each day reads in order
    const byDay = new Map<string, ActivityItem[]>();
    for (const event of events.reverse()) {
      const item = this.toEventActivity(event);
      if (!item) continue;
      const date = event.created_at.slice(0, 10);
      const list = byDay.get(date) ?? [];

      // Collapse repeated pushes to the same repository on the same day
      if (item.kind === "push" && list.some((i) => i.kind === "push" && i.repo === item.repo)) continue;

      list.push(item);
      byDay.set(date, list);
    }
    return byDay;
  }

  /** Maps one raw event to an `EventActivity`, or `null` when it isn't worth showing. */
  private toEventActivity(event: ApiEvent): EventActivity | null {
    const repo = event.repo.name;
    const repoUrl = `https://github.com/${repo}`;
    const p = event.payload;

    switch (event.type) {
      // New repository or branch; tags are covered by releases
      case "CreateEvent":
        if (p.ref_type === "repository") return { kind: "repository", repo, url: repoUrl };
        if (p.ref_type === "branch" && p.ref) return { kind: "branch", repo, url: `${repoUrl}/tree/${p.ref}`, title: p.ref };
        return null;

      // Published releases
      case "ReleaseEvent":
        if (p.action !== "published") return null;
        return { kind: "release", repo, url: p.release?.html_url ?? `${repoUrl}/releases`, title: p.release?.tag_name };

      // Opened pull requests and issues
      case "PullRequestEvent":
        if (p.action !== "opened") return null;
        return { kind: "pull-request", repo, url: p.pull_request?.html_url ?? `${repoUrl}/pulls`, title: p.pull_request?.title };
      case "IssuesEvent":
        if (p.action !== "opened") return null;
        return { kind: "issue", repo, url: p.issue?.html_url ?? `${repoUrl}/issues`, title: p.issue?.title };

      // Reviews, stars and forks
      case "PullRequestReviewEvent":
        return { kind: "review", repo, url: p.pull_request?.html_url ?? repoUrl, title: p.pull_request?.title };
      case "WatchEvent":
        return { kind: "star", repo, url: repoUrl };
      case "ForkEvent":
        return { kind: "fork", repo, url: p.forkee?.html_url ?? repoUrl };

      // Pushes; dropped later where commit details already cover the day
      case "PushEvent":
        return { kind: "push", repo, url: repoUrl };

      default:
        return null;
    }
  }

  /** GET a GitHub REST endpoint as JSON, authenticating when a token is available. */
  private async api<T>(path: string): Promise<T> {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "portfolio-activity-script",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
    return (await res.json()) as T;
  }

  /** Appends items to a day's list, creating it if needed. */
  private append(target: Record<string, ActivityItem[]> | Map<string, ActivityItem[]>, date: string, items: ActivityItem[]): void {
    if (target instanceof Map) {
      target.set(date, [...(target.get(date) ?? []), ...items]);
    } else {
      target[date] = [...(target[date] ?? []), ...items];
    }
  }
}

// ---------- Entry ---------- //

const user = process.env.GITHUB_USER ?? "Benzo-Fury";
const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
const outPath = new URL("../src/content/github-activity.json", import.meta.url).pathname;

await new GithubActivityFetcher(user, token).run(outPath);
