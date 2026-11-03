import type { FontSource } from "@/lib/card/schema";
import { cssFontFamily } from "@/lib/fonts/catalog";

import styles from "./font-option.module.css";

type FontOptionProps = {
  /** Shared radio group name. */
  name: string;
  font: FontSource;
  label: string;
  detail: string;
  checked: boolean;
  onSelect: (font: FontSource) => void;
};

/** One font as a radio row, previewed in its own typeface. */
export function FontOption({
  name,
  font,
  label,
  detail,
  checked,
  onSelect,
}: FontOptionProps) {
  return (
    <label className={styles.option}>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={() => onSelect(font)}
        className="sr-only"
      />
      <span aria-hidden className={styles.marker} />
      <span
        className={styles.label}
        style={{ fontFamily: cssFontFamily(font) }}
      >
        {label}
      </span>
      <span className={styles.detail}>{detail}</span>
    </label>
  );
}
