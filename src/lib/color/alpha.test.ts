import { describe, expect, it } from "vitest";

import { withAlpha } from "./alpha";

describe("withAlpha", () => {
  it("converts hex to rgba", () => {
    expect(withAlpha("#5e6ad2", 0.2)).toBe("rgba(94, 106, 210, 0.2)");
    expect(withAlpha("#000000", 1)).toBe("rgba(0, 0, 0, 1)");
  });

  it("clamps alpha into range", () => {
    expect(withAlpha("#ffffff", 2)).toBe("rgba(255, 255, 255, 1)");
    expect(withAlpha("#ffffff", -1)).toBe("rgba(255, 255, 255, 0)");
  });
});
