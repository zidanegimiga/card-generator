import type { CardView } from "@/lib/card/card-view";

import { BrandMark, Portrait } from "../parts";
import { QrCode } from "../qr-code";

/**
 * Picks a type size (in cqw) so the longest word of the name fills the block
 * without overflowing. Wide names get smaller, short names get huge.
 */
export function posterTypeSize(name: string): number {
  const longest = Math.max(1, ...name.split(/\s+/).map((word) => word.length));
  // A bold sans averages ~0.62em per glyph; 84cqw is the usable line width.
  // The floor of 6 still fits a 22 character word, the longest a name can be.
  return Math.min(26, Math.max(6, 84 / (longest * 0.62)));
}

export function PosterFace({ view }: { view: CardView }) {
  const { colors } = view;
  const words = view.fullName.split(/\s+/).filter(Boolean);

  return (
    <div
      className="relative flex size-full flex-col"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <section
        className="relative flex h-[64%] flex-col justify-between overflow-hidden px-[7cqw] pt-[7cqw] pb-[6cqw]"
        style={{ backgroundColor: colors.primary, color: colors.background }}
      >
        <div className="flex items-start justify-between text-[2.8cqw] font-medium tracking-[0.18em] uppercase">
          <span>{view.membership}</span>
          <span>{view.label || view.since}</span>
        </div>

        {/* One text node, one word per line: reads as "Ada Lovelace" to assistive tech. */}
        <p
          className="leading-[0.86] font-bold tracking-[-0.04em] whitespace-pre-line uppercase"
          style={{ fontSize: `${posterTypeSize(view.fullName)}cqw` }}
        >
          {words.join("\n")}
        </p>
      </section>

      <Portrait
        view={view}
        className="absolute top-[52%] right-[7cqw] h-[34cqw] w-[27cqw] border-[1.2cqw] text-[27cqw]"
        style={{
          borderColor: colors.background,
          backgroundColor: colors.secondary,
          color: colors.background,
        }}
      />

      <div className="flex flex-1 flex-col justify-between px-[7cqw] pt-[5cqw] pb-[7cqw]">
        <div className="max-w-[52%]">
          {view.title && (
            <p className="text-[4.2cqw] font-medium">{view.title}</p>
          )}
          <p className="mt-[1cqw] font-mono text-[3cqw] opacity-60">
            {view.memberId}
          </p>
        </div>

        <div className="flex items-end justify-between gap-[3cqw]">
          <BrandMark view={view} className="min-w-0" />
          {view.qrValue && (
            <QrCode
              value={view.qrValue}
              tones={[colors.text, colors.background]}
              className="size-[15cqw]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
