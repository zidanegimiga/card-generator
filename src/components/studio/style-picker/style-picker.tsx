"use client";

import { useId } from "react";

import { IdCard } from "@/components/card/id-card";
import type { CardConfig, CardStyle } from "@/lib/card/schema";
import { CARD_STYLE_META, STYLE_GROUPS } from "@/lib/card/styles";

import styles from "./style-picker.module.css";

type StylePickerProps = {
  config: CardConfig;
  onChange: (style: CardStyle) => void;
};

/**
 * Styles sectioned into materials and layouts. All options share one radio
 * group, so arrow keys move through every style, across both sections.
 */
export function StylePicker({ config, onChange }: StylePickerProps) {
  const name = useId();

  return (
    <fieldset className={styles.picker}>
      <legend className="sr-only">Card style</legend>

      {STYLE_GROUPS.map((group) => (
        <section
          key={group.id}
          aria-labelledby={`${name}-${group.id}`}
          className={styles.group}
        >
          <header className={styles.groupHeader}>
            <h3 id={`${name}-${group.id}`} className={styles.groupTitle}>
              {group.label}
            </h3>
            <p className={styles.groupDescription}>{group.description}</p>
          </header>

          <div className={styles.grid}>
            {group.styles.map((style) => {
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
        </section>
      ))}
    </fieldset>
  );
}
