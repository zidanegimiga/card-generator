import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Studio } from "./studio";

function setup() {
  const user = userEvent.setup();
  render(<Studio />);
  const rail = screen.getByRole("navigation", { name: "Studio steps" });
  const stepHeading = () => screen.getByRole("heading", { level: 2 });
  return { user, rail, stepHeading };
}

describe("Studio", () => {
  it("opens on the brand step with a card preview", () => {
    const { stepHeading } = setup();

    expect(stepHeading()).toHaveTextContent("Brand");
    expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: /ID card for Ada Lovelace/ }),
    ).toBeInTheDocument();
  });

  it("walks forward and back with the panel buttons", async () => {
    const { user, stepHeading } = setup();

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(stepHeading()).toHaveTextContent("Font");

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(stepHeading()).toHaveTextContent("Style");
  });

  it("disables Back on the first step and hides Next on the last", async () => {
    const { user, rail } = setup();

    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();

    await user.click(within(rail).getByRole("button", { name: "Export" }));

    expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the rail in sync with the panel", async () => {
    const { user, rail } = setup();

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(within(rail).getByRole("button", { name: "Style" })).toHaveAttribute(
      "aria-current",
      "step",
    );
  });

  it("updates the card preview from the member form", async () => {
    const { user, rail } = setup();

    await user.click(within(rail).getByRole("button", { name: "Member" }));
    const name = screen.getByLabelText("Full name");
    await user.clear(name);
    await user.type(name, "Grace Hopper");

    const card = screen.getByRole("article", { name: /ID card for/ });
    expect(card).toHaveAccessibleName(
      "Card Generator ID card for Grace Hopper",
    );
    expect(within(card).getByText("Grace Hopper")).toBeInTheDocument();
  });

  it("keeps member edits when leaving and returning to the step", async () => {
    const { user, rail } = setup();

    await user.click(within(rail).getByRole("button", { name: "Member" }));
    await user.clear(screen.getByLabelText("Job title"));
    await user.type(screen.getByLabelText("Job title"), "Admiral");
    await user.click(within(rail).getByRole("button", { name: "Brand" }));
    await user.click(within(rail).getByRole("button", { name: "Member" }));

    expect(screen.getByLabelText("Job title")).toHaveValue("Admiral");
  });

  it("updates the card preview from the brand form", async () => {
    const { user } = setup();

    const name = screen.getByLabelText("Brand name");
    await user.clear(name);
    await user.type(name, "Linear");

    expect(
      screen.getByRole("article", { name: "Linear ID card for Ada Lovelace" }),
    ).toBeInTheDocument();
  });
});
