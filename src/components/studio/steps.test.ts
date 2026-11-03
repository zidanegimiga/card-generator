import { describe, expect, it } from "vitest";

import {
  INITIAL_STEPPER_STATE,
  type StepperState,
  STUDIO_STEPS,
  stepperReducer,
} from "./steps";

const last: StepperState = { index: STUDIO_STEPS.length - 1, direction: 1 };

describe("stepperReducer", () => {
  it("starts on the first step", () => {
    expect(STUDIO_STEPS[INITIAL_STEPPER_STATE.index]?.id).toBe("brand");
  });

  it("moves forward with a positive direction", () => {
    expect(stepperReducer(INITIAL_STEPPER_STATE, { type: "next" })).toEqual({
      index: 1,
      direction: 1,
    });
  });

  it("moves back with a negative direction", () => {
    expect(
      stepperReducer({ index: 2, direction: 1 }, { type: "back" }),
    ).toEqual({ index: 1, direction: -1 });
  });

  it("returns the same state at either end", () => {
    expect(stepperReducer(INITIAL_STEPPER_STATE, { type: "back" })).toBe(
      INITIAL_STEPPER_STATE,
    );
    expect(stepperReducer(last, { type: "next" })).toBe(last);
  });

  it("jumps to a step by id and infers the direction", () => {
    const forward = stepperReducer(INITIAL_STEPPER_STATE, {
      type: "goTo",
      id: "member",
    });
    expect(forward).toEqual({ index: 3, direction: 1 });

    expect(stepperReducer(forward, { type: "goTo", id: "style" })).toEqual({
      index: 1,
      direction: -1,
    });
  });

  it("returns the same state when jumping to the current step", () => {
    expect(
      stepperReducer(INITIAL_STEPPER_STATE, { type: "goTo", id: "brand" }),
    ).toBe(INITIAL_STEPPER_STATE);
  });
});
