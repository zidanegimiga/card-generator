const SIGNATURES = {
  woff2: [0x77, 0x4f, 0x46, 0x32],
  woff: [0x77, 0x4f, 0x46, 0x46],
  otf: [0x4f, 0x54, 0x54, 0x4f],
  ttf: [0x00, 0x01, 0x00, 0x00],
} as const;

/** A tiny file whose first bytes look like the given font format. */
export function fakeFontFile(
  name: string,
  format: keyof typeof SIGNATURES = "woff2",
): File {
  return new File([new Uint8Array([...SIGNATURES[format], 0, 0, 0, 0])], name);
}
