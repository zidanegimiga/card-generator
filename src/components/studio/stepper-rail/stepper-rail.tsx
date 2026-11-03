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
import { type StepId, STUDIO_STEPS } from "@/lib/studio/steps";

import styles from "./stepper-rail.module.css";

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
    <nav aria-label="Studio steps" className={styles.nav}>
      <motion.div
        className={styles.rail}
        initial={false}
        // On phones the rail is a full-width bottom bar; CSS overrides this width.
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
          className={styles.list}
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
                  className={styles.step}
                >
                  {isActive && (
                    <motion.span
                      layoutId="rail-active-indicator"
                      transition={spring}
                      className={styles.indicator}
                    >
                      <span className={styles.bar} />
                    </motion.span>
                  )}

                  <span className={styles.icon}>
                    <Icon aria-hidden size={18} />
                    {isDone && (
                      <motion.span
                        data-testid={`step-done-${step.id}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={spring}
                        className={styles.done}
                      >
                        <Check aria-hidden size={8} strokeWidth={4} />
                      </motion.span>
                    )}
                  </span>

                  <motion.span
                    className={styles.label}
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
