import type { HexColor } from "@/lib/card/schema";
import { relativeLuminance } from "@/lib/color/contrast";
import { qrMatrix, qrPath } from "@/lib/qr/qr-matrix";

const QUIET_ZONE = 2;

type QrCodeProps = {
  value: string;
  /** Two brand colours. The darker becomes the modules so the code is never inverted. */
  tones: readonly [HexColor, HexColor];
  className?: string;
};

/** A scannable QR code drawn as one SVG path, crisp at any export size. */
export function QrCode({ value, tones, className = "" }: QrCodeProps) {
  const matrix = qrMatrix(value);
  const size = matrix.length + QUIET_ZONE * 2;
  const [dark, light] = [...tones].sort(
    (a, b) => relativeLuminance(a) - relativeLuminance(b),
  ) as [HexColor, HexColor];

  return (
    <svg
      role="img"
      aria-label={`QR code linking to ${value}`}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      className={`shrink-0 ${className}`}
    >
      <rect width={size} height={size} fill={light} />
      <path d={qrPath(matrix, QUIET_ZONE)} fill={dark} />
    </svg>
  );
}
