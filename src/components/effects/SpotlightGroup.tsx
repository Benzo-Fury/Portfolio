import { useRef, type ElementType, type PointerEvent, type ReactNode } from "react";

type SpotlightGroupProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};

const OFFSCREEN = "-9999px";

/**
 * Shares one cursor-following light across every descendant marked
 * `data-spotlight="border"` (lit border + soft glow), so neighbouring cards
 * catch the edge of the light too. Styles live in global.css.
 */
export function SpotlightGroup({ children, as: Tag = "div", className }: SpotlightGroupProps) {
  const ref = useRef<HTMLElement>(null);

  // Position the light relative to each target
  const setPosition = (x: number | null, y: number | null) => {
    ref.current?.querySelectorAll<HTMLElement>("[data-spotlight]").forEach((el) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", x === null ? OFFSCREEN : `${x - rect.left}px`);
      el.style.setProperty("--my", y === null ? OFFSCREEN : `${y - rect.top}px`);
    });
  };

  return (
    <Tag
      ref={ref}
      className={className}
      onPointerMove={(e: PointerEvent) => e.pointerType !== "touch" && setPosition(e.clientX, e.clientY)}
      onPointerLeave={() => setPosition(null, null)}
    >
      {children}
    </Tag>
  );
}

export default SpotlightGroup;
