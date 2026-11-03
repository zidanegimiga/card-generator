export type Tilt = {
  /** Degrees around the horizontal axis. Pointer above centre tips the top back. */
  rotateX: number;
  /** Degrees around the vertical axis. Pointer right of centre turns the card right. */
  rotateY: number;
  /** Where the sheen sits, as percentages across the card. */
  glareX: number;
  glareY: number;
};

export const RESTING_TILT: Tilt = {
  rotateX: 0,
  rotateY: 0,
  glareX: 50,
  glareY: 50,
};

type Rect = Pick<DOMRect, "left" | "top" | "width" | "height">;

/** Maps a pointer position over `rect` to a tilt of at most `maxDegrees`. */
export function tiltFromPointer(
  clientX: number,
  clientY: number,
  rect: Rect,
  maxDegrees = 10,
): Tilt {
  if (rect.width === 0 || rect.height === 0) return RESTING_TILT;
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  const x = clamp((clientX - rect.left) / rect.width);
  const y = clamp((clientY - rect.top) / rect.height);

  return {
    rotateX: (0.5 - y) * 2 * maxDegrees,
    rotateY: (x - 0.5) * 2 * maxDegrees,
    glareX: x * 100,
    glareY: y * 100,
  };
}
