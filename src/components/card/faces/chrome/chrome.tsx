import type { CardView } from "@/lib/card/card-view";

import { BrandMark } from "../../brand-mark";
import { Portrait } from "../../portrait";
import { QrCode } from "../../qr-code";
import styles from "./chrome.module.css";

/** Polished chrome: a mirrored horizon, a stamped monogram, and a dark plate for details. */
export function ChromeFace({ view }: { view: CardView }) {
  return (
    <div className={styles.face}>
      <div aria-hidden className={styles.sheen} />

      <header className={styles.header}>
        <BrandMark view={view} />
        {view.label && <span className={styles.label}>{view.label}</span>}
      </header>

      <Portrait view={view} className={styles.monogram} />

      <footer className={styles.plate}>
        <div className={styles.who}>
          <p className={styles.name}>{view.fullName}</p>
          {view.title && <p className={styles.title}>{view.title}</p>}
          <p className={styles.id}>
            <span>{view.memberId}</span>
            <span>{view.since}</span>
          </p>
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
