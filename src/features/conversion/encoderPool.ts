import type { ConversionSettings, EncodeRequest, EncodeResponse } from './types';

type Success = Extract<EncodeResponse, { ok: true }>;

interface Job {
  request: EncodeRequest;
  resolve: (value: Success) => void;
  reject: (reason: Error) => void;
}

/** Runs encodes on a small pool of workers so large batches stay responsive. */
export class EncoderPool {
  private readonly size: number;
  private readonly idle: Worker[] = [];
  private readonly busy = new Map<Worker, Job>();
  private readonly queue: Job[] = [];
  private created = 0;

  constructor(size = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 2) - 1))) {
    this.size = size;
  }

  encode(jobId: number, file: File, settings: ConversionSettings): Promise<Success> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request: { jobId, file, settings }, resolve, reject });
      this.drain();
    });
  }

  /** Drops queued jobs that have not started yet. */
  cancel(jobIds: Set<number>): void {
    for (let i = this.queue.length - 1; i >= 0; i -= 1) {
      const job = this.queue[i];
      if (jobIds.has(job.request.jobId)) {
        this.queue.splice(i, 1);
        job.reject(new Error('cancelled'));
      }
    }
  }

  terminate(): void {
    for (const worker of [...this.idle, ...this.busy.keys()]) worker.terminate();
    this.idle.length = 0;
    this.busy.clear();
    this.queue.length = 0;
    this.created = 0;
  }

  private drain(): void {
    while (this.queue.length > 0) {
      const worker = this.idle.pop() ?? this.spawn();
      if (!worker) return;
      const job = this.queue.shift()!;
      this.busy.set(worker, job);
      worker.postMessage(job.request);
    }
  }

  private spawn(): Worker | undefined {
    if (this.created >= this.size) return undefined;
    this.created += 1;
    const worker = new Worker(new URL('./encoder.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<EncodeResponse>) => {
      const job = this.busy.get(worker);
      this.release(worker);
      if (!job) return;
      const data = event.data;
      if (data.ok) job.resolve(data);
      else job.reject(new Error(data.error));
    };
    worker.onerror = (event) => {
      const job = this.busy.get(worker);
      this.release(worker);
      job?.reject(new Error(event.message || 'El conversor falló.'));
    };
    return worker;
  }

  private release(worker: Worker): void {
    this.busy.delete(worker);
    this.idle.push(worker);
    this.drain();
  }
}
