/* eslint-disable @next/next/no-img-element -- card images are data URLs, which next/image can't optimise */
import type { CSSProperties } from "react";

import type { CardView } from "@/lib/card/card-view";

import styles from "./portrait.module.css";

type PortraitProps = {
  view: CardView;
  /** The face sets size, shape, and colours. Initials scale with its font-size. */
  className?: string;
  style?: CSSProperties;
};

/** The member's photo, or their initials when there isn't one. */
export function Portrait({ view, className = "", style }: PortraitProps) {
  return (
    <div className={`${styles.portrait} ${className}`} style={style}>
      {view.photoUrl ? (
        <img
          src={view.photoUrl}
          alt={`Photo of ${view.fullName}`}
          className={styles.photo}
        />
      ) : (
        <span data-testid="portrait-initials" className={styles.initials}>
          {view.initials}
        </span>
      )}
    </div>
  );
}
