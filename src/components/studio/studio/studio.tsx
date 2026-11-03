"use client";

import { MotionConfig } from "motion/react";
import { useEffect, useReducer, useSyncExternalStore } from "react";

import { IdCard } from "@/components/card/id-card";
import { useCardConfig } from "@/hooks/use-card-config";
import { useCustomFonts } from "@/hooks/use-custom-fonts";
import type { ConfigStore } from "@/lib/card/config-store";
import { DEFAULT_CARD_CONFIG } from "@/lib/card/defaults";
import { googleFontsHref } from "@/lib/fonts/catalog";

import {
  INITIAL_STEPPER_STATE,
  STUDIO_STEPS,
  stepperReducer,
} from "@/lib/studio/steps";

import { BrandForm } from "../brand-form";
import { CardTilt } from "../card-tilt";
import { ExportPanel } from "../export-panel";
import { FinishPicker } from "../finish-picker";
import { FontPicker } from "../font-picker";
import { MemberForm } from "../member-form";
import { StepPanel } from "../step-panel";
import { StepperRail } from "../stepper-rail";
import { StylePicker } from "../style-picker";
import styles from "./studio.module.css";

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
          <>
            <StylePicker
              config={config}
              onChange={(style) =>
                setConfig((current) => ({ ...current, style }))
              }
            />
            <FinishPicker
              value={config.finish}
              brandColors={config.brand.colors}
              onChange={(finish) =>
                setConfig((current) => ({ ...current, finish }))
              }
            />
          </>
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
      <div className={styles.studio}>
        <StepperRail
          activeIndex={stepper.index}
          onSelect={(id) => dispatch({ type: "goTo", id })}
        />

        <aside className={styles.sidebar}>
          <header className={styles.header}>
            <h1 className={styles.title}>Card Generator</h1>
          </header>
          <div className={styles.body}>
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

        <main className={styles.canvas}>
          <CardTilt className={styles.preview}>
            <IdCard config={config} />
          </CardTilt>
        </main>
      </div>
    </MotionConfig>
  );
}
