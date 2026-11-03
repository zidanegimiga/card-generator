import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterEach } from "vitest";

// Animations finish instantly so exit transitions don't hold elements in the DOM.
MotionGlobalConfig.skipAnimations = true;

afterEach(() => {
  cleanup();
});
