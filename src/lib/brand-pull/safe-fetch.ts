import { isIP } from "node:net";

import { isPublicAddress, normalizeSiteUrl, stripBrackets } from "./url-safety";

export type Resolver = (hostname: string) => Promise<string[]>;

export type FetchDeps = {
  fetch: typeof fetch;
  resolve: Resolver;
};

export class FetchRefusedError extends Error {}

type SafeFetchOptions = {
  maxBytes: number;
  /**
   * Keep the first `maxBytes` instead of refusing a larger body. Right for
   * HTML, where everything we need is in the <head>; wrong for images.
   */
  truncate?: boolean;
  timeoutMs?: number;
  maxRedirects?: number;
  accept?: string;
};

export type FetchedBody = {
  url: URL;
  contentType: string;
  body: Uint8Array;
};

async function assertPublicHost(url: URL, resolve: Resolver) {
  const host = stripBrackets(url.hostname);
  const addresses = isIP(host) ? [host] : await resolve(host);
  if (addresses.length === 0) {
    throw new FetchRefusedError("That site couldn't be found.");
  }
  // Every address must be public; one private record is enough to refuse.
  if (!addresses.every(isPublicAddress)) {
    throw new FetchRefusedError("That address isn't a public website.");
  }
}

async function readCapped(
  response: Response,
  maxBytes: number,
  truncate: boolean,
) {
  const declared = Number(response.headers.get("content-length"));
  if (declared > maxBytes && !truncate) {
    throw new FetchRefusedError("That page is too large.");
  }

  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (total + value.byteLength > maxBytes) {
      await reader.cancel();
      if (!truncate) throw new FetchRefusedError("That page is too large.");
      chunks.push(value.subarray(0, maxBytes - total));
      total = maxBytes;
      break;
    }
    total += value.byteLength;
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

/**
 * Fetches a user-supplied URL without letting it reach internal services.
 * Redirects are followed by hand so every hop is re-checked.
 *
 * Known gap: the DNS check and the connection resolve separately, so a
 * hostile DNS server could rebind between them. Pinning the checked IP needs
 * a custom undici dispatcher, which is a reasonable next step.
 */
export async function safeFetch(
  input: string,
  deps: FetchDeps,
  {
    maxBytes,
    truncate = false,
    timeoutMs = 5000,
    maxRedirects = 3,
    accept = "*/*",
  }: SafeFetchOptions,
): Promise<FetchedBody> {
  const start = normalizeSiteUrl(input);
  if (!start) throw new FetchRefusedError("Enter a public website address.");
  let url: URL = start;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    await assertPublicHost(url, deps.resolve);

    const response = await deps.fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        accept,
        "user-agent": "CardGeneratorBot/1.0 (+brand pull)",
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      const next = location
        ? normalizeSiteUrl(new URL(location, url).toString())
        : null;
      if (!next)
        throw new FetchRefusedError(
          "That site redirected somewhere we can't follow.",
        );
      url = next;
      continue;
    }

    if (!response.ok) {
      throw new FetchRefusedError(
        `That site answered with ${response.status}.`,
      );
    }

    return {
      url,
      contentType: (response.headers.get("content-type") ?? "").toLowerCase(),
      body: await readCapped(response, maxBytes, truncate),
    };
  }

  throw new FetchRefusedError("That site redirected too many times.");
}
