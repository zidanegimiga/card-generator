import { describe, expect, it } from "vitest";

import { posterTypeSize } from "./poster";

describe("posterTypeSize", () => {
  it("sizes by the longest word, not the whole name", () => {
    expect(posterTypeSize("Ada Lovelace")).toBe(posterTypeSize("Lovelace"));
  });

  it("shrinks as the longest word grows", () => {
    expect(posterTypeSize("Christopher")).toBeLessThan(posterTypeSize("Ada"));
  });

  it("keeps the longest word inside the 84cqw line", () => {
    // 22 characters is the longest a full name, and so any word in it, can be.
    for (const word of [
      "Al",
      "Lovelace",
      "Wolfeschlegelstein",
      "x".repeat(22),
    ]) {
      const width = posterTypeSize(word) * word.length * 0.62;
      expect(width).toBeLessThanOrEqual(84.01);
    }
  });

  it("caps short names and floors very long ones", () => {
    expect(posterTypeSize("Jo")).toBe(26);
    expect(posterTypeSize("x".repeat(40))).toBe(6);
  });
});
