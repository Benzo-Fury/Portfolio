import type React from "react";
import { cn } from "../../lib/utils";

type CardProps = (React.HTMLAttributes<HTMLElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>) & {
  as?: keyof JSX.IntrinsicElements;
  href?: string;
  target?: string;
  rel?: string;
};

const baseCardClasses =
  "group p-6 sm:p-8 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 hover:shadow-lg cursor-pointer";

export default function Card({
  as: Component = "article",
  className,
  children,
  ...rest
}: Readonly<CardProps>) {
  return (
    <Component className={cn(baseCardClasses, className)} {...rest}>
      {children}
    </Component>
  );
}


