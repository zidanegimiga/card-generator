import { describe, expect, it } from "vitest";

import { relativeLuminance } from "@/lib/color/contrast";

import { DEFAULT_CARD_CONFIG } from "./defaults";
import {
  brandPalette,
  FINISH_PRESETS,
  finishLabel,
  resolvePalette,
} from "./finishes";
import { FINISHES, hexColorSchema } from "./schema";

const brand = DEFAULT_CARD_CONFIG.brand.colors;

describe("resolvePalette", () => {
  it("uses the brand's own colours for the brand finish", () => {
    expect(resolvePalette(brand, "brand")).toMatchObject(brand);
  });

  it("ignores the brand for a preset finish", () => {
    expect(resolvePalette(brand, "gold")).toBe(FINISH_PRESETS.gold.palette);
  });
});

describe("brandPalette", () => {
  it("shades metal tones from the primary: light, the primary, then dark", () => {
    const palette = brandPalette({ ...brand, primary: "#4d7fd1" });

    expect(palette.metalMid).toBe("#4d7fd1");
    expect(relativeLuminance(palette.metalLight)).toBeGreaterThan(
      relativeLuminance(palette.metalMid),
    );
    expect(relativeLuminance(palette.metalDark)).toBeLessThan(
      relativeLuminance(palette.metalMid),
    );
  });
});

describe("FINISH_PRESETS", () => {
  it.each(Object.entries(FINISH_PRESETS))(
    "%s has valid colours ordered light to dark",
    (_finish, { palette }) => {
      for (const colour of Object.values(palette)) {
        expect(hexColorSchema.parse(colour)).toBe(colour);
      }
      expect(relativeLuminance(palette.metalLight)).toBeGreaterThan(
        relativeLuminance(palette.metalMid),
      );
      expect(relativeLuminance(palette.metalMid)).toBeGreaterThan(
        relativeLuminance(palette.metalDark),
      );
    },
  );

  it("labels every finish", () => {
    expect(FINISHES.map(finishLabel)).toEqual([
      "Brand",
      "Silver",
      "Gold",
      "Graphite",
      "Copper",
      "Jade",
      "Cobalt",
      "Bone",
      "Oxblood",
    ]);
  });
});
