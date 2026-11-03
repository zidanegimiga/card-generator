import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_CARD_CONFIG } from "@/lib/card/defaults";
import type { CardConfig } from "@/lib/card/schema";
import type { CardRenderer, Downloader } from "@/lib/export/render-png";

import { ExportPanel } from "./export-panel";

const linear: CardConfig = {
  ...DEFAULT_CARD_CONFIG,
  style: "transit",
  brand: { ...DEFAULT_CARD_CONFIG.brand, name: "Linear", domain: "linear.app" },
};

function setup(
  config: CardConfig = linear,
  render$: CardRenderer = async () => new Blob(["png"], { type: "image/png" }),
) {
  const user = userEvent.setup();
  const renderer = vi.fn(render$);
  const download = vi.fn<Downloader>();
  render(<ExportPanel config={config} render={renderer} download={download} />);
  const button = () =>
    screen.getByRole("button", { name: /Download PNG|Rendering/ });
  return { user, renderer, download, button };
}

describe("ExportPanel", () => {
  it("summarises what will be exported", () => {
    setup();

    expect(screen.getByText("Transit")).toBeInTheDocument();
    expect(screen.getByText("Geist")).toBeInTheDocument();
    expect(screen.getByText("https://linear.app")).toBeInTheDocument();
    expect(screen.getByText("1080 × 1712 px")).toBeInTheDocument();
  });

  it("explains how to turn the QR code on", () => {
    setup(DEFAULT_CARD_CONFIG);

    expect(
      screen.getByText("Off (add a website or QR link)"),
    ).toBeInTheDocument();
  });

  it("renders the full-size card and downloads it with a readable name", async () => {
    const { user, renderer, download, button } = setup();

    await user.click(button());

    const node = renderer.mock.calls[0]![0];
    expect(node.tagName).toBe("ARTICLE");
    expect(node).toHaveAttribute("data-style", "transit");
    expect(node.parentElement).toHaveStyle({ width: "1080px" });
    expect(download).toHaveBeenCalledWith(
      expect.any(Blob),
      "linear-ada-lovelace.png",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Saved linear-ada-lovelace.png",
    );
  });

  it("shows progress and blocks repeat clicks while rendering", async () => {
    let finish!: (blob: Blob) => void;
    const { user, renderer, button } = setup(
      linear,
      () => new Promise<Blob>((resolve) => (finish = resolve)),
    );

    await user.click(button());

    expect(button()).toHaveTextContent("Rendering…");
    expect(button()).toBeDisabled();
    await user.click(button());
    expect(renderer).toHaveBeenCalledTimes(1);

    finish(new Blob());
    expect(await screen.findByText(/Saved/)).toBeInTheDocument();
    expect(button()).toBeEnabled();
  });

  it("reports a failed render without downloading", async () => {
    const { user, download, button } = setup(linear, async () => {
      throw new Error("canvas tainted");
    });

    await user.click(button());

    expect(screen.getByRole("status")).toHaveTextContent(
      "The image couldn't be created. Try again.",
    );
    expect(download).not.toHaveBeenCalled();
  });

  it("keeps the export copy out of the accessibility tree", () => {
    setup();

    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
