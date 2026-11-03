import type { HexColor } from "@/lib/card/schema";
import {
  type ContrastRating,
  contrastRatio,
  rateContrast,
} from "@/lib/color/contrast";

import styles from "./contrast-check.module.css";

const RATING_CLASS: Record<ContrastRating, string> = {
  AAA: styles.pass,
  AA: styles.pass,
  "AA large": styles.warn,
  Low: styles.fail,
};

/** Live WCAG contrast between the card's text and background. */
export function ContrastCheck({
  text,
  background,
}: {
  text: HexColor;
  background: HexColor;
}) {
  const ratio = contrastRatio(text, background);
  const rating = rateContrast(ratio);

  return (
    <p role="status" aria-label="Text contrast" className={styles.row}>
      <span className={styles.label}>Text on background</span>
      <span className={styles.value}>
        {ratio.toFixed(1)}:1{" "}
        <span className={RATING_CLASS[rating]}>{rating}</span>
      </span>
    </p>
  );
}
