import { useEffect, useState } from "react";
import { useInView } from "../../lib/useInView";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { cn } from "../../lib/utils";

type CountUpProps = {
  value: number;
  /** How far below `value` to start counting */
  span?: number;
  /** Animation length in ms */
  duration?: number;
  className?: string;
};

/** A number that counts up to `value` (ease-out) when it first scrolls into view. */
export function CountUp({ value, span = 6, duration = 900, className }: CountUpProps) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [shown, setShown] = useState(reduced ? value : value - span);

  useEffect(() => {
    if (reduced) {
      setShown(value);
      return;
    }
    if (!inView) return;

    const from = value - span;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      setShown(Math.round(from + (value - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, value, span, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}

export default CountUp;
