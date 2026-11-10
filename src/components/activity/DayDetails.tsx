import {
  BookPlus,
  CircleDot,
  Eye,
  GitBranch,
  GitCommitHorizontal,
  GitFork,
  GitPullRequest,
  Star,
  Tag,
  Upload,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import type { ActivityDay, ActivityItem, CommitActivity, EventActivity } from "../../content/activity.types";
import { formatDayLong, pluralize } from "../../lib/format";

type DayDetailsProps = {
  day: ActivityDay;
  items: ActivityItem[];
  user: string;
};

/** Icon and verb for each event kind. */
const EVENT_COPY: Record<EventActivity["kind"], { icon: LucideIcon; verb: string }> = {
  repository: { icon: BookPlus, verb: "Created" },
  branch: { icon: GitBranch, verb: "New branch in" },
  release: { icon: Tag, verb: "Released" },
  "pull-request": { icon: GitPullRequest, verb: "Opened a pull request in" },
  issue: { icon: CircleDot, verb: "Opened an issue in" },
  review: { icon: Eye, verb: "Reviewed a pull request in" },
  star: { icon: Star, verb: "Starred" },
  fork: { icon: GitFork, verb: "Forked" },
  push: { icon: Upload, verb: "Pushed to" },
};

/** Event kinds GitHub counts as contributions (stars, branches and so on don't count). */
const CONTRIBUTION_KINDS = new Set<EventActivity["kind"]>(["repository", "pull-request", "issue", "review"]);

const MESSAGES_SHOWN = 3;

/**
 * What happened on one day: the contribution count, public commits grouped
 * by repository, other public events, and how much of the count is private.
 */
export function DayDetails({ day, items, user }: DayDetailsProps) {
  // Whatever the public details don't account for is private or unlisted work
  const publicCount = items.reduce(
    (sum, item) => sum + (item.kind === "commits" ? item.count : CONTRIBUTION_KINDS.has(item.kind) ? 1 : 0),
    0,
  );
  const hidden = Math.max(0, day.count - publicCount);
  const dayUrl = `https://github.com/${user}?tab=overview&from=${day.date}&to=${day.date}`;

  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-1">
        <div className="font-medium">{formatDayLong(day.date)}</div>
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span className="activity-cell inline-block size-2.5 rounded-[2px]" data-level={day.level} />
          {day.count ? pluralize(day.count, "contribution") : "No contributions"}
        </div>
      </div>

      {items.length > 0 && (
        <ul className="space-y-3 border-t border-border pt-3">
          {items.map((item, i) =>
            item.kind === "commits" ? (
              <CommitRow key={i} item={item} user={user} />
            ) : (
              <EventRow key={i} item={item} user={user} />
            ),
          )}
        </ul>
      )}

      {hidden > 0 && (
        <p className="text-xs text-muted-foreground">
          {items.length ? "Plus " : ""}
          {pluralize(hidden, "contribution")} to private repositories or not listed publicly.
        </p>
      )}

      <a
        href={dayUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        View this day on GitHub <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

/** Shows `name` for the user's own repositories and `owner/name` for everyone else's. */
function repoLabel(repo: string, user: string): string {
  return repo.startsWith(`${user}/`) ? repo.slice(user.length + 1) : repo;
}

function RepoLink({ repo, url, user }: { repo: string; url: string; user: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="font-medium text-foreground hover:underline underline-offset-2 break-all">
      {repoLabel(repo, user)}
    </a>
  );
}

function Row({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-1.5">{children}</div>
    </li>
  );
}

function CommitRow({ item, user }: { item: CommitActivity; user: string }) {
  const more = item.count - Math.min(item.messages.length, MESSAGES_SHOWN);
  return (
    <Row icon={GitCommitHorizontal}>
      <div className="text-muted-foreground">
        {pluralize(item.count, "commit")} to <RepoLink repo={item.repo} url={item.url} user={user} />
      </div>
      <ul className="space-y-1 font-mono text-[11px] leading-snug text-muted-foreground">
        {item.messages.slice(0, MESSAGES_SHOWN).map((message, i) => (
          <li key={i} className="truncate" title={message}>
            {message}
          </li>
        ))}
        {more > 0 && <li>+{more} more</li>}
      </ul>
    </Row>
  );
}

function EventRow({ item, user }: { item: EventActivity; user: string }) {
  const { icon, verb } = EVENT_COPY[item.kind];
  return (
    <Row icon={icon}>
      <div className="text-muted-foreground">
        {verb} <RepoLink repo={item.repo} url={item.url} user={user} />
      </div>
      {item.title && <div className="truncate font-mono text-[11px] text-muted-foreground">{item.title}</div>}
    </Row>
  );
}

export default DayDetails;
