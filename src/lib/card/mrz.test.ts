import { describe, expect, it } from "vitest";

import { MRZ_WIDTH, mrzLines } from "./mrz";

const ada = {
  brandName: "Linear",
  fullName: "Ada Lovelace",
  memberId: "4729 9159 692",
};

describe("mrzLines", () => {
  it("formats an issuer and number line and a name line", () => {
    expect(mrzLines(ada)).toEqual([
      "IDLIN47299159692<<<<<<<<<<<<<<",
      "LOVELACE<<ADA<<<<<<<<<<<<<<<<<",
    ]);
  });

  it("always produces two lines of exactly 30 characters", () => {
    const [line1, line2] = mrzLines({
      brandName: "A",
      fullName: "Wolfeschlegelsteinhausenberger Hubert Blaine",
      memberId: "1234 5678 901",
    });
    expect(line1).toHaveLength(MRZ_WIDTH);
    expect(line2).toHaveLength(MRZ_WIDTH);
  });

  it("uses only MRZ characters, folding accents and punctuation", () => {
    const [, names] = mrzLines({ ...ada, fullName: "Élodie O'Brien-Núñez" });

    expect(names).toMatch(/^[A-Z0-9<]+$/);
    expect(names.startsWith("O<BRIEN<NUNEZ<<ELODIE")).toBe(true);
  });

  it("pads short brand names in the issuer code", () => {
    expect(mrzLines({ ...ada, brandName: "X" })[0].startsWith("IDX<<")).toBe(
      true,
    );
  });

  it("handles a single name", () => {
    expect(mrzLines({ ...ada, fullName: "Cher" })[1]).toBe(
      "CHER<<<<<<<<<<<<<<<<<<<<<<<<<<",
    );
  });
});
