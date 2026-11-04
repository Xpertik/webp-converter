import encode from '@jsquash/webp/encode';
import type { EncodeOptions } from '@jsquash/webp/meta';
import type { ConversionSettings, EncodeRequest, EncodeResponse } from './types';

/** Mirrors `cwebp -q <n> -m 6 -sharp_yuv` and `cwebp -lossless`. */
function toEncodeOptions(settings: ConversionSettings): Partial<EncodeOptions> {
  if (settings.mode === 'lossless') {
    return { lossless: 1, quality: 75, method: 4, exact: 0 };
  }
  return { lossless: 0, quality: settings.quality, method: 6, use_sharp_yuv: 1 };
}

async function decode(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file, {
    premultiplyAlpha: 'none',
    colorSpaceConversion: 'none',
  });
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Este navegador no soporta Canvas 2D.');
    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}

self.onmessage = async (event: MessageEvent<EncodeRequest>) => {
  const { jobId, file, settings } = event.data;
  let response: EncodeResponse;
  try {
    const image = await decode(file);
    const buffer = await encode(image, toEncodeOptions(settings));
    response = { jobId, ok: true, buffer, width: image.width, height: image.height };
    self.postMessage(response, { transfer: [buffer] });
  } catch (err) {
    response = { jobId, ok: false, error: err instanceof Error ? err.message : String(err) };
    self.postMessage(response);
  }
};
