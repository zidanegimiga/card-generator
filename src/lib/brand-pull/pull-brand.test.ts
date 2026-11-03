// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import {
  classifyThemeColor,
  MAX_HTML_BYTES,
  MAX_LOGO_BYTES,
  pullBrand,
} from "./pull-brand";
import type { FetchDeps } from "./safe-fetch";

type Route = {
  status?: number;
  headers?: Record<string, string>;
  body?: BodyInit;
};

/**
 * A fake internet: `routes` maps full URLs to responses and `dns` maps
 * hostnames to addresses. Any request it doesn't know about fails the test.
 */
function fakeDeps(
  routes: Record<string, Route>,
  dns: Record<string, string[]> = {},
) {
  const fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = input.toString();
    const route = routes[url];
    if (!route) throw new Error(`Unexpected request to ${url}`);
    return new Response(route.body ?? null, {
      status: route.status ?? 200,
      headers: route.headers,
    });
  });
  const resolve = vi.fn(async (host: string) => dns[host] ?? ["76.76.21.21"]);
  const deps: FetchDeps = {
    fetch: fetch as unknown as typeof globalThis.fetch,
    resolve,
  };
  return { deps, fetch, resolve };
}

const HTML = { "content-type": "text/html; charset=utf-8" };
const PNG = { "content-type": "image/png" };

const linearPage = `<html><head>
  <title>Linear – Plan and build products</title>
  <meta name="theme-color" content="#5e6ad2">
  <link rel="apple-touch-icon" href="/apple.png">
</head></html>`;

