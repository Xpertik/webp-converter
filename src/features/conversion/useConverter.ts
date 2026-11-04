import { useCallback, useEffect, useRef, useState } from 'react';
import { EncoderPool } from './encoderPool';
import { toWebpName } from './format';
import type { ConversionItem, ConversionSettings } from './types';

interface Target {
  id: string;
  file: File;
}

const RECONVERT_DELAY_MS = 350;

export function useConverter(settings: ConversionSettings) {
  const [items, setItems] = useState<ConversionItem[]>([]);
  const itemsRef = useRef(items);
  const poolRef = useRef<EncoderPool | null>(null);
  const jobCounter = useRef(0);
  const settingsRef = useRef(settings);
  const isFirstSettings = useRef(true);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const pool = useCallback(() => (poolRef.current ??= new EncoderPool()), []);

  const run = useCallback(
    (targets: Target[], runSettings: ConversionSettings) => {
      const jobs = targets.map((t) => ({ ...t, jobId: (jobCounter.current += 1) }));
      const jobByItem = new Map(jobs.map((j) => [j.id, j.jobId]));

      setItems((prev) =>
        prev.map((item) =>
          jobByItem.has(item.id)
            ? { ...item, jobId: jobByItem.get(item.id)!, status: 'converting', error: undefined }
            : item,
        ),
      );

      for (const job of jobs) {
        pool()
          .encode(job.jobId, job.file, runSettings)
          .then(
            (res) => {
              const blob = new Blob([res.buffer], { type: 'image/webp' });
              const url = URL.createObjectURL(blob);
              const current = itemsRef.current.find((i) => i.id === job.id);
              if (!current || current.jobId !== job.jobId) {
                // Item was removed or re-queued with new settings: drop this stale output.
                URL.revokeObjectURL(url);
                return;
              }
              setItems((prev) =>
                prev.map((item) =>
                  item.id === job.id && item.jobId === job.jobId
                    ? {
                        ...item,
                        status: 'done',
                        width: res.width,
                        height: res.height,
                        result: { blob, url, size: blob.size },
                      }
                    : item,
                ),
              );
              // Free the previous output once it has been replaced.
              if (current.result) URL.revokeObjectURL(current.result.url);
            },
            (err: Error) => {
              if (err.message === 'cancelled') return;
              setItems((prev) =>
                prev.map((item) =>
                  item.id === job.id && item.jobId === job.jobId
                    ? { ...item, status: 'error', error: err.message }
                    : item,
                ),
              );
            },
          );
      }
    },
    [pool],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      const created: ConversionItem[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        outputName: toWebpName(file.name),
        status: 'converting',
        jobId: 0,
      }));
      setItems((prev) => [...prev, ...created]);
      run(created, settingsRef.current);
    },
    [run],
  );

  const revoke = (item: ConversionItem) => {
    URL.revokeObjectURL(item.previewUrl);
    if (item.result) URL.revokeObjectURL(item.result.url);
  };

  const remove = useCallback(
    (id: string) => {
      const item = itemsRef.current.find((i) => i.id === id);
      if (!item) return;
      pool().cancel(new Set([item.jobId]));
      revoke(item);
      setItems((prev) => prev.filter((i) => i.id !== id));
    },
    [pool],
  );

  const clear = useCallback(() => {
    const current = itemsRef.current;
    pool().cancel(new Set(current.map((i) => i.jobId)));
    current.forEach(revoke);
    setItems([]);
  }, [pool]);

  const retry = useCallback(
    (id: string) => {
      const item = itemsRef.current.find((i) => i.id === id);
      if (item) run([item], settingsRef.current);
    },
    [run],
  );

  // Re-encode everything when the settings change (debounced for slider drags).
  useEffect(() => {
    if (isFirstSettings.current) {
      isFirstSettings.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const current = itemsRef.current;
      if (current.length === 0) return;
      pool().cancel(new Set(current.map((i) => i.jobId)));
      run(current, settings);
    }, RECONVERT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [settings, pool, run]);

  useEffect(() => () => poolRef.current?.terminate(), []);

  return { items, addFiles, remove, clear, retry };
}
