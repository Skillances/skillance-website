/**
 * Resizes an image in the browser and returns a `data:image/jpeg;base64,...` string.
 * Some upload routes (portfolio, police clearance) sit under the API's 2 MB body limit,
 * so images are scaled down and re-encoded until they fit [maxBytes].
 */
export async function compressImage(file: File, opts?: { maxDim?: number; quality?: number; maxBytes?: number }): Promise<string> {
  const maxDim = opts?.maxDim ?? 1600;
  const maxBytes = opts?.maxBytes ?? 1_400_000;
  let quality = opts?.quality ?? 0.82;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error('That image could not be read. Try a JPG or PNG.');

  let scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser cannot prepare images for upload.');

  for (let attempt = 0; attempt < 6; attempt++) {
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL('image/jpeg', quality);
    // Base64 length is ~4/3 of the byte size.
    if (url.length * 0.75 <= maxBytes) {
      bitmap.close();
      return url;
    }
    quality = Math.max(0.5, quality - 0.1);
    scale *= 0.8;
  }
  bitmap.close();
  throw new Error('That image is too large. Try a smaller photo.');
}

/** Approximate byte size of a data URL. */
export function dataUrlBytes(url: string): number {
  const i = url.indexOf(',');
  return Math.round((url.length - (i + 1)) * 0.75);
}
