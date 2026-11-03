import { describe, expect, it } from "vitest";

import {
  cssFontFamily,
  customFontFamily,
  GOOGLE_FONTS,
  googleFontsHref,
} from "./catalog";

describe("googleFontsHref", () => {
  it("requests each family at weights 400 and 600", () => {
    const href = googleFontsHref([
      { family: "Inter", category: "sans" },
      { family: "DM Sans", category: "sans" },
    ]);

    expect(href).toBe(
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=DM+Sans:wght@400;600&display=swap",
    );
  });

  it("includes the whole catalog by default", () => {
    const families = new URL(googleFontsHref()).searchParams.getAll("family");
    expect(families).toHaveLength(GOOGLE_FONTS.length);
  });

  it("has no duplicate families", () => {
    const names = GOOGLE_FONTS.map((font) => font.family);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("cssFontFamily", () => {
  it("uses a category-appropriate fallback for Google fonts", () => {
    expect(cssFontFamily({ kind: "google", family: "Fraunces" })).toBe(
      '"Fraunces", ui-serif, Georgia, serif',
    );
    expect(cssFontFamily({ kind: "google", family: "JetBrains Mono" })).toMatch(
      /monospace$/,
    );
  });

  it("falls back to sans for families outside the catalog", () => {
    expect(cssFontFamily({ kind: "google", family: "Lato" })).toMatch(
      /^"Lato", ui-sans-serif/,
    );
  });

  it("points uploaded fonts at their namespaced family", () => {
    const css = cssFontFamily({
      kind: "custom",
      id: "abc",
      family: "Inter",
      fileName: "inter.woff2",
    });

    expect(customFontFamily("abc")).toBe("cg-upload-abc");
    expect(css).toMatch(/^"cg-upload-abc", /);
  });
});
