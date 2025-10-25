import { useCallback, useEffect, useRef, useState } from "react";

export function useSectionObserver(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState("");
  const sectionElementsRef = useRef<Array<HTMLElement | null>>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const registerSectionRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      sectionElementsRef.current[index] = el;
    },
    []
  );

  useEffect(() => {
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
            const id = (entry.target as HTMLElement).id;
            if (id) setActiveSection(id);
          }
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px -20% 0px" }
    );

    const currentObserver = observerRef.current;
    sectionElementsRef.current.forEach((el) => {
      if (el) currentObserver.observe(el);
    });

    return () => currentObserver.disconnect();
  }, [sectionIds.join(",")]);

  return { activeSection, registerSectionRef } as const;
}


