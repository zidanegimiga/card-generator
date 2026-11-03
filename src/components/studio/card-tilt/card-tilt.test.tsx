import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CardTilt } from "./card-tilt";

describe("CardTilt", () => {
  it("renders its child and takes a sizing class from the parent", () => {
    render(
      <CardTilt className="preview">
        <p>card</p>
      </CardTilt>,
    );

    expect(screen.getByText("card")).toBeInTheDocument();
    expect(screen.getByTestId("card-tilt")).toHaveClass("preview");
  });

  it("keeps the sheen out of the accessibility tree", () => {
    const { container } = render(
      <CardTilt>
        <p>card</p>
      </CardTilt>,
    );

    expect(container.querySelectorAll("[aria-hidden]")).toHaveLength(1);
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
