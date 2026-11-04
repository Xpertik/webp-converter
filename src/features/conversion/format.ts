const SUPPORTED_TYPES = new Set(['image/png', 'image/jpeg']);
const SUPPORTED_EXTENSIONS = /\.(png|jpe?g)$/i;

export function isSupportedImage(file: { type: string; name: string }): boolean {
  if (file.type) return SUPPORTED_TYPES.has(file.type);
  return SUPPORTED_EXTENSIONS.test(file.name);
}

export function toWebpName(name: string): string {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  return `${base}.webp`;
}

/** Numbers repeated names ("a.webp", "a (2).webp") so zip entries never collide. */
export function uniqueNames(names: string[]): string[] {
  const taken = new Set(names);
  const used = new Set<string>();

  return names.map((name) => {
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
    const dot = name.lastIndexOf('.');
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    let n = 2;
    let candidate = `${base} (${n})${ext}`;
    while (used.has(candidate) || taken.has(candidate)) {
      n += 1;
      candidate = `${base} (${n})${ext}`;
    }
    used.add(candidate);
    return candidate;
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function savingsPercent(original: number, converted: number): number {
  if (original === 0) return 0;
  return Math.round((1 - converted / original) * 100);
}
