import { barcodeBars, type CardView } from "@/lib/card/card-view";

import { BrandMark } from "../../brand-mark";
import { CardField } from "../../card-field";
import { Portrait } from "../../portrait";
import { QrCode } from "../../qr-code";
import styles from "./transit.module.css";

export function TransitFace({ view }: { view: CardView }) {
  return (
    <div className={styles.face}>
      <header className={styles.band}>
        <div className={styles.bandTop}>
          <BrandMark
            view={view}
            color={view.colors.background}
            tileColor={view.colors.background}
          />
          <span className={styles.year}>{view.since}</span>
        </div>
        <div>
          <p className={styles.kicker}>{view.label || "Boarding pass"}</p>
          <p className={styles.name}>{view.fullName}</p>
        </div>
      </header>

      <div className={styles.fields}>
        <CardField label="Title" value={view.title} />
        <CardField label="Class" value={view.membership} />
        <CardField label="Member since" value={view.since} />
        <CardField label="Gate" value={view.domain ?? ""} />
      </div>

      <div aria-hidden className={styles.tear} />

      <footer className={styles.stub}>
        <div className={styles.code}>
          <div data-testid="barcode" aria-hidden className={styles.barcode}>
            {barcodeBars(view.memberId).map((bar, index) => (
              <span
                key={index}
                className={styles.bar}
                style={{
                  width: `${bar.width * 0.9}cqw`,
                  marginRight: `${bar.gap * 0.9}cqw`,
                }}
              />
            ))}
          </div>
          <p className={styles.id}>{view.memberId}</p>
        </div>
        {view.qrValue && (
          <QrCode
            value={view.qrValue}
            tones={[view.colors.text, view.colors.background]}
            className={styles.qr}
          />
        )}
        <Portrait view={view} className={styles.portrait} />
      </footer>
    </div>
  );
}
