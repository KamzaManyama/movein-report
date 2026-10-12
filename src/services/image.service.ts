export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

export function validateImageFile(file: {
  type: string;
  size: number;
  name?: string;
}): string | null {
  const type = file.type.toLowerCase();
  if (type.includes("heic") || type.includes("heif") || /\.hei[cf]$/i.test(file.name ?? "")) {
    return "HEIC photos aren't supported by this browser. Please choose a JPG or PNG photo.";
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(type)) return "Only JPG, PNG or WebP photos can be added.";
  if (file.size > MAX_IMAGE_BYTES)
    return "This photo is larger than 20 MB. Please choose a smaller one.";
  if (file.size === 0) return "This file appears to be empty.";
  return null;
}

async function decode(
  file: Blob,
): Promise<{ source: CanvasImageSource; width: number; height: number; close?: () => void }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file);
      return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
    } catch {
      /* fall through */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Resize to fit within maxDim and re-encode as JPEG to save storage and PDF size. */
export async function optimiseImage(
  file: Blob,
  maxDim = 1600,
  quality = 0.8,
): Promise<{ blob: Blob; width: number; height: number }> {
  let decoded;
  try {
    decoded = await decode(file);
  } catch {
    throw new Error("This photo could not be read. Try a different photo.");
  }
  const scale = Math.min(1, maxDim / Math.max(decoded.width, decoded.height));
  const width = Math.max(1, Math.round(decoded.width * scale));
  const height = Math.max(1, Math.round(decoded.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not process this photo.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(decoded.source, 0, 0, width, height);
  decoded.close?.();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
  if (!blob) throw new Error("Your browser could not process this photo.");
  return { blob, width, height };
}
