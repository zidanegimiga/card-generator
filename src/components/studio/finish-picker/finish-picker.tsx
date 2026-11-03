"use client";

import { useId } from "react";

import { finishLabel, resolvePalette } from "@/lib/card/finishes";
import { type BrandColors, type Finish, FINISHES } from "@/lib/card/schema";

import styles from "./finish-picker.module.css";

type FinishPickerProps = {
  value: Finish;
  /** The brand's colours, so the "Brand" swatch shows them. */
  brandColors: BrandColors;
  onChange: (finish: Finish) => void;
};

/** Colourways for the card: the brand's own, or a material preset. */
export function FinishPicker({
  value,
  brandColors,
  onChange,
}: FinishPickerProps) {
  const name = useId();

  return (
    <fieldset className={styles.picker}>
      <legend className={styles.legend}>Finish</legend>
      <div className={styles.grid}>
        {FINISHES.map((finish) => {
          const palette = resolvePalette(brandColors, finish);
          return (
            <label key={finish} className={styles.option}>
              <input
                type="radio"
                name={name}
                value={finish}
                checked={value === finish}
                onChange={() => onChange(finish)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={styles.swatch}
                style={{
                  background: `linear-gradient(135deg, ${palette.metalDark}, ${palette.metalLight} 45%, ${palette.metalMid} 60%, ${palette.background})`,
                }}
              />
              <span className={styles.label}>{finishLabel(finish)}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
