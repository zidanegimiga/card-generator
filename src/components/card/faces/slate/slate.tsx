import type { CardView } from "@/lib/card/card-view";

import { BrandMark } from "../../brand-mark";
import { Portrait } from "../../portrait";
import { QrCode } from "../../qr-code";
import styles from "./slate.module.css";

export function SlateFace({ view }: { view: CardView }) {
  return (
    <div className={styles.face}>
      <header className={styles.header}>
        <BrandMark view={view} />
        {view.label && <span className={styles.label}>{view.label}</span>}
      </header>

      <div className={styles.media}>
        <Portrait view={view} className={styles.portrait} />
        {view.qrValue && (
          <QrCode
            value={view.qrValue}
            tones={[view.colors.text, view.colors.background]}
            className={styles.qr}
          />
        )}
      </div>

      <div className={styles.identity}>
        {view.membership && <p className={styles.caption}>{view.membership}</p>}
        <p className={styles.name}>{view.fullName}</p>
        {view.title && <p className={styles.title}>{view.title}</p>}
      </div>

      <footer className={styles.footer}>
        <span>{view.memberId}</span>
        <span>{view.since}</span>
      </footer>
    </div>
  );
}
