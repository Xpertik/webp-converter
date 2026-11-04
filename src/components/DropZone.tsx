import { useRef, useState, type DragEvent } from 'react';
import { collectDroppedFiles } from '../features/conversion/collectFiles';
import { isSupportedImage } from '../features/conversion/format';

interface Props {
  compact: boolean;
  onFiles: (files: File[]) => void;
}

export function DropZone({ compact, onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = async (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    onFiles(await collectDroppedFiles(event.dataTransfer));
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`group flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-center transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 ${
        compact ? 'px-6 py-6' : 'px-6 py-16'
      } ${
        dragging
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
          : 'border-zinc-300 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500'
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={`${compact ? 'size-6' : 'size-10'} text-zinc-400 transition-colors group-hover:text-zinc-600 dark:group-hover:text-zinc-300`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 16V4m0 0-4 4m4-4 4 4" />
        <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      </svg>
      <span className={`font-medium text-zinc-900 dark:text-zinc-100 ${compact ? 'text-sm' : 'text-base'}`}>
        {dragging ? 'Suelta para convertir' : compact ? 'Agregar más imágenes' : 'Arrastra imágenes PNG o JPEG aquí'}
      </span>
      {!compact && <span className="text-sm text-zinc-500">También puedes soltar carpetas o hacer clic para elegir archivos</span>}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        multiple
        hidden
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []).filter(isSupportedImage));
          e.target.value = '';
        }}
      />
    </button>
  );
}
