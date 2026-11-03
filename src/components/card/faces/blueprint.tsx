import type { CardView } from "@/lib/card/card-view";
import { withAlpha } from "@/lib/color/alpha";

import { BrandMark, Field, Portrait } from "../parts";

/** An L-shaped registration mark for one corner. */
function CornerMark({
  position,
  color,
}: {
  position: "tl" | "tr" | "bl" | "br";
  color: string;
}) {
  const sides = {
    tl: "top-[4cqw] left-[4cqw] border-t border-l",
    tr: "top-[4cqw] right-[4cqw] border-t border-r",
    bl: "bottom-[4cqw] left-[4cqw] border-b border-l",
    br: "bottom-[4cqw] right-[4cqw] border-b border-r",
  }[position];
  return (
    <span
      aria-hidden
      className={`absolute size-[5cqw] ${sides}`}
      style={{ borderColor: color }}
    />
  );
}

export function BlueprintFace({ view }: { view: CardView }) {
  const { colors } = view;
  const fine = withAlpha(colors.primary, 0.14);
  const bold = withAlpha(colors.primary, 0.3);

  return (
    <div
      className="relative flex size-full flex-col p-[9cqw] font-mono"
      style={{
        color: colors.text,
        backgroundColor: colors.background,
        backgroundImage: [
          `linear-gradient(${bold} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${bold} 1px, transparent 1px)`,
          `linear-gradient(${fine} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${fine} 1px, transparent 1px)`,
        ].join(", "),
        backgroundSize: "25cqw 25cqw, 25cqw 25cqw, 5cqw 5cqw, 5cqw 5cqw",
      }}
    >
      {(["tl", "tr", "bl", "br"] as const).map((position) => (
        <CornerMark key={position} position={position} color={colors.primary} />
      ))}

      <header className="flex items-center justify-between gap-[3cqw] font-sans">
        <BrandMark view={view} className="min-w-0" />
        <span
          className="shrink-0 font-mono text-[2.8cqw]"
          style={{ color: colors.primary }}
        >
          REV {view.since}
        </span>
      </header>

      <figure className="mt-auto flex items-end gap-[4cqw]">
        <Portrait
          view={view}
          className="size-[30cqw] border-[0.5cqw] border-dashed font-sans text-[30cqw]"
          style={{
            borderColor: colors.primary,
            backgroundColor: withAlpha(colors.primary, 0.12),
          }}
        />
        <figcaption
          className="pb-[1cqw] text-[2.6cqw] leading-relaxed"
          style={{ color: colors.primary }}
        >
          <p>FIG. A</p>
          <p>{view.label || "Member"}</p>
        </figcaption>
      </figure>

      <p className="mt-[7cqw] font-sans text-[8cqw] leading-[1.05] font-semibold tracking-tight">
        {view.fullName}
      </p>

      <div
        className="mt-[8cqw] grid grid-cols-2 gap-[4cqw] border-t pt-[4cqw]"
        style={{ borderColor: bold }}
      >
        <Field label="Role" value={view.title} />
        <Field label="Tier" value={view.membership} />
        <Field label="Serial" value={view.memberId} className="col-span-2" />
      </div>
    </div>
  );
}
