import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CardTilt } from "./card-tilt";

describe("CardTilt", () => {
  it("renders its child and sets the width on itself", () => {
    render(
      <CardTilt className="w-72">
        <p>card</p>
      </CardTilt>,
    );

    expect(screen.getByText("card")).toBeInTheDocument();
    expect(screen.getByTestId("card-tilt")).toHaveClass("w-72");
  });

  it("keeps the sheen out of the accessibility tree and off the pointer path", () => {
    const { container } = render(
      <CardTilt>
        <p>card</p>
      </CardTilt>,
    );

    const sheen = container.querySelector("[aria-hidden]");
    expect(sheen).toHaveClass("pointer-events-none");
  });

  it("handles pointer movement and leaving without errors", () => {
    render(
      <CardTilt>
        <p>card</p>
      </CardTilt>,
    );
    const tilt = screen.getByTestId("card-tilt");

    fireEvent.pointerMove(tilt, { clientX: 10, clientY: 10 });
    fireEvent.pointerLeave(tilt);

    expect(screen.getByText("card")).toBeInTheDocument();
  });
});
