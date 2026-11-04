import type { ConversionSettings, Mode } from '../features/conversion/types';

interface Props {
  settings: ConversionSettings;
  onChange: (settings: ConversionSettings) => void;
}

const MODES: { value: Mode; label: string; hint: string }[] = [
  { value: 'lossy', label: 'Con pérdida', hint: 'Archivos mucho más livianos. Ideal para fotos.' },
  { value: 'lossless', label: 'Sin pérdida', hint: 'Conserva cada píxel. Solo para logos y gráficos planos: en fotos el archivo pesa varias veces más.' },
];

export function SettingsPanel({ settings, onChange }: Props) {
  const active = MODES.find((m) => m.value === settings.mode)!;
  const lossy = settings.mode === 'lossy';

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-5 sm:flex-row sm:items-center sm:gap-8 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Modo</span>
        <div role="radiogroup" aria-label="Modo de compresión" className="inline-flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          {MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              role="radio"
              aria-checked={settings.mode === mode.value}
              onClick={() => onChange({ ...settings, mode: mode.value })}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                settings.mode === mode.value
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500">{active.hint}</p>
      </div>

      <div className={`flex flex-1 flex-col gap-2 transition-opacity ${lossy ? '' : 'pointer-events-none opacity-40'}`}>
        <div className="flex items-baseline justify-between">
          <label htmlFor="quality" className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
            Calidad
          </label>
          <span className="font-mono text-sm tabular-nums text-zinc-900 dark:text-zinc-100">{settings.quality}</span>
        </div>
        <input
          id="quality"
          type="range"
          min={0}
          max={100}
          step={1}
          disabled={!lossy}
          value={settings.quality}
          onChange={(e) => onChange({ ...settings, quality: Number(e.target.value) })}
          className="w-full accent-emerald-600"
        />
        <p className="text-xs text-zinc-500">Entre 70 y 80 es un buen punto de partida. Al cambiarla se reconvierten todas las imágenes.</p>
      </div>
    </section>
  );
}
