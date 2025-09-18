import React, { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import { getStats, getMonitoringStats } from "../services/api";
import { Log } from "logging-middleware";

export default function StatsPage() {
  const [code, setCode] = useState("");
  const [stats, setStats] = useState<any | null>(null);
  const [monitoring, setMonitoring] = useState<any[]>([]);

  const handleFetch = async () => {
    try {
      const data = await getStats(code);
      setStats(data);
      await Log("frontend", "info", "page", `Fetched stats for: ${code}`);
    } catch {
      await Log("frontend", "error", "api", `Failed to fetch stats for: ${code}`);
    }
  };

  const handleFetchMonitoring = async () => {
    try {
      const s = await getMonitoringStats();
      setMonitoring(s.items || []);
    } catch {}
  };

  return (
    <div style={{ padding: 20 }}>
      <TextField label="Shortcode" value={code} onChange={(e) => setCode(e.target.value)} />
      <Button onClick={handleFetch} variant="contained">Get Stats</Button>
      <Button onClick={handleFetchMonitoring} style={{ marginLeft: 8 }}>Get Monitoring Stats</Button>

      {stats && (
        <div>
          <Typography>Original URL: {stats.url}</Typography>
          <Typography>Total Clicks: {stats.totalClicks}</Typography>
          <Typography>Expiry: {new Date(stats.expiry).toLocaleString()}</Typography>
          <pre>{JSON.stringify(stats.clicks, null, 2)}</pre>
        </div>
      )}

      {monitoring.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Typography variant="h6">Monitoring</Typography>
          <pre>{JSON.stringify(monitoring, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
