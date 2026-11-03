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
    <div className="flex flex-col gap-5">
      <dl className="divide-y divide-border border-y border-border text-sm">
        {[
          ["Style", CARD_STYLE_META[config.style].label],
          ["Font", font],
          ["QR code", qrValue ?? "Off (add a website or QR link)"],
          ["Size", `${EXPORT_SIZE.width} × ${EXPORT_SIZE.height} px`],
        ].map(([term, detail]) => (
          <div key={term} className="flex justify-between gap-4 py-2.5">
            <dt className="text-muted">{term}</dt>
            <dd className="truncate text-right">{detail}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={handleExport}
        disabled={status.type === "rendering"}
        className="flex h-10 items-center justify-center gap-2 rounded-md bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status.type === "rendering" ? (
          <LoaderCircle aria-hidden className="size-4 animate-spin" />
        ) : (
          <Download aria-hidden className="size-4" />
        )}
        {status.type === "rendering" ? "Rendering…" : "Download PNG"}
      </button>

      <p role="status" className="min-h-4 text-xs text-muted">
        {status.type === "done" && (
          <span className="flex items-center gap-1.5">
            <Check aria-hidden className="size-3.5 text-emerald-400" />
            Saved {status.fileName}
          </span>
        )}
        {status.type === "error" && (
          <span className="text-red-400">
            The image couldn&apos;t be created. Try again.
          </span>
        )}
      </p>

      {/* A full-size copy laid out off screen, so the PNG never depends on the preview's size. */}
      <div
        ref={exportRef}
        aria-hidden
        className="pointer-events-none fixed top-0 -left-[10000px]"
        style={{ width: EXPORT_SIZE.width }}
      >
        <IdCard config={config} className="w-full" decorative />
      </div>
    </div>
  );
}
