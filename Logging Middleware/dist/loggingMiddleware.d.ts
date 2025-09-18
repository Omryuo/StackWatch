type Stack = "backend" | "frontend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type Package = "auth" | "config" | "middleware" | "utils" | "cache" | "controller" | "cron_job" | "db" | "domain" | "handler" | "repository" | "route" | "service" | "component" | "hook" | "page" | "state" | "style" | "api";
export declare function Log(stack: Stack, level: Level, pkg: Package, message: string): Promise<void>;
export {};
