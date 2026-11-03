export const IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
] as const;

export const IMAGE_ACCEPT = IMAGE_TYPES.join(",");

export const MAX_IMAGE_BYTES = 1024 * 1024;

export type ImageRead =
  { ok: true; dataUrl: string } | { ok: false; error: string };

function isImageType(type: string): type is (typeof IMAGE_TYPES)[number] {
  return (IMAGE_TYPES as readonly string[]).includes(type);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Turns an uploaded logo or photo into a data URL the card can render and
 * export without a server. Shared by the brand logo and the member photo.
 */
export async function readImageFile(file: File): Promise<ImageRead> {
  if (!isImageType(file.type)) {
    return { ok: false, error: "Use a PNG, JPEG, WebP, or SVG image." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Images can be up to 1 MB." };
  }
  try {
    return { ok: true, dataUrl: await readAsDataUrl(file) };
  } catch {
    return { ok: false, error: "That image couldn't be read. Try another." };
  }
}
