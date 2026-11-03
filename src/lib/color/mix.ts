import type { HexColor } from "@/lib/card/schema";

function channels(hex: HexColor): [number, number, number] {
  return [1, 3, 5].map((start) =>
    parseInt(hex.slice(start, start + 2), 16),
  ) as [number, number, number];
}

/** Linear blend in sRGB: 0 returns `a`, 1 returns `b`. */
export function mix(a: HexColor, b: HexColor, amount: number): HexColor {
  const t = Math.min(1, Math.max(0, amount));
  const [ar, ag, ab] = channels(a);
  const [br, bg, bb] = channels(b);
  const blend = (x: number, y: number) =>
    Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${blend(ar, br)}${blend(ag, bg)}${blend(ab, bb)}`;
}
