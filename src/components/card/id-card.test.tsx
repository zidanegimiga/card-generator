import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DEFAULT_CARD_CONFIG } from "@/lib/card/defaults";
import { CARD_STYLES, type CardConfig } from "@/lib/card/schema";

import { IdCard } from "./id-card";

const PHOTO = "data:image/png;base64,iVBORw0KGgo=";
const LOGO = "data:image/svg+xml;base64,PHN2Zz4=";

function config(overrides: {
  style?: CardConfig["style"];
  member?: Partial<CardConfig["member"]>;
  brand?: Partial<CardConfig["brand"]>;
}): CardConfig {
  return {
    ...DEFAULT_CARD_CONFIG,
    style: overrides.style ?? DEFAULT_CARD_CONFIG.style,
    member: { ...DEFAULT_CARD_CONFIG.member, ...overrides.member },
    brand: { ...DEFAULT_CARD_CONFIG.brand, ...overrides.brand },
  };
}

function renderCard(cardConfig: CardConfig) {
  render(<IdCard config={cardConfig} />);
  return screen.getByRole("article", {
    name: `${cardConfig.brand.name} ID card for ${cardConfig.member.fullName}`,
  });
}

describe.each(CARD_STYLES)("%s card", (style) => {
  it("shows the brand, member, and member ID", () => {
    const card = renderCard(
      config({ style, member: { memberId: "4729 9159 692" } }),
    );

    expect(card).toHaveAttribute("data-style", style);
    expect(within(card).getByText("Card Generator")).toBeInTheDocument();
    expect(within(card).getByText("Ada Lovelace")).toBeInTheDocument();
    expect(within(card).getByText("4729 9159 692")).toBeInTheDocument();
  });

  it("shows initials when there's no photo", () => {
    const card = renderCard(config({ style }));

    expect(within(card).getByTestId("portrait-initials")).toHaveTextContent(
      "AL",
    );
    expect(within(card).queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows the member's photo when set", () => {
    const card = renderCard(config({ style, member: { photoUrl: PHOTO } }));

    expect(
      within(card).getByRole("img", { name: "Photo of Ada Lovelace" }),
    ).toHaveAttribute("src", PHOTO);
    expect(
      within(card).queryByTestId("portrait-initials"),
    ).not.toBeInTheDocument();
  });

  it("shows the logo as decoration next to the brand name", () => {
    const card = renderCard(config({ style, brand: { logoUrl: LOGO } }));

    // alt="" keeps the logo out of the accessible tree; the name is right beside it.
    const logo = card.querySelector(`img[src="${LOGO}"]`);
    expect(logo).toHaveAttribute("alt", "");
  });

  it("shows the card label when set", () => {
    const card = renderCard(config({ style, member: { label: "Staff" } }));

    expect(within(card).getByText("Staff")).toBeInTheDocument();
  });
});

describe("IdCard", () => {
  it("uses the selected font", () => {
    const card = renderCard({
      ...DEFAULT_CARD_CONFIG,
      font: { kind: "google", family: "Fraunces" },
    });

    expect(card).toHaveStyle({
      fontFamily: '"Fraunces", ui-serif, Georgia, serif',
    });
  });

  it("drops empty optional fields instead of showing blank labels", () => {
    const card = renderCard(
      config({ style: "transit", member: { title: "", membership: "" } }),
    );

    expect(within(card).queryByText("Title")).not.toBeInTheDocument();
    expect(within(card).queryByText("Class")).not.toBeInTheDocument();
    expect(within(card).getByText("Member since")).toBeInTheDocument();
  });

  it("shows the transit gate only when the brand has a website", () => {
    const withSite = renderCard(
      config({ style: "transit", brand: { domain: "linear.app" } }),
    );
    expect(within(withSite).getByText("linear.app")).toBeInTheDocument();
  });

  it("gives the transit card a barcode with one bar per digit", () => {
    const card = renderCard(
      config({ style: "transit", member: { memberId: "1234 5678 901" } }),
    );

    expect(within(card).getByTestId("barcode").children).toHaveLength(11);
  });

  it("hides decorative copies from assistive tech", () => {
    render(<IdCard config={DEFAULT_CARD_CONFIG} decorative />);

    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
