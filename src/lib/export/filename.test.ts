import { describe, expect, it } from "vitest";

import { DEFAULT_CARD_CONFIG } from "@/lib/card/defaults";

import { cardFileName, slugify } from "./filename";

describe("slugify", () => {
  it.each([
    ["Ada Lovelace", "ada-lovelace"],
    ["Élodie Ñúñez & Co.", "elodie-nunez-co"],
    ["  --Linear--  ", "linear"],
    ["日本語", ""],
    ["", ""],
  ])("%j -> %j", (text, slug) => {
    expect(slugify(text)).toBe(slug);
  });
});

describe("cardFileName", () => {
  it("combines brand and member", () => {
    expect(cardFileName(DEFAULT_CARD_CONFIG)).toBe(
      "card-generator-ada-lovelace.png",
    );
  });

  it("falls back to 'card' when nothing is sluggable", () => {
    expect(
      cardFileName({
        ...DEFAULT_CARD_CONFIG,
        brand: { ...DEFAULT_CARD_CONFIG.brand, name: "日本" },
        member: { ...DEFAULT_CARD_CONFIG.member, fullName: "語" },
      }),
    ).toBe("card.png");
  });
});
