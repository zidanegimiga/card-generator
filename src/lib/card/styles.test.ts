import { describe, expect, it } from "vitest";

import { CARD_STYLES } from "./schema";
import { CARD_STYLE_META, STYLE_GROUPS } from "./styles";

describe("STYLE_GROUPS", () => {
  it("puts every style in exactly one group", () => {
    const grouped = STYLE_GROUPS.flatMap((group) => group.styles);

    expect([...grouped].sort()).toEqual([...CARD_STYLES].sort());
    expect(new Set(grouped).size).toBe(grouped.length);
  });

  it("leads with materials", () => {
    expect(STYLE_GROUPS.map((group) => group.id)).toEqual([
      "materials",
      "layouts",
    ]);
  });
});

describe("CARD_STYLE_META", () => {
  it.each(CARD_STYLES)("describes %s", (style) => {
    expect(CARD_STYLE_META[style].label).not.toBe("");
    expect(CARD_STYLE_META[style].description).toMatch(/\.$/);
  });
});
