import { isSupportedImage } from './format';

/** Reads files from a drop, including images inside dropped folders. */
export async function collectDroppedFiles(dataTransfer: DataTransfer): Promise<File[]> {
  const entries = Array.from(dataTransfer.items)
    .map((item) => (item.kind === 'file' ? item.webkitGetAsEntry?.() : null))
    .filter((e): e is FileSystemEntry => Boolean(e));

  if (entries.length === 0) return Array.from(dataTransfer.files).filter(isSupportedImage);

  const files: File[] = [];
  await Promise.all(entries.map((entry) => walk(entry, files)));
  return files.filter(isSupportedImage);
}

async function walk(entry: FileSystemEntry, out: File[]): Promise<void> {
  if (entry.isFile) {
    const file = await new Promise<File>((resolve, reject) => (entry as FileSystemFileEntry).file(resolve, reject));
    out.push(file);
    return;
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    // readEntries returns results in chunks; keep reading until it returns none.
    for (;;) {
      const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => reader.readEntries(resolve, reject));
      if (batch.length === 0) break;
      await Promise.all(batch.map((child) => walk(child, out)));
    }
  }
}
