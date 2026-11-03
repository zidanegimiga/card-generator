/** Returns a number in [0, 1), like `Math.random`. Injectable so tests stay deterministic. */
export type RandomSource = () => number;

const GROUPS = [4, 4, 3] as const;

/** Generates an 11 digit member ID formatted as `1234 5678 901`. */
export function createMemberId(random: RandomSource = Math.random): string {
  return GROUPS.map((size) =>
    Array.from({ length: size }, () => Math.floor(random() * 10)).join(""),
  ).join(" ");
}
