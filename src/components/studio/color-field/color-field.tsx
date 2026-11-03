"use client";

import { useId } from "react";

import type { HexColor } from "@/lib/card/schema";

import styles from "./color-field.module.css";

type ColorFieldProps = {
  label: string;
  value: string;
  /** Last valid colour, so the swatch stays usable while the hex is mid-edit. */
  committed: HexColor;
  error?: string;
  onChange: (value: string) => void;
};

/** A native colour picker beside a hex input, kept in sync. */
export function ColorField({
  label,
  value,
  committed,
  error,
  onChange,
}: ColorFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.control} data-invalid={error ? true : undefined}>
        <input
          type="color"
          aria-label={`${label} colour picker`}
          value={committed}
          onChange={(event) => onChange(event.target.value)}
          className={styles.swatch}
        />
        <input
          id={id}
          value={value}
          spellCheck={false}
          maxLength={7}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={styles.hex}
        />
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
