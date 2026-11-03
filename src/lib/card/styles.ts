import type { CardStyle } from "./schema";

export const CARD_STYLE_META: Record<
  CardStyle,
  { label: string; description: string }
> = {
  slate: {
    label: "Slate",
    description: "Quiet and minimal, with an accent bar.",
  },
  halo: {
    label: "Halo",
    description: "Frosted glass over a glow of brand colour.",
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
