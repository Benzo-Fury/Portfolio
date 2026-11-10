/**
 * Shape of the GitHub activity snapshot written by `scripts/github-activity.ts`
 * and rendered by the Activity section. Shared by both so they can't drift.
 */

/** One square on the contribution calendar. Dates are UTC, as GitHub counts them. */
export type ActivityDay = {
  /** ISO date, `YYYY-MM-DD` */
  date: string;
  count: number;
  /** GitHub's own intensity bucket, 0 (none) to 4 (most) */
  level: 0 | 1 | 2 | 3 | 4;
};

/** Commits pushed to one repository on one day. */
export type CommitActivity = {
  kind: "commits";
  /** Full `owner/name` */
  repo: string;
  url: string;
  count: number;
  /** First line of up to a few commit messages, newest first */
  messages: string[];
};

/** A non-commit event from the public activity feed (last ~90 days only). */
export type EventActivity = {
  kind:
    | "repository"
    | "branch"
    | "release"
    | "pull-request"
    | "issue"
    | "review"
    | "star"
    | "fork"
    | "push";
  /** Full `owner/name`, since events can involve other people's repositories */
  repo: string;
  url: string;
  /** Branch name, release tag, or PR/issue title where one applies */
  title?: string;
};

export type ActivityItem = CommitActivity | EventActivity;

/** The whole snapshot. */
export type ActivityData = {
  user: string;
  /** ISO timestamp of when the snapshot was fetched */
  generatedAt: string;
  total: number;
  /** Chronological, one entry per day for the last year */
  days: ActivityDay[];
  /** Per-day details keyed by ISO date; days with nothing public are omitted */
  details: Record<string, ActivityItem[]>;
};
