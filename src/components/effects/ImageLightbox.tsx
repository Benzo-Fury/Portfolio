import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type LightboxImage = { src: string; alt: string; width: number; height: number };

type Props = {
  image: LightboxImage;
  className?: string;
};

const DURATION = 450;
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Largest rect with the image's aspect ratio that fits the viewport with a margin. */
function targetRect(width: number, height: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = vw < 640 ? 16 : 48;
  const scale = Math.min((vw - margin * 2) / width, (vh - margin * 2) / height);
  const w = width * scale;
  const h = height * scale;
  return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
}

/** FLIP transform that makes the target rect look like the source rect. */
function flip(from: DOMRect, to: ReturnType<typeof targetRect>) {
  const dx = from.left - to.left;
  const dy = from.top - to.top;
  return `translate(${dx}px, ${dy}px) scale(${from.width / to.width}, ${from.height / to.height})`;
}

/** Thumbnail that expands to a near full-screen view when clicked. */
function ImageLightbox({ image, className }: Props) {
  const thumbRef = useRef<HTMLButtonElement>(null);
  const bigRef = useRef<HTMLImageElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(() => ({ left: 0, top: 0, width: 0, height: 0 }));
  const closing = useRef(false);

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const openBox = () => {
    closing.current = false;
    setRect(targetRect(image.width, image.height));
    setOpen(true);
  };

  // Animate in from the thumbnail's position
  useLayoutEffect(() => {
    if (!open || !thumbRef.current || !bigRef.current || !backdropRef.current) return;
    const duration = reduced() ? 0 : DURATION;
    thumbRef.current.style.visibility = "hidden";
    bigRef.current.animate(
      [{ transform: flip(thumbRef.current.getBoundingClientRect(), rect) }, { transform: "none" }],
      { duration, easing: EASE },
    );
    backdropRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing: EASE });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = useCallback(() => {
    if (closing.current || !thumbRef.current || !bigRef.current || !backdropRef.current) return;
    closing.current = true;
    const duration = reduced() ? 0 : DURATION;
    const from = thumbRef.current.getBoundingClientRect();
    const current = targetRect(image.width, image.height);
    backdropRef.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration, easing: EASE, fill: "forwards" });
    const anim = bigRef.current.animate(
      [{ transform: "none" }, { transform: flip(from, current) }],
      { duration, easing: EASE, fill: "forwards" },
    );
    anim.onfinish = () => {
      if (thumbRef.current) thumbRef.current.style.visibility = "";
      setOpen(false);
      thumbRef.current?.focus();
    };
  }, [image.width, image.height]);

  // Escape, scroll lock and resize handling while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onResize = () => setRect(targetRect(image.width, image.height));
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.documentElement.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close, image.width, image.height]);

  return (
    <>
      <button
        ref={thumbRef}
        type="button"
        onClick={openBox}
        aria-label={`Enlarge image: ${image.alt}`}
        className="block w-full cursor-zoom-in rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="lazy"
          decoding="async"
          className={className}
        />
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={image.alt}
            className="fixed inset-0 z-[100] cursor-zoom-out"
            onClick={close}
          >
            <div ref={backdropRef} className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
            <img
              ref={bigRef}
              src={image.src}
              alt={image.alt}
              style={{ ...rect, transformOrigin: "0 0" }}
              className="absolute rounded-lg border border-border bg-muted shadow-2xl will-change-transform"
            />
            <button
              type="button"
              autoFocus
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              aria-label="Close image"
              className="absolute right-3 top-3 rounded-full bg-background/80 p-2 text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" />
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}

export default ImageLightbox;
