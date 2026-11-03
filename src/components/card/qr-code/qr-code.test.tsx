import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QrCode } from "./qr-code";

function colours() {
  const svg = screen.getByRole("img");
  return {
    paper: svg.querySelector("rect")!.getAttribute("fill"),
    ink: svg.querySelector("path")!.getAttribute("fill"),
  };
}

describe("QrCode", () => {
  it("describes where it links", () => {
    render(
      <QrCode value="https://linear.app" tones={["#ffffff", "#000000"]} />,
    );

    expect(
      screen.getByRole("img", {
        name: "QR code linking to https://linear.app",
      }),
    ).toBeInTheDocument();
  });

  it.each([[["#f7f8f8", "#08090a"]], [["#08090a", "#f7f8f8"]]] as const)(
    "always uses the darker tone for modules (%j)",
    (tones) => {
      render(<QrCode value="x" tones={tones} />);

      expect(colours()).toEqual({ ink: "#08090a", paper: "#f7f8f8" });
    },
  );

  it("includes a quiet zone around the code", () => {
    render(<QrCode value="x" tones={["#ffffff", "#000000"]} />);

    // A version 1 code is 21 modules wide; two modules of margin each side.
    expect(screen.getByRole("img")).toHaveAttribute("viewBox", "0 0 25 25");
  });
});
