"use client";

import { Upload } from "lucide-react";
import { type DragEvent, useState } from "react";

import { FONT_ACCEPT } from "@/lib/fonts/upload";

import styles from "./font-dropzone.module.css";

type FontDropzoneProps = {
  busy: boolean;
  onFile: (file: File) => void;
};

/** Click to browse or drop a font file. */
export function FontDropzone({ busy, onFile }: FontDropzoneProps) {
  const [dragging, setDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) onFile(file);
  }

  return (
    <label
      data-dragging={dragging || undefined}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={styles.zone}
    >
      <input
        type="file"
        accept={FONT_ACCEPT}
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onFile(file);
        }}
        className="sr-only"
      />
      <Upload aria-hidden size={16} className={styles.icon} />
      <span className={styles.text}>
        <span className={styles.title}>
          {busy ? "Adding font…" : "Upload a font"}
        </span>
        <span className={styles.hint}>
          Drop a .woff2, .woff, .ttf, or .otf file up to 2 MB
        </span>
      </span>
    </label>
  );
}
