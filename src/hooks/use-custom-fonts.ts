"use client";

import { useCallback, useEffect, useState } from "react";

import type { CustomFontSource } from "@/lib/card/schema";
import { customFontFamily } from "@/lib/fonts/catalog";
import {
  createIndexedDbFontStore,
  type FontStore,
  type StoredFont,
} from "@/lib/fonts/font-store";
import {
  documentFontRegistrar,
  type FontRegistrar,
} from "@/lib/fonts/registrar";
import { validateFontFile } from "@/lib/fonts/upload";

export type CustomFontsDeps = {
  store: FontStore;
  registrar: FontRegistrar;
  createId?: () => string;
  now?: () => number;
};

export type AddFontResult =
  { ok: true; font: CustomFontSource } | { ok: false; error: string };

export type CustomFonts = {
  fonts: CustomFontSource[];
  ready: boolean;
  add: (file: File) => Promise<AddFontResult>;
  remove: (id: string) => Promise<void>;
};

const randomId = () => crypto.randomUUID();

const defaultDeps: CustomFontsDeps = {
  store: createIndexedDbFontStore(),
  registrar: documentFontRegistrar,
};

function toSource({ id, family, fileName }: StoredFont): CustomFontSource {
  return { kind: "custom", id, family, fileName };
}

/** Uploaded fonts: restored from storage on mount, registered with the document. */
export function useCustomFonts(
  deps: CustomFontsDeps = defaultDeps,
): CustomFonts {
  const { store, registrar } = deps;
  const createId = deps.createId ?? randomId;
  const now = deps.now ?? Date.now;

  const [fonts, setFonts] = useState<CustomFontSource[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const restored: CustomFontSource[] = [];
      try {
        for (const stored of await store.list()) {
          try {
            await registrar.register(customFontFamily(stored.id), stored.data);
            restored.push(toSource(stored));
          } catch {
            // A font that no longer loads is skipped rather than breaking the rest.
          }
        }
      } catch {
        // Storage can be unavailable (private mode). Uploads still work for the session.
      }
      if (!cancelled) {
        setFonts(restored);
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [store, registrar]);

  const add = useCallback(
    async (file: File): Promise<AddFontResult> => {
      const validation = await validateFontFile(file);
      if (!validation.ok) return validation;

      const { family, fileName, format, data } = validation.font;
      const id = createId();

      try {
        await registrar.register(customFontFamily(id), data);
      } catch {
        return {
          ok: false,
          error: "That font file looks damaged. Try another.",
        };
      }

      const stored: StoredFont = {
        id,
        family,
        fileName,
        format,
        data,
        addedAt: now(),
      };
      try {
        await store.put(stored);
      } catch {
        // Keep the font for this session even if it can't be saved.
      }

      const font = toSource(stored);
      setFonts((current) => [...current, font]);
      return { ok: true, font };
    },
    [store, registrar, createId, now],
  );

  const remove = useCallback(
    async (id: string) => {
      setFonts((current) => current.filter((font) => font.id !== id));
      registrar.unregister(customFontFamily(id));
      await store.remove(id);
    },
    [store, registrar],
  );

  return { fonts, ready, add, remove };
}
