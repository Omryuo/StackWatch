"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = Log;
const axios_1 = __importDefault(require("axios"));
const DEFAULT_LOG_API = "http://20.244.56.144/evaluation-service/logs";
function getEnv(name) {
    try {
        // Only works in Node. In the browser this will throw or be undefined.
        // eslint-disable-next-line no-undef
        return (typeof process !== "undefined" && process.env && process.env[name]) || undefined;
    }
    catch {
        return undefined;
    }
}
const LOG_API = getEnv("LOG_API") || DEFAULT_LOG_API;
const LOG_API_KEY = getEnv("LOG_API_KEY");
async function Log(stack, level, pkg, message) {
    const payload = { stack, level, package: pkg, message };
    try {
        // If no API key is configured and we're targeting the evaluation service,
        // quietly skip remote logging to avoid 401s during local dev.
        const isEvaluationService = typeof LOG_API === "string" && LOG_API.includes("evaluation-service");
        if (!LOG_API_KEY && isEvaluationService) {
            if (typeof console !== "undefined") {
                console.debug?.(`[LOG SKIPPED] ${JSON.stringify(payload)}`);
            }
            return;
        }
        const headers = { "Content-Type": "application/json" };
        if (LOG_API_KEY) {
            headers["Authorization"] = `Bearer ${LOG_API_KEY}`;
        }
        const res = await axios_1.default.post(LOG_API, payload, { headers });
        if (res.status === 200) {
            console.info(`[LOGGED] ${JSON.stringify(payload)} → ${res.data.logID}`);
        }
    }
    catch (err) {
        console.error(`[LOG ERROR] Failed to log: ${message}`, err.message);
    }
}
