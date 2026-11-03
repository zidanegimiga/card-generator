import type { CardView } from "@/lib/card/card-view";

import { BrandMark } from "../../brand-mark";
import { CardField } from "../../card-field";
import { Portrait } from "../../portrait";
import { QrCode } from "../../qr-code";
import styles from "./blueprint.module.css";

const CORNERS = ["topLeft", "topRight", "bottomLeft", "bottomRight"] as const;

export function BlueprintFace({ view }: { view: CardView }) {
  return (
    <div className={styles.face}>
      {CORNERS.map((corner) => (
        <span
          key={corner}
          aria-hidden
          className={`${styles.corner} ${styles[corner]}`}
        />
      ))}

      <header className={styles.header}>
        <BrandMark view={view} />
        <span className={styles.rev}>REV {view.since}</span>
      </header>

      <figure className={styles.figure}>
        <Portrait view={view} className={styles.portrait} />
        <figcaption className={styles.caption}>
          <p>FIG. A</p>
          <p>{view.label || "Member"}</p>
        </figcaption>
        {view.qrValue && (
          <QrCode
            value={view.qrValue}
            tones={[view.colors.text, view.colors.background]}
            className={styles.qr}
          />
        )}
      </figure>

      <p className={styles.name}>{view.fullName}</p>

      <div className={styles.specs}>
        <CardField label="Role" value={view.title} />
        <CardField label="Tier" value={view.membership} />
        <CardField
          label="Serial"
          value={view.memberId}
          className={styles.wide}
        />
      </div>
    </div>
  );
}
