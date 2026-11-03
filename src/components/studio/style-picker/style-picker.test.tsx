import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_CARD_CONFIG } from "@/lib/card/defaults";
import { CARD_STYLES, type CardStyle } from "@/lib/card/schema";
import { STYLE_GROUPS } from "@/lib/card/styles";

import { StylePicker } from "./style-picker";

function Harness({ onChange }: { onChange: (style: CardStyle) => void }) {
  const [style, setStyle] = useState<CardStyle>("slate");
  return (
    <StylePicker
      config={{ ...DEFAULT_CARD_CONFIG, style }}
      onChange={(next) => {
        setStyle(next);
        onChange(next);
      }}
    />
  );
}

function setup() {
  const user = userEvent.setup();
  const onChange = vi.fn<(style: CardStyle) => void>();
  const { container } = render(<Harness onChange={onChange} />);
  return { user, onChange, container };
}

describe("StylePicker", () => {
  it("offers every style with a description", () => {
    setup();

    expect(screen.getAllByRole("radio")).toHaveLength(CARD_STYLES.length);
    expect(
      screen.getByRole("radio", { name: "Transit" }),
    ).toHaveAccessibleDescription("A ticket with a tear-off stub and barcode.");
  });

  it("checks the current style", () => {
    setup();

    expect(screen.getByRole("radio", { name: "Slate" })).toBeChecked();
  });

  it("switches style", async () => {
    const { user, onChange } = setup();

    await user.click(screen.getByRole("radio", { name: "Blueprint" }));

    expect(onChange).toHaveBeenLastCalledWith("blueprint");
    expect(screen.getByRole("radio", { name: "Blueprint" })).toBeChecked();
  });

  it("sections materials and layouts under their own headings", () => {
    setup();

    const materials = screen.getByRole("region", { name: "Materials" });
    const layouts = screen.getByRole("region", { name: "Layouts" });

    expect(
      within(materials).getByRole("radio", { name: "Alloy" }),
    ).toBeInTheDocument();
    expect(
      within(materials).getByRole("radio", { name: "Press" }),
    ).toBeInTheDocument();
    expect(
      within(layouts).getByRole("radio", { name: "Slate" }),
    ).toBeInTheDocument();
    expect(
      within(layouts).queryByRole("radio", { name: "Foil" }),
    ).not.toBeInTheDocument();
  });

  it("keeps one radio group, so arrow keys cross sections", async () => {
    const { user, onChange } = setup();

    await user.click(screen.getByRole("radio", { name: "Press" }));
    await user.keyboard("{ArrowRight}");

    // Press is the last material; the next option is the first layout.
    expect(onChange).toHaveBeenLastCalledWith("slate");
  });

  it("previews the member's own card in each style", () => {
    const { container } = setup();

    const previews = [...container.querySelectorAll("article[data-style]")];
    expect(previews.map((card) => card.getAttribute("data-style"))).toEqual(
      STYLE_GROUPS.flatMap((group) => group.styles),
    );
    expect(
      previews.every((card) =>
        card.textContent?.replace(/\s+/g, " ").includes("Ada Lovelace"),
      ),
    ).toBe(true);
  });
});
