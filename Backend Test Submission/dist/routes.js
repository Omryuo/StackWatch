"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("./controllers");
const router = (0, express_1.Router)();
router.post("/shorturls", controllers_1.createShortUrl);
router.get("/shorturls/:shortcode", controllers_1.getStats);
router.get("/:shortcode", controllers_1.redirectUrl);
// Monitoring endpoints
router.post("/api/urls", controllers_1.startMonitoring);
router.get("/api/stats", controllers_1.getMonitoringStats);
exports.default = router;
