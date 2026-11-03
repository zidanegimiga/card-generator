import { describe, expect, it } from "vitest";

import { contrastRatio, rateContrast, relativeLuminance } from "./contrast";

describe("relativeLuminance", () => {
  it("is 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#ffffff")).toBe(1);
  });

  it("weights green most heavily", () => {
    expect(relativeLuminance("#00ff00")).toBeGreaterThan(
      relativeLuminance("#ff0000"),
    );
    expect(relativeLuminance("#ff0000")).toBeGreaterThan(
      relativeLuminance("#0000ff"),
    );
  });
});

describe("contrastRatio", () => {
  it("ranges from 1 to 21", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBe(21);
    expect(contrastRatio("#5e6ad2", "#5e6ad2")).toBe(1);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#5e6ad2", "#08090a")).toBe(
      contrastRatio("#08090a", "#5e6ad2"),
    );
  });

  // The two greys are the well-known AA boundary; the last is the default palette.
  it.each([
    ["#777777", "#ffffff", 4.48],
    ["#767676", "#ffffff", 4.54],
    ["#f4f4f5", "#0b0b0f", 17.87],
  ] as const)("%s on %s is %d:1", (a, b, expected) => {
    expect(contrastRatio(a, b)).toBeCloseTo(expected, 1);
  });
});

describe("rateContrast", () => {
  it.each([
    [21, "AAA"],
    [7, "AAA"],
    [6.99, "AA"],
    [4.5, "AA"],
    [4.49, "AA large"],
    [3, "AA large"],
    [2.99, "Low"],
  ] as const)("%d -> %s", (ratio, rating) => {
    expect(rateContrast(ratio)).toBe(rating);
  });
});
