import type { CardConfig } from "./schema";

export const DEFAULT_CARD_CONFIG = {
  brand: {
    name: "Card Generator",
    colors: {
      primary: "#e8e3d9",
      secondary: "#8a857a",
      background: "#141414",
      text: "#f1ede6",
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
