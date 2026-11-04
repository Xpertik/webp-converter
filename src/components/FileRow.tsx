import { formatBytes, savingsPercent } from '../features/conversion/format';
import type { ConversionItem } from '../features/conversion/types';

interface Props {
  item: ConversionItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

export function FileRow({ item, onRemove, onRetry }: Props) {
  const saved = item.result ? savingsPercent(item.file.size, item.result.size) : null;

  return (
    <li className="flex items-center gap-4 px-4 py-3">
      <img
        src={item.previewUrl}
        alt=""
        className="size-12 shrink-0 rounded-lg bg-[repeating-conic-gradient(#e4e4e7_0_25%,transparent_0_50%)] bg-[length:12px_12px] object-contain dark:bg-[repeating-conic-gradient(#3f3f46_0_25%,transparent_0_50%)]"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100" title={item.file.name}>
          {item.outputName}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500 tabular-nums">
          {formatBytes(item.file.size)}
          {item.result && (
            <>
              {' → '}
              <span className="text-zinc-800 dark:text-zinc-200">{formatBytes(item.result.size)}</span>
            </>
          )}
          {item.width && item.height ? ` · ${item.width}×${item.height}` : ''}
        </p>
        {item.status === 'error' && <p className="mt-0.5 text-xs text-red-600">{item.error}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {item.status === 'converting' && (
          <span className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="size-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-200" />
            Convirtiendo
          </span>
        )}

        {item.status === 'done' && saved !== null && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${
              saved >= 0
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
            }`}
            title={saved < 0 ? 'El WebP pesa más que el original. Prueba una calidad menor o el otro modo.' : undefined}
          >
            {saved >= 0 ? `−${saved}%` : `+${-saved}%`}
          </span>
        )}

        {item.status === 'done' && item.result && (
          <a
            href={item.result.url}
            download={item.outputName}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Descargar
          </a>
        )}

        {item.status === 'error' && (
          <button
            type="button"
            onClick={() => onRetry(item.id)}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Reintentar
          </button>
        )}

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Quitar ${item.file.name}`}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
    </li>
  );
}
