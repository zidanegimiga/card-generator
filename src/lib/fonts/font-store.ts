import type { FontFormat } from "./upload";

export type StoredFont = {
  id: string;
  family: string;
  fileName: string;
  format: FontFormat;
  data: ArrayBuffer;
  addedAt: number;
};

/** Where uploaded fonts persist. The app uses IndexedDB; tests can use memory. */
export interface FontStore {
  list(): Promise<StoredFont[]>;
  put(font: StoredFont): Promise<void>;
  remove(id: string): Promise<void>;
}

const DB_NAME = "card-generator";
const STORE_NAME = "fonts";

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function createIndexedDbFontStore(): FontStore {
  // Opened lazily so importing this module on the server is safe.
  let db: Promise<IDBDatabase> | null = null;

  function open() {
    db ??= new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return db;
  }

  async function objectStore(mode: IDBTransactionMode) {
    return (await open()).transaction(STORE_NAME, mode).objectStore(STORE_NAME);
  }

  return {
    async list() {
      if (typeof indexedDB === "undefined") return [];
      const fonts = await promisify<StoredFont[]>(
        (await objectStore("readonly")).getAll(),
      );
      return fonts.sort((a, b) => a.addedAt - b.addedAt);
    },
    async put(font) {
      await promisify((await objectStore("readwrite")).put(font));
    },
    async remove(id) {
      await promisify((await objectStore("readwrite")).delete(id));
    },
  };
}

export function createMemoryFontStore(initial: StoredFont[] = []): FontStore {
  const fonts = new Map(initial.map((font) => [font.id, font]));
  return {
    async list() {
      return [...fonts.values()].sort((a, b) => a.addedAt - b.addedAt);
    },
    async put(font) {
      fonts.set(font.id, font);
    },
    async remove(id) {
      fonts.delete(id);
    },
  };
}
