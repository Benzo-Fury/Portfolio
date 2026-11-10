import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type CollapseProps = {
  open: boolean;
  children: ReactNode;
  id?: string;
  /** Id of the control that labels this region */
  labelledBy?: string;
  className?: string;
};

/**
 * Animates its content open and closed to its natural height (no measuring),
 * using the grid-rows 0fr → 1fr technique. Closed content is `inert`, so it
 * can't be focused or read by assistive tech.
 */
export function Collapse({ open, children, id, labelledBy, className }: CollapseProps) {
  return (
    <div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      inert={!open}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        className,
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

export default Collapse;
