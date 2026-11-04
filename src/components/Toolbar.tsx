import { formatBytes, savingsPercent } from '../features/conversion/format';
import type { ConversionItem } from '../features/conversion/types';

interface Props {
  items: ConversionItem[];
  zipping: boolean;
  onDownloadAll: () => void;
  onClear: () => void;
}

export function Toolbar({ items, zipping, onDownloadAll, onClear }: Props) {
  const done = items.filter((i) => i.status === 'done' && i.result);
  const pending = items.filter((i) => i.status === 'converting').length;
  const original = done.reduce((sum, i) => sum + i.file.size, 0);
  const converted = done.reduce((sum, i) => sum + (i.result?.size ?? 0), 0);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-zinc-600 tabular-nums dark:text-zinc-400">
        {done.length} de {items.length} convertidas
        {done.length > 0 && (
          <>
            {' · '}
            {formatBytes(original)} → <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatBytes(converted)}</span>{' '}
            <span className="text-emerald-700 dark:text-emerald-400">(−{savingsPercent(original, converted)}%)</span>
          </>
        )}
        {pending > 0 && <span className="text-zinc-400"> · {pending} en proceso</span>}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Quitar todo
        </button>
        <button
          type="button"
          onClick={onDownloadAll}
          disabled={done.length === 0 || pending > 0 || zipping}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {zipping ? 'Comprimiendo…' : 'Descargar todo (.zip)'}
        </button>
      </div>
    </div>
  );
}
