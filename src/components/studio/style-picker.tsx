"use client";

import { useId } from "react";

import { IdCard } from "@/components/card/id-card";
import {
  type CardConfig,
  CARD_STYLES,
  type CardStyle,
} from "@/lib/card/schema";
import { CARD_STYLE_META } from "@/lib/card/styles";

type StylePickerProps = {
  config: CardConfig;
  onChange: (style: CardStyle) => void;
};

/** Each option previews the member's own card in that style. */
export function StylePicker({ config, onChange }: StylePickerProps) {
  const name = useId();

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">Card style</legend>
      <div className="grid grid-cols-2 gap-3">
        {CARD_STYLES.map((style) => {
          const meta = CARD_STYLE_META[style];
          return (
            <label
              key={style}
              className="group flex cursor-pointer flex-col gap-2 rounded-xl border border-border p-2 hover:border-muted has-checked:border-accent has-checked:bg-surface-raised has-focus-visible:ring-2 has-focus-visible:ring-accent"
            >
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
              <IdCard
                config={{ ...config, style }}
                className="w-full"
                decorative
              />
              <span id={`${name}-${style}-label`} className="px-1 text-sm">
                {meta.label}
              </span>
              <span
                id={`${name}-${style}`}
                className="px-1 pb-1 text-xs leading-snug text-muted"
              >
                {meta.description}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
