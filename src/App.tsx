import { useEffect, useState } from 'react';
import { DropZone } from './components/DropZone';
import { FileRow } from './components/FileRow';
import { SettingsPanel } from './components/SettingsPanel';
import { Toolbar } from './components/Toolbar';
import type { ConversionSettings } from './features/conversion/types';
import { useConverter } from './features/conversion/useConverter';
import { buildZip, downloadBlob } from './features/conversion/zip';

// v2: resets the lossless setting left over from early testing; defaults now match CloudConvert.
const SETTINGS_KEY = 'webp-converter:settings:v2';
const DEFAULT_SETTINGS: ConversionSettings = { mode: 'lossy', quality: 75 };

function loadSettings(): ConversionSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null');
    if (saved && (saved.mode === 'lossy' || saved.mode === 'lossless') && typeof saved.quality === 'number') {
      return saved;
    }
  } catch {
    // Storage unavailable or corrupted: fall back to defaults.
  }
  return DEFAULT_SETTINGS;
}

function zipName(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `webp-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.zip`;
}

export default function App() {
  const [settings, setSettings] = useState(loadSettings);
  const { items, addFiles, remove, clear, retry } = useConverter(settings);
  const [zipping, setZipping] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore: settings just won't persist.
    }
  }, [settings]);

  // Keep the browser from opening a file dropped outside the drop zone.
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  }, []);

  const downloadAll = async () => {
    const done = items.filter((i) => i.status === 'done' && i.result);
    setZipping(true);
    try {
      const zip = await buildZip(done.map((i) => ({ name: i.outputName, blob: i.result!.blob })));
      downloadBlob(zip, zipName());
    } finally {
      setZipping(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-10 sm:py-16">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Conversor WebP</h1>
        <p className="text-sm text-zinc-500">
          Convierte imágenes PNG y JPEG a WebP. Todo se procesa en tu navegador: no se sube nada.
        </p>
      </header>

      <SettingsPanel settings={settings} onChange={setSettings} />
      <DropZone compact={items.length > 0} onFiles={addFiles} />

      {items.length > 0 && (
        <section className="flex flex-col gap-3">
          <Toolbar items={items} zipping={zipping} onDownloadAll={downloadAll} onClear={clear} />
          <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {items.map((item) => (
              <FileRow key={item.id} item={item} onRemove={remove} onRetry={retry} />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
