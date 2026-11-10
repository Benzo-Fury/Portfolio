export type RGB = readonly [number, number, number];

let probe: CanvasRenderingContext2D | null = null;

/**
 * Resolves a CSS custom property (e.g. `--foreground`, defined in oklch) to RGB
 * by painting it onto a 1×1 canvas. Canvas drawing needs plain RGB values.
 */
export function resolveCssColor(variable: string, fallback: RGB = [128, 128, 128]): RGB {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  if (!value) return fallback;

  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe) return fallback;

  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = value;
  probe.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = probe.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

/** Formats an RGB triple with alpha for canvas `fillStyle`. */
export function rgba([r, g, b]: RGB, alpha: number): string {
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Calls `onChange` whenever the site theme flips (the `dark` class on `<html>`).
 * Returns an unsubscribe function.
 */
export function onThemeChange(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
