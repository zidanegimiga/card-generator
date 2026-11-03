"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query. `fallback` is used on the server and in
 * environments without `matchMedia` (like jsdom), so hydration stays stable.
 */
export function useMediaQuery(query: string, fallback = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window.matchMedia !== "function") return () => {};
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = () =>
    typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : fallback;

  return useSyncExternalStore(subscribe, getSnapshot, () => fallback);
}
