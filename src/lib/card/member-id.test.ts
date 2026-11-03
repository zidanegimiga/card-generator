import { describe, expect, it } from "vitest";

import { createMemberId, resolveMemberId, seededRandom } from "./member-id";
import { MEMBER_ID_PATTERN } from "./schema";

/** Cycles through fixed values so output is predictable. */
function sequence(...values: number[]) {
  let index = 0;
  return () => values[index++ % values.length]!;
}

describe("createMemberId", () => {
  it("formats 11 digits as 4-4-3 groups", () => {
    const id = createMemberId(sequence(0.1, 0.25, 0.99));
    expect(id).toBe("1291 2912 912");
  });

  it("maps the edges of the random range to 0 and 9", () => {
    expect(createMemberId(() => 0)).toBe("0000 0000 000");
    expect(createMemberId(() => 0.9999)).toBe("9999 9999 999");
  });

  it("always matches the schema's member ID pattern", () => {
    for (let i = 0; i < 100; i++) {
      expect(createMemberId()).toMatch(MEMBER_ID_PATTERN);
    }
  });
});

describe("seededRandom", () => {
  it("repeats the same sequence for the same seed", () => {
    const a = seededRandom("linear:ada");
    const b = seededRandom("linear:ada");
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("differs between seeds", () => {
    expect(seededRandom("a")()).not.toBe(seededRandom("b")());
  });

  it("stays within [0, 1)", () => {
    const random = seededRandom("range");
    for (let i = 0; i < 1000; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("resolveMemberId", () => {
  it("prefers the member's own ID", () => {
    expect(
      resolveMemberId("Linear", { fullName: "Ada", memberId: "1111 2222 333" }),
    ).toBe("1111 2222 333");
  });

  it("derives a stable ID from brand and name otherwise", () => {
    const first = resolveMemberId("Linear", { fullName: "Ada" });

    expect(first).toMatch(MEMBER_ID_PATTERN);
    expect(resolveMemberId("Linear", { fullName: "Ada" })).toBe(first);
    expect(resolveMemberId("Linear", { fullName: "Grace" })).not.toBe(first);
  });
});
