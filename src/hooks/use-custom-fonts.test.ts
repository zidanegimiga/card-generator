import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { StoredFont } from "@/lib/fonts/font-store";
import { createFontDeps } from "@/test/font-deps";
import { fakeFontFile } from "@/test/font-files";

import { useCustomFonts } from "./use-custom-fonts";

const saved: StoredFont = {
  id: "saved-1",
  family: "Saved Sans",
  fileName: "saved-sans.woff2",
  format: "woff2",
  data: new Uint8Array([0x77, 0x4f, 0x46, 0x32]).buffer,
  addedAt: 1,
};

async function renderReady(deps: ReturnType<typeof createFontDeps>["deps"]) {
  const hook = renderHook(() => useCustomFonts(deps));
  await waitFor(() => expect(hook.result.current.ready).toBe(true));
  return hook;
}

describe("useCustomFonts", () => {
  it("restores and registers saved fonts on mount", async () => {
    const { deps, registered } = createFontDeps([saved]);

    const { result } = await renderReady(deps);

    expect(result.current.fonts).toEqual([
      {
        kind: "custom",
        id: "saved-1",
        family: "Saved Sans",
        fileName: "saved-sans.woff2",
      },
    ]);
    expect(registered).toContain("cg-upload-saved-1");
  });

  it("skips a saved font that no longer loads", async () => {
    const { deps, registrar } = createFontDeps([
      saved,
      { ...saved, id: "broken", addedAt: 2 },
    ]);
    registrar.register.mockImplementation(async (family) => {
      if (family.endsWith("broken")) throw new Error("bad font");
    });

    const { result } = await renderReady(deps);

    expect(result.current.fonts.map((font) => font.id)).toEqual(["saved-1"]);
  });

  it("adds a valid upload: registers, saves, and returns it", async () => {
    const { deps, store, registered } = createFontDeps();
    const { result } = await renderReady(deps);

    let outcome: Awaited<ReturnType<typeof result.current.add>> | undefined;
    await act(async () => {
      outcome = await result.current.add(fakeFontFile("Brand-Display.woff2"));
    });

    const expected = {
      kind: "custom",
      id: "font-1",
      family: "Brand Display",
      fileName: "Brand-Display.woff2",
    };
    expect(outcome).toEqual({ ok: true, font: expected });
    expect(result.current.fonts).toEqual([expected]);
    expect(registered).toContain("cg-upload-font-1");
    expect(await store.list()).toEqual([
      expect.objectContaining({
        id: "font-1",
        format: "woff2",
        addedAt: 1_000,
      }),
    ]);
  });

  it("returns the validation error and saves nothing for a bad file", async () => {
    const { deps, store, registrar } = createFontDeps();
    const { result } = await renderReady(deps);

    let outcome: Awaited<ReturnType<typeof result.current.add>> | undefined;
    await act(async () => {
      outcome = await result.current.add(new File(["nope"], "notes.woff2"));
    });

    expect(outcome).toEqual({
      ok: false,
      error: "That file isn't a font we can read.",
    });
    expect(registrar.register).not.toHaveBeenCalled();
    expect(await store.list()).toEqual([]);
  });

  it("reports a damaged font when the browser can't load it", async () => {
    const { deps, store, registrar } = createFontDeps();
    registrar.register.mockRejectedValue(new Error("decode failed"));
    const { result } = await renderReady(deps);

    let outcome: Awaited<ReturnType<typeof result.current.add>> | undefined;
    await act(async () => {
      outcome = await result.current.add(fakeFontFile("broken.woff2"));
    });

    expect(outcome).toEqual({
      ok: false,
      error: "That font file looks damaged. Try another.",
    });
    expect(await store.list()).toEqual([]);
  });

  it("keeps an upload for the session when saving fails", async () => {
    const { deps, store } = createFontDeps();
    store.put = async () => {
      throw new Error("quota exceeded");
    };
    const { result } = await renderReady(deps);

    await act(async () => {
      await result.current.add(fakeFontFile("session.woff2"));
    });

    expect(result.current.fonts).toHaveLength(1);
  });

  it("removes a font everywhere", async () => {
    const { deps, store, registered } = createFontDeps([saved]);
    const { result } = await renderReady(deps);

    await act(() => result.current.remove("saved-1"));

    expect(result.current.fonts).toEqual([]);
    expect(registered).not.toContain("cg-upload-saved-1");
    expect(await store.list()).toEqual([]);
  });
});
