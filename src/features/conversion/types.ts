export type Mode = 'lossy' | 'lossless';

export interface ConversionSettings {
  mode: Mode;
  /** 0-100, only used in lossy mode. */
  quality: number;
}

export type ItemStatus = 'converting' | 'done' | 'error';

export interface ConversionResult {
  blob: Blob;
  url: string;
  size: number;
}

export interface ConversionItem {
  id: string;
  file: File;
  previewUrl: string;
  outputName: string;
  status: ItemStatus;
  /** Id of the latest job; results from older jobs are ignored. */
  jobId: number;
  width?: number;
  height?: number;
  result?: ConversionResult;
  error?: string;
}

export interface EncodeRequest {
  jobId: number;
  file: File;
  settings: ConversionSettings;
}

export type EncodeResponse =
  | { jobId: number; ok: true; buffer: ArrayBuffer; width: number; height: number }
  | { jobId: number; ok: false; error: string };