describe("pullBrand", () => {
  it("returns the name, domain, primary colour, and logo as a data URL", async () => {
    const { deps } = fakeDeps({
      "https://linear.app/": { headers: HTML, body: linearPage },
      "https://linear.app/apple.png": {
        headers: PNG,
        body: new Uint8Array([1, 2, 3]),
      },
    });

    expect(await pullBrand("linear.app", deps)).toEqual({
      ok: true,
      brand: {
        name: "Linear",
        domain: "linear.app",
        primary: "#5e6ad2",
        logoUrl: "data:image/png;base64,AQID",
      },
    });
  });

  it("follows redirects and reports the final domain", async () => {
    const { deps } = fakeDeps({
      "https://vercel.app/": {
        status: 301,
        headers: { location: "https://www.vercel.com/home" },
      },
      "https://www.vercel.com/home": {
        headers: HTML,
        body: "<title>Vercel</title>",
      },
      "https://www.vercel.com/favicon.ico": { status: 404 },
    });

    const result = await pullBrand("vercel.app", deps);

    expect(result).toMatchObject({
      ok: true,
      brand: { name: "Vercel", domain: "vercel.com" },
    });
  });

  it("names the brand after the domain when the page has no title", async () => {
    const { deps } = fakeDeps({
      "https://exa.ai/": { headers: HTML, body: "<html></html>" },
      "https://exa.ai/favicon.ico": { status: 404 },
    });

    expect(await pullBrand("exa.ai", deps)).toMatchObject({
      ok: true,
      brand: { name: "Exa", logoUrl: undefined },
    });
  });

  it("tries the next icon when one isn't an image", async () => {
    const { deps } = fakeDeps({
      "https://acme.com/": {
        headers: HTML,
        body: `<link rel="icon" href="/broken.png" sizes="512x512"><link rel="icon" href="/ok.png">`,
      },
      "https://acme.com/broken.png": {
        headers: HTML,
        body: "<html>404</html>",
      },
      "https://acme.com/ok.png": { headers: PNG, body: new Uint8Array([9]) },
    });

    const result = await pullBrand("acme.com", deps);
    expect(result).toMatchObject({
      ok: true,
      brand: { logoUrl: "data:image/png;base64,CQ==" },
    });
  });

  describe("refuses to reach internal services", () => {
    it.each([
      ["a private IP literal", "http://10.0.0.5/admin"],
      [
        "the cloud metadata endpoint",
        "http://169.254.169.254/latest/meta-data",
      ],
      ["loopback", "http://127.0.0.1/"],
      ["IPv6 loopback", "http://[::1]/"],
    ])("%s", async (_label, url) => {
      const { deps, fetch } = fakeDeps({});

      expect(await pullBrand(url, deps)).toEqual({
        ok: false,
        status: 422,
        error: "That address isn't a public website.",
      });
      expect(fetch).not.toHaveBeenCalled();
    });

    it("a public-looking domain that resolves to a private address", async () => {
      const { deps, fetch } = fakeDeps(
        {},
        { "evil.example.com": ["192.168.0.10"] },
      );

      expect(await pullBrand("evil.example.com", deps)).toMatchObject({
        ok: false,
        status: 422,
      });
      expect(fetch).not.toHaveBeenCalled();
    });

    it("a domain with mixed public and private records", async () => {
      const { deps } = fakeDeps(
        {},
        { "sneaky.example.com": ["76.76.21.21", "127.0.0.1"] },
      );

      expect(await pullBrand("sneaky.example.com", deps)).toMatchObject({
        ok: false,
        status: 422,
      });
    });

    it("a redirect into the private network", async () => {
      const { deps, fetch } = fakeDeps({
        "https://good.example.com/": {
          status: 302,
          headers: { location: "http://169.254.169.254/latest/meta-data" },
        },
      });

      expect(await pullBrand("good.example.com", deps)).toEqual({
        ok: false,
        status: 422,
        error: "That address isn't a public website.",
      });
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("a redirect to another port", async () => {
      const { deps } = fakeDeps({
        "https://good.example.com/": {
          status: 302,
          headers: { location: "http://good.example.com:6379/" },
        },
      });

      expect(await pullBrand("good.example.com", deps)).toMatchObject({
        ok: false,
        error: "That site redirected somewhere we can't follow.",
      });
    });

    it("endless redirects", async () => {
      const { deps } = fakeDeps({
        "https://loop.example.com/": {
          status: 302,
          headers: { location: "https://loop.example.com/" },
        },
      });

      expect(await pullBrand("loop.example.com", deps)).toMatchObject({
        ok: false,
        error: "That site redirected too many times.",
      });
    });
  });

  it("reads only the head of a huge page instead of refusing it", async () => {
    const { deps } = fakeDeps({
      "https://big.example.com/": {
        headers: HTML,
        body: `<title>Big Co</title>${"x".repeat(MAX_HTML_BYTES * 2)}`,
      },
      "https://big.example.com/favicon.ico": { status: 404 },
    });

    expect(await pullBrand("big.example.com", deps)).toMatchObject({
      ok: true,
      brand: { name: "Big Co" },
    });
  });

  it("refuses logos over the size limit rather than cutting them off", async () => {
    const { deps } = fakeDeps({
      "https://huge.example.com/": {
        headers: HTML,
        body: `<link rel="icon" href="/huge.png">`,
      },
      "https://huge.example.com/huge.png": {
        headers: PNG,
        body: new Uint8Array(MAX_LOGO_BYTES + 1),
      },
      "https://huge.example.com/favicon.ico": { status: 404 },
    });

    expect(await pullBrand("huge.example.com", deps)).toMatchObject({
      ok: true,
      brand: { logoUrl: undefined },
    });
  });

  it("refuses responses that aren't HTML", async () => {
    const { deps } = fakeDeps({
      "https://api.example.com/": {
        headers: { "content-type": "application/json" },
        body: "{}",
      },
    });

    expect(await pullBrand("api.example.com", deps)).toMatchObject({
      ok: false,
      error: "That address isn't a web page.",
    });
  });

  it("reports error statuses from the site", async () => {
    const { deps } = fakeDeps({ "https://down.example.com/": { status: 503 } });

    expect(await pullBrand("down.example.com", deps)).toMatchObject({
      ok: false,
      error: "That site answered with 503.",
    });
  });

  it("reports a timeout as slow rather than broken", async () => {
    const { deps, fetch } = fakeDeps({});
    fetch.mockRejectedValue(
      Object.assign(new Error("timed out"), { name: "TimeoutError" }),
    );

    expect(await pullBrand("slow.example.com", deps)).toEqual({
      ok: false,
      status: 502,
      error: "That site took too long to answer.",
    });
  });

  it("reports an unknown domain", async () => {
    const { deps } = fakeDeps({}, { "nope.example.com": [] });

    expect(await pullBrand("nope.example.com", deps)).toMatchObject({
      ok: false,
      error: "That site couldn't be found.",
    });
  });
});

describe("classifyThemeColor", () => {
  it("treats a real colour as the primary", () => {
    expect(classifyThemeColor("#5e6ad2")).toEqual({ primary: "#5e6ad2" });
  });

  it("treats near-black as a dark background with light text", () => {
    expect(classifyThemeColor("#08090a")).toEqual({
      background: "#08090a",
      text: "#f2f2f2",
    });
  });

  it("treats near-white as a light background with dark text", () => {
    expect(classifyThemeColor("#fafafa")).toEqual({
      background: "#fafafa",
      text: "#111111",
    });
  });

  it("returns nothing when the site has no theme colour", () => {
    expect(classifyThemeColor(undefined)).toEqual({});
  });
});
