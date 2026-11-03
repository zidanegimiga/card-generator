import type { CardConfig } from "./schema";

export const DEFAULT_CARD_CONFIG = {
  brand: {
    name: "Card Generator",
    colors: {
      primary: "#5b5bd6",
      secondary: "#f5d90a",
      background: "#0b0b0f",
      text: "#f4f4f5",
    },
  },
  style: "slate",
  font: { kind: "google", family: "Geist" },
  member: {
    fullName: "Ada Lovelace",
    title: "Engineer",
    membership: "Founding member",
    label: "",
    memberSince: 2026,
  },
} as const satisfies CardConfig;
