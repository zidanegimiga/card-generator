import { describe, expect, it } from "vitest";

import { createMemberId } from "./member-id";
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
