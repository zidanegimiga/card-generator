"use client";

import { MotionConfig } from "motion/react";
import { useReducer, useState } from "react";

import { IdCard } from "@/components/card/id-card";
import { DEFAULT_CARD_CONFIG } from "@/lib/card/defaults";
import type { CardConfig } from "@/lib/card/schema";

import { MemberForm } from "./member-form";
import { StepPanel } from "./step-panel";
import { StepperRail } from "./stepper-rail";
import { INITIAL_STEPPER_STATE, STUDIO_STEPS, stepperReducer } from "./steps";

export function Studio() {
  const [stepper, dispatch] = useReducer(stepperReducer, INITIAL_STEPPER_STATE);
  const [config, setConfig] = useState<CardConfig>(DEFAULT_CARD_CONFIG);
  const step = STUDIO_STEPS[stepper.index];

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-dvh flex-col-reverse md:flex-row">
        <StepperRail
          activeIndex={stepper.index}
          onSelect={(id) => dispatch({ type: "goTo", id })}
        />

        <aside className="flex min-h-0 flex-1 flex-col border-border bg-surface md:w-[360px] md:flex-none md:border-r">
          <header className="border-b border-border px-6 py-4">
            <h1 className="text-sm font-medium">Card Generator</h1>
          </header>
          <div className="min-h-0 flex-1">
            <StepPanel
              step={step}
              stepNumber={stepper.index + 1}
              totalSteps={STUDIO_STEPS.length}
              direction={stepper.direction}
              onBack={() => dispatch({ type: "back" })}
              onNext={() => dispatch({ type: "next" })}
            >
              {step.id === "member" ? (
                <MemberForm
                  member={config.member}
                  onChange={(member) =>
                    setConfig((current) => ({ ...current, member }))
                  }
                />
              ) : (
                <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
                  {step.label} controls are coming in a later step.
                </p>
              )}
            </StepPanel>
          </div>
        </aside>

        <main className="grid flex-1 place-items-center bg-[radial-gradient(circle_at_center,#18181d_0%,var(--background)_70%)] p-8">
          <IdCard config={config} />
        </main>
      </div>
    </MotionConfig>
  );
}
