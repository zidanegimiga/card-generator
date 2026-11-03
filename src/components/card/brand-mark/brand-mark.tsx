/* eslint-disable @next/next/no-img-element -- card images are data URLs, which next/image can't optimise */
import type { CardView } from "@/lib/card/card-view";

import styles from "./brand-mark.module.css";

type BrandMarkProps = {
  view: CardView;
  /** Overrides the text colour, for marks placed on a coloured band. */
  color?: string;
  /** Overrides the placeholder tile, which is the primary colour by default. */
  tileColor?: string;
  className?: string;
};

/** Logo (or a coloured tile) followed by the brand name. */
export function BrandMark({
  view,
  color,
  tileColor,
  className = "",
}: BrandMarkProps) {
  return (
    <div
      className={`${styles.mark} ${className}`}
      style={color ? { color } : undefined}
    >
      {view.logoUrl ? (
        <img src={view.logoUrl} alt="" className={styles.logo} />
      ) : (
        <span
          aria-hidden
          className={styles.tile}
          style={tileColor ? { backgroundColor: tileColor } : undefined}
        />
      )}
      <span className={styles.name}>{view.brandName}</span>
    </div>
  );
}
