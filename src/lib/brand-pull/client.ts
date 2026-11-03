import {
  type BrandPull,
  brandPullErrorSchema,
  brandPullSchema,
} from "./brand-pull-schema";

export type BrandPullResult =
  { ok: true; brand: BrandPull } | { ok: false; error: string };

/** Calls the brand API and validates the response before the UI trusts it. */
export async function requestBrandPull(
  site: string,
  fetchImpl: typeof fetch = fetch,
): Promise<BrandPullResult> {
  let response: Response;
  try {
    response = await fetchImpl(`/api/brand?url=${encodeURIComponent(site)}`);
  } catch {
    return { ok: false, error: "You seem to be offline. Try again." };
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsed = brandPullErrorSchema.safeParse(body);
    return {
      ok: false,
      error: parsed.success
        ? parsed.data.error
        : "That brand couldn't be pulled.",
    };
  }

  const parsed = brandPullSchema.safeParse(body);
  return parsed.success
    ? { ok: true, brand: parsed.data }
    : { ok: false, error: "That brand couldn't be pulled." };
}
