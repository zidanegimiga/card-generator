import type { ComponentType } from "react";

import { type CardView, toCardView } from "@/lib/card/card-view";
import type { CardConfig, CardStyle } from "@/lib/card/schema";
import { cssFontFamily } from "@/lib/fonts/catalog";

import { BlueprintFace } from "./faces/blueprint";
import { HaloFace } from "./faces/halo";
import { SlateFace } from "./faces/slate";
import { TransitFace } from "./faces/transit";

const FACES: Record<CardStyle, ComponentType<{ view: CardView }>> = {
  slate: SlateFace,
  halo: HaloFace,
  transit: TransitFace,
  blueprint: BlueprintFace,
};

type IdCardProps = {
  config: CardConfig;
  /** Sets the rendered width. Everything inside scales with it. */
  className?: string;
  /** Thumbnails are decorative copies, hidden from assistive tech. */
  decorative?: boolean;
};

export function IdCard({
  config,
  className = "w-52 md:w-72",
  decorative = false,
}: IdCardProps) {
  const Face = FACES[config.style];

  return (
    <article
      aria-label={
        decorative
          ? undefined
          : `${config.brand.name} ID card for ${config.member.fullName}`
      }
      aria-hidden={decorative || undefined}
      data-style={config.style}
      // The card is a size container, so faces size everything in cqw and scale freely.
      className={`@container aspect-[1080/1712] shrink-0 ${className}`}
      style={{ fontFamily: cssFontFamily(config.font) }}
    >
      <div className="size-full overflow-hidden rounded-[5cqw] shadow-2xl ring-1 ring-white/10">
        <Face view={toCardView(config)} />
      </div>
    </article>
  );
}
