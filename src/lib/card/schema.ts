import { z } from "zod";

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const DOMAIN = /^(?!-)[a-z0-9-]{1,63}(?:\.[a-z0-9-]{1,63})+$/;

/** Accepts `#abc` or `#aabbcc` in any case and normalises to lowercase `#aabbcc`. */
export const hexColorSchema = z
  .string()
  .trim()
  .regex(HEX_COLOR, "Use a hex colour like #5e6ad2")
  .transform((value) => {
    const hex = value.slice(1).toLowerCase();
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((char) => char + char)
            .join("")
        : hex;
    return `#${full}`;
  });

export const brandColorsSchema = z.object({
  primary: hexColorSchema,
  secondary: hexColorSchema,
  background: hexColorSchema,
  text: hexColorSchema,
});

export const BRAND_NAME_LIMIT = 32;

/** An https image URL, or an uploaded image as a `data:image/...` URL. */
export const imageUrlSchema = z
  .url({ protocol: /^(https|data)$/, error: "Use an https or uploaded image" })
  .refine(
    (value) => !value.startsWith("data:") || value.startsWith("data:image/"),
    "Use an https or uploaded image",
  );

/** Accepts a bare domain or a pasted URL, and keeps just the host. */
export const domainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .transform((value) =>
    value
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/[/?#].*$/, ""),
  )
  .pipe(z.string().max(253).regex(DOMAIN, "Enter a domain like linear.app"));

export const brandSchema = z.object({
  name: z.string().trim().min(1, "Enter a brand name").max(BRAND_NAME_LIMIT),
  domain: domainSchema.optional(),
  logoUrl: imageUrlSchema.optional(),
  colors: brandColorsSchema,
});

export const CARD_STYLES = [
  "slate",
  "alloy",
  "foil",
  "chrome",
  "carbon",
  "gingham",
  "press",
  "poster",
  "transit",
  "blueprint",
] as const;

export const cardStyleSchema = z.enum(CARD_STYLES);

export const FINISHES = [
  "brand",
  "silver",
  "gold",
  "graphite",
  "copper",
  "jade",
  "cobalt",
  "bone",
  "oxblood",
] as const;

/** Cards saved before finishes existed have none, so default to the brand. */
export const finishSchema = z.enum(FINISHES).default("brand");

/**
 * A font is either a hosted Google Font or one the user uploaded.
 * Uploaded font bytes live in browser storage; the config only keeps a reference.
 */
export const fontSourceSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("google"),
    family: z.string().trim().min(1),
  }),
  z.object({
    kind: z.literal("custom"),
    id: z.string().min(1),
    family: z.string().trim().min(1).max(64),
    fileName: z.string().min(1),
  }),
]);

export const MEMBER_LIMITS = {
  fullName: 22,
  title: 18,
  membership: 16,
  label: 22,
} as const;

export const MEMBER_ID_PATTERN = /^\d{4} \d{4} \d{3}$/;

export const memberSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Enter a name")
    .max(MEMBER_LIMITS.fullName),
  title: z.string().trim().max(MEMBER_LIMITS.title),
  membership: z.string().trim().max(MEMBER_LIMITS.membership),
  label: z.string().trim().max(MEMBER_LIMITS.label),
  memberSince: z
    .number({ error: "Enter a year" })
    .int("Enter a whole year")
    .min(1900, "Enter a year from 1900 to 2100")
    .max(2100, "Enter a year from 1900 to 2100"),
  memberId: z
    .string()
    .trim()
    .regex(MEMBER_ID_PATTERN, "Use 11 digits, like 1234 5678 901")
    .optional(),
  photoUrl: imageUrlSchema.optional(),
  qrUrl: z.url("Enter a full link, like https://example.com").optional(),
});

export const cardConfigSchema = z.object({
  brand: brandSchema,
  style: cardStyleSchema,
  finish: finishSchema,
  font: fontSourceSchema,
  member: memberSchema,
});

export type HexColor = z.output<typeof hexColorSchema>;
export type BrandColors = z.output<typeof brandColorsSchema>;
export type Brand = z.output<typeof brandSchema>;
export type CardStyle = z.output<typeof cardStyleSchema>;
export type Finish = z.output<typeof finishSchema>;
export type FontSource = z.output<typeof fontSourceSchema>;
export type CustomFontSource = Extract<FontSource, { kind: "custom" }>;
export type Member = z.output<typeof memberSchema>;
export type CardConfig = z.output<typeof cardConfigSchema>;
/** What callers may pass in before normalisation (e.g. `#ABC` colours). */
export type CardConfigInput = z.input<typeof cardConfigSchema>;

export type ParseResult<T> =
  { ok: true; value: T } | { ok: false; errors: string[] };

export function parseCardConfig(input: unknown): ParseResult<CardConfig> {
  const result = cardConfigSchema.safeParse(input);
  if (result.success) return { ok: true, value: result.data };
  return {
    ok: false,
    errors: result.error.issues.map(
      (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
    ),
  };
}
