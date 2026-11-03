import { vi } from "vitest";

import type { CustomFontsDeps } from "@/hooks/use-custom-fonts";
import { createMemoryFontStore, type StoredFont } from "@/lib/fonts/font-store";
import type { FontRegistrar } from "@/lib/fonts/registrar";

/** A registrar that records families instead of touching `document.fonts`. */
export function createFakeRegistrar() {
  const registered = new Set<string>();
  const registrar = {
    register: vi.fn<FontRegistrar["register"]>(async (family) => {
      registered.add(family);
    }),
    unregister: vi.fn<FontRegistrar["unregister"]>((family) => {
      registered.delete(family);
    }),
  } satisfies FontRegistrar;
  return { registrar, registered };
}

/** Test dependencies for `useCustomFonts` with predictable ids and times. */
export function createFontDeps(initial: StoredFont[] = []) {
  const store = createMemoryFontStore(initial);
  const { registrar, registered } = createFakeRegistrar();
  let nextId = 1;
  const deps: CustomFontsDeps = {
    store,
    registrar,
    createId: () => `font-${nextId++}`,
    now: () => 1_000,
  };
  return { deps, store, registrar, registered };
}
