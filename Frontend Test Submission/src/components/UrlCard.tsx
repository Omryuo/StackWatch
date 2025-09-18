import React from "react";
import { Card, Typography } from "@mui/material";

export default function UrlCard({ shortLink, expiry, url, status, latencyMs, error }: any) {
  if (url) {
    return (
      <Card style={{ padding: 16, marginTop: 16 }}>
        <Typography>URL: {url}</Typography>
        <Typography>Status: {status ?? "ERR"}</Typography>
        <Typography>Latency: {typeof latencyMs === "number" ? `${latencyMs} ms` : "-"}</Typography>
        {error && <Typography color="error">Error: {error}</Typography>}
      </Card>
    );
  }

  return (
    <Card style={{ padding: 16, marginTop: 16 }}>
      <Typography>Short Link: <a href={shortLink}>{shortLink}</a></Typography>
      <Typography>Expires: {new Date(expiry).toLocaleString()}</Typography>
    </Card>
  );
}
