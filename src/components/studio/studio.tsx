"use client";

import { MotionConfig } from "motion/react";
import { useReducer, useState } from "react";

import { IdCard } from "@/components/card/id-card";
import { useCustomFonts } from "@/hooks/use-custom-fonts";
import { DEFAULT_CARD_CONFIG } from "@/lib/card/defaults";
import type { CardConfig } from "@/lib/card/schema";
import { googleFontsHref } from "@/lib/fonts/catalog";

import { BrandForm } from "./brand-form";
import { ExportPanel } from "./export-panel";
import { FontPicker } from "./font-picker";
import { MemberForm } from "./member-form";
import { StepPanel } from "./step-panel";
import { StylePicker } from "./style-picker";
import { StepperRail } from "./stepper-rail";
import { INITIAL_STEPPER_STATE, STUDIO_STEPS, stepperReducer } from "./steps";

export function Studio() {
  const [stepper, dispatch] = useReducer(stepperReducer, INITIAL_STEPPER_STATE);
  const [config, setConfig] = useState<CardConfig>(DEFAULT_CARD_CONFIG);
  const customFonts = useCustomFonts();
  const step = STUDIO_STEPS[stepper.index];

  function renderStep() {
    switch (step.id) {
      case "brand":
        return (
          <BrandForm
            brand={config.brand}
            onChange={(brand) =>
              setConfig((current) => ({ ...current, brand }))
            }
          />
        );
      case "style":
        return (
          <StylePicker
            config={config}
            onChange={(style) =>
              setConfig((current) => ({ ...current, style }))
            }
          />
        );
      case "font":
        return (
          <FontPicker
            value={config.font}
            onChange={(font) => setConfig((current) => ({ ...current, font }))}
            customFonts={customFonts}
          />
        );
      case "member":
        return (
          <MemberForm
            member={config.member}
            onChange={(member) =>
              setConfig((current) => ({ ...current, member }))
            }
          />
        );
      case "export":
        return <ExportPanel config={config} />;
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <link rel="stylesheet" href={googleFontsHref()} precedence="default" />
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
              {renderStep()}
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
