export const STUDIO_STEPS = [
  { id: "brand", label: "Brand", description: "Name, logo, and colours." },
  { id: "style", label: "Style", description: "Layout and material." },
  { id: "font", label: "Font", description: "Pick one or upload your own." },
  { id: "member", label: "Member", description: "Who the card belongs to." },
  { id: "export", label: "Export", description: "Download the finished card." },
] as const;

export type StudioStep = (typeof STUDIO_STEPS)[number];
export type StepId = StudioStep["id"];

export type StepperState = {
  index: number;
  /** 1 when moving forward, -1 when moving back. Drives the slide direction. */
  direction: 1 | -1;
};

export type StepperAction =
  { type: "next" } | { type: "back" } | { type: "goTo"; id: StepId };

export const INITIAL_STEPPER_STATE: StepperState = { index: 0, direction: 1 };

const LAST_INDEX = STUDIO_STEPS.length - 1;

export function stepperReducer(
  state: StepperState,
  action: StepperAction,
): StepperState {
  switch (action.type) {
    case "next":
      if (state.index === LAST_INDEX) return state;
      return { index: state.index + 1, direction: 1 };
    case "back":
      if (state.index === 0) return state;
      return { index: state.index - 1, direction: -1 };
    case "goTo": {
      const index = STUDIO_STEPS.findIndex((step) => step.id === action.id);
      if (index === state.index) return state;
      return { index, direction: index > state.index ? 1 : -1 };
    }
  }
}
