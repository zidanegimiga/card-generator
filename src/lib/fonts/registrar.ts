/** Makes font bytes usable from CSS. Swappable because jsdom has no `FontFace`. */
export interface FontRegistrar {
  register(cssFamily: string, data: ArrayBuffer): Promise<void>;
  unregister(cssFamily: string): void;
}

function facesFor(cssFamily: string): FontFace[] {
  return [...document.fonts].filter(
    (face) => face.family === cssFamily || face.family === `"${cssFamily}"`,
  );
}

export const documentFontRegistrar: FontRegistrar = {
  async register(cssFamily, data) {
    // Safe to call twice, e.g. when React re-runs effects in development.
    if (facesFor(cssFamily).length > 0) return;
    const face = new FontFace(cssFamily, data);
    // Added before loading so a second call made mid-load sees it.
    document.fonts.add(face);
    try {
      // Rejects on corrupt files, which is how we catch fonts that only look valid.
      await face.load();
    } catch (error) {
      document.fonts.delete(face);
      throw error;
    }
  },
  unregister(cssFamily) {
    for (const face of facesFor(cssFamily)) document.fonts.delete(face);
  },
};
