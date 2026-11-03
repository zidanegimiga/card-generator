"use client";

import { type HTMLInputTypeAttribute, useId } from "react";

import styles from "./text-field.module.css";

export type FieldMeta = {
  label: string;
  hint?: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  inputMode?: "numeric" | "url";
  maxLength?: number;
};

type TextFieldProps = {
  meta: FieldMeta;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

/** A labelled input with an optional hint, error, and character counter. */
export function TextField({ meta, value, error, onChange }: TextFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const counterId = `${id}-counter`;

  const describedBy =
    [
      error ? errorId : meta.hint ? hintId : null,
      meta.maxLength ? counterId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={styles.field}>
      <div className={styles.top}>
        <label htmlFor={id} className={styles.label}>
          {meta.label}
        </label>
        {meta.maxLength && (
          <span id={counterId} className={styles.counter}>
            {value.length}/{meta.maxLength}
          </span>
        )}
      </div>
      <input
        id={id}
        type={meta.type ?? "text"}
        inputMode={meta.inputMode}
        placeholder={meta.placeholder}
        maxLength={meta.maxLength}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        className={styles.input}
      />
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : (
        meta.hint && (
          <p id={hintId} className={styles.hint}>
            {meta.hint}
          </p>
        )
      )}
    </div>
  );
}
