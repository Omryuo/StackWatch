export interface Click {
  timestamp: Date;
  referrer: string;
  location: string;
}

export interface ShortUrl {
  url: string;
  shortcode: string;
  createdAt: Date;
  expiry: Date;
  clicks: Click[];
}

export const store: Record<string, ShortUrl> = {};

// Monitoring models
export interface MonitorResult {
  url: string;
  timestamp: Date;
  status: number | null;
  latencyMs: number | null;
  sizeBytes: number | null;
  error?: string;
}

export interface MonitoredUrl {
  url: string;
  history: MonitorResult[];
}

export const monitoringStore: Record<string, MonitoredUrl> = {};
