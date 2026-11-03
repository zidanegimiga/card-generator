"use client";

/* eslint-disable @next/next/no-img-element -- previews are data URLs, which next/image can't optimise */
import { ImageUp, Trash2 } from "lucide-react";
import { useState } from "react";

import { IMAGE_ACCEPT, readImageFile } from "@/lib/images/read-image";

import styles from "./image-field.module.css";

type ImageFieldProps = {
  /** Visible label and the noun used in button text, e.g. "Logo" or "Photo". */
  label: string;
  /** Alt text for the preview. */
  alt: string;
  value?: string;
  /** How the preview fills its box: logos fit, photos cover. */
  fit?: "contain" | "cover";
  onChange: (dataUrl: string | undefined) => void;
};

/** Upload, preview, replace, and remove a single image. Used for logos and photos. */
export function ImageField({
  label,
  alt,
  value,
  fit = "contain",
  onChange,
}: ImageFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const noun = label.toLowerCase();

  async function handleFile(file: File) {
    const result = await readImageFile(file);
    if (result.ok) {
      setError(null);
      onChange(result.dataUrl);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.row}>
        <div className={styles.preview}>
          {value ? (
            <img src={value} alt={alt} className={styles[fit]} />
          ) : (
            <ImageUp aria-hidden size={16} className={styles.placeholder} />
          )}
        </div>
        <label className={styles.upload}>
          {value ? `Replace ${noun}` : `Upload ${noun}`}
          <input
            type="file"
            accept={IMAGE_ACCEPT}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void handleFile(file);
            }}
          />
        </label>
        {value && (
          <button
            type="button"
            aria-label={`Remove ${noun}`}
            onClick={() => onChange(undefined)}
            className={styles.remove}
          >
            <Trash2 aria-hidden size={16} />
          </button>
        )}
      </div>
      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : (
        <p className={styles.hint}>PNG, JPEG, WebP, or SVG up to 1 MB.</p>
      )}
    </div>
  );
}
