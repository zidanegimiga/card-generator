import { describe, expect, it } from "vitest";

import { parseBrandText, parseHexColor, toBrandDraft } from "./brand-fields";
import { DEFAULT_CARD_CONFIG } from "./defaults";
import { BRAND_NAME_LIMIT } from "./schema";

describe("parseBrandText", () => {
  it("requires a brand name", () => {
    expect(parseBrandText("name", " ")).toEqual({
      ok: false,
      error: "Enter a brand name",
    });
  });

  it("caps the brand name", () => {
    expect(parseBrandText("name", "a".repeat(BRAND_NAME_LIMIT)).ok).toBe(true);
    expect(parseBrandText("name", "a".repeat(BRAND_NAME_LIMIT + 1)).ok).toBe(
      false,
    );
  });

  it("treats an empty domain as unset", () => {
    expect(parseBrandText("domain", "")).toEqual({
      ok: true,
      value: undefined,
    });
  });

  it.each([
    ["linear.app", "linear.app"],
    ["Linear.APP", "linear.app"],
    ["https://linear.app/features?x=1", "linear.app"],
    ["http://www.vercel.com/", "vercel.com"],
    ["docs.example.co.uk", "docs.example.co.uk"],
  ])("normalises %j to %j", (raw, value) => {
    expect(parseBrandText("domain", raw)).toEqual({ ok: true, value });
  });

  it.each(["linear", "not a domain", "-bad.com", "https://"])(
    "rejects domain %j",
    (raw) => {
      expect(parseBrandText("domain", raw)).toEqual({
        ok: false,
        error: "Enter a domain like linear.app",
      });
    },
  );
});

describe("parseHexColor", () => {
  it("normalises valid colours", () => {
    expect(parseHexColor("#ABC")).toEqual({ ok: true, value: "#aabbcc" });
  });

  it("explains invalid colours", () => {
    expect(parseHexColor("#12")).toEqual({
      ok: false,
      error: "Use a hex colour like #5e6ad2",
    });
  });
});

describe("toBrandDraft", () => {
  it("flattens colours next to the text fields", () => {
    expect(toBrandDraft(DEFAULT_CARD_CONFIG.brand)).toEqual({
      name: "Card Generator",
      domain: "",
      ...DEFAULT_CARD_CONFIG.brand.colors,
    });
  });
});
