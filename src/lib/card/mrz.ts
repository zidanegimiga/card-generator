/** Length of each line in the ID-card machine readable zone (ICAO TD1). */
export const MRZ_WIDTH = 30;

/** Uppercase A to Z and digits only; everything else becomes the `<` filler. */
function toMrz(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "<");
}

function pad(text: string): string {
  return text.slice(0, MRZ_WIDTH).padEnd(MRZ_WIDTH, "<");
}

/**
 * Two decorative MRZ-style lines in the spirit of a TD1 ID card:
 * `IDACM<12345678901<<<<<<<<<<<<<` and `LOVELACE<<ADA<<<<<<<<<<<<<<<<`.
 * Not a valid travel document, just the look of one.
 */
export function mrzLines(input: {
  brandName: string;
  fullName: string;
  memberId: string;
}): [string, string] {
  const issuer = pad(toMrz(input.brandName).replace(/</g, "")).slice(0, 3);
  const digits = input.memberId.replace(/\D/g, "");
  const words = input.fullName.trim().split(/\s+/).filter(Boolean);
  const surname =
    words.length > 1 ? words[words.length - 1]! : (words[0] ?? "");
  const given = words.length > 1 ? words.slice(0, -1).join(" ") : "";

  return [
    pad(`ID${issuer}${digits}`),
    pad(`${toMrz(surname)}<<${toMrz(given)}`),
  ];
}
