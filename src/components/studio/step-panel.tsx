"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

import type { StudioStep } from "./steps";

const slide: Variants = {
  enter: (direction: 1 | -1) => ({ opacity: 0, x: 24 * direction }),
  center: { opacity: 1, x: 0 },
  exit: (direction: 1 | -1) => ({ opacity: 0, x: -24 * direction }),
};

type StepPanelProps = {
  step: StudioStep;
  stepNumber: number;
  totalSteps: number;
  direction: 1 | -1;
  onBack: () => void;
  onNext: () => void;
  children: ReactNode;
};

export function StepPanel({
  step,
  stepNumber,
  totalSteps,
  direction,
  onBack,
  onNext,
  children,
}: StepPanelProps) {
  const isFirst = stepNumber === 1;
  const isLast = stepNumber === totalSteps;

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-x-hidden overflow-y-auto">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.section
            key={step.id}
            aria-labelledby={`step-${step.id}-title`}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="p-6"
          >
            <p className="font-mono text-xs text-muted">
              Step {stepNumber} of {totalSteps}
            </p>
            <h2
              id={`step-${step.id}-title`}
              className="mt-1 text-lg font-medium"
            >
              {step.label}
            </h2>
            <p className="mt-1 text-sm text-muted">{step.description}</p>
            <div className="mt-6">{children}</div>
          </motion.section>
        </AnimatePresence>
      </div>

      <div className="flex justify-between gap-2 border-t border-border p-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirst}
          className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted hover:text-foreground disabled:invisible"
        >
          <ChevronLeft aria-hidden className="size-4" />
          Back
        </button>
        {!isLast && (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-1 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Next
            <ChevronRight aria-hidden className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
