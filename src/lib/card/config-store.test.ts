import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CONFIG_STORAGE_KEY, createConfigStore } from "./config-store";
import { DEFAULT_CARD_CONFIG } from "./defaults";
import type { CardConfig } from "./schema";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => void data.set(key, value)),
    data,
  };
}

const saved = (config: unknown) => ({
  [CONFIG_STORAGE_KEY]: JSON.stringify(config),
});

const renamed: CardConfig = {
  ...DEFAULT_CARD_CONFIG,
  brand: { ...DEFAULT_CARD_CONFIG.brand, name: "Linear" },
};

describe("createConfigStore", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  describe("loading", () => {
    it("starts from defaults when nothing is saved", () => {
      const store = createConfigStore({ storage: memoryStorage() });
      expect(store.getSnapshot()).toBe(DEFAULT_CARD_CONFIG);
    });

    it("restores a valid saved config", () => {
      const store = createConfigStore({
        storage: memoryStorage(saved(renamed)),
      });
      expect(store.getSnapshot().brand.name).toBe("Linear");
    });

    it.each([
      ["broken JSON", { [CONFIG_STORAGE_KEY]: "{not json" }],
      ["a config that fails validation", saved({ style: "hologram" })],
      [
        "a saved unsafe logo",
        saved({
          ...renamed,
          brand: { ...renamed.brand, logoUrl: "javascript:alert(1)" },
        }),
      ],
    ])("ignores %s", (_label, initial) => {
      const store = createConfigStore({ storage: memoryStorage(initial) });
      expect(store.getSnapshot()).toBe(DEFAULT_CARD_CONFIG);
    });

    it("survives storage that throws on read", () => {
      const storage = memoryStorage();
      storage.getItem.mockImplementation(() => {
        throw new Error("SecurityError");
      });
      const store = createConfigStore({ storage });
      expect(store.getSnapshot()).toBe(DEFAULT_CARD_CONFIG);
    });

    it("reads storage once and returns a stable snapshot", () => {
      const storage = memoryStorage(saved(renamed));
      const store = createConfigStore({ storage });

      expect(store.getSnapshot()).toBe(store.getSnapshot());
      expect(storage.getItem).toHaveBeenCalledTimes(1);
    });

    it("always renders defaults on the server", () => {
      const store = createConfigStore({
        storage: memoryStorage(saved(renamed)),
      });
      expect(store.getServerSnapshot()).toBe(DEFAULT_CARD_CONFIG);
    });
  });

  describe("updating", () => {
    it("accepts a value or an updater and notifies subscribers", () => {
      const store = createConfigStore({ storage: memoryStorage() });
      const listener = vi.fn();
      store.subscribe(listener);

      store.set(renamed);
      store.set((current) => ({ ...current, style: "poster" }));

      expect(store.getSnapshot()).toMatchObject({
        style: "poster",
        brand: { name: "Linear" },
      });
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it("skips no-op updates", () => {
      const store = createConfigStore({ storage: memoryStorage() });
      const listener = vi.fn();
      store.subscribe(listener);

      store.set((current) => current);

      expect(listener).not.toHaveBeenCalled();
    });

    it("stops notifying after unsubscribe", () => {
      const store = createConfigStore({ storage: memoryStorage() });
      const listener = vi.fn();
      store.subscribe(listener)();

      store.set(renamed);

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("saving", () => {
    it("debounces writes while the user types", () => {
      const storage = memoryStorage();
      const store = createConfigStore({ storage, debounceMs: 300 });

      for (const name of ["L", "Li", "Lin", "Linear"]) {
        store.set((current) => ({
          ...current,
          brand: { ...current.brand, name },
        }));
      }
      expect(storage.setItem).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);

      expect(storage.setItem).toHaveBeenCalledTimes(1);
      expect(JSON.parse(storage.data.get(CONFIG_STORAGE_KEY)!).brand.name).toBe(
        "Linear",
      );
    });

    it("writes immediately on flush", () => {
      const storage = memoryStorage();
      const store = createConfigStore({ storage });

      store.set(renamed);
      store.flush();

      expect(storage.setItem).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(1000);
      expect(storage.setItem).toHaveBeenCalledTimes(1);
    });

    it("drops images and retries when storage is full", () => {
      const storage = memoryStorage();
      storage.setItem.mockImplementationOnce(() => {
        throw new DOMException("full", "QuotaExceededError");
      });
      const store = createConfigStore({ storage });

      store.set({
        ...renamed,
        brand: { ...renamed.brand, logoUrl: "data:image/png;base64,AA==" },
      });
      store.flush();

      const written = JSON.parse(storage.data.get(CONFIG_STORAGE_KEY)!);
      expect(written.brand.name).toBe("Linear");
      expect(written.brand.logoUrl).toBeUndefined();
      // The live card keeps its logo; only the saved copy is trimmed.
      expect(store.getSnapshot().brand.logoUrl).toBe(
        "data:image/png;base64,AA==",
      );
    });

    it("works without storage at all", () => {
      const store = createConfigStore({ storage: null });

      store.set(renamed);
      store.flush();

      expect(store.getSnapshot().brand.name).toBe("Linear");
    });
  });
});
