import type { ComponentType } from "react";

import { type CardView, toCardView } from "@/lib/card/card-view";
import type { CardConfig, CardStyle } from "@/lib/card/schema";
import { cssFontFamily } from "@/lib/fonts/catalog";

import { BlueprintFace } from "./faces/blueprint";
import { PosterFace } from "./faces/poster";
import { SlateFace } from "./faces/slate";
import { TransitFace } from "./faces/transit";

const FACES: Record<CardStyle, ComponentType<{ view: CardView }>> = {
  slate: SlateFace,
  poster: PosterFace,
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
      <div className="size-full overflow-hidden rounded-[3.2cqw] shadow-[0_2cqw_6cqw_-2cqw_rgba(0,0,0,0.7)]">
        <Face view={toCardView(config)} />
      </div>
    </article>
  );
}
