import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_CARD_CONFIG } from "@/lib/card/defaults";
import type { BrandPullResult } from "@/lib/brand-pull/client";
import type { Brand } from "@/lib/card/schema";

import { applyBrandPull } from "@/lib/brand-pull/apply-brand-pull";

import { BrandForm } from "./brand-form";

function Harness({
  onChange,
  requestPull,
}: {
  onChange: (brand: Brand) => void;
  requestPull?: (site: string) => Promise<BrandPullResult>;
}) {
  const [brand, setBrand] = useState<Brand>(DEFAULT_CARD_CONFIG.brand);
  return (
    <BrandForm
      brand={brand}
      requestPull={requestPull}
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
      ).toHaveTextContent("15.8:1 AAA");
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

  describe("pull from a website", () => {
    const LOGO = "data:image/png;base64,AQID";

    function setupPull(result: BrandPullResult) {
      const user = userEvent.setup();
      const onChange = vi.fn<(brand: Brand) => void>();
      const requestPull = vi.fn(async () => result);
      render(<Harness onChange={onChange} requestPull={requestPull} />);
      const site = screen.getByLabelText("Pull from a website");
      const pull = screen.getByRole("button", { name: "Pull" });
      return { user, onChange, requestPull, site, pull };
    }

    it("fills the form and the card from the site", async () => {
      const { user, onChange, requestPull, site, pull } = setupPull({
        ok: true,
        brand: {
          name: "Linear",
          domain: "linear.app",
          primary: "#5e6ad2",
          logoUrl: LOGO,
        },
      });

      await user.type(site, "linear.app");
      await user.click(pull);

      expect(requestPull).toHaveBeenCalledWith("linear.app");
      expect(screen.getByLabelText("Brand name")).toHaveValue("Linear");
      expect(screen.getByLabelText("Website")).toHaveValue("linear.app");
      expect(screen.getByLabelText("Primary")).toHaveValue("#5e6ad2");
      expect(screen.getByRole("img", { name: "Linear logo" })).toHaveAttribute(
        "src",
        LOGO,
      );
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ name: "Linear", logoUrl: LOGO }),
      );
      expect(
        screen.getByText("Pulled Linear. Adjust anything below."),
      ).toBeInTheDocument();
    });

    it("submits with Enter", async () => {
      const { user, requestPull, site } = setupPull({
        ok: true,
        brand: { name: "Exa", domain: "exa.ai" },
      });

      await user.type(site, "exa.ai{Enter}");

      expect(requestPull).toHaveBeenCalledWith("exa.ai");
    });

    it("shows the reason a pull failed and leaves the brand alone", async () => {
      const { user, onChange, site, pull } = setupPull({
        ok: false,
        error: "That address isn't a public website.",
      });

      await user.type(site, "127.0.0.1");
      await user.click(pull);

      expect(
        screen.getByText("That address isn't a public website."),
      ).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });

    it("asks for a site instead of calling the API with nothing", async () => {
      const { user, requestPull, pull } = setupPull({
        ok: true,
        brand: { name: "X", domain: "x.com" },
      });

      await user.click(pull);

      expect(
        screen.getByText("Enter a website, like linear.app."),
      ).toBeInTheDocument();
      expect(requestPull).not.toHaveBeenCalled();
    });

    it("disables the button while pulling", async () => {
      const user = userEvent.setup();
      let finish!: (result: BrandPullResult) => void;
      render(
        <Harness
          onChange={vi.fn()}
          requestPull={() => new Promise((resolve) => (finish = resolve))}
        />,
      );

      await user.type(screen.getByLabelText("Pull from a website"), "x.com");
      await user.click(screen.getByRole("button", { name: "Pull" }));

      expect(screen.getByRole("button", { name: "Pulling…" })).toBeDisabled();
      finish({ ok: true, brand: { name: "X", domain: "x.com" } });
      expect(await screen.findByRole("button", { name: "Pull" })).toBeEnabled();
    });
  });
});

describe("applyBrandPull", () => {
  it("keeps the existing logo and colour when the site has none", () => {
    const brand = {
      ...DEFAULT_CARD_CONFIG.brand,
      logoUrl: "data:image/png;base64,AA==",
    };

    expect(applyBrandPull(brand, { name: "Exa", domain: "exa.ai" })).toEqual({
      ...brand,
      name: "Exa",
      domain: "exa.ai",
    });
  });

  it("takes a pulled background and text colour together", () => {
    const next = applyBrandPull(DEFAULT_CARD_CONFIG.brand, {
      name: "Vercel",
      domain: "vercel.com",
      background: "#fafafa",
      text: "#111111",
    });

    expect(next.colors).toEqual({
      ...DEFAULT_CARD_CONFIG.brand.colors,
      background: "#fafafa",
      text: "#111111",
    });
  });
});
