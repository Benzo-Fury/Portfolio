/** "1 contribution" / "12 contributions" */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count.toLocaleString("en-AU")} ${count === 1 ? singular : plural}`;
}

/** Parses a `YYYY-MM-DD` string as a UTC date, matching how GitHub buckets days. */
export function parseIsoDay(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

/** "Tuesday, 4 March 2026" for a `YYYY-MM-DD` string. */
export function formatDayLong(day: string): string {
  return parseIsoDay(day).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "Mar" for a `YYYY-MM-DD` string. */
export function formatMonthShort(day: string): string {
  return parseIsoDay(day).toLocaleDateString("en-AU", { month: "short", timeZone: "UTC" });
}

/** "10 Nov 2026" for any ISO timestamp. */
export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}
