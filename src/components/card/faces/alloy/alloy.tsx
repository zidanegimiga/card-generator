import type { CardView } from "@/lib/card/card-view";

import { BrandMark } from "../../brand-mark";
import { Portrait } from "../../portrait";
import { QrCode } from "../../qr-code";
import styles from "./alloy.module.css";

/** Brushed metal: horizontal grain, a raking sheen, engraved type, and a contact chip. */
export function AlloyFace({ view }: { view: CardView }) {
  return (
    <div className={styles.face}>
      <div aria-hidden className={styles.grain} />

      <header className={styles.header}>
        <BrandMark view={view} />
        <span className={styles.label}>{view.label || "Member"}</span>
      </header>

      <div className={styles.row}>
        <div aria-hidden className={styles.chip}>
          <span />
          <span />
          <span />
        </div>
        <Portrait view={view} className={styles.portrait} />
      </div>

      <div className={styles.identity}>
        {view.membership && <p className={styles.tier}>{view.membership}</p>}
        <p className={styles.name}>{view.fullName}</p>
        {view.title && <p className={styles.title}>{view.title}</p>}
      </div>

      <footer className={styles.footer}>
        <div className={styles.numbers}>
          <span>{view.memberId}</span>
          <span>Since {view.since}</span>
        </div>
        {view.qrValue && (
          <QrCode
            value={view.qrValue}
            tones={[view.colors.metalDark, view.colors.metalLight]}
            className={styles.qr}
          />
        )}
      </footer>
    </div>
  );
}
