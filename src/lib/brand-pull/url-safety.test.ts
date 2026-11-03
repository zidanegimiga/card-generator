// @vitest-environment node
import { describe, expect, it } from "vitest";

import { isPublicAddress, normalizeSiteUrl } from "./url-safety";

describe("normalizeSiteUrl", () => {
  it.each([
    ["linear.app", "https://linear.app/"],
    ["  https://linear.app/features  ", "https://linear.app/features"],
    ["http://vercel.com", "http://vercel.com/"],
    ["LINEAR.app", "https://linear.app/"],
  ])("accepts %j as %s", (input, expected) => {
    expect(normalizeSiteUrl(input)?.toString()).toBe(expected);
  });

  it.each([
    ["", "empty"],
    ["localhost", "single-label host"],
    ["intranet", "single-label host"],
    ["file:///etc/passwd", "non-http scheme"],
    ["ftp://example.com", "non-http scheme"],
    ["javascript:alert(1)", "non-http scheme"],
    ["https://user:pass@example.com", "credentials"],
    ["https://example.com:8080", "non-default port"],
    ["http://example.com:22", "non-default port"],
    ["https://", "no host"],
  ])("refuses %j (%s)", (input) => {
    expect(normalizeSiteUrl(input)).toBeNull();
  });
});

describe("isPublicAddress", () => {
  it.each(["8.8.8.8", "76.76.21.21", "2606:4700:4700::1111"])(
    "allows public %s",
    (address) => {
      expect(isPublicAddress(address)).toBe(true);
    },
  );

  it.each([
    ["127.0.0.1", "loopback"],
    ["10.1.2.3", "private"],
    ["172.16.0.1", "private"],
    ["192.168.1.1", "private"],
    ["169.254.169.254", "cloud metadata (link-local)"],
    ["100.64.0.1", "carrier-grade NAT"],
    ["0.0.0.0", "unspecified"],
    ["224.0.0.1", "multicast"],
    ["255.255.255.255", "broadcast"],
    ["::1", "IPv6 loopback"],
    ["fd12:3456::1", "IPv6 unique local"],
    ["fe80::1", "IPv6 link-local"],
    ["::ffff:127.0.0.1", "IPv4-mapped loopback"],
    ["::ffff:169.254.169.254", "IPv4-mapped metadata"],
    ["not-an-ip", "invalid"],
  ])("refuses %s (%s)", (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });
});
