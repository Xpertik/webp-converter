import { zip } from 'fflate';
import { uniqueNames } from './format';

export interface ZipEntry {
  name: string;
  blob: Blob;
}

/** WebP is already compressed, so entries are stored (level 0) to keep zipping instant. */
export async function buildZip(entries: ZipEntry[]): Promise<Blob> {
  const names = uniqueNames(entries.map((e) => e.name));
  const files: Record<string, [Uint8Array, { level: 0 }]> = {};
  await Promise.all(
    entries.map(async (entry, i) => {
      files[names[i]] = [new Uint8Array(await entry.blob.arrayBuffer()), { level: 0 }];
    }),
  );
  return new Promise((resolve, reject) => {
    zip(files, (err, data) => (err ? reject(err) : resolve(new Blob([data], { type: 'application/zip' }))));
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
