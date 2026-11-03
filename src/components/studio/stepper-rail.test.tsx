import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StepperRail } from "./stepper-rail";
import { STUDIO_STEPS } from "./steps";

function renderRail(activeIndex = 0) {
  const onSelect = vi.fn();
  render(<StepperRail activeIndex={activeIndex} onSelect={onSelect} />);
  const nav = screen.getByRole("navigation", { name: "Studio steps" });
  return { nav, onSelect };
}

describe("StepperRail", () => {
  it("lists every step in order", () => {
    const { nav } = renderRail();

    const labels = within(nav)
      .getAllByRole("button")
      .map((button) => button.textContent);

    expect(labels).toEqual(STUDIO_STEPS.map((step) => step.label));
  });

  it("marks only the active step as current", () => {
    const { nav } = renderRail(2);

    expect(within(nav).getByRole("button", { name: "Font" })).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(
      within(nav).getByRole("button", { name: "Brand" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("shows a done marker on steps before the active one", () => {
    renderRail(2);

    expect(screen.getByTestId("step-done-brand")).toBeInTheDocument();
    expect(screen.getByTestId("step-done-style")).toBeInTheDocument();
    expect(screen.queryByTestId("step-done-font")).not.toBeInTheDocument();
  });

  it("reports the step the user picks", async () => {
    const user = userEvent.setup();
    const { nav, onSelect } = renderRail();

    await user.click(within(nav).getByRole("button", { name: "Member" }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith("member");
  });

  it("is reachable with the keyboard", async () => {
    const user = userEvent.setup();
    const { nav, onSelect } = renderRail();

    await user.tab();
    expect(within(nav).getByRole("button", { name: "Brand" })).toHaveFocus();

    await user.tab();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("style");
  });
});
