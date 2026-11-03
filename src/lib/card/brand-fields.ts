import {
  type Brand,
  type BrandColors,
  brandSchema,
  hexColorSchema,
  type HexColor,
} from "./schema";

export const BRAND_COLOR_ROLES = [
  "primary",
  "secondary",
  "background",
  "text",
] as const satisfies readonly (keyof BrandColors)[];

export type BrandColorRole = (typeof BRAND_COLOR_ROLES)[number];

export type BrandTextField = "name" | "domain";

export type BrandDraft = Record<BrandTextField, string> &
  Record<BrandColorRole, string>;

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function firstIssue(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Check this value";
}

export function parseBrandText<K extends BrandTextField>(
  name: K,
  raw: string,
): Result<Brand[K]> {
  const input = name === "domain" && raw.trim() === "" ? undefined : raw;
  const result = brandSchema.shape[name].safeParse(input);
  return result.success
    ? { ok: true, value: result.data as Brand[K] }
    : { ok: false, error: firstIssue(result.error) };
}

export function parseHexColor(raw: string): Result<HexColor> {
  const result = hexColorSchema.safeParse(raw);
  return result.success
    ? { ok: true, value: result.data }
    : { ok: false, error: firstIssue(result.error) };
}

export function toBrandDraft(brand: Brand): BrandDraft {
  return {
    name: brand.name,
    domain: brand.domain ?? "",
    ...brand.colors,
  };
}
