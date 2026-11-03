import { mix } from "@/lib/color/mix";

import type { BrandColors, Finish, HexColor } from "./schema";

/** Every colour a card face can use, resolved from the brand or a preset. */
export type Palette = BrandColors & {
  /** Highlight, body, and shadow of the metal for metallic materials. */
  metalLight: HexColor;
  metalMid: HexColor;
  metalDark: HexColor;
};

type Preset = { label: string; palette: Palette };

/** Fixed finishes for when a card should look like a material, not the brand. */
export const FINISH_PRESETS: Record<Exclude<Finish, "brand">, Preset> = {
  silver: {
    label: "Silver",
    palette: {
      background: "#d9dbde",
      text: "#1b1d20",
      primary: "#9aa0a8",
      secondary: "#f4f5f7",
      metalLight: "#f5f6f8",
      metalMid: "#b7bcc3",
      metalDark: "#6d737b",
    },
  },
  gold: {
    label: "Gold",
    palette: {
      background: "#c9a44c",
      text: "#2a1f08",
      primary: "#e8cf86",
      secondary: "#8a6a1f",
      metalLight: "#f6e3a6",
      metalMid: "#c9a44c",
      metalDark: "#7a5c18",
    },
  },
  graphite: {
    label: "Graphite",
    palette: {
      background: "#2a2b2e",
      text: "#e9e9ea",
      primary: "#5a5c61",
      secondary: "#9a9ca1",
      metalLight: "#8c8f95",
      metalMid: "#4a4c51",
      metalDark: "#1c1d20",
    },
  },
  copper: {
    label: "Copper",
    palette: {
      background: "#b87352",
      text: "#2b140a",
      primary: "#e3a77f",
      secondary: "#7a3f22",
      metalLight: "#f2c4a3",
      metalMid: "#b87352",
      metalDark: "#6b351c",
    },
  },
  jade: {
    label: "Jade",
    palette: {
      background: "#1f4d44",
      text: "#e6f2ee",
      primary: "#4fa38f",
      secondary: "#a8d8c8",
      metalLight: "#b8e3d6",
      metalMid: "#4fa38f",
      metalDark: "#163a33",
    },
  },
  cobalt: {
    label: "Cobalt",
    palette: {
      background: "#1d3a6e",
      text: "#eaf0fb",
      primary: "#4d7fd1",
      secondary: "#b9cdf0",
      metalLight: "#c9d8f3",
      metalMid: "#4d7fd1",
      metalDark: "#142951",
    },
  },
  bone: {
    label: "Bone",
    palette: {
      background: "#ece6da",
      text: "#24211c",
      primary: "#b9ad97",
      secondary: "#6f675a",
      metalLight: "#faf7f0",
      metalMid: "#d6ccb9",
      metalDark: "#9a8f7b",
    },
  },
  oxblood: {
    label: "Oxblood",
    palette: {
      background: "#5b1a1f",
      text: "#f3e6e3",
      primary: "#a3333d",
      secondary: "#e3b7b0",
      metalLight: "#e8b9b6",
      metalMid: "#a3333d",
      metalDark: "#3a0f13",
    },
  },
};

export function finishLabel(finish: Finish): string {
  return finish === "brand" ? "Brand" : FINISH_PRESETS[finish].label;
}

/** The brand's own colours, with metal tones shaded from its primary. */
export function brandPalette(colors: BrandColors): Palette {
  return {
    ...colors,
    metalLight: mix(colors.primary, "#ffffff", 0.55),
    metalMid: colors.primary,
    metalDark: mix(colors.primary, "#000000", 0.55),
  };
}

export function resolvePalette(colors: BrandColors, finish: Finish): Palette {
  return finish === "brand"
    ? brandPalette(colors)
    : FINISH_PRESETS[finish].palette;
}
