import { useEffect, useRef, useState } from "react";

type Options = {
  /** Fraction of the element that must be visible */
  threshold?: number;
  rootMargin?: string;
};

/**
 * Reports when an element first scrolls into view. Stays `true` afterwards,
 * so reveal animations play once.
 */
export function useInView<T extends Element>({ threshold = 0.15, rootMargin = "0px 0px -8% 0px" }: Options = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, inView } as const;
}
