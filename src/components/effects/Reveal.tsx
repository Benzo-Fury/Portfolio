import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "../../lib/useInView";
import { cn } from "../../lib/utils";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  /** Extra wait before animating, in ms */
  delay?: number;
  /** Animate each direct child in turn instead of the wrapper as a whole */
  stagger?: boolean;
  className?: string;
};

/**
 * Rises in from a soft blur the first time it scrolls into view.
 * Styles live in global.css (`.reveal`, `.reveal-group`) and are disabled for reduced motion.
 */
export function Reveal({ children, as: Tag = "div", delay = 0, stagger = false, className }: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();
  const style = delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined;

  return (
    <Tag ref={ref} data-in={inView} style={style} className={cn(stagger ? "reveal-group" : "reveal", className)}>
      {children}
    </Tag>
  );
}

export default Reveal;
