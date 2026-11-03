import type { CardStyle } from "./schema";

export const CARD_STYLE_META: Record<
  CardStyle,
  { label: string; description: string }
> = {
  slate: {
    label: "Slate",
    description: "Quiet and minimal. Name, photo, and ID.",
  },
  alloy: {
    label: "Alloy",
    description: "Brushed metal with an engraved name and a chip.",
  },
  foil: {
    label: "Foil",
    description: "Holographic laminate with guilloche lines and an MRZ.",
  },
  chrome: {
    label: "Chrome",
    description: "Polished chrome with a stamped monogram.",
  },
  carbon: {
    label: "Carbon",
    description: "Carbon fibre weave with a spec sheet.",
  },
  gingham: {
    label: "Gingham",
    description: "A woven check band over cream card stock.",
  },
  press: {
    label: "Press",
    description: "Letterpress paper with a debossed monogram.",
  },
  poster: {
    label: "Poster",
    description: "Oversized type on a solid block of colour.",
  },
  transit: {
    label: "Transit",
    description: "A ticket with a tear-off stub and barcode.",
  },
  blueprint: {
    label: "Blueprint",
    description: "A technical drawing on a measured grid.",
  },
};

export type StyleGroup = {
  id: "materials" | "layouts";
  label: string;
  description: string;
  styles: readonly CardStyle[];
};

/** How the picker sections the styles. Every style appears in exactly one group. */
export const STYLE_GROUPS: readonly StyleGroup[] = [
  {
    id: "materials",
    label: "Materials",
    description: "Metal, film, fibre, fabric, and paper. Pair with a finish.",
    styles: ["alloy", "foil", "chrome", "carbon", "gingham", "press"],
  },
  {
    id: "layouts",
    label: "Layouts",
    description: "Flat designs in your brand colours.",
    styles: ["slate", "poster", "transit", "blueprint"],
  },
];
