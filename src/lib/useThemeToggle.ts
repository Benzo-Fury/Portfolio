import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { prefersReducedMotion } from "./usePrefersReducedMotion";

/** Viewport point the circular theme transition grows from. */
export type ThemeOrigin = { x: number; y: number };

const TRANSITION_MS = 700;

export function useThemeToggle(initialDark?: boolean) {
  const getInitial = () => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      if (typeof document !== "undefined") {
        return document.documentElement.classList.contains("dark");
      }
    } catch {}
    return initialDark ?? true;
  };

  const [isDark, setIsDark] = useState<boolean>(getInitial);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {}
  }, [isDark]);

  /**
   * Flips the theme. Given an origin, the new theme spreads out from it in a
   * circle using the View Transitions API; without support, or with reduced
   * motion, it switches instantly.
   */
  const toggleTheme = (origin?: ThemeOrigin) => {
    const next = !isDark;

    // Apply synchronously so the transition snapshots the finished state
    const apply = () => {
      document.documentElement.classList.toggle("dark", next);
      flushSync(() => setIsDark(next));
    };

    if (!origin || !document.startViewTransition || prefersReducedMotion()) {
      apply();
      return;
    }

    // Grow a circle from the origin until it covers the farthest corner
    const { x, y } = origin;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(apply);
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: TRANSITION_MS, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {});
  };

  return { isDark, toggleTheme } as const;
}
