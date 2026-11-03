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
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        {CARD_STYLES.map((style) => {
          const meta = CARD_STYLE_META[style];
          return (
            <label
              key={style}
              className="group flex cursor-pointer flex-col gap-2.5"
            >
              <input
                type="radio"
                name={name}
                value={style}
                checked={config.style === style}
                onChange={() => onChange(style)}
                aria-labelledby={`${name}-${style}-label`}
                aria-describedby={`${name}-${style}`}
                className="peer sr-only"
              />
              <div className="opacity-45 transition-opacity duration-200 group-hover:opacity-80 peer-checked:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent">
                <IdCard
                  config={{ ...config, style }}
                  className="w-full"
                  decorative
                />
              </div>
              <span
                id={`${name}-${style}-label`}
                className="flex items-center gap-2 text-sm text-muted peer-checked:text-foreground"
              >
                <span
                  aria-hidden
                  className="size-1.5 rounded-full bg-transparent transition-colors group-has-checked:bg-accent"
                />
                {meta.label}
              </span>
              <span
                id={`${name}-${style}`}
                className="-mt-1.5 text-xs leading-snug text-muted"
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
