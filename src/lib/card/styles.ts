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
