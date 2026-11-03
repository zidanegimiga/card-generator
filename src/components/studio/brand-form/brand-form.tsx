"use client";

import { useState } from "react";

import { applyBrandPull } from "@/lib/brand-pull/apply-brand-pull";
import type { BrandPull } from "@/lib/brand-pull/brand-pull-schema";
import type { BrandPullResult } from "@/lib/brand-pull/client";
import {
  BRAND_COLOR_ROLES,
  type BrandColorRole,
  type BrandDraft,
  type BrandTextField,
  parseBrandText,
  parseHexColor,
  toBrandDraft,
} from "@/lib/card/brand-fields";
import { BRAND_NAME_LIMIT, type Brand } from "@/lib/card/schema";

import { BrandPullForm } from "../brand-pull-form";
import { ColorField } from "../color-field";
import { ContrastCheck } from "../contrast-check";
import { ImageField } from "../image-field";
import { type FieldMeta, TextField } from "../text-field";
import styles from "./brand-form.module.css";

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
  /** Swappable for tests; defaults to the real API. */
  requestPull?: (site: string) => Promise<BrandPullResult>;
};

export function BrandForm({ brand, onChange, requestPull }: BrandFormProps) {
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

  function handlePull(pull: BrandPull) {
    const next = applyBrandPull(brand, pull);
    setDraft(toBrandDraft(next));
    setErrors({});
    onChange(next);
  }

  return (
    <div className={styles.stack}>
      <BrandPullForm onPull={handlePull} request={requestPull} />
      <form
        aria-label="Brand details"
        noValidate
        onSubmit={(event) => event.preventDefault()}
        className={styles.stack}
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

        <fieldset className={styles.colours}>
          <legend className={styles.legend}>Colours</legend>
          <div className={styles.grid}>
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
    </div>
  );
}
