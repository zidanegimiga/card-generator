/** Returns a number in [0, 1), like `Math.random`. Injectable so tests stay deterministic. */
export type RandomSource = () => number;

const GROUPS = [4, 4, 3] as const;

/** Generates an 11 digit member ID formatted as `1234 5678 901`. */
export function createMemberId(random: RandomSource = Math.random): string {
  return GROUPS.map((size) =>
    Array.from({ length: size }, () => Math.floor(random() * 10)).join(""),
  ).join(" ");
}

/**
 * A small seeded PRNG (FNV-1a hash into mulberry32). The same seed always
 * yields the same sequence, so server and client render the same ID.
 */
export function seededRandom(seed: string): RandomSource {
  let state = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    state = Math.imul(state ^ seed.charCodeAt(i), 0x01000193);
  }

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The ID to print: the member's own, or a stable one derived from brand and name. */
export function resolveMemberId(
  brandName: string,
  member: { fullName: string; memberId?: string },
): string {
  return (
    member.memberId ??
    createMemberId(seededRandom(`${brandName}:${member.fullName}`))
  );
}
