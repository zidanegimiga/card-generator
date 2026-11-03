import { describe, expect, it } from "vitest";

import { barcodeBars, initials, toCardView } from "./card-view";
import { DEFAULT_CARD_CONFIG } from "./defaults";
import { MEMBER_ID_PATTERN } from "./schema";

describe("initials", () => {
  it.each([
    ["Ada Lovelace", "AL"],
    ["grace brewster murray hopper", "GH"],
    ["Cher", "C"],
    ["  Ada   Lovelace  ", "AL"],
    ["Élodie Ñúñez", "ÉÑ"],
    ["", ""],
  ])("%j -> %j", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });

  it("keeps an emoji whole instead of splitting it", () => {
    expect(initials("😀 Smile")).toBe("😀S");
  });
});

describe("toCardView", () => {
  it("flattens the config and resolves derived values", () => {
    const view = toCardView(DEFAULT_CARD_CONFIG);

    expect(view).toMatchObject({
      brandName: "Card Generator",
      fullName: "Ada Lovelace",
      initials: "AL",
      since: 2026,
      colors: DEFAULT_CARD_CONFIG.brand.colors,
    });
    expect(view.memberId).toMatch(MEMBER_ID_PATTERN);
  });

  it("uses the member's own ID when set", () => {
    const view = toCardView({
      ...DEFAULT_CARD_CONFIG,
      member: { ...DEFAULT_CARD_CONFIG.member, memberId: "1111 2222 333" },
    });
    expect(view.memberId).toBe("1111 2222 333");
  });
});

describe("qrValue", () => {
  const withBrand = (domain?: string, qrUrl?: string) =>
    toCardView({
      ...DEFAULT_CARD_CONFIG,
      brand: { ...DEFAULT_CARD_CONFIG.brand, domain },
      member: { ...DEFAULT_CARD_CONFIG.member, qrUrl },
    }).qrValue;

  it("prefers the member's QR link", () => {
    expect(withBrand("linear.app", "https://ada.dev")).toBe("https://ada.dev");
  });

  it("falls back to the brand's site", () => {
    expect(withBrand("linear.app")).toBe("https://linear.app");
  });

  it("is unset when there's neither", () => {
    expect(withBrand()).toBeUndefined();
  });
});

describe("barcodeBars", () => {
  it("makes one bar per digit and ignores spaces", () => {
    expect(barcodeBars("1234 5678 901")).toHaveLength(11);
  });

  it("maps digits to widths and gaps predictably", () => {
    expect(barcodeBars("0 1 2 3")).toEqual([
      { width: 1, gap: 1 },
      { width: 2, gap: 1 },
      { width: 3, gap: 1 },
      { width: 1, gap: 2 },
    ]);
  });

  it("is stable for the same ID", () => {
    expect(barcodeBars("4729 9159 692")).toEqual(barcodeBars("4729 9159 692"));
  });
});
