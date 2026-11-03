import type { CardView } from "@/lib/card/card-view";
import { mrzLines } from "@/lib/card/mrz";

import { BrandMark } from "../../brand-mark";
import { CardField } from "../../card-field";
import { Portrait } from "../../portrait";
import { QrCode } from "../../qr-code";
import styles from "./foil.module.css";

/** A laminated ID: holographic film, guilloche security lines, and an MRZ strip. */
export function FoilFace({ view }: { view: CardView }) {
  const [line1, line2] = mrzLines(view);

  return (
    <div className={styles.face}>
      <div aria-hidden className={styles.guilloche} />
      <div aria-hidden className={styles.holo} />

      <header className={styles.header}>
        <BrandMark view={view} />
        <span className={styles.doc}>{view.label || "Identity card"}</span>
      </header>

      <div className={styles.body}>
        <Portrait view={view} className={styles.portrait} />
        <div className={styles.fields}>
          <CardField label="Name" value={view.fullName} />
          <CardField label="Title" value={view.title} />
          <CardField label="Membership" value={view.membership} />
          <CardField label="Since" value={view.since} />
        </div>
      </div>

      <div className={styles.numberRow}>
        <p className={styles.number}>{view.memberId}</p>
        {view.qrValue && (
          <QrCode
            value={view.qrValue}
            tones={[view.colors.metalDark, "#ffffff"]}
            className={styles.qr}
          />
        )}
      </div>

      <div className={styles.mrz} aria-label="Machine readable zone">
        <p>{line1}</p>
        <p>{line2}</p>
      </div>
    </div>
  );
}
