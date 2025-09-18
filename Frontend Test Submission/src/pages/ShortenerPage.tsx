import React, { useState } from "react";
import { Button, Grid, Typography } from "@mui/material";
import UrlForm from "../components/UrlForm";
import UrlCard from "../components/UrlCard";
import { createShortUrl, startMonitoring, getMonitoringStats } from "../services/api";
import { Log } from "logging-middleware";

export default function ShortenerPage() {
  const [urls, setUrls] = useState([{ url: "", validity: "", shortcode: "" }]);
  const [results, setResults] = useState<any[]>([]);
  const [monitoring, setMonitoring] = useState<any[]>([]);

  const handleAdd = () => {
    if (urls.length < 5) setUrls([...urls, { url: "", validity: "", shortcode: "" }]);
  };

  const handleChange = (i: number, field: string, value: string) => {
    const newUrls = [...urls];
    (newUrls[i] as any)[field] = value;
    setUrls(newUrls);
  };

  const handleSubmit = async () => {
    const res: any[] = [];
    for (const u of urls) {
      try {
        const r = await createShortUrl(u);
        res.push(r);
        await Log("frontend", "info", "component", `Short URL created: ${r.shortLink}`);
      } catch (err: any) {
        await Log("frontend", "error", "api", `Failed to shorten: ${u.url}`);
      }
    }
    setResults(res);
  };

  const handleStartMonitoring = async () => {
    try {
      const list = urls.map((u) => u.url).filter(Boolean);
      await startMonitoring(list);
      await Log("frontend", "info", "component", `Monitoring started for ${list.length} urls`);
      const stats = await getMonitoringStats();
      setMonitoring(stats.items || []);
    } catch (err: any) {
      await Log("frontend", "error", "api", `Failed to start monitoring`);
    }
  };

  return (
    <Grid container spacing={2} padding={2}>
      {urls.map((u, i) => (
        <UrlForm key={i} index={i} data={u} onChange={handleChange} />
      ))}
      <Button onClick={handleAdd}>Add URL</Button>
      <Button onClick={handleSubmit} variant="contained">Shorten</Button>
      <Button onClick={handleStartMonitoring} variant="outlined">Start Monitoring</Button>

      {results.map((r, i) => (
        <UrlCard key={`short-${i}`} shortLink={r.shortLink} expiry={r.expiry} />
      ))}

      {monitoring.map((m: any, i: number) => {
        const last = (m.history || [])[m.history.length - 1];
        return (
          <UrlCard
            key={`mon-${i}`}
            url={m.url}
            status={last?.status}
            latencyMs={last?.latencyMs}
            error={last?.error}
          />
        );
      })}
    </Grid>
  );
}
