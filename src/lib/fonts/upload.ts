export const FONT_FORMATS = ["woff2", "woff", "ttf", "otf"] as const;
export type FontFormat = (typeof FONT_FORMATS)[number];

export const FONT_ACCEPT = FONT_FORMATS.map((format) => `.${format}`).join(",");

export const MAX_FONT_BYTES = 2 * 1024 * 1024;

/** First four bytes of each format. TrueType has two valid signatures. */
const SIGNATURES: Record<FontFormat, readonly (readonly number[])[]> = {
  woff2: [[0x77, 0x4f, 0x46, 0x32]], // "wOF2"
  woff: [[0x77, 0x4f, 0x46, 0x46]], // "wOFF"
  otf: [[0x4f, 0x54, 0x54, 0x4f]], // "OTTO"
  ttf: [
    [0x00, 0x01, 0x00, 0x00],
    [0x74, 0x72, 0x75, 0x65], // "true", used by older Apple fonts
  ],
};

export type ValidatedFont = {
  format: FontFormat;
  family: string;
  fileName: string;
  data: ArrayBuffer;
};

export type FontValidation =
  { ok: true; font: ValidatedFont } | { ok: false; error: string };

export function formatFromFileName(fileName: string): FontFormat | null {
  const dot = fileName.lastIndexOf(".");
  if (dot === -1) return null;
  const extension = fileName.slice(dot + 1).toLowerCase();
  return FONT_FORMATS.find((format) => format === extension) ?? null;
}

function detectFormat(bytes: Uint8Array): FontFormat | null {
  for (const format of FONT_FORMATS) {
    const matches = SIGNATURES[format].some((signature) =>
      signature.every((byte, index) => bytes[index] === byte),
    );
    if (matches) return format;
  }
  return null;
}

/** `space-mono_Bold.woff2` becomes `space mono Bold`, capped at 64 characters. */
export function familyFromFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "");
  const family = base.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return family.slice(0, 64).trim() || "Custom font";
}

/**
 * Checks the extension, size, and the file's magic bytes. The bytes matter
 * because a renamed `.txt` would otherwise pass the extension check.
 * A file is accepted as long as its bytes are a font, even if the extension
 * names a different font format.
 */
export async function validateFontFile(file: File): Promise<FontValidation> {
  if (!formatFromFileName(file.name)) {
    return { ok: false, error: "Use a .woff2, .woff, .ttf, or .otf file." };
  }
  if (file.size > MAX_FONT_BYTES) {
    return { ok: false, error: "Font files can be up to 2 MB." };
  }

  const data = await file.arrayBuffer();
  const format = detectFormat(
    new Uint8Array(data, 0, Math.min(4, data.byteLength)),
  );
  if (!format) {
    return { ok: false, error: "That file isn't a font we can read." };
  }

  return {
    ok: true,
    font: {
      format,
      family: familyFromFileName(file.name),
      fileName: file.name,
      data,
    },
  };
}
