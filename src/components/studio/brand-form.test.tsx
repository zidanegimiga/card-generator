import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_CARD_CONFIG } from "@/lib/card/defaults";
import type { Brand } from "@/lib/card/schema";

import { BrandForm } from "./brand-form";

function Harness({ onChange }: { onChange: (brand: Brand) => void }) {
  const [brand, setBrand] = useState<Brand>(DEFAULT_CARD_CONFIG.brand);
  return (
    <BrandForm
      brand={brand}
      onChange={(next) => {
        setBrand(next);
        onChange(next);
      }}
    />
  );
}

function setup() {
  const user = userEvent.setup();
  const onChange = vi.fn<(brand: Brand) => void>();
  render(<Harness onChange={onChange} />);
  const lastBrand = () => onChange.mock.lastCall?.[0];
  return { user, onChange, lastBrand };
}

describe("BrandForm", () => {
  it("renames the brand", async () => {
    const { user, lastBrand } = setup();
    const name = screen.getByLabelText("Brand name");

    await user.clear(name);
    await user.type(name, "Linear");

    expect(lastBrand()?.name).toBe("Linear");
  });

  it("normalises a pasted website to its domain", async () => {
    const { user, lastBrand } = setup();

    await user.type(screen.getByLabelText("Website"), "https://linear.app/");

    expect(lastBrand()?.domain).toBe("linear.app");
  });

  describe("colours", () => {
    it("applies a typed hex colour and syncs the swatch", async () => {
      const { user, lastBrand } = setup();
      const hex = screen.getByLabelText("Primary");

      await user.clear(hex);
      await user.type(hex, "#E4F222");

      expect(lastBrand()?.colors.primary).toBe("#e4f222");
      expect(screen.getByLabelText("Primary colour picker")).toHaveValue(
        "#e4f222",
      );
    });

    it("applies a colour from the picker and syncs the hex", () => {
      const { lastBrand } = setup();

      fireEvent.change(screen.getByLabelText("Background colour picker"), {
        target: { value: "#ffffff" },
      });

      expect(lastBrand()?.colors.background).toBe("#ffffff");
      expect(screen.getByLabelText("Background")).toHaveValue("#ffffff");
    });

    it("flags a partial hex without breaking the swatch", async () => {
      const { user, onChange } = setup();
      const hex = screen.getByLabelText("Primary");

      await user.clear(hex);
      onChange.mockClear();
      await user.type(hex, "#12");

      expect(hex).toHaveAccessibleDescription("Use a hex colour like #5e6ad2");
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByLabelText("Primary colour picker")).toHaveValue(
        DEFAULT_CARD_CONFIG.brand.colors.primary,
      );
    });
  });

  describe("contrast check", () => {
    it("rates the default palette", () => {
      setup();

      expect(
        screen.getByRole("status", { name: "Text contrast" }),
      ).toHaveTextContent("17.9:1 AAA");
    });

    it("warns when text and background are too close", () => {
      setup();

      fireEvent.change(screen.getByLabelText("Text colour picker"), {
        target: { value: "#222222" },
      });

      expect(
        screen.getByRole("status", { name: "Text contrast" }),
      ).toHaveTextContent(/Low$/);
    });
  });

  describe("logo", () => {
    const svg = () =>
      new File(["<svg/>"], "logo.svg", { type: "image/svg+xml" });

    it("uploads a logo and shows a preview", async () => {
      const { user, lastBrand } = setup();

      await user.upload(screen.getByLabelText("Upload logo"), svg());

      expect(
        await screen.findByRole("img", { name: "Card Generator logo" }),
      ).toHaveAttribute("src", expect.stringMatching(/^data:image\/svg\+xml/));
      expect(lastBrand()?.logoUrl).toMatch(/^data:image\/svg\+xml/);
      expect(screen.getByLabelText("Replace logo")).toBeInTheDocument();
    });

    it("removes the logo", async () => {
      const { user, lastBrand } = setup();

      await user.upload(screen.getByLabelText("Upload logo"), svg());
      await screen.findByRole("img", { name: "Card Generator logo" });
      await user.click(screen.getByRole("button", { name: "Remove logo" }));

      expect(lastBrand()?.logoUrl).toBeUndefined();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("explains a rejected file", async () => {
      const user = userEvent.setup({ applyAccept: false });
      const onChange = vi.fn();
      render(<Harness onChange={onChange} />);

      await user.upload(
        screen.getByLabelText("Upload logo"),
        new File(["%PDF"], "logo.pdf", { type: "application/pdf" }),
      );

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Use a PNG, JPEG, WebP, or SVG image.",
      );
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
