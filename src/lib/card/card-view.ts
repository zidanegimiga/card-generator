import { type Palette, resolvePalette } from "./finishes";
import { resolveMemberId } from "./member-id";
import type { CardConfig } from "./schema";

/** Everything a card face needs, already resolved. Faces stay purely presentational. */
export type CardView = {
  brandName: string;
  domain?: string;
  logoUrl?: string;
  /** Resolved from the brand or the chosen finish. Faces read it as CSS variables. */
  colors: Palette;
  fullName: string;
  title: string;
  membership: string;
  label: string;
  since: number;
  memberId: string;
  initials: string;
  photoUrl?: string;
  /** What the QR code encodes: the member's link, else the brand's site. */
  qrValue?: string;
};

/** "Ada Lovelace" -> "AL", "Cher" -> "C". Handles accents and emoji safely. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  if (!first) return "";
  const last = words.length > 1 ? words[words.length - 1] : undefined;
  return [first, last]
    .filter((word): word is string => Boolean(word))
    .map((word) => Array.from(word)[0]!.toUpperCase())
    .join("");
}

export function toCardView({ brand, member, finish }: CardConfig): CardView {
  return {
    brandName: brand.name,
    domain: brand.domain,
    logoUrl: brand.logoUrl,
    colors: resolvePalette(brand.colors, finish),
    fullName: member.fullName,
    title: member.title,
    membership: member.membership,
    label: member.label,
    since: member.memberSince,
    memberId: resolveMemberId(brand.name, member),
    initials: initials(member.fullName),
    photoUrl: member.photoUrl,
    qrValue:
      member.qrUrl ?? (brand.domain ? `https://${brand.domain}` : undefined),
  };
}

export type Bar = { width: 1 | 2 | 3; gap: 1 | 2 };

/** A decorative barcode derived from the member ID's digits. Same ID, same bars. */
export function barcodeBars(memberId: string): Bar[] {
  return Array.from(memberId.replace(/\D/g, ""), (char) => {
    const digit = Number(char);
    return {
      width: ((digit % 3) + 1) as Bar["width"],
      gap: ((Math.floor(digit / 3) % 2) + 1) as Bar["gap"],
    };
  });
}
