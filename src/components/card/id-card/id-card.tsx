import type { CSSProperties } from "react";

import { toCardView } from "@/lib/card/card-view";
import type { CardConfig } from "@/lib/card/schema";
import { cssFontFamily } from "@/lib/fonts/catalog";

import { FACES } from "../faces";
import styles from "./id-card.module.css";

type IdCardProps = {
  config: CardConfig;
  /** Thumbnails and export copies are decorative, hidden from assistive tech. */
  decorative?: boolean;
};

/**
 * Fills its parent's width at the 1080 × 1712 card ratio. The palette is
 * handed to faces as CSS variables, so every face works with every finish.
 */
export function IdCard({ config, decorative = false }: IdCardProps) {
  const view = toCardView(config);
  const Face = FACES[config.style];
  const { colors } = view;
  const font = cssFontFamily(config.font);

  const variables = {
    "--card-bg": colors.background,
    "--card-ink": colors.text,
    "--card-primary": colors.primary,
    "--card-secondary": colors.secondary,
    "--metal-light": colors.metalLight,
    "--metal-mid": colors.metalMid,
    "--metal-dark": colors.metalDark,
    "--card-font": font,
    fontFamily: font,
  } as CSSProperties;

  return (
    <article
      aria-label={
        decorative
          ? undefined
          : `${config.brand.name} ID card for ${config.member.fullName}`
      }
      aria-hidden={decorative || undefined}
      data-style={config.style}
      data-finish={config.finish}
      className={styles.card}
      style={variables}
    >
      <div className={styles.face}>
        <Face view={view} />
      </div>
    </article>
  );
}
