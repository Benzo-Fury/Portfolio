import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { ActivityData, ActivityDay } from "../../content/activity.types";
import { formatDayLong, formatMonthShort, parseIsoDay, pluralize } from "../../lib/format";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { cn } from "../../lib/utils";
import DayDetails from "./DayDetails";

type ContributionGraphProps = {
  data: ActivityData;
};

/** A calendar day placed on the week × weekday grid. */
type Cell = ActivityDay & { week: number; weekday: number };

/** Row labels, Sunday first; blanks still render so the pinned column hides cells scrolling beneath it */
const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const RIPPLE_STEP_MS = 28;

/** Keyboard moves, in day offsets, matching the grid's column-per-week layout. */
const KEY_OFFSETS: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 };

/**
 * A GitHub-style year of contributions. Clicking (or pressing Enter on) a day
 * ripples the grid outward from it and opens a card with that day's activity.
 * Arrow keys move between days. On narrow screens the grid scrolls sideways,
 * starting at the most recent week.
 */
export function ContributionGraph({ data }: ContributionGraphProps) {
  const reduced = usePrefersReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [focusIndex, setFocusIndex] = useState(data.days.length - 1);

  // Lay days out in columns of weeks, Sunday at the top
  const { cells, weeks, months } = useMemo(() => {
    const offset = data.days[0] ? parseIsoDay(data.days[0].date).getUTCDay() : 0;
    const cells: Cell[] = data.days.map((day, i) => ({ ...day, week: Math.floor((i + offset) / 7), weekday: (i + offset) % 7 }));
    const weeks = (cells.at(-1)?.week ?? 0) + 1;

    // Label a week when its month differs from the previous label, keeping labels apart
    const months: { week: number; label: string }[] = [];
    let lastMonth = "";
    for (const cell of cells) {
      const month = cell.date.slice(0, 7);
      if (month === lastMonth || Number(cell.date.slice(8)) > 7) continue;
      const prev = months.at(-1);
      if (!prev || cell.week - prev.week >= 3) months.push({ week: cell.week, label: formatMonthShort(cell.date) });
      lastMonth = month;
    }
    return { cells, weeks, months };
  }, [data.days]);

  // Start scrolled to the most recent week
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  // Ripple every cell outward from the chosen one
  const ripple = (origin: Cell) => {
    if (reduced) return;
    cells.forEach((cell, i) => {
      const distance = Math.hypot(cell.week - origin.week, cell.weekday - origin.weekday);
      cellRefs.current[i]?.animate(
        [
          { transform: "scale(1)", filter: "brightness(1)" },
          { transform: "scale(1.4)", filter: "brightness(1.6)" },
          { transform: "scale(1)", filter: "brightness(1)" },
        ],
        { duration: 520, delay: distance * RIPPLE_STEP_MS, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
    });
  };

  const select = (index: number) => {
    const cell = cells[index];
    if (!cell) return;
    anchorRef.current = cellRefs.current[index] ?? null;
    setFocusIndex(index);
    setSelected(index);
    ripple(cell);
  };

  // Arrow keys move focus between days (roving tabindex)
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (e.key in KEY_OFFSETS) next = focusIndex + KEY_OFFSETS[e.key]!;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = cells.length - 1;
    if (next === null) return;
    e.preventDefault();
    next = Math.min(cells.length - 1, Math.max(0, next));
    setFocusIndex(next);
    cellRefs.current[next]?.focus();
    if (selected !== null) select(next);
  };

  const selectedCell = selected !== null ? cells[selected] : undefined;

  return (
    <Popover.Root open={!!selectedCell} onOpenChange={(open) => !open && setSelected(null)}>
      <Popover.Anchor virtualRef={anchorRef as RefObject<HTMLButtonElement>} />

      <div className="space-y-4">
        <div
          ref={scrollRef}
          className="overflow-x-auto pb-2 [scrollbar-width:thin]"
        >
          <div
            role="grid"
            aria-label={`${pluralize(data.total, "contribution")} in the last year`}
            onKeyDown={onKeyDown}
            className="grid min-w-[760px] gap-[3px] sm:min-w-[680px]"
            style={{ gridTemplateColumns: `1.75rem repeat(${weeks}, minmax(0, 1fr))`, gridTemplateRows: "auto repeat(7, auto)" }}
          >
            {/* Month labels across the top */}
            {months.map((m) => (
              <div
                key={m.week}
                aria-hidden="true"
                className="pb-1 font-mono text-[10px] text-muted-foreground whitespace-nowrap"
                style={{ gridRow: 1, gridColumn: `${m.week + 2} / span 3` }}
              >
                {m.label}
              </div>
            ))}

            {/* Pinned corner so month labels slide under it too */}
            <div aria-hidden="true" className="sticky left-0 z-10 bg-background" style={{ gridRow: 1, gridColumn: 1 }} />

            {/* Weekday labels, pinned while the grid scrolls sideways */}
            {WEEKDAY_LABELS.map((label, weekday) => (
              <div
                key={weekday}
                aria-hidden="true"
                className="sticky left-0 z-10 flex items-center self-stretch bg-background font-mono text-[10px] leading-none text-muted-foreground"
                style={{ gridRow: weekday + 2, gridColumn: 1 }}
              >
                {label}
              </div>
            ))}

            {/* Day cells */}
            {cells.map((cell, i) => (
              <button
                key={cell.date}
                ref={(el) => {
                  cellRefs.current[i] = el;
                }}
                type="button"
                role="gridcell"
                data-activity-cell=""
                data-level={cell.level}
                tabIndex={i === focusIndex ? 0 : -1}
                aria-label={`${cell.count ? pluralize(cell.count, "contribution") : "No contributions"} on ${formatDayLong(cell.date)}`}
                aria-selected={selected === i}
                onClick={() => (selected === i ? setSelected(null) : select(i))}
                className={cn(
                  "activity-cell aspect-square w-full cursor-pointer rounded-[3px] outline-none transition-shadow",
                  "hover:ring-1 hover:ring-foreground/40 focus-visible:ring-2 focus-visible:ring-foreground",
                  selected === i && "ring-2 ring-foreground",
                )}
                style={{ gridRow: cell.weekday + 2, gridColumn: cell.week + 2 }}
              />
            ))}
          </div>
        </div>

        {/* Caption and legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>Click any day to see what shipped.</span>
          <span className="flex items-center gap-1.5 font-mono text-[10px]" aria-hidden="true">
            Less
            {[0, 1, 2, 3, 4].map((level) => (
              <span key={level} className="activity-cell inline-block size-2.5 rounded-[2px]" data-level={level} />
            ))}
            More
          </span>
        </div>
      </div>

      <Popover.Portal>
        {selectedCell && (
          <Popover.Content
            key={selectedCell.date}
            side="top"
            align="center"
            sideOffset={10}
            collisionPadding={16}
            hideWhenDetached
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              // Clicking another day switches the card instead of closing it
              if ((e.target as Element | null)?.closest?.("[data-activity-cell]")) e.preventDefault();
            }}
            className="popover-in z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl"
          >
            <DayDetails day={selectedCell} items={data.details[selectedCell.date] ?? []} user={data.user} />
          </Popover.Content>
        )}
      </Popover.Portal>
    </Popover.Root>
  );
}

export default ContributionGraph;
