import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_CARD_CONFIG } from "@/lib/card/defaults";
import type { CardStyle } from "@/lib/card/schema";

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

    expect(screen.getAllByRole("radio")).toHaveLength(4);
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

  it("can be operated with arrow keys", async () => {
    const { user, onChange } = setup();

    await user.click(screen.getByRole("radio", { name: "Slate" }));
    await user.keyboard("{ArrowRight}");

    expect(onChange).toHaveBeenLastCalledWith("poster");
  });

  it("previews the member's own card in each style", () => {
    const { container } = setup();

    const previews = [...container.querySelectorAll("article[data-style]")];
    expect(previews.map((card) => card.getAttribute("data-style"))).toEqual([
      "slate",
      "poster",
      "transit",
      "blueprint",
    ]);
    expect(
      previews.every((card) =>
        card.textContent?.replace(/\s+/g, " ").includes("Ada Lovelace"),
      ),
    ).toBe(true);
  });
});
