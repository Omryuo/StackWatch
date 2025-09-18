"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonitoringStats = exports.startMonitoring = exports.getStats = exports.redirectUrl = exports.createShortUrl = void 0;
const models_1 = require("./models");
const shortcode_1 = require("./utils/shortcode");
const logging_middleware_1 = require("logging-middleware");
const axios_1 = __importDefault(require("axios"));
const createShortUrl = async (req, res) => {
    try {
        const { url, validity = 30, shortcode } = req.body;
        if (!url || typeof url !== "string") {
            await (0, logging_middleware_1.Log)("backend", "error", "handler", "Invalid URL input");
            return res.status(400).json({ error: "Invalid URL" });
        }
        let finalCode = shortcode || (0, shortcode_1.generateShortcode)();
        if (models_1.store[finalCode]) {
            return res.status(409).json({ error: "Shortcode already exists" });
        }
        const now = new Date();
        const expiry = new Date(now.getTime() + validity * 60000);
        const entry = {
            url,
            shortcode: finalCode,
            createdAt: now,
            expiry,
            clicks: [],
        };
        models_1.store[finalCode] = entry;
        await (0, logging_middleware_1.Log)("backend", "info", "service", `Short URL created: ${finalCode}`);
        res.status(201).json({
            shortLink: `http://localhost:4000/${finalCode}`,
            expiry: expiry.toISOString(),
        });
    }
    catch (err) {
        await (0, logging_middleware_1.Log)("backend", "fatal", "service", `Error creating short URL: ${err.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.createShortUrl = createShortUrl;
const redirectUrl = async (req, res) => {
    const { shortcode } = req.params;
    const entry = models_1.store[shortcode];
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
    await (0, logging_middleware_1.Log)("backend", "info", "handler", `Redirecting shortcode: ${shortcode}`);
    res.redirect(entry.url);
};
exports.redirectUrl = redirectUrl;
const getStats = async (req, res) => {
    const { shortcode } = req.params;
    const entry = models_1.store[shortcode];
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
exports.getStats = getStats;
// Monitoring Controllers
const startMonitoring = async (req, res) => {
    const { urls } = req.body;
    if (!Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: "urls must be a non-empty array" });
    }
    for (const raw of urls) {
        try {
            const u = new URL(raw).toString();
            if (!models_1.monitoringStore[u]) {
                models_1.monitoringStore[u] = { url: u, history: [] };
            }
        }
        catch {
            return res.status(400).json({ error: `Invalid URL: ${raw}` });
        }
    }
    await (0, logging_middleware_1.Log)("backend", "info", "service", `Monitoring started for ${urls.length} url(s)`);
    res.status(202).json({ message: "Monitoring started", count: urls.length });
};
exports.startMonitoring = startMonitoring;
const getMonitoringStats = async (req, res) => {
    const all = Object.values(models_1.monitoringStore);
    res.json({ items: all });
};
exports.getMonitoringStats = getMonitoringStats;
// Internal probe helper
async function probeUrlOnce(targetUrl) {
    const start = Date.now();
    try {
        const response = await axios_1.default.get(targetUrl, { timeout: 8000, validateStatus: () => true, responseType: "arraybuffer" });
        const latency = Date.now() - start;
        const size = response.data ? response.data.byteLength ?? undefined : undefined;
        return {
            url: targetUrl,
            timestamp: new Date(),
            status: response.status,
            latencyMs: latency,
            sizeBytes: typeof size === "number" ? size : null,
        };
    }
    catch (err) {
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
    const urls = Object.keys(models_1.monitoringStore);
    if (urls.length === 0)
        return;
    for (const u of urls) {
        const result = await probeUrlOnce(u);
        models_1.monitoringStore[u].history.push(result);
        if (models_1.monitoringStore[u].history.length > 50) {
            models_1.monitoringStore[u].history.shift();
        }
        const level = result.status && result.status >= 200 && result.status < 400 ? "info" : "error";
        await (0, logging_middleware_1.Log)("backend", level, "service", `Probe ${u} → ${result.status ?? "ERR"} in ${result.latencyMs}ms`);
    }
}, PROBE_INTERVAL_MS);
