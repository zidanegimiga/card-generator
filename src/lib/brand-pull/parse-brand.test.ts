// @vitest-environment node
import { describe, expect, it } from "vitest";

import { cleanTitle, parseBrandHtml } from "./parse-brand";

const page = new URL("https://linear.app/features");

function html(head: string) {
  return `<!doctype html><html><head>${head}</head><body></body></html>`;
}

describe("cleanTitle", () => {
  it.each([
    ["Linear – Plan and build products", "Linear"],
    ["Vercel | Build and deploy", "Vercel"],
    ["Exa - Search for AI", "Exa"],
    ["Stripe: Financial infrastructure", "Stripe"],
    ["  Just   a name ", "Just a name"],
    ["Hyphen-ated Co", "Hyphen-ated Co"],
    ["Re:Build", "Re:Build"],
  ])("%j -> %j", (title, name) => {
    expect(cleanTitle(title)).toBe(name);
  });
});

describe("parseBrandHtml", () => {
  describe("name", () => {
    it("prefers og:site_name", () => {
      const parsed = parseBrandHtml(
        html(
          `<title>Home | Linear</title><meta property="og:site_name" content="Linear">`,
        ),
        page,
      );
      expect(parsed.name).toBe("Linear");
    });

    it("falls back to application-name, then the title", () => {
      expect(
        parseBrandHtml(
          html(
            `<title>A – B</title><meta name="application-name" content="App">`,
          ),
          page,
        ).name,
      ).toBe("App");
      expect(
        parseBrandHtml(html(`<title>Linear – Plan</title>`), page).name,
      ).toBe("Linear");
    });

    it("caps long names to fit the brand field", () => {
      const parsed = parseBrandHtml(
        html(`<meta property="og:site_name" content="${"x".repeat(50)}">`),
        page,
      );
      expect(parsed.name).toHaveLength(32);
    });

    it("leaves the name unset when the page has none", () => {
      expect(parseBrandHtml(html(""), page).name).toBeUndefined();
    });
  });

  describe("icons", () => {
    it("ranks SVG, then the largest raster, and resolves relative URLs", () => {
      const parsed = parseBrandHtml(
        html(`
          <link rel="icon" href="/favicon-32.png" sizes="32x32">
          <link rel="apple-touch-icon" href="/apple.png">
          <link rel="icon" href="https://cdn.linear.app/icon-512.png" sizes="512x512">
          <link rel="icon" type="image/svg+xml" href="icon.svg">
        `),
        page,
      );

      expect(parsed.iconUrls).toEqual([
        "https://linear.app/icon.svg",
        "https://cdn.linear.app/icon-512.png",
        "https://linear.app/apple.png",
        "https://linear.app/favicon-32.png",
        "https://linear.app/favicon.ico",
      ]);
    });

    it("skips mask icons, which are single-colour silhouettes", () => {
      const parsed = parseBrandHtml(
        html(`<link rel="mask-icon" href="/mask.svg" color="#5e6ad2">`),
        page,
      );
      expect(parsed.iconUrls).toEqual(["https://linear.app/favicon.ico"]);
    });

    it("always ends with /favicon.ico as a last resort", () => {
      expect(parseBrandHtml(html(""), page).iconUrls).toEqual([
        "https://linear.app/favicon.ico",
      ]);
    });
  });

  describe("theme colour", () => {
    it("reads theme-color, preferring the unconditional one", () => {
      const parsed = parseBrandHtml(
        html(`
          <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff">
          <meta name="theme-color" content="#5E6AD2">
        `),
        page,
      );
      expect(parsed.themeColor).toBe("#5e6ad2");
    });

    it("falls back to the mask-icon colour", () => {
      const parsed = parseBrandHtml(
        html(`<link rel="mask-icon" href="/m.svg" color="#E4F222">`),
        page,
      );
      expect(parsed.themeColor).toBe("#e4f222");
    });

    it("ignores colours that aren't hex", () => {
      const parsed = parseBrandHtml(
        html(`<meta name="theme-color" content="rgb(0, 0, 0)">`),
        page,
      );
      expect(parsed.themeColor).toBeUndefined();
    });
  });
});
