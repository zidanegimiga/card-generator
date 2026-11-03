import { describe, expect, it } from "vitest";

import { DEFAULT_CARD_CONFIG } from "./defaults";
import { parseMemberField, toMemberDraft } from "./member-fields";

describe("parseMemberField", () => {
  it("trims and accepts a valid name", () => {
    expect(parseMemberField("fullName", "  Grace Hopper ")).toEqual({
      ok: true,
      value: "Grace Hopper",
    });
  });

  it("asks for a name when it is blank", () => {
    expect(parseMemberField("fullName", "   ")).toEqual({
      ok: false,
      error: "Enter a name",
    });
  });

  it("allows empty optional text fields", () => {
    expect(parseMemberField("title", "")).toEqual({ ok: true, value: "" });
    expect(parseMemberField("memberId", "")).toEqual({
      ok: true,
      value: undefined,
    });
    expect(parseMemberField("qrUrl", " ")).toEqual({
      ok: true,
      value: undefined,
    });
  });

  describe("memberSince", () => {
    it("converts the typed year to a number", () => {
      expect(parseMemberField("memberSince", "2024")).toEqual({
        ok: true,
        value: 2024,
      });
    });

    it.each([
      ["", "Enter a year"],
      ["abc", "Enter a year"],
      ["2024.5", "Enter a whole year"],
      ["1850", "Enter a year from 1900 to 2100"],
      ["2200", "Enter a year from 1900 to 2100"],
    ])("rejects %j with %j", (raw, error) => {
      expect(parseMemberField("memberSince", raw)).toEqual({
        ok: false,
        error,
      });
    });
  });

  it("validates the member ID format", () => {
    expect(parseMemberField("memberId", " 1234 5678 901 ")).toEqual({
      ok: true,
      value: "1234 5678 901",
    });
    expect(parseMemberField("memberId", "12345")).toEqual({
      ok: false,
      error: "Use 11 digits, like 1234 5678 901",
    });
  });

  it("requires a full URL for the QR link", () => {
    expect(parseMemberField("qrUrl", "https://linear.app").ok).toBe(true);
    expect(parseMemberField("qrUrl", "linear.app")).toEqual({
      ok: false,
      error: "Enter a full link, like https://example.com",
    });
  });
});

describe("toMemberDraft", () => {
  it("turns a member into strings for the inputs", () => {
    expect(toMemberDraft(DEFAULT_CARD_CONFIG.member)).toEqual({
      fullName: "Ada Lovelace",
      title: "Engineer",
      membership: "Founding member",
      label: "",
      memberSince: "2026",
      memberId: "",
      qrUrl: "",
    });
  });
});
