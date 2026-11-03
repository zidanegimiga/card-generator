import { describe, expect, it } from "vitest";

import { arrayBufferToBase64, fontFaceCss } from "./registrar";

describe("arrayBufferToBase64", () => {
  it("matches Node's encoder", () => {
    const bytes = Uint8Array.from({ length: 256 }, (_, i) => i);
    expect(arrayBufferToBase64(bytes.buffer)).toBe(
      Buffer.from(bytes).toString("base64"),
    );
  });

  it("handles fonts larger than one chunk without overflowing the stack", () => {
    const bytes = new Uint8Array(2 * 1024 * 1024).map((_, i) => i % 251);
    expect(arrayBufferToBase64(bytes.buffer)).toBe(
      Buffer.from(bytes).toString("base64"),
    );
  });
});

describe("fontFaceCss", () => {
  it("declares the family with the bytes inlined", () => {
    const css = fontFaceCss("cg-upload-1", new Uint8Array([1, 2, 3]).buffer);

    expect(css).toContain('font-family: "cg-upload-1"');
    expect(css).toContain("url(data:application/octet-stream;base64,AQID)");
  });
});
