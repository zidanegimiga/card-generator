/** Makes font bytes usable from CSS. Swappable because jsdom has no `FontFace`. */
export interface FontRegistrar {
  register(cssFamily: string, data: ArrayBuffer): Promise<void>;
  unregister(cssFamily: string): void;
}

/** Base64 without blowing the call stack on multi-megabyte fonts. */
export function arrayBufferToBase64(data: ArrayBuffer): string {
  const bytes = new Uint8Array(data);
  const chunk = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function fontFaceCss(cssFamily: string, data: ArrayBuffer): string {
  const src = `data:application/octet-stream;base64,${arrayBufferToBase64(data)}`;
  return `@font-face { font-family: "${cssFamily}"; src: url(${src}); font-display: block; }`;
}

function facesFor(cssFamily: string): FontFace[] {
  return [...document.fonts].filter(
    (face) => face.family === cssFamily || face.family === `"${cssFamily}"`,
  );
}

function styleFor(cssFamily: string): HTMLStyleElement | null {
  return document.head.querySelector(
    `style[data-font-family="${CSS.escape(cssFamily)}"]`,
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

    // PNG export reads @font-face rules from stylesheets and can't see fonts
    // added through the FontFace API, so mirror the font as a CSS rule too.
    if (!styleFor(cssFamily)) {
      const style = document.createElement("style");
      style.dataset.fontFamily = cssFamily;
      style.textContent = fontFaceCss(cssFamily, data);
      document.head.append(style);
    }
  },
  unregister(cssFamily) {
    for (const face of facesFor(cssFamily)) document.fonts.delete(face);
    styleFor(cssFamily)?.remove();
  },
};
