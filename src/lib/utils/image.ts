import type { IntakePhoto, PhotoKind } from "@/lib/domain/types";
import { shortId } from "./id";

const MAX_EDGE = 1400;
const QUALITY = 0.72;

export class ImageTooLargeError extends Error {
  constructor() {
    super("That image is larger than 25 MB.");
    this.name = "ImageTooLargeError";
  }
}

export class ImageUnreadableError extends Error {
  constructor() {
    super("That file couldn't be read as an image.");
    this.name = "ImageUnreadableError";
  }
}

/**
 * Downscales an uploaded photo in the browser before it is ever stored.
 *
 * A modern phone photo is 3–6 MB, which would blow past the storage budget in
 * two uploads. 1400px on the long edge is more than enough to read a model
 * plate, and it keeps the demo responsive on a phone over cellular.
 */
export async function processPhoto(file: File, kind: PhotoKind): Promise<IntakePhoto> {
  if (file.size > 25 * 1024 * 1024) throw new ImageTooLargeError();
  if (!file.type.startsWith("image/")) throw new ImageUnreadableError();

  const bitmap = await loadBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageUnreadableError();
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  if ("close" in bitmap) bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", QUALITY);
  return {
    id: shortId("img"),
    kind,
    name: file.name,
    dataUrl,
    sizeBytes: Math.round((dataUrl.length * 3) / 4),
  };
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* Safari occasionally refuses certain JPEGs — fall back to <img>. */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageUnreadableError());
    };
    img.src = url;
  });
}
