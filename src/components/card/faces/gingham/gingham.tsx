import type { CardView } from "@/lib/card/card-view";

import { BrandMark } from "../../brand-mark";
import { Portrait } from "../../portrait";
import { QrCode } from "../../qr-code";
import styles from "./gingham.module.css";

/** A woven check band over cream stock, with a rubber-stamp year. */
export function GinghamFace({ view }: { view: CardView }) {
  return (
    <div className={styles.face}>
      <div aria-hidden className={styles.check} />
      {view.label && <span className={styles.tag}>{view.label}</span>}

      <Portrait view={view} className={styles.portrait} />

      <div className={styles.stamp}>
        <span>Since</span>
        <strong>{view.since}</strong>
      </div>

      <div className={styles.body}>
        {view.membership && <p className={styles.tier}>{view.membership}</p>}
        <p className={styles.name}>{view.fullName}</p>
        {view.title && <p className={styles.title}>{view.title}</p>}
      </div>

      <footer className={styles.footer}>
        <div className={styles.brand}>
          <BrandMark view={view} />
          <span className={styles.id}>{view.memberId}</span>
        </div>
        {view.qrValue && (
          <QrCode
            value={view.qrValue}
            tones={[view.colors.primary, "#fbf8f2"]}
            className={styles.qr}
          />
        )}
      </footer>
    </div>
  );
}
