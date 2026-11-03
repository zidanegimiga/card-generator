"use client";

import {
  Check,
  Download,
  LayoutTemplate,
  type LucideIcon,
  Palette,
  Type,
  UserRound,
} from "lucide-react";
import { motion, type Variants } from "motion/react";
import { useState } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";

import { type StepId, STUDIO_STEPS } from "./steps";

const STEP_ICONS: Record<StepId, LucideIcon> = {
  brand: Palette,
  style: LayoutTemplate,
  font: Type,
  member: UserRound,
  export: Download,
};

const RAIL_WIDTH = { collapsed: 64, expanded: 184 } as const;

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: spring },
};

type StepperRailProps = {
  activeIndex: number;
  onSelect: (id: StepId) => void;
};

export function StepperRail({ activeIndex, onSelect }: StepperRailProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)", true);
  const [expanded, setExpanded] = useState(false);
  const showLabels = expanded || !isDesktop;

  return (
    <nav aria-label="Studio steps" className="relative md:h-full md:w-16">
      <motion.div
        className="z-20 flex overflow-hidden border-border bg-surface p-2 max-md:w-full! max-md:border-t md:absolute md:inset-y-0 md:left-0 md:border-r"
        initial={false}
        animate={{
          width: expanded ? RAIL_WIDTH.expanded : RAIL_WIDTH.collapsed,
        }}
        transition={spring}
        onHoverStart={() => setExpanded(true)}
        onHoverEnd={() => setExpanded(false)}
        onFocus={() => setExpanded(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setExpanded(false);
          }
        }}
      >
        <motion.ol
          className="flex w-full gap-1 max-md:justify-between md:flex-col"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {STUDIO_STEPS.map((step, index) => {
            const Icon = STEP_ICONS[step.id];
            const isActive = index === activeIndex;
            const isDone = index < activeIndex;

            return (
              <motion.li key={step.id} variants={itemVariants}>
                <button
                  type="button"
                  aria-current={isActive ? "step" : undefined}
                  onClick={() => onSelect(step.id)}
                  className="group relative flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent aria-[current=step]:text-foreground max-md:h-auto max-md:flex-col max-md:gap-1 max-md:px-2 max-md:py-1.5 max-md:text-[11px]"
                >
                  {isActive && (
                    <motion.span
                      layoutId="rail-active-indicator"
                      transition={spring}
                      className="absolute inset-0 rounded-lg bg-surface-raised"
                    >
                      <span className="absolute top-2 bottom-2 -left-2 w-0.5 rounded-full bg-accent max-md:hidden" />
                    </motion.span>
                  )}

                  <span className="relative">
                    <Icon aria-hidden className="size-[18px]" />
                    {isDone && (
                      <motion.span
                        data-testid={`step-done-${step.id}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={spring}
                        className="absolute -top-1.5 -right-1.5 grid size-3 place-items-center rounded-full bg-accent text-background"
                      >
                        <Check aria-hidden className="size-2" strokeWidth={4} />
                      </motion.span>
                    )}
                  </span>

                  <motion.span
                    className="relative whitespace-nowrap"
                    initial={false}
                    animate={{
                      opacity: showLabels ? 1 : 0,
                      x: showLabels ? 0 : -4,
                    }}
                    transition={{ duration: 0.15 }}
                  >
                    {step.label}
                  </motion.span>
                </button>
              </motion.li>
            );
          })}
        </motion.ol>
      </motion.div>
    </nav>
  );
}
