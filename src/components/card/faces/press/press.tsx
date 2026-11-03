import type { CardView } from "@/lib/card/card-view";

import { BrandMark } from "../../brand-mark";
import { Portrait } from "../../portrait";
import { QrCode } from "../../qr-code";
import styles from "./press.module.css";

/** Letterpress on heavy paper: a blind-debossed monogram and inked type. */
export function PressFace({ view }: { view: CardView }) {
  return (
    <div className={styles.face}>
      <div aria-hidden className={styles.fibres} />

      <div className={styles.sheet}>
        <BrandMark view={view} className={styles.brand} />

        <Portrait view={view} className={styles.monogram} />

        <div className={styles.identity}>
          <p className={styles.name}>{view.fullName}</p>
          {view.title && <p className={styles.title}>{view.title}</p>}
          {view.membership && <p className={styles.tier}>{view.membership}</p>}
        </div>

        <footer className={styles.footer}>
          <span>{view.memberId}</span>
          {view.qrValue && (
            <QrCode
              value={view.qrValue}
              tones={[view.colors.text, "#f3eee4"]}
              className={styles.qr}
            />
          )}
          <span>{view.label || view.since}</span>
        </footer>
      </div>
    </div>
  );
}
