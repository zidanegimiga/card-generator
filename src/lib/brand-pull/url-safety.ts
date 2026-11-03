import ipaddr from "ipaddr.js";

/**
 * Turns user input like `linear.app` or `https://linear.app/features` into a
 * URL we're willing to fetch, or null. Only http(s) on default ports, no
 * credentials, and the host must look like a public domain or IP.
 */
export function normalizeSiteUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  if (url.port !== "") return null;
  // Single-label hosts like "localhost" or "intranet" are never public sites.
  if (!url.hostname.includes(".") && !url.hostname.includes(":")) return null;
  return url;
}

/**
 * True only for globally routable addresses. Everything else (private,
 * loopback, link-local such as cloud metadata at 169.254.169.254, CGNAT,
 * multicast, reserved) is refused. IPv4-mapped IPv6 is unwrapped first.
 */
export function isPublicAddress(address: string): boolean {
  if (!ipaddr.isValid(address)) return false;
  return ipaddr.process(address).range() === "unicast";
}

/** `[::1]` -> `::1`. URL hostnames keep IPv6 brackets. */
export function stripBrackets(hostname: string): string {
  return hostname.replace(/^\[(.*)\]$/, "$1");
}
