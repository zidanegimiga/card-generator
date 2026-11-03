import type { ComponentType } from "react";

import type { CardView } from "@/lib/card/card-view";
import type { CardStyle } from "@/lib/card/schema";

import { AlloyFace } from "./alloy";
import { BlueprintFace } from "./blueprint";
import { CarbonFace } from "./carbon";
import { ChromeFace } from "./chrome";
import { FoilFace } from "./foil";
import { GinghamFace } from "./gingham";
import { PosterFace } from "./poster";
import { PressFace } from "./press";
import { SlateFace } from "./slate";
import { TransitFace } from "./transit";

export type FaceProps = { view: CardView };

/** Every style must have a face; adding a style without one is a type error. */
export const FACES: Record<CardStyle, ComponentType<FaceProps>> = {
  slate: SlateFace,
  alloy: AlloyFace,
  foil: FoilFace,
  chrome: ChromeFace,
  carbon: CarbonFace,
  gingham: GinghamFace,
  press: PressFace,
  poster: PosterFace,
  transit: TransitFace,
  blueprint: BlueprintFace,
};
