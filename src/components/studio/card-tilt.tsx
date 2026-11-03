"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { PointerEvent, ReactNode } from "react";

import { RESTING_TILT, tiltFromPointer } from "@/lib/tilt";

const spring = { stiffness: 220, damping: 22, mass: 0.6 };

/**
 * Tilts its child in 3D toward the pointer, with a soft sheen that follows.
 * Only the on-screen preview tilts; the PNG export renders a flat copy.
 */
export function CardTilt({
  children,
  className = "",
}: {
  children: ReactNode;
  /** Sets the width. Containers don't size from content, so it must be explicit. */
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(RESTING_TILT.rotateX, spring);
  const rotateY = useSpring(RESTING_TILT.rotateY, spring);
  const glareX = useSpring(RESTING_TILT.glareX, spring);
  const glareY = useSpring(RESTING_TILT.glareY, spring);
  const glareOpacity = useSpring(0, spring);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.18), transparent 55%)`;

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const tilt = tiltFromPointer(
      event.clientX,
      event.clientY,
      event.currentTarget.getBoundingClientRect(),
    );
    rotateX.set(tilt.rotateX);
    rotateY.set(tilt.rotateY);
    glareX.set(tilt.glareX);
    glareY.set(tilt.glareY);
    glareOpacity.set(1);
  }

  function handleLeave() {
    rotateX.set(RESTING_TILT.rotateX);
    rotateY.set(RESTING_TILT.rotateY);
    glareOpacity.set(0);
  }

  return (
    <div
      data-testid="card-tilt"
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`[perspective:900px] ${className}`}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        // A size container like the card, so the sheen's cqw radius matches it.
        className="@container relative"
      >
        {children}
        <motion.div
          aria-hidden
          style={{ background: glare, opacity: glareOpacity }}
          className="pointer-events-none absolute inset-0 rounded-[3.2cqw] mix-blend-soft-light"
        />
      </motion.div>
    </div>
  );
}
