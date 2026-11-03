import { create } from "qrcode";

/** A square grid of modules; `true` is a dark module. */
export type QrMatrix = boolean[][];

/** Encodes text as a QR matrix synchronously, so it renders on the server too. */
export function qrMatrix(text: string): QrMatrix {
  const { modules } = create(text, { errorCorrectionLevel: "M" });
  return Array.from({ length: modules.size }, (_, y) =>
    Array.from({ length: modules.size }, (_, x) => Boolean(modules.get(x, y))),
  );
}

/**
 * One SVG path for all dark modules, offset by a quiet zone. A single path keeps
 * the DOM small (a v4 code has 1,000+ modules) and exports cleanly.
 */
export function qrPath(matrix: QrMatrix, quietZone = 0): string {
  const commands: string[] = [];
  matrix.forEach((row, y) =>
    row.forEach((dark, x) => {
      if (dark) commands.push(`M${x + quietZone} ${y + quietZone}h1v1h-1z`);
    }),
  );
  return commands.join("");
}
