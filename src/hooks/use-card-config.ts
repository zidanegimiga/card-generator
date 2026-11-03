"use client";

import { useEffect, useSyncExternalStore } from "react";

import {
  type ConfigStore,
  getDefaultConfigStore,
} from "@/lib/card/config-store";
import type { CardConfig } from "@/lib/card/schema";

/**
 * The card config, saved to localStorage. The server renders defaults and the
 * client switches to the saved card after hydration, with no mismatch.
 */
export function useCardConfig(store: ConfigStore = getDefaultConfigStore()) {
  const config = useSyncExternalStore<CardConfig>(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  // Don't lose the last edit if the tab closes inside the debounce window.
  useEffect(() => {
    const flush = () => store.flush();
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [store]);

  return [config, store.set] as const;
}
