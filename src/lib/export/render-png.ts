import { domToBlob } from "modern-screenshot";

export const EXPORT_SIZE = { width: 1080, height: 1712 } as const;

/** Rasterises a card element that is already laid out at the export size. */
export type CardRenderer = (node: HTMLElement) => Promise<Blob>;

export const renderCardPng: CardRenderer = async (node) => {
  // Wait for every font the card uses, including uploads, before drawing.
  await document.fonts.ready;
  return domToBlob(node, {
    width: EXPORT_SIZE.width,
    height: EXPORT_SIZE.height,
    scale: 1,
    type: "image/png",
  });
};

export type Downloader = (blob: Blob, fileName: string) => void;

export const downloadBlob: Downloader = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  // Revoke on the next tick so the click has started the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
