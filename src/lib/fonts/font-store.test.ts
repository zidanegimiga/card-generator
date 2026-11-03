import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it } from "vitest";

import {
  createIndexedDbFontStore,
  createMemoryFontStore,
  type FontStore,
  type StoredFont,
} from "./font-store";

function storedFont(id: string, addedAt: number): StoredFont {
  return {
    id,
    family: `Font ${id}`,
    fileName: `${id}.woff2`,
    format: "woff2",
    data: new Uint8Array([1, 2, 3]).buffer,
    addedAt,
  };
}

// The same contract runs against both implementations.
describe.each([
  ["memory", () => createMemoryFontStore()],
  ["IndexedDB", () => createIndexedDbFontStore()],
])("%s font store", (_name, createStore: () => FontStore) => {
  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory();
  });

  it("starts empty", async () => {
    expect(await createStore().list()).toEqual([]);
  });

  it("lists fonts oldest first", async () => {
    const store = createStore();
    await store.put(storedFont("b", 2));
    await store.put(storedFont("a", 1));

    const ids = (await store.list()).map((font) => font.id);
    expect(ids).toEqual(["a", "b"]);
  });

  it("keeps the font bytes intact", async () => {
    const store = createStore();
    await store.put(storedFont("a", 1));

    const [font] = await store.list();
    expect([...new Uint8Array(font!.data)]).toEqual([1, 2, 3]);
  });

  it("replaces a font with the same id", async () => {
    const store = createStore();
    await store.put(storedFont("a", 1));
    await store.put({ ...storedFont("a", 1), family: "Renamed" });

    expect(await store.list()).toEqual([
      expect.objectContaining({ id: "a", family: "Renamed" }),
    ]);
  });

  it("removes a font", async () => {
    const store = createStore();
    await store.put(storedFont("a", 1));
    await store.put(storedFont("b", 2));
    await store.remove("a");

    expect((await store.list()).map((font) => font.id)).toEqual(["b"]);
  });
});

describe("IndexedDB font store", () => {
  it("persists across store instances", async () => {
    globalThis.indexedDB = new IDBFactory();
    await createIndexedDbFontStore().put(storedFont("a", 1));

    const reopened = await createIndexedDbFontStore().list();
    expect(reopened.map((font) => font.id)).toEqual(["a"]);
  });
});
