import { lookup } from "node:dns/promises";

import type { HexColor } from "@/lib/card/schema";
import { relativeLuminance } from "@/lib/color/contrast";

import type { BrandPull } from "./brand-pull-schema";
import { parseBrandHtml } from "./parse-brand";
import { type FetchDeps, FetchRefusedError, safeFetch } from "./safe-fetch";

export const MAX_HTML_BYTES = 1024 * 1024;
export const MAX_LOGO_BYTES = 1024 * 1024;

const LOGO_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

export const defaultFetchDeps: FetchDeps = {
  fetch: globalThis.fetch.bind(globalThis),
  resolve: async (hostname) => {
    try {
      return (await lookup(hostname, { all: true })).map(
        (entry) => entry.address,
      );
    } catch {
      // ENOTFOUND and friends: report "couldn't be found" rather than a crash.
      return [];
    }
  },
};

export type PullResult =
  { ok: true; brand: BrandPull } | { ok: false; status: number; error: string };

/**
 * Sites often set theme-color to their page background rather than their
 * brand colour. Near-black or near-white is treated as a background (with a
 * readable text colour to match); anything with real colour is the primary.
 */
export function classifyThemeColor(
  color: HexColor | undefined,
): Pick<BrandPull, "primary" | "background" | "text"> {
  if (!color) return {};
  const luminance = relativeLuminance(color);
  if (luminance < 0.03) return { background: color, text: "#f2f2f2" };
  if (luminance > 0.85) return { background: color, text: "#111111" };
  return { primary: color };
}

function titleFromDomain(domain: string): string {
  const label = domain.split(".")[0] ?? domain;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Downloads the first icon that is a real image and returns it as a data URL,
 * so the card can render and export it without cross-origin requests.
 */
async function fetchLogo(urls: string[], deps: FetchDeps) {
  for (const url of urls.slice(0, 4)) {
    try {
      const { contentType, body } = await safeFetch(url, deps, {
        maxBytes: MAX_LOGO_BYTES,
        accept: "image/*",
      });
      const type = contentType.split(";")[0]!.trim();
      if (!LOGO_TYPES.has(type) || body.byteLength === 0) continue;
      return `data:${type};base64,${Buffer.from(body).toString("base64")}`;
    } catch {
      // Try the next candidate.
    }
  }
  return undefined;
}

export async function pullBrand(
  input: string,
  deps: FetchDeps = defaultFetchDeps,
): Promise<PullResult> {
  let page;
  try {
    page = await safeFetch(input, deps, {
      maxBytes: MAX_HTML_BYTES,
      truncate: true,
      accept: "text/html,application/xhtml+xml",
    });
  } catch (error) {
    if (error instanceof FetchRefusedError) {
      return { ok: false, status: 422, error: error.message };
    }
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return {
      ok: false,
      status: 502,
      error: timedOut
        ? "That site took too long to answer."
        : "That site couldn't be reached.",
    };
  }

  if (!page.contentType.includes("html")) {
    return { ok: false, status: 422, error: "That address isn't a web page." };
  }

  const html = new TextDecoder().decode(page.body);
  const parsed = parseBrandHtml(html, page.url);
  const domain = page.url.hostname.replace(/^www\./, "");

  return {
    ok: true,
    brand: {
      name: parsed.name || titleFromDomain(domain),
      domain,
      logoUrl: await fetchLogo(parsed.iconUrls, deps),
      ...classifyThemeColor(parsed.themeColor),
    },
  };
}
