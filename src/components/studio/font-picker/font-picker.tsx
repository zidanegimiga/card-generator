"use client";

import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";

import type { CustomFonts } from "@/hooks/use-custom-fonts";
import { DEFAULT_CARD_CONFIG } from "@/lib/card/defaults";
import type { FontSource } from "@/lib/card/schema";
import { GOOGLE_FONTS } from "@/lib/fonts/catalog";

import { FontDropzone } from "../font-dropzone";
import { FontOption } from "../font-option";
import styles from "./font-picker.module.css";

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
    <fieldset className={styles.picker}>
      <legend className="sr-only">Card font</legend>

      <section
        aria-labelledby={`${groupName}-yours`}
        className={styles.section}
      >
        <h3 id={`${groupName}-yours`} className={styles.heading}>
          Your fonts
        </h3>

        <FontDropzone busy={status.type === "busy"} onFile={handleFile} />

        {status.type === "error" && (
          <p role="alert" className={styles.error}>
            {status.message}
          </p>
        )}

        <ul className={styles.list}>
          <AnimatePresence initial={false}>
            {customFonts.fonts.map((font) => (
              <motion.li
                key={font.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={styles.upload}
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
                  className={styles.remove}
                >
                  <Trash2 aria-hidden size={16} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </section>

      <section
        aria-labelledby={`${groupName}-google`}
        className={styles.section}
      >
        <h3 id={`${groupName}-google`} className={styles.heading}>
          Google Fonts
        </h3>
        <ul className={styles.list}>
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
