"use client";

import { Check, Download, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";

import { IdCard } from "@/components/card/id-card";
import { toCardView } from "@/lib/card/card-view";
import type { CardConfig } from "@/lib/card/schema";
import { CARD_STYLE_META } from "@/lib/card/styles";
import { cardFileName } from "@/lib/export/filename";
import {
  type CardRenderer,
  type Downloader,
  downloadBlob,
  EXPORT_SIZE,
  renderCardPng,
} from "@/lib/export/render-png";

import styles from "./export-panel.module.css";

type ExportPanelProps = {
  config: CardConfig;
  render?: CardRenderer;
  download?: Downloader;
};

type Status =
  | { type: "idle" }
  | { type: "rendering" }
  | { type: "done"; fileName: string }
  | { type: "error" };

export function ExportPanel({
  config,
  render = renderCardPng,
  download = downloadBlob,
}: ExportPanelProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const fileName = cardFileName(config);
  const { qrValue } = toCardView(config);

  async function handleExport() {
    const node = exportRef.current?.querySelector("article");
    if (!node) return;
    setStatus({ type: "rendering" });
    try {
      download(await render(node), fileName);
      setStatus({ type: "done", fileName });
    } catch {
      setStatus({ type: "error" });
    }
  }

  const font =
    config.font.kind === "custom"
      ? `${config.font.family} (uploaded)`
      : config.font.family;

  return (
    <div className={styles.panel}>
      <dl className={styles.summary}>
        {[
          ["Style", CARD_STYLE_META[config.style].label],
          ["Font", font],
          ["QR code", qrValue ?? "Off (add a website or QR link)"],
          ["Size", `${EXPORT_SIZE.width} × ${EXPORT_SIZE.height} px`],
        ].map(([term, detail]) => (
          <div key={term} className={styles.row}>
            <dt className={styles.term}>{term}</dt>
            <dd className={styles.detail}>{detail}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={handleExport}
        disabled={status.type === "rendering"}
        className={styles.download}
      >
        {status.type === "rendering" ? (
          <LoaderCircle aria-hidden size={16} className={styles.spinner} />
        ) : (
          <Download aria-hidden size={16} />
        )}
        {status.type === "rendering" ? "Rendering…" : "Download PNG"}
      </button>

      <p role="status" className={styles.status}>
        {status.type === "done" && (
          <span className={styles.saved}>
            <Check aria-hidden size={14} className={styles.check} />
            Saved {status.fileName}
          </span>
        )}
        {status.type === "error" && (
          <span className={styles.error}>
            The image couldn&apos;t be created. Try again.
          </span>
        )}
      </p>

      {/* A full-size copy laid out off screen, so the PNG never depends on the preview's size. */}
      <div
        ref={exportRef}
        aria-hidden
        className={styles.offscreen}
        style={{ width: EXPORT_SIZE.width }}
      >
        <IdCard config={config} decorative />
      </div>
    </div>
  );
}
