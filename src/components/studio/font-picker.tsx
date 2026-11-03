"use client";

import { Trash2, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type DragEvent, useId, useState } from "react";

import type { CustomFonts } from "@/hooks/use-custom-fonts";
import { DEFAULT_CARD_CONFIG } from "@/lib/card/defaults";
import type { FontSource } from "@/lib/card/schema";
import { cssFontFamily, GOOGLE_FONTS } from "@/lib/fonts/catalog";
import { FONT_ACCEPT } from "@/lib/fonts/upload";

type FontPickerProps = {
  value: FontSource;
  onChange: (font: FontSource) => void;
  customFonts: CustomFonts;
};

function fontKey(font: FontSource): string {
  return font.kind === "custom" ? `custom:${font.id}` : `google:${font.family}`;
}

export function FontPicker({ value, onChange, customFonts }: FontPickerProps) {
  const groupName = useId();
  const selectedKey = fontKey(value);
  const [status, setStatus] = useState<
    { type: "idle" } | { type: "busy" } | { type: "error"; message: string }
  >({ type: "idle" });

  async function handleFile(file: File) {
    setStatus({ type: "busy" });
    const result = await customFonts.add(file);
    if (result.ok) {
      setStatus({ type: "idle" });
      onChange(result.font);
    } else {
      setStatus({ type: "error", message: result.error });
    }
  }

  async function handleRemove(id: string) {
    if (value.kind === "custom" && value.id === id) {
      onChange(DEFAULT_CARD_CONFIG.font);
    }
    await customFonts.remove(id);
  }

  return (
    <fieldset className="flex min-w-0 flex-col gap-6">
      <legend className="sr-only">Card font</legend>

      <section
        aria-labelledby={`${groupName}-yours`}
        className="flex flex-col gap-3"
      >
        <h3 id={`${groupName}-yours`} className="text-sm">
          Your fonts
        </h3>

        <FontDropzone busy={status.type === "busy"} onFile={handleFile} />

        {status.type === "error" && (
          <p role="alert" className="text-xs text-red-400">
            {status.message}
          </p>
        )}

        <ul className="flex flex-col gap-1">
          <AnimatePresence initial={false}>
            {customFonts.fonts.map((font) => (
              <motion.li
                key={font.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-1"
              >
                <FontOption
                  name={groupName}
                  font={font}
                  label={font.family}
                  detail={font.fileName}
                  checked={selectedKey === fontKey(font)}
                  onSelect={onChange}
                />
                <button
                  type="button"
                  aria-label={`Remove ${font.family}`}
                  onClick={() => handleRemove(font.id)}
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface-raised hover:text-red-400"
                >
                  <Trash2 aria-hidden className="size-4" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </section>

      <section
        aria-labelledby={`${groupName}-google`}
        className="flex flex-col gap-3"
      >
        <h3 id={`${groupName}-google`} className="text-sm">
          Google Fonts
        </h3>
        <ul className="flex flex-col gap-1">
          {GOOGLE_FONTS.map((entry) => {
            const font: FontSource = { kind: "google", family: entry.family };
            return (
              <li key={entry.family}>
                <FontOption
                  name={groupName}
                  font={font}
                  label={entry.family}
                  detail={entry.category}
                  checked={selectedKey === fontKey(font)}
                  onSelect={onChange}
                />
              </li>
            );
          })}
        </ul>
      </section>
    </fieldset>
  );
}

type FontOptionProps = {
  name: string;
  font: FontSource;
  label: string;
  detail: string;
  checked: boolean;
  onSelect: (font: FontSource) => void;
};

function FontOption({
  name,
  font,
  label,
  detail,
  checked,
  onSelect,
}: FontOptionProps) {
  return (
    <label className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2 hover:bg-surface-raised has-checked:border-accent/60 has-checked:bg-surface-raised has-focus-visible:ring-2 has-focus-visible:ring-accent">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={() => onSelect(font)}
        className="sr-only"
      />
      <span
        className="truncate text-base"
        style={{ fontFamily: cssFontFamily(font) }}
      >
        {label}
      </span>
      <span className="truncate font-mono text-[11px] text-muted">
        {detail}
      </span>
    </label>
  );
}

type FontDropzoneProps = {
  busy: boolean;
  onFile: (file: File) => void;
};

function FontDropzone({ busy, onFile }: FontDropzoneProps) {
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
      className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-border px-4 py-5 text-center transition-colors hover:border-muted has-focus-visible:ring-2 has-focus-visible:ring-accent data-dragging:border-accent data-dragging:bg-accent/5"
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
      <Upload aria-hidden className="size-4 text-muted" />
      <span className="text-sm">{busy ? "Adding font…" : "Upload a font"}</span>
      <span className="text-xs text-muted">
        Drop a .woff2, .woff, .ttf, or .otf file up to 2 MB
      </span>
    </label>
  );
}
