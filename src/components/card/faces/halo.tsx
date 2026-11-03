import type { CardView } from "@/lib/card/card-view";
import { withAlpha } from "@/lib/color/alpha";

import { QrCode } from "../qr-code";
import { BrandMark, Portrait } from "../parts";

export function HaloFace({ view }: { view: CardView }) {
  const { colors } = view;

  return (
    <div
      className="relative flex size-full p-[5cqw]"
      style={{
        color: colors.text,
        // Gradients instead of CSS blur filters, so the PNG export matches the preview.
        backgroundColor: colors.background,
        backgroundImage: [
          `radial-gradient(circle at 20% 15%, ${withAlpha(colors.primary, 0.85)}, transparent 55%)`,
          `radial-gradient(circle at 85% 80%, ${withAlpha(colors.secondary, 0.7)}, transparent 50%)`,
        ].join(", "),
      }}
    >
      <div
        className="relative flex flex-1 flex-col items-center rounded-[5cqw] border px-[6cqw] pt-[9cqw] pb-[6cqw] text-center backdrop-blur-md"
        style={{
          backgroundColor: withAlpha(colors.background, 0.55),
          borderColor: withAlpha(colors.text, 0.14),
        }}
      >
        {view.qrValue && (
          <QrCode
            value={view.qrValue}
            tones={[colors.text, colors.background]}
            className="absolute top-[4cqw] right-[4cqw] size-[13cqw] rounded-[1.5cqw]"
          />
        )}
        {view.label && (
          <span className="mb-[4cqw] text-[2.8cqw] tracking-[0.22em] uppercase opacity-70">
            {view.label}
          </span>
        )}

        <Portrait
          view={view}
          className="size-[34cqw] rounded-full text-[34cqw]"
          style={{
            backgroundColor: withAlpha(colors.text, 0.08),
            boxShadow: `0 0 0 1.2cqw ${withAlpha(colors.primary, 0.45)}`,
          }}
        />

        <p className="mt-[8cqw] text-[8cqw] leading-[1.05] font-semibold tracking-tight">
          {view.fullName}
        </p>
        {view.title && (
          <p className="mt-[1.5cqw] text-[3.8cqw] opacity-75">{view.title}</p>
        )}
        {view.membership && (
          <span
            className="mt-[4cqw] rounded-full px-[3.5cqw] py-[1.2cqw] text-[2.8cqw] tracking-[0.16em] uppercase"
            style={{ backgroundColor: withAlpha(colors.primary, 0.3) }}
          >
            {view.membership}
          </span>
        )}

        <div className="mt-auto flex w-full items-end justify-between gap-[3cqw]">
          <BrandMark view={view} className="min-w-0" />
          <div className="shrink-0 text-right font-mono text-[2.8cqw] leading-relaxed opacity-70">
            <p>{view.memberId}</p>
            <p>Since {view.since}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
