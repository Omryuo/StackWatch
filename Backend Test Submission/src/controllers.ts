import { Request, Response } from "express";
import { store, ShortUrl, monitoringStore, MonitoredUrl, MonitorResult } from "./models";
import { generateShortcode } from "./utils/shortcode";
import { Log } from "logging-middleware";
import axios from "axios";

export const createShortUrl = async (req: Request, res: Response) => {
  try {
    const { url, validity = 30, shortcode } = req.body;

    if (!url || typeof url !== "string") {
      await Log("backend", "error", "handler", "Invalid URL input");
      return res.status(400).json({ error: "Invalid URL" });
    }

    let finalCode = shortcode || generateShortcode();
    if (store[finalCode]) {
      return res.status(409).json({ error: "Shortcode already exists" });
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + validity * 60000);

    const entry: ShortUrl = {
      url,
      shortcode: finalCode,
      createdAt: now,
      expiry,
      clicks: [],
    };

    store[finalCode] = entry;

    await Log("backend", "info", "service", `Short URL created: ${finalCode}`);

    res.status(201).json({
      shortLink: `http://localhost:4000/${finalCode}`,
      expiry: expiry.toISOString(),
    });
  } catch (err: any) {
    await Log("backend", "fatal", "service", `Error creating short URL: ${err.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const redirectUrl = async (req: Request, res: Response) => {
  const { shortcode } = req.params;
  const entry = store[shortcode];

  if (!entry) {
    return res.status(404).json({ error: "Shortcode not found" });
  }
  if (new Date() > entry.expiry) {
    return res.status(410).json({ error: "Link expired" });
  }

  entry.clicks.push({
    timestamp: new Date(),
    referrer: req.get("Referrer") || "direct",
    location: "unknown",
  });

  await Log("backend", "info", "handler", `Redirecting shortcode: ${shortcode}`);
  res.redirect(entry.url);
};

export const getStats = async (req: Request, res: Response) => {
  const { shortcode } = req.params;
  const entry = store[shortcode];

  if (!entry) {
    return res.status(404).json({ error: "Shortcode not found" });
  }

  res.json({
    url: entry.url,
    shortcode: entry.shortcode,
    createdAt: entry.createdAt,
    expiry: entry.expiry,
    totalClicks: entry.clicks.length,
    clicks: entry.clicks,
  });
};

// Monitoring Controllers
export const startMonitoring = async (req: Request, res: Response) => {
  const { urls } = req.body as { urls: string[] };
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "urls must be a non-empty array" });
  }

  for (const raw of urls) {
    try {
      const u = new URL(raw).toString();
      if (!monitoringStore[u]) {
        monitoringStore[u] = { url: u, history: [] } as MonitoredUrl;
      }
    } catch {
      return res.status(400).json({ error: `Invalid URL: ${raw}` });
    }
  }

  await Log("backend", "info", "service", `Monitoring started for ${urls.length} url(s)`);
  res.status(202).json({ message: "Monitoring started", count: urls.length });
};

export const getMonitoringStats = async (req: Request, res: Response) => {
  const all = Object.values(monitoringStore);
  res.json({ items: all });
};

// Internal probe helper
async function probeUrlOnce(targetUrl: string): Promise<MonitorResult> {
  const start = Date.now();
  try {
    const response = await axios.get(targetUrl, { timeout: 8000, validateStatus: () => true, responseType: "arraybuffer" });
    const latency = Date.now() - start;
    const size = response.data ? (response.data as ArrayBuffer).byteLength ?? undefined : undefined;
    return {
      url: targetUrl,
      timestamp: new Date(),
      status: response.status,
      latencyMs: latency,
      sizeBytes: typeof size === "number" ? size : null,
    };
  } catch (err: any) {
    const latency = Date.now() - start;
    return {
      url: targetUrl,
      timestamp: new Date(),
      status: null,
      latencyMs: latency,
      sizeBytes: null,
      error: err?.message || "request failed",
    };
  }
}

// Lightweight in-memory interval to probe monitored urls
const PROBE_INTERVAL_MS = 15000;
setInterval(async () => {
  const urls = Object.keys(monitoringStore);
  if (urls.length === 0) return;
  for (const u of urls) {
    const result = await probeUrlOnce(u);
    monitoringStore[u].history.push(result);
    if (monitoringStore[u].history.length > 50) {
      monitoringStore[u].history.shift();
    }
    const level = result.status && result.status >= 200 && result.status < 400 ? "info" : "error";
    await Log("backend", level as any, "service", `Probe ${u} → ${result.status ?? "ERR"} in ${result.latencyMs}ms`);
  }
}, PROBE_INTERVAL_MS);
