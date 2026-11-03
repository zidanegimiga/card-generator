import { DEFAULT_CARD_CONFIG } from "./defaults";
import { type CardConfig, parseCardConfig } from "./schema";

export const CONFIG_STORAGE_KEY = "card-generator:config:v1";

export type ConfigUpdate = CardConfig | ((current: CardConfig) => CardConfig);

export interface ConfigStore {
  subscribe(listener: () => void): () => void;
  getSnapshot(): CardConfig;
  getServerSnapshot(): CardConfig;
  set(update: ConfigUpdate): void;
  /** Writes any pending change now instead of waiting for the debounce. */
  flush(): void;
}

type StoreOptions = {
  storage: Pick<Storage, "getItem" | "setItem"> | null;
  key?: string;
  debounceMs?: number;
};

function withoutImages(config: CardConfig): CardConfig {
  return {
    ...config,
    brand: { ...config.brand, logoUrl: undefined },
    member: { ...config.member, photoUrl: undefined },
  };
}

/**
 * Holds the card config in memory and mirrors it to storage. Saved data is
 * validated on load, so a stale or hand-edited entry falls back to defaults
 * instead of crashing the studio.
 */
export function createConfigStore({
  storage,
  key = CONFIG_STORAGE_KEY,
  debounceMs = 300,
}: StoreOptions): ConfigStore {
  let current: CardConfig | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const listeners = new Set<() => void>();

  function load(): CardConfig {
    if (current) return current;
    current = DEFAULT_CARD_CONFIG;
    try {
      const raw = storage?.getItem(key);
      if (raw) {
        const parsed = parseCardConfig(JSON.parse(raw));
        if (parsed.ok) current = parsed.value;
      }
    } catch {
      // Unreadable storage or broken JSON: start fresh.
    }
    return current;
  }

  function write() {
    timer = null;
    if (!storage || !current) return;
    try {
      storage.setItem(key, JSON.stringify(current));
    } catch {
      // Usually a quota error from large images. Keep everything else.
      try {
        storage.setItem(key, JSON.stringify(withoutImages(current)));
      } catch {
        // Storage is unavailable; the card still works for this session.
      }
    }
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: load,
    getServerSnapshot: () => DEFAULT_CARD_CONFIG,
    set(update) {
      const previous = load();
      const next = typeof update === "function" ? update(previous) : update;
      if (next === previous) return;
      current = next;
      listeners.forEach((listener) => listener());
      if (timer) clearTimeout(timer);
      timer = setTimeout(write, debounceMs);
    },
    flush() {
      if (!timer) return;
      clearTimeout(timer);
      write();
    },
  };
}

function browserStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null; // Some privacy modes throw on access.
  }
}

let defaultStore: ConfigStore | null = null;

/** The app-wide store, created on first use so server imports stay safe. */
export function getDefaultConfigStore(): ConfigStore {
  defaultStore ??= createConfigStore({ storage: browserStorage() });
  return defaultStore;
}
