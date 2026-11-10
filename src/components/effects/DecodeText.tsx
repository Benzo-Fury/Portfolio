import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "../../lib/useInView";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { cn } from "../../lib/utils";

type DecodeTextProps = {
  text: string;
  /** Play when mounted, or the first time it scrolls into view */
  trigger?: "mount" | "inView";
  /** Wait before the first play, in ms */
  delay?: number;
  replayOnHover?: boolean;
  className?: string;
};

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_+*#";
const TICK_MS = 45;

/** One random glyph per character, or `null` where the real character shows. */
type Frame = (string | null)[];

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;
const scrambled = (text: string): Frame => [...text].map((c) => (c === " " ? null : randomGlyph()));

/**
 * Text that resolves from scrambled glyphs, one character at a time.
 * Each glyph sits over its invisible real character, so the layout never shifts.
 * Screen readers get the plain text; reduced motion shows it immediately.
 */
export function DecodeText({ text, trigger = "inView", delay = 0, replayOnHover = true, className }: DecodeTextProps) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.5 });
  const [frame, setFrame] = useState<Frame | null>(() => (reduced ? null : scrambled(text)));
  const running = useRef(false);
  const raf = useRef(0);

  const play = useCallback(
    (wait = 0) => {
      if (reduced || running.current) return;
      running.current = true;

      // Each character resolves at a slightly random time, left to right
      const chars = [...text];
      const resolveAt = chars.map((_, i) => 80 + i * 40 + Math.random() * 220);
      const start = performance.now() + wait;
      let lastTick = -Infinity;

      const step = (now: number) => {
        const elapsed = now - start;
        const done = elapsed >= Math.max(...resolveAt);

        // Swap glyphs at a readable pace rather than every frame
        if (done || now - lastTick >= TICK_MS) {
          lastTick = now;
          setFrame(done ? null : chars.map((c, i) => (c === " " || elapsed >= resolveAt[i]! ? null : randomGlyph())));
        }
        if (done) {
          running.current = false;
          return;
        }
        raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    },
    [reduced, text],
  );

  // First play on mount or on entering the viewport
  const shouldPlay = trigger === "mount" || inView;
  useEffect(() => {
    if (reduced) setFrame(null);
    else if (shouldPlay) play(delay);
  }, [shouldPlay, reduced, delay, play]);

  // Stop on unmount (and StrictMode's simulated unmount) so a later play can start
  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      running.current = false;
    },
    [],
  );

  return (
    <span ref={ref} className={className} onPointerEnter={replayOnHover ? () => play() : undefined}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {frame
          ? [...text].map((char, i) =>
              frame[i] ? (
                <span key={i} className="relative">
                  <span className="invisible">{char}</span>
                  <span className="absolute left-1/2 top-0 -translate-x-1/2 text-muted-foreground/70">{frame[i]}</span>
                </span>
              ) : (
                <span key={i}>{char}</span>
              ),
            )
          : text}
      </span>
    </span>
  );
}

export default DecodeText;
