import { Router } from "express";
import { createShortUrl, redirectUrl, getStats, startMonitoring, getMonitoringStats } from "./controllers";

const router = Router();

router.post("/shorturls", createShortUrl);
router.get("/shorturls/:shortcode", getStats);
router.get("/:shortcode", redirectUrl);

// Monitoring endpoints
router.post("/api/urls", startMonitoring);
router.get("/api/stats", getMonitoringStats);

export default router;
