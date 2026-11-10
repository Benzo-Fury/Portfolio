import { useEffect, useRef } from "react";
import { onThemeChange, resolveCssColor, rgba } from "../../lib/color";
import { prefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { cn } from "../../lib/utils";

type DotFieldProps = {
  /** Distance between dots, in CSS pixels */
  gap?: number;
  className?: string;
};

/** Alpha is quantised so dots can be drawn in a few batched paths per frame */
const ALPHA_STEPS = 24;
const TAU = Math.PI * 2;
const RIPPLE_SPEED = 0.42; // px per ms
const RIPPLE_LIFE = 1700; // ms

type Ripple = { x: number; y: number; t: number };

/**
 * A canvas grid of dots that brightens and parts around the cursor, breathes
 * slowly while idle and ripples outward on click. Fills its parent; the canvas
 * itself ignores pointer events, so content placed above stays clickable.
 *
 * Stops drawing when off-screen or when the tab is hidden. With reduced motion
 * the idle wave and ripples are off and it only redraws when the pointer moves.
 */
export function DotField({ gap = 26, className }: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = prefersReducedMotion();

    let width = 0;
    let height = 0;
    let raf = 0;
    let visible = true;
    let fade = 0;
    const pointer = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, inside: false };
    const ripples: Ripple[] = [];

    // Precompute fill styles per alpha step for both colours
    let dotStyles: string[] = [];
    let rippleStyles: string[] = [];
    const readColors = () => {
      const fg = resolveCssColor("--foreground");
      const signal = resolveCssColor("--signal");
      dotStyles = Array.from({ length: ALPHA_STEPS + 1 }, (_, i) => rgba(fg, i / ALPHA_STEPS));
      rippleStyles = Array.from({ length: ALPHA_STEPS + 1 }, (_, i) => rgba(signal, i / ALPHA_STEPS));
      requestDraw();
    };

    // Batches of [x, y, r] triples, one per alpha step
    const dotBatches: number[][] = Array.from({ length: ALPHA_STEPS + 1 }, () => []);
    const rippleBatches: number[][] = Array.from({ length: ALPHA_STEPS + 1 }, () => []);

    const draw = (now: number) => {
      raf = 0;
      if (!visible || document.hidden || !width) return;

      // Ease pointer and hover strength toward their targets
      pointer.x += (pointer.tx - pointer.x) * 0.16;
      pointer.y += (pointer.ty - pointer.y) * 0.16;
      fade += ((pointer.inside ? 1 : 0) - fade) * 0.07;
      while (ripples.length && now - ripples[0]!.t > RIPPLE_LIFE) ripples.shift();

      const radius = Math.min(180, Math.max(110, width * 0.14));
      const time = reduced ? 0 : now * 0.001;
      const cols = Math.ceil(width / gap) + 1;
      const rows = Math.ceil(height / gap) + 1;
      const ox = (width - (cols - 1) * gap) / 2;
      const oy = (height - (rows - 1) * gap) / 2;
      dotBatches.forEach((b) => (b.length = 0));
      rippleBatches.forEach((b) => (b.length = 0));

      // Work out each dot's offset and brightness
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x0 = ox + i * gap;
          const y0 = oy + j * gap;
          let dx = 0;
          let dy = 0;
          let glow = 0;
          let ring = 0;

          // Hover: brighten and push away from the cursor
          const px = x0 - pointer.x;
          const py = y0 - pointer.y;
          const pd = Math.hypot(px, py);
          if (fade > 0.01 && pd < radius) {
            const k = 1 - pd / radius;
            glow = k * k * fade;
            if (pd > 0.5) {
              dx += (px / pd) * glow * 12;
              dy += (py / pd) * glow * 12;
            }
          }

          // Ripples: a bright band expanding from each click
          for (const r of ripples) {
            const rx = x0 - r.x;
            const ry = y0 - r.y;
            const rd = Math.hypot(rx, ry);
            const age = now - r.t;
            const band = Math.max(0, 1 - Math.abs(rd - age * RIPPLE_SPEED) / 38) * (1 - age / RIPPLE_LIFE);
            if (band > 0) {
              ring = Math.max(ring, band);
              if (rd > 0.5) {
                dx += (rx / rd) * band * 7;
                dy += (ry / rd) * band * 7;
              }
            }
          }

          // Queue into the matching batch
          const base = 0.15 + (reduced ? 0 : 0.06 * Math.sin(time * 1.1 + i * 0.33 + j * 0.21));
          const strength = Math.max(glow, ring);
          const useRipple = ring > glow && ring > 0.2;
          const alpha = Math.min(1, base + (useRipple ? ring : glow * 0.8));
          const batch = (useRipple ? rippleBatches : dotBatches)[Math.round(alpha * ALPHA_STEPS)]!;
          batch.push(x0 + dx, y0 + dy, 1 + strength * 1.4);
        }
      }

      // Paint each batch as one path
      ctx.clearRect(0, 0, width, height);
      const paint = (batches: number[][], styles: string[]) => {
        batches.forEach((batch, step) => {
          if (!batch.length) return;
          ctx.fillStyle = styles[step]!;
          ctx.beginPath();
          for (let k = 0; k < batch.length; k += 3) {
            const x = batch[k]!;
            const y = batch[k + 1]!;
            const r = batch[k + 2]!;
            ctx.moveTo(x + r, y);
            ctx.arc(x, y, r, 0, TAU);
          }
          ctx.fill();
        });
      };
      paint(dotBatches, dotStyles);
      paint(rippleBatches, rippleStyles);

      // Keep going while anything is still moving
      const settling = Math.abs((pointer.inside ? 1 : 0) - fade) > 0.005 || Math.abs(pointer.tx - pointer.x) > 0.5 || Math.abs(pointer.ty - pointer.y) > 0.5;
      if (!reduced || settling || ripples.length) requestDraw();
    };

    function requestDraw() {
      if (!raf) raf = requestAnimationFrame(draw);
    }

    // Size the backing store to the element, capped at 2x density
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      requestDraw();
    };

    // Pointer tracking happens on window because the canvas ignores pointer events
    const local = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const p = local(e);
      if (!pointer.inside && p.inside) {
        pointer.x = p.x;
        pointer.y = p.y;
      }
      pointer.tx = p.x;
      pointer.ty = p.y;
      pointer.inside = p.inside;
      requestDraw();
    };
    const onDown = (e: PointerEvent) => {
      const p = local(e);
      if (!p.inside || reduced) return;
      ripples.push({ x: p.x, y: p.y, t: performance.now() });
      requestDraw();
    };
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget) return;
      pointer.inside = false;
      requestDraw();
    };

    // Pause off-screen and in background tabs
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible) requestDraw();
    });
    const ro = new ResizeObserver(resize);
    const offTheme = onThemeChange(readColors);
    io.observe(canvas);
    ro.observe(canvas);
    readColors();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerout", onOut, { passive: true });
    document.addEventListener("visibilitychange", requestDraw);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      offTheme();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerout", onOut);
      document.removeEventListener("visibilitychange", requestDraw);
    };
  }, [gap]);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn("block h-full w-full pointer-events-none", className)} />;
}

export default DotField;
