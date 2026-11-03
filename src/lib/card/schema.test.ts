import { describe, expect, expectTypeOf, it } from "vitest";

import { DEFAULT_CARD_CONFIG } from "./defaults";
import {
  type CardConfig,
  type CardConfigInput,
  type FontSource,
  cardConfigSchema,
  fontSourceSchema,
  hexColorSchema,
  MEMBER_LIMITS,
  memberSchema,
  parseCardConfig,
} from "./schema";

describe("hexColorSchema", () => {
  it.each([
    ["#5E6AD2", "#5e6ad2"],
    ["#abc", "#aabbcc"],
    ["  #FFF  ", "#ffffff"],
  ])("normalises %j to %j", (input, expected) => {
    expect(hexColorSchema.parse(input)).toBe(expected);
  });

  it.each(["5e6ad2", "#abcd", "#ggg", "red", ""])("rejects %j", (input) => {
    expect(hexColorSchema.safeParse(input).success).toBe(false);
  });
});

describe("fontSourceSchema", () => {
  it("accepts a Google font", () => {
    const font = { kind: "google", family: "Inter" };
    expect(fontSourceSchema.parse(font)).toEqual(font);
  });

  it("accepts an uploaded font reference", () => {
    const font = {
      kind: "custom",
      id: "font_1",
      family: "My Display",
      fileName: "my-display.woff2",
    };
    expect(fontSourceSchema.parse(font)).toEqual(font);
  });

  it("rejects a custom font without a file reference", () => {
    const result = fontSourceSchema.safeParse({
      kind: "custom",
      family: "My Display",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown kind", () => {
    const result = fontSourceSchema.safeParse({ kind: "adobe", family: "x" });
    expect(result.success).toBe(false);
  });

  it("narrows on kind", () => {
    const font = fontSourceSchema.parse({ kind: "google", family: "Inter" });
    if (font.kind === "custom") {
      expectTypeOf(font.fileName).toBeString();
    } else {
      expectTypeOf(font).not.toHaveProperty("fileName");
    }
  });
});

describe("memberSchema", () => {
  const member = DEFAULT_CARD_CONFIG.member;

  it("trims text fields", () => {
    const parsed = memberSchema.parse({ ...member, fullName: "  Ada  " });
    expect(parsed.fullName).toBe("Ada");
  });

  it("requires a name", () => {
    expect(memberSchema.safeParse({ ...member, fullName: " " }).success).toBe(
      false,
    );
  });

  it.each(Object.entries(MEMBER_LIMITS))(
    "caps %s at %i characters",
    (field, limit) => {
      const atLimit = { ...member, [field]: "a".repeat(limit) };
      const overLimit = { ...member, [field]: "a".repeat(limit + 1) };

      expect(memberSchema.safeParse(atLimit).success).toBe(true);
      expect(memberSchema.safeParse(overLimit).success).toBe(false);
    },
  );

  it.each(["4729 9159 692", undefined])("accepts member ID %j", (memberId) => {
    expect(memberSchema.safeParse({ ...member, memberId }).success).toBe(true);
  });

  it.each(["47299159692", "4729-9159-692", "abcd efgh ijk"])(
    "rejects member ID %j",
    (memberId) => {
      expect(memberSchema.safeParse({ ...member, memberId }).success).toBe(
        false,
      );
    },
  );

  it("rejects a non-integer year", () => {
    expect(
      memberSchema.safeParse({ ...member, memberSince: 2025.5 }).success,
    ).toBe(false);
  });
});

describe("cardConfigSchema", () => {
  it("accepts the default config unchanged", () => {
    expect(cardConfigSchema.parse(DEFAULT_CARD_CONFIG)).toEqual(
      DEFAULT_CARD_CONFIG,
    );
  });

  it("rejects an unknown card style", () => {
    const result = cardConfigSchema.safeParse({
      ...DEFAULT_CARD_CONFIG,
      style: "hologram",
    });
    expect(result.success).toBe(false);
  });

  it("separates input and output types", () => {
    expectTypeOf<CardConfigInput["font"]>().toEqualTypeOf<FontSource>();
    expectTypeOf<CardConfig["style"]>().toEqualTypeOf<
      "slate" | "halo" | "transit" | "blueprint"
    >();
  });
});

describe("parseCardConfig", () => {
  it("returns the normalised config on success", () => {
    const input = {
      ...DEFAULT_CARD_CONFIG,
      brand: {
        ...DEFAULT_CARD_CONFIG.brand,
        colors: { ...DEFAULT_CARD_CONFIG.brand.colors, primary: "#ABC" },
      },
    };

    const result = parseCardConfig(input);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.brand.colors.primary).toBe("#aabbcc");
  });

  it("returns readable errors with field paths", () => {
    const result = parseCardConfig({
      ...DEFAULT_CARD_CONFIG,
      member: { ...DEFAULT_CARD_CONFIG.member, fullName: "" },
      brand: { ...DEFAULT_CARD_CONFIG.brand, logoUrl: "not a url" },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(2);
      expect(result.errors.join("\n")).toMatch(/^brand\.logoUrl: /m);
      expect(result.errors.join("\n")).toMatch(/^member\.fullName: /m);
    }
  });

  it("reports a root error for non-objects", () => {
    const result = parseCardConfig(null);
    expect(result).toEqual({
      ok: false,
      errors: [expect.stringMatching(/^\(root\): /)],
    });
  });
});
