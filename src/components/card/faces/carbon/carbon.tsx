import type { CardView } from "@/lib/card/card-view";

import { BrandMark } from "../../brand-mark";
import { Portrait } from "../../portrait";
import { QrCode } from "../../qr-code";
import styles from "./carbon.module.css";

/** Carbon fibre weave with a spec-sheet table of the member's details. */
export function CarbonFace({ view }: { view: CardView }) {
  const rows = [
    ["Role", view.title],
    ["Tier", view.membership],
    ["Since", String(view.since)],
    ["Serial", view.memberId],
  ].filter(([, value]) => value !== "");

  return (
    <div className={styles.face}>
      <div aria-hidden className={styles.tint} />

      <header className={styles.header}>
        <BrandMark view={view} />
        <span className={styles.label}>{view.label || "Spec"}</span>
      </header>

      <div className={styles.hero}>
        <Portrait view={view} className={styles.portrait} />
        <p className={styles.name}>{view.fullName}</p>
      </div>

      <dl className={styles.specs}>
        {rows.map(([term, value]) => (
          <div key={term} className={styles.row}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {view.qrValue && (
        <QrCode
          value={view.qrValue}
          tones={["#141414", "#e9e9e9"]}
          className={styles.qr}
        />
      )}
    </div>
  );
}
