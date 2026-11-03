import { describe, expect, it } from "vitest";

import { fakeFontFile } from "@/test/font-files";

import {
  familyFromFileName,
  formatFromFileName,
  MAX_FONT_BYTES,
  validateFontFile,
} from "./upload";

describe("formatFromFileName", () => {
  it.each([
    ["Brand.woff2", "woff2"],
    ["Brand.WOFF", "woff"],
    ["brand.final.ttf", "ttf"],
    ["brand.otf", "otf"],
    ["brand.txt", null],
    ["woff2", null],
  ])("%s -> %s", (name, format) => {
    expect(formatFromFileName(name)).toBe(format);
  });
});

describe("familyFromFileName", () => {
  it.each([
    ["Space-Mono_Bold.woff2", "Space Mono Bold"],
    ["my__font--v2.ttf", "my font v2"],
    ["  spaced  .otf", "spaced"],
    [".woff2", "Custom font"],
  ])("%j -> %j", (name, family) => {
    expect(familyFromFileName(name)).toBe(family);
  });

  it("caps long names at 64 characters", () => {
    expect(familyFromFileName(`${"a".repeat(80)}.woff2`)).toHaveLength(64);
  });
});

describe("validateFontFile", () => {
  it.each(["woff2", "woff", "otf", "ttf"] as const)(
    "accepts a real %s header",
    async (format) => {
      const result = await validateFontFile(
        fakeFontFile(`Brand-Sans.${format}`, format),
      );

      expect(result).toMatchObject({
        ok: true,
        font: {
          format,
          family: "Brand Sans",
          fileName: `Brand-Sans.${format}`,
        },
      });
    },
  );

  it("accepts the legacy 'true' TrueType signature", async () => {
    const file = new File([new TextEncoder().encode("true....")], "old.ttf");
    expect(await validateFontFile(file)).toMatchObject({
      ok: true,
      font: { format: "ttf" },
    });
  });

  it("trusts the bytes over the extension", async () => {
    const result = await validateFontFile(
      fakeFontFile("mislabeled.ttf", "woff2"),
    );
    expect(result).toMatchObject({ ok: true, font: { format: "woff2" } });
  });

  it("rejects unsupported extensions before reading the file", async () => {
    expect(await validateFontFile(fakeFontFile("brand.svg"))).toEqual({
      ok: false,
      error: "Use a .woff2, .woff, .ttf, or .otf file.",
    });
  });

  it("rejects files over the size limit", async () => {
    const big = new File([new Uint8Array(MAX_FONT_BYTES + 1)], "big.woff2");
    expect(await validateFontFile(big)).toEqual({
      ok: false,
      error: "Font files can be up to 2 MB.",
    });
  });

  it("rejects a renamed file that isn't a font", async () => {
    const fake = new File(["hello world"], "notes.woff2");
    expect(await validateFontFile(fake)).toEqual({
      ok: false,
      error: "That file isn't a font we can read.",
    });
  });

  it("rejects an empty file", async () => {
    expect(await validateFontFile(new File([], "empty.woff2"))).toMatchObject({
      ok: false,
    });
  });
});
