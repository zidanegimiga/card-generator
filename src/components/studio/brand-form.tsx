"use client";

import { useId, useState } from "react";

import {
  BRAND_COLOR_ROLES,
  type BrandColorRole,
  type BrandDraft,
  type BrandTextField,
  parseBrandText,
  parseHexColor,
  toBrandDraft,
} from "@/lib/card/brand-fields";
import { BRAND_NAME_LIMIT, type Brand, type HexColor } from "@/lib/card/schema";
import { contrastRatio, rateContrast } from "@/lib/color/contrast";

import { ImageField } from "./image-field";
import { type FieldMeta, TextField } from "./text-field";

const TEXT_META: Record<BrandTextField, FieldMeta> = {
  name: { label: "Brand name", maxLength: BRAND_NAME_LIMIT },
  domain: {
    label: "Website",
    hint: "Used for the QR code when no link is set.",
    placeholder: "linear.app",
    inputMode: "url",
  },
};

const COLOR_LABELS: Record<BrandColorRole, string> = {
  primary: "Primary",
  secondary: "Secondary",
  background: "Background",
  text: "Text",
};

type Errors = Partial<Record<keyof BrandDraft, string>>;

type BrandFormProps = {
  brand: Brand;
  onChange: (brand: Brand) => void;
};

export function BrandForm({ brand, onChange }: BrandFormProps) {
  const [draft, setDraft] = useState<BrandDraft>(() => toBrandDraft(brand));
  const [errors, setErrors] = useState<Errors>({});

  function setField(name: keyof BrandDraft, raw: string, error?: string) {
    setDraft((current) => ({ ...current, [name]: raw }));
    setErrors((current) => ({ ...current, [name]: error }));
  }

  function handleText(name: BrandTextField, raw: string) {
    const result = parseBrandText(name, raw);
    setField(name, raw, result.ok ? undefined : result.error);
    if (result.ok) onChange({ ...brand, [name]: result.value });
  }

  function handleColor(role: BrandColorRole, raw: string) {
    const result = parseHexColor(raw);
    setField(role, raw, result.ok ? undefined : result.error);
    if (result.ok) {
      onChange({ ...brand, colors: { ...brand.colors, [role]: result.value } });
    }
  }

  return (
    <form
      aria-label="Brand details"
      noValidate
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-6"
    >
      {(["name", "domain"] as const).map((name) => (
        <TextField
          key={name}
          meta={TEXT_META[name]}
          value={draft[name]}
          error={errors[name]}
          onChange={(raw) => handleText(name, raw)}
        />
      ))}

      <ImageField
        label="Logo"
        alt={`${brand.name} logo`}
        value={brand.logoUrl}
        onChange={(logoUrl) => onChange({ ...brand, logoUrl })}
      />

      <fieldset className="flex min-w-0 flex-col gap-3">
        <legend className="mb-3 text-sm">Colours</legend>
        <div className="grid grid-cols-2 gap-3">
          {BRAND_COLOR_ROLES.map((role) => (
            <ColorField
              key={role}
              label={COLOR_LABELS[role]}
              value={draft[role]}
              committed={brand.colors[role]}
              error={errors[role]}
              onChange={(raw) => handleColor(role, raw)}
            />
          ))}
        </div>
        <ContrastCheck
          text={brand.colors.text}
          background={brand.colors.background}
        />
      </fieldset>
    </form>
  );
}

type ColorFieldProps = {
  label: string;
  value: string;
  /** Last valid colour, so the swatch stays usable while the hex is mid-edit. */
  committed: HexColor;
  error?: string;
  onChange: (value: string) => void;
};

function ColorField({
  label,
  value,
  committed,
  error,
  onChange,
}: ColorFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-xs text-muted">
        {label}
      </label>
      <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-background pr-2 pl-1.5 focus-within:border-accent has-aria-invalid:border-red-400">
        <input
          type="color"
          aria-label={`${label} colour picker`}
          value={committed}
          onChange={(event) => onChange(event.target.value)}
          className="size-6 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0 ring-1 ring-white/15 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
        />
        <input
          id={id}
          value={value}
          spellCheck={false}
          maxLength={7}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
          className="w-full min-w-0 bg-transparent font-mono text-xs outline-none"
        />
      </div>
      {error && (
        <p id={errorId} className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

const RATING_STYLES = {
  AAA: "text-emerald-400",
  AA: "text-emerald-400",
  "AA large": "text-amber-400",
  Low: "text-red-400",
} as const;

function ContrastCheck({
  text,
  background,
}: {
  text: HexColor;
  background: HexColor;
}) {
  const ratio = contrastRatio(text, background);
  const rating = rateContrast(ratio);

  return (
    <p
      role="status"
      aria-label="Text contrast"
      className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-xs"
    >
      <span className="text-muted">Text on background</span>
      <span className="font-mono">
        {ratio.toFixed(1)}:1{" "}
        <span className={RATING_STYLES[rating]}>{rating}</span>
      </span>
    </p>
  );
}
