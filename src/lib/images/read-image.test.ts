import { describe, expect, it } from "vitest";

import { MAX_IMAGE_BYTES, readImageFile } from "./read-image";

describe("readImageFile", () => {
  it("returns a data URL for a supported image", async () => {
    const file = new File(["<svg/>"], "logo.svg", { type: "image/svg+xml" });

    expect(await readImageFile(file)).toEqual({
      ok: true,
      dataUrl: `data:image/svg+xml;base64,${btoa("<svg/>")}`,
    });
  });

  it.each(["image/gif", "application/pdf", ""])(
    "rejects type %j",
    async (type) => {
      const file = new File(["x"], "file", { type });
      expect(await readImageFile(file)).toEqual({
        ok: false,
        error: "Use a PNG, JPEG, WebP, or SVG image.",
      });
    },
  );

  it("rejects images over 1 MB", async () => {
    const file = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "big.png", {
      type: "image/png",
    });
    expect(await readImageFile(file)).toEqual({
      ok: false,
      error: "Images can be up to 1 MB.",
    });
  });
});
