import { describe, expect, it } from "vitest";

import { qrMatrix, qrPath } from "./qr-matrix";

/** Every QR code has a 7×7 finder pattern: a dark ring, a light ring, a 3×3 dark core. */
function hasFinderAt(matrix: boolean[][], top: number, left: number) {
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 7; x++) {
      const ring = Math.max(Math.abs(x - 3), Math.abs(y - 3));
      const expected = ring !== 2;
      if (matrix[top + y]![left + x] !== expected) return false;
    }
  }
  return true;
}

describe("qrMatrix", () => {
  it("returns a square grid of a valid QR size", () => {
    const matrix = qrMatrix("https://linear.app");

    expect(matrix.every((row) => row.length === matrix.length)).toBe(true);
    // QR versions are 21×21, 25×25, ... growing by 4.
    expect((matrix.length - 21) % 4).toBe(0);
  });

  it("has finder patterns in three corners", () => {
    const matrix = qrMatrix("https://linear.app");
    const end = matrix.length - 7;

    expect(hasFinderAt(matrix, 0, 0)).toBe(true);
    expect(hasFinderAt(matrix, 0, end)).toBe(true);
    expect(hasFinderAt(matrix, end, 0)).toBe(true);
  });

  it("grows for longer content", () => {
    const short = qrMatrix("https://a.co");
    const long = qrMatrix(`https://example.com/${"x".repeat(120)}`);
    expect(long.length).toBeGreaterThan(short.length);
  });

  it("is deterministic", () => {
    expect(qrMatrix("same")).toEqual(qrMatrix("same"));
  });
});

describe("qrPath", () => {
  it("draws one square per dark module", () => {
    const matrix = [
      [true, false],
      [false, true],
    ];
    expect(qrPath(matrix)).toBe("M0 0h1v1h-1zM1 1h1v1h-1z");
  });

  it("offsets everything by the quiet zone", () => {
    expect(qrPath([[true]], 2)).toBe("M2 2h1v1h-1z");
  });

  it("draws nothing for an all-light matrix", () => {
    expect(qrPath([[false, false]])).toBe("");
  });
});
