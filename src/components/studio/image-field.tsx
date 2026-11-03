"use client";

import { ImageUp, Trash2 } from "lucide-react";
import { useState } from "react";

import { IMAGE_ACCEPT, readImageFile } from "@/lib/images/read-image";

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
    <div className="flex flex-col gap-1.5">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-surface-raised">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URLs can't use next/image
            <img
              src={value}
              alt={alt}
              className={
                fit === "cover"
                  ? "size-full object-cover"
                  : "size-full object-contain p-1.5"
              }
            />
          ) : (
            <ImageUp aria-hidden className="size-4 text-muted" />
          )}
        </div>
        <label className="cursor-pointer text-sm underline decoration-border underline-offset-4 hover:decoration-foreground has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent">
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
            className="grid size-8 place-items-center rounded-md text-muted hover:text-red-400"
          >
            <Trash2 aria-hidden className="size-4" />
          </button>
        )}
      </div>
      {error ? (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted">
          PNG, JPEG, WebP, or SVG up to 1 MB.
        </p>
      )}
    </div>
  );
}
