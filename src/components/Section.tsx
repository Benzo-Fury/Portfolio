import type React from "react";

type Props = {
  id: string;
  index: number;
  registerRef: (index: number) => (el: HTMLElement | null) => void;
  className?: string;
  children: React.ReactNode;
};

export function Section({ id, index, registerRef, className, children }: Props) {
  return (
    <section id={id} ref={registerRef(index)} className={className}>
      {children}
    </section>
  );
}

export default Section;


