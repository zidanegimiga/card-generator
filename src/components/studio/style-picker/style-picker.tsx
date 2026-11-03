"use client";

import { useId } from "react";

import { IdCard } from "@/components/card/id-card";
import {
  type CardConfig,
  CARD_STYLES,
  type CardStyle,
} from "@/lib/card/schema";
import { CARD_STYLE_META } from "@/lib/card/styles";

import styles from "./style-picker.module.css";

type StylePickerProps = {
  config: CardConfig;
  onChange: (style: CardStyle) => void;
};

/** Each option previews the member's own card in that style. */
export function StylePicker({ config, onChange }: StylePickerProps) {
  const name = useId();

  return (
    <fieldset>
      <legend className="sr-only">Card style</legend>
      <div className={styles.grid}>
        {CARD_STYLES.map((style) => {
          const meta = CARD_STYLE_META[style];
          return (
            <label key={style} className={styles.option}>
              <input
                type="radio"
                name={name}
                value={style}
                checked={config.style === style}
                onChange={() => onChange(style)}
                aria-labelledby={`${name}-${style}-label`}
                aria-describedby={`${name}-${style}`}
                className="sr-only"
              />
              <div className={styles.preview}>
                <IdCard config={{ ...config, style }} decorative />
              </div>
              <span id={`${name}-${style}-label`} className={styles.label}>
                <span aria-hidden className={styles.marker} />
                {meta.label}
              </span>
              <span id={`${name}-${style}`} className={styles.description}>
                {meta.description}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
