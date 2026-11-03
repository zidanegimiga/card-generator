"use client";

import { type HTMLInputTypeAttribute, useId } from "react";

export type FieldMeta = {
  label: string;
  hint?: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  inputMode?: "numeric" | "url";
  maxLength?: number;
};

type FieldProps = {
  meta: FieldMeta;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function TextField({ meta, value, error, onChange }: FieldProps) {
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
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm">
          {meta.label}
        </label>
        {meta.maxLength && (
          <span
            id={counterId}
            className="font-mono text-[11px] text-muted tabular-nums"
          >
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
        className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted/60 focus:border-foreground/50 aria-invalid:border-red-400"
      />
      {error ? (
        <p id={errorId} className="text-xs text-red-400">
          {error}
        </p>
      ) : (
        meta.hint && (
          <p id={hintId} className="text-xs text-muted">
            {meta.hint}
          </p>
        )
      )}
    </div>
  );
}
