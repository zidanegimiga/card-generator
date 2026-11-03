import type { HexColor } from "@/lib/card/schema";

/** `#5e6ad2` at 0.2 -> `rgba(94, 106, 210, 0.2)`. Alpha is clamped to [0, 1]. */
export function withAlpha(hex: HexColor, alpha: number): string {
  const [r, g, b] = [1, 3, 5].map((start) =>
    parseInt(hex.slice(start, start + 2), 16),
  );
  const a = Math.min(1, Math.max(0, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
