import { useEffect, useRef } from "react";

type Props = {
  sections: string[];
  activeSection: string;
  onSelect: (id: string) => void;
};

/**
 * Side navigation that doubles as a reading-progress rail: each pill fills
 * as you scroll through its section. Fills are written straight to the DOM
 * on scroll, so scrolling never re-renders React.
 */
export function NavigationDots({ sections, activeSection, onSelect }: Props) {
  const fills = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    let raf = 0;

    // Progress through each section, measured at the middle of the viewport
    const update = () => {
      raf = 0;
      const mid = window.scrollY + window.innerHeight / 2;
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      sections.forEach((id, i) => {
        const el = document.getElementById(id);
        const fill = fills.current[i];
        if (!el || !fill) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        const progress = atBottom ? 1 : Math.min(1, Math.max(0, (mid - top) / el.offsetHeight));
        fill.style.transform = `scaleY(${progress})`;
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sections.join(",")]);

  return (
    <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block" aria-label="Sections">
      <div className="flex flex-col gap-4">
        {sections.map((section, i) => (
          <button
            key={section}
            onClick={() => onSelect(section)}
            className="group relative w-2 h-8 rounded-full overflow-hidden bg-muted-foreground/25 hover:bg-muted-foreground/45 transition-colors duration-300"
            aria-label={`Navigate to ${section}`}
            aria-current={activeSection === section ? "true" : undefined}
          >
            <span
              ref={(el) => {
                fills.current[i] = el;
              }}
              className="absolute inset-0 origin-top bg-foreground transition-transform duration-150 ease-out"
              style={{ transform: "scaleY(0)" }}
            />
          </button>
        ))}
      </div>
    </nav>
  );
}

export default NavigationDots;
