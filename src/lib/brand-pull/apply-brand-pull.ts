import type { Brand } from "@/lib/card/schema";

import type { BrandPull } from "./brand-pull-schema";

/** Pulled values fill in the brand; anything the site didn't provide is kept. */
export function applyBrandPull(brand: Brand, pull: BrandPull): Brand {
  return {
    ...brand,
    name: pull.name,
    domain: pull.domain,
    logoUrl: pull.logoUrl ?? brand.logoUrl,
    colors: {
      ...brand.colors,
      primary: pull.primary ?? brand.colors.primary,
      background: pull.background ?? brand.colors.background,
      text: pull.text ?? brand.colors.text,
    },
  };
}
