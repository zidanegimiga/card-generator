/* eslint-disable @next/next/no-img-element -- card images are data URLs, which next/image can't optimise */
import type { CSSProperties } from "react";

import type { CardView } from "@/lib/card/card-view";

type BrandMarkProps = {
  view: CardView;
  /** Overrides the text colour, for marks placed on a coloured band. */
  color?: string;
  /** Overrides the placeholder tile, which is primary by default. */
  tileColor?: string;
  className?: string;
};

/** Logo (or a primary-coloured tile) followed by the brand name. */
export function BrandMark({
  view,
  color,
  tileColor,
  className = "",
}: BrandMarkProps) {
  return (
    <div
      className={`flex items-center gap-[2.5cqw] ${className}`}
      style={color ? { color } : undefined}
    >
      {view.logoUrl ? (
        <img
          src={view.logoUrl}
          alt=""
          className="size-[7cqw] rounded-[1.5cqw] object-contain"
        />
      ) : (
        <span
          aria-hidden
          className="size-[7cqw] rounded-[1.5cqw]"
          style={{ backgroundColor: tileColor ?? view.colors.primary }}
        />
      )}
      <span className="truncate text-[4.6cqw] font-semibold">
        {view.brandName}
      </span>
    </div>
  );
}

type PortraitProps = {
  view: CardView;
  className?: string;
  style?: CSSProperties;
};

/** The member's photo, or their initials when there isn't one. */
export function Portrait({ view, className = "", style }: PortraitProps) {
  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden ${className}`}
      style={style}
    >
      {view.photoUrl ? (
        <img
          src={view.photoUrl}
          alt={`Photo of ${view.fullName}`}
          className="size-full object-cover"
        />
      ) : (
        <span
          data-testid="portrait-initials"
          className="text-[0.38em] font-semibold"
        >
          {view.initials}
        </span>
      )}
    </div>
  );
}

/** A small uppercase caption over a value. Renders nothing when the value is empty. */
export function Field({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  if (value === "") return null;
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[2.6cqw] tracking-[0.18em] uppercase opacity-55">
        {label}
      </p>
      <p className="mt-[0.8cqw] truncate text-[4cqw] font-medium">{value}</p>
    </div>
  );
}
