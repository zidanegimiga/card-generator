import { describe, expect, it } from "vitest";

import { RESTING_TILT, tiltFromPointer } from "./tilt";

const rect = { left: 100, top: 200, width: 200, height: 400 };

describe("tiltFromPointer", () => {
  it("is flat at the centre", () => {
    expect(tiltFromPointer(200, 400, rect)).toEqual({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
    });
  });

  it("turns toward the pointer at the corners, up to the max", () => {
    expect(tiltFromPointer(300, 200, rect, 10)).toEqual({
      rotateX: 10,
      rotateY: 10,
      glareX: 100,
      glareY: 0,
    });
    expect(tiltFromPointer(100, 600, rect, 10)).toEqual({
      rotateX: -10,
      rotateY: -10,
      glareX: 0,
      glareY: 100,
    });
  });

  it("clamps pointers outside the card", () => {
    expect(tiltFromPointer(9999, -9999, rect, 8)).toMatchObject({
      rotateX: 8,
      rotateY: 8,
    });
  });

  it("rests for a card with no size", () => {
    expect(
      tiltFromPointer(10, 10, { left: 0, top: 0, width: 0, height: 0 }),
    ).toBe(RESTING_TILT);
  });
});
