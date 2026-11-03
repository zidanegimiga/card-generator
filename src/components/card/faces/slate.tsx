import type { CardView } from "@/lib/card/card-view";
import { withAlpha } from "@/lib/color/alpha";

import { QrCode } from "../qr-code";
import { BrandMark, Portrait } from "../parts";

export function SlateFace({ view }: { view: CardView }) {
  const { colors } = view;

  return (
    <div
      className="relative flex size-full flex-col p-[8cqw]"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <header className="flex items-center justify-between gap-[3cqw]">
        <BrandMark view={view} className="min-w-0" />
        {view.label && (
          <span className="shrink-0 text-[2.8cqw] tracking-[0.2em] uppercase opacity-60">
            {view.label}
          </span>
        )}
      </header>

      <div className="mt-auto flex items-end justify-between">
        <Portrait
          view={view}
          className="size-[24cqw] rounded-[4cqw] text-[24cqw]"
          style={{
            backgroundColor: colors.primary,
            color: colors.background,
          }}
        />
        {view.qrValue && (
          <QrCode
            value={view.qrValue}
            tones={[colors.text, colors.background]}
            className="size-[22cqw] rounded-[2cqw]"
          />
        )}
      </div>

      <div className="mt-[6cqw]">
        {view.membership && (
          <p className="text-[2.8cqw] tracking-[0.22em] uppercase opacity-60">
            {view.membership}
          </p>
        )}
        <p className="mt-[1.5cqw] text-[8.5cqw] leading-[1.05] font-semibold tracking-tight">
          {view.fullName}
        </p>
        {view.title && (
          <p className="mt-[1cqw] text-[3.8cqw] opacity-70">{view.title}</p>
        )}
      </div>

      <footer
        className="mt-[6cqw] flex justify-between border-t pt-[3.5cqw] font-mono text-[3cqw] opacity-70"
        style={{ borderColor: withAlpha(colors.text, 0.14) }}
      >
        <span>{view.memberId}</span>
        <span>{view.since}</span>
      </footer>
    </div>
  );
}
