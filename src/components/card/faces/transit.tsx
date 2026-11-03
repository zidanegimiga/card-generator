import { barcodeBars, type CardView } from "@/lib/card/card-view";
import { withAlpha } from "@/lib/color/alpha";

import { BrandMark, Field, Portrait } from "../parts";

/** Where the tear line sits, as a share of the card's height. */
const TEAR = "74%";

export function TransitFace({ view }: { view: CardView }) {
  const { colors } = view;
  const notch = `radial-gradient(circle 3.5cqw at %X ${TEAR}, transparent 98%, #000 100%)`;

  return (
    <div
      className="relative flex size-full flex-col"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        // Two notches cut into the card edges at the tear line.
        maskImage: [notch.replace("%X", "0"), notch.replace("%X", "100%")].join(
          ", ",
        ),
        maskComposite: "intersect",
      }}
    >
      <header
        className="flex h-[36%] flex-col justify-between p-[7cqw]"
        style={{ backgroundColor: colors.primary, color: colors.background }}
      >
        <div className="flex items-center justify-between gap-[3cqw]">
          <BrandMark
            view={view}
            color={colors.background}
            tileColor={colors.background}
            className="min-w-0"
          />
          <span className="shrink-0 font-mono text-[3cqw]">{view.since}</span>
        </div>
        <div>
          <p className="text-[2.6cqw] tracking-[0.2em] uppercase opacity-70">
            {view.label || "Boarding pass"}
          </p>
          <p className="mt-[1.5cqw] text-[8.5cqw] leading-[1.05] font-semibold tracking-tight">
            {view.fullName}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-x-[5cqw] gap-y-[5cqw] px-[7cqw] pt-[7cqw]">
        <Field label="Title" value={view.title} />
        <Field label="Class" value={view.membership} />
        <Field label="Member since" value={view.since} />
        <Field label="Gate" value={view.domain ?? ""} />
      </div>

      <div
        aria-hidden
        className="absolute inset-x-[5cqw] border-t-[0.5cqw] border-dashed"
        style={{ top: TEAR, borderColor: withAlpha(colors.text, 0.25) }}
      />

      <footer className="mt-auto flex h-[26%] items-center gap-[5cqw] px-[7cqw]">
        <div className="min-w-0 flex-1">
          <div
            data-testid="barcode"
            aria-hidden
            className="flex h-[12cqw] items-stretch"
          >
            {barcodeBars(view.memberId).map((bar, index) => (
              <span
                key={index}
                style={{
                  width: `${bar.width * 0.9}cqw`,
                  marginRight: `${bar.gap * 0.9}cqw`,
                  backgroundColor: colors.text,
                }}
              />
            ))}
          </div>
          <p className="mt-[2cqw] font-mono text-[3cqw] opacity-75">
            {view.memberId}
          </p>
        </div>
        <Portrait
          view={view}
          className="size-[18cqw] rounded-[2.5cqw] text-[18cqw]"
          style={{
            backgroundColor: colors.secondary,
            color: colors.background,
          }}
        />
      </footer>
    </div>
  );
}
