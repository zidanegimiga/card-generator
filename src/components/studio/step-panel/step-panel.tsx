"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

import type { StudioStep } from "@/lib/studio/steps";

import styles from "./step-panel.module.css";

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
    <div className={styles.panel}>
      <div className={styles.scroller}>
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
            className={styles.section}
          >
            <p className={styles.count}>
              Step {stepNumber} of {totalSteps}
            </p>
            <h2 id={`step-${step.id}-title`} className={styles.title}>
              {step.label}
            </h2>
            <p className={styles.description}>{step.description}</p>
            <div className={styles.content}>{children}</div>
          </motion.section>
        </AnimatePresence>
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          onClick={onBack}
          disabled={isFirst}
          className={styles.back}
        >
          <ChevronLeft aria-hidden size={16} />
          Back
        </button>
        {!isLast && (
          <button type="button" onClick={onNext} className={styles.next}>
            Next
            <ChevronRight aria-hidden size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
