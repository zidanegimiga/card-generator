import type { CardConfig } from "@/lib/card/schema";

/** "Élodie Ñúñez & Co." -> "elodie-nunez-co". Empty input gives an empty string. */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function cardFileName({ brand, member }: CardConfig): string {
  const parts = [slugify(brand.name), slugify(member.fullName)].filter(Boolean);
  return `${parts.join("-") || "card"}.png`;
}
