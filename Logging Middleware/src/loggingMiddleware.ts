
import axios from "axios";

type Stack = "backend" | "frontend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type Package =
  | "auth" | "config" | "middleware" | "utils"
  | "cache" | "controller" | "cron_job" | "db"
  | "domain" | "handler" | "repository" | "route" | "service"
  | "component" | "hook" | "page" | "state" | "style" | "api";

interface LogPayload {
  stack: Stack;
  level: Level;
  package: Package;
  message: string;
}

const DEFAULT_LOG_API = "http://20.244.56.144/evaluation-service/logs";

function getEnv(name: string): string | undefined {
  try {
    // Only works in Node. In the browser this will throw or be undefined.
    // eslint-disable-next-line no-undef
    return (typeof process !== "undefined" && (process as any).env && (process as any).env[name]) || undefined;
  } catch {
    return undefined;
  }
}

const LOG_API = getEnv("LOG_API") || DEFAULT_LOG_API;
const LOG_API_KEY = getEnv("LOG_API_KEY");

export async function Log(stack: Stack, level: Level, pkg: Package, message: string) {
  const payload: LogPayload = { stack, level, package: pkg, message };

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

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (LOG_API_KEY) {
      headers["Authorization"] = `Bearer ${LOG_API_KEY}`;
    }

    const res = await axios.post(LOG_API, payload, { headers });
    if (res.status === 200) {
      console.info(`[LOGGED] ${JSON.stringify(payload)} → ${res.data.logID}`);
    }
  } catch (err: any) {
    console.error(`[LOG ERROR] Failed to log: ${message}`, err.message);
  }
}
