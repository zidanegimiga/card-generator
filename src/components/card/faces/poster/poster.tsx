import type { CardView } from "@/lib/card/card-view";

import { BrandMark } from "../../brand-mark";
import { Portrait } from "../../portrait";
import { QrCode } from "../../qr-code";
import styles from "./poster.module.css";

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
  const words = view.fullName.split(/\s+/).filter(Boolean);

  return (
    <div className={styles.face}>
      <section className={styles.block}>
        <div className={styles.meta}>
          <span>{view.membership}</span>
          <span>{view.label || view.since}</span>
        </div>
        {/* One text node, one word per line: reads as "Ada Lovelace" to assistive tech. */}
        <p
          className={styles.name}
          style={{ fontSize: `${posterTypeSize(view.fullName)}cqw` }}
        >
          {words.join("\n")}
        </p>
      </section>

      <Portrait view={view} className={styles.portrait} />

      <div className={styles.details}>
        <div className={styles.who}>
          {view.title && <p className={styles.title}>{view.title}</p>}
          <p className={styles.id}>{view.memberId}</p>
        </div>
        <div className={styles.footer}>
          <BrandMark view={view} />
          {view.qrValue && (
            <QrCode
              value={view.qrValue}
              tones={[view.colors.text, view.colors.background]}
              className={styles.qr}
            />
          )}
        </div>
      </div>
    </div>
  );
}
