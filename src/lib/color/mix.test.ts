import { describe, expect, it } from "vitest";

import { mix } from "./mix";

describe("mix", () => {
  it("returns the ends at 0 and 1", () => {
    expect(mix("#102030", "#ffffff", 0)).toBe("#102030");
    expect(mix("#102030", "#ffffff", 1)).toBe("#ffffff");
  });

  it("blends each channel linearly", () => {
    expect(mix("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(mix("#ff0000", "#0000ff", 0.25)).toBe("#bf0040");
  });

  it("clamps the amount", () => {
    expect(mix("#000000", "#ffffff", 2)).toBe("#ffffff");
    expect(mix("#000000", "#ffffff", -1)).toBe("#000000");
  });
});
