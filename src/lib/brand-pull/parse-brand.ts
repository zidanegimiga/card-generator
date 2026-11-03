import { parse } from "node-html-parser";

import { hexColorSchema, type HexColor } from "@/lib/card/schema";

export type ParsedBrand = {
  name?: string;
  /** Absolute icon URLs, best first. */
  iconUrls: string[];
  themeColor?: HexColor;
};

/** "Linear – Plan and build products" -> "Linear". */
export function cleanTitle(title: string): string {
  // Spaced dashes and bars ("A – B", "A | B"), or a colon after a word ("A: B").
  const first = title.split(/\s+[|–—·-]\s+|:\s+/)[0] ?? title;
  return first.replace(/\s+/g, " ").trim();
}

function toHex(value: string | undefined): HexColor | undefined {
  if (!value) return undefined;
  const result = hexColorSchema.safeParse(value);
  return result.success ? result.data : undefined;
}

function largestSize(sizes: string | undefined): number {
  if (!sizes) return 0;
  if (sizes.trim().toLowerCase() === "any") return 1024;
  return Math.max(
    0,
    ...sizes.split(/\s+/).map((size) => Number(size.split("x")[0]) || 0),
  );
}

type Candidate = { href: string; score: number };

/**
 * Ranks icons: SVG first (scales to any card size), then the largest raster,
 * with apple-touch-icon as a strong default since it is usually 180px+.
 */
function scoreIcon(rel: string, type: string, href: string, sizes?: string) {
  const isSvg = type.includes("svg") || /\.svg(\?|$)/i.test(href);
  const isMask = rel.includes("mask-icon");
  if (isMask) return -1; // Single-colour silhouettes look wrong as a logo.
  if (isSvg) return 10_000;
  const size =
    largestSize(sizes) || (rel.includes("apple-touch-icon") ? 180 : 16);
  return size;
}

export function parseBrandHtml(html: string, pageUrl: URL): ParsedBrand {
  const root = parse(html);
  const meta = (selector: string) =>
    root.querySelector(selector)?.getAttribute("content")?.trim() || undefined;

  const title = root.querySelector("title")?.text;
  const name =
    meta('meta[property="og:site_name"]') ??
    meta('meta[name="application-name"]') ??
    (title ? cleanTitle(title) : undefined);

  const candidates: Candidate[] = [];
  for (const link of root.querySelectorAll("link[rel][href]")) {
    const rel = (link.getAttribute("rel") ?? "").toLowerCase();
    if (!/\b(icon|apple-touch-icon)\b/.test(rel)) continue;
    const href = link.getAttribute("href")!;
    let absolute: string;
    try {
      absolute = new URL(href, pageUrl).toString();
    } catch {
      continue;
    }
    const score = scoreIcon(
      rel,
      (link.getAttribute("type") ?? "").toLowerCase(),
      href,
      link.getAttribute("sizes"),
    );
    if (score >= 0) candidates.push({ href: absolute, score });
  }
  candidates.sort((a, b) => b.score - a.score);

  const iconUrls = [...new Set(candidates.map((candidate) => candidate.href))];
  const fallback = new URL("/favicon.ico", pageUrl).toString();
  if (!iconUrls.includes(fallback)) iconUrls.push(fallback);

  const themeColor =
    toHex(
      root
        .querySelectorAll('meta[name="theme-color"]')
        // Prefer the unconditional value, then the dark variant to suit the studio.
        .sort(
          (a, b) =>
            Number(a.hasAttribute("media")) - Number(b.hasAttribute("media")),
        )[0]
        ?.getAttribute("content"),
    ) ??
    toHex(root.querySelector('link[rel="mask-icon"]')?.getAttribute("color")) ??
    toHex(meta('meta[name="msapplication-TileColor"]'));

  return { name: name?.slice(0, 32).trim(), iconUrls, themeColor };
}
