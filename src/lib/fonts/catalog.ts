import type { FontSource } from "@/lib/card/schema";

export type FontCategory = "sans" | "serif" | "display" | "mono";

export type CatalogFont = {
  family: string;
  category: FontCategory;
};

/** Every family here has a variable weight axis covering 400 and 600. */
export const GOOGLE_FONTS = [
  { family: "Geist", category: "sans" },
  { family: "Inter", category: "sans" },
  { family: "Manrope", category: "sans" },
  { family: "DM Sans", category: "sans" },
  { family: "Space Grotesk", category: "sans" },
  { family: "Outfit", category: "sans" },
  { family: "Sora", category: "sans" },
  { family: "Bricolage Grotesque", category: "display" },
  { family: "Syne", category: "display" },
  { family: "Unbounded", category: "display" },
  { family: "Fraunces", category: "serif" },
  { family: "Playfair Display", category: "serif" },
  { family: "JetBrains Mono", category: "mono" },
] as const satisfies readonly CatalogFont[];

const FALLBACKS: Record<FontCategory, string> = {
  sans: "ui-sans-serif, system-ui, sans-serif",
  display: "ui-sans-serif, system-ui, sans-serif",
  serif: "ui-serif, Georgia, serif",
  mono: "ui-monospace, monospace",
};

/** One stylesheet URL for the whole catalog, at the two weights the card uses. */
export function googleFontsHref(
  fonts: readonly CatalogFont[] = GOOGLE_FONTS,
): string {
  const params = fonts
    .map((font) => `family=${font.family.replaceAll(" ", "+")}:wght@400;600`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

/** Uploaded fonts get a namespaced family so they can't clash with real ones. */
export function customFontFamily(id: string): string {
  return `cg-upload-${id}`;
}

/** The CSS `font-family` value for a font source, with a sensible fallback. */
export function cssFontFamily(font: FontSource): string {
  if (font.kind === "custom") {
    return `"${customFontFamily(font.id)}", ${FALLBACKS.sans}`;
  }
  const category =
    GOOGLE_FONTS.find((entry) => entry.family === font.family)?.category ??
    "sans";
  return `"${font.family}", ${FALLBACKS[category]}`;
}
