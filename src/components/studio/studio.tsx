"use client";

import { MotionConfig } from "motion/react";
import { useEffect, useReducer, useSyncExternalStore } from "react";

import { IdCard } from "@/components/card/id-card";
import { useCardConfig } from "@/hooks/use-card-config";
import { useCustomFonts } from "@/hooks/use-custom-fonts";
import type { ConfigStore } from "@/lib/card/config-store";
import { DEFAULT_CARD_CONFIG } from "@/lib/card/defaults";
import { googleFontsHref } from "@/lib/fonts/catalog";

import { BrandForm } from "./brand-form";
import { CardTilt } from "./card-tilt";
import { ExportPanel } from "./export-panel";
import { FontPicker } from "./font-picker";
import { MemberForm } from "./member-form";
import { StepPanel } from "./step-panel";
import { StylePicker } from "./style-picker";
import { StepperRail } from "./stepper-rail";
import { INITIAL_STEPPER_STATE, STUDIO_STEPS, stepperReducer } from "./steps";

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true after. */
function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function Studio({ store }: { store?: ConfigStore }) {
  const [stepper, dispatch] = useReducer(stepperReducer, INITIAL_STEPPER_STATE);
  const [config, setConfig] = useCardConfig(store);
  const customFonts = useCustomFonts();
  const hydrated = useHydrated();
  const step = STUDIO_STEPS[stepper.index];

  // A saved card can point at an uploaded font that has since been removed.
  const { font } = config;
  const missingUpload =
    customFonts.ready &&
    font.kind === "custom" &&
    !customFonts.fonts.some((upload) => upload.id === font.id);
  useEffect(() => {
    if (missingUpload) {
      setConfig((current) => ({ ...current, font: DEFAULT_CARD_CONFIG.font }));
    }
  }, [missingUpload, setConfig]);

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
              {/* Forms copy their values on mount, so remount once the saved card loads. */}
              <div key={String(hydrated)}>{renderStep()}</div>
            </StepPanel>
          </div>
        </aside>

        <main className="grid flex-1 place-items-center bg-background p-8">
          <CardTilt className="w-52 md:w-72">
            <IdCard config={config} className="w-full" />
          </CardTilt>
        </main>
      </div>
    </MotionConfig>
  );
}
