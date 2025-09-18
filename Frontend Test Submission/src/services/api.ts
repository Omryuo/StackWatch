import axios from "axios";

const API_BASE = "http://localhost:4000";

export async function createShortUrl({ url, validity, shortcode }: any) {
  const res = await axios.post(`${API_BASE}/shorturls`, { url, validity, shortcode });
  return res.data;
}

export async function getStats(code: string) {
  const res = await axios.get(`${API_BASE}/shorturls/${code}`);
  return res.data;
}

// Monitoring API
export async function startMonitoring(urls: string[]) {
  const res = await axios.post(`${API_BASE}/api/urls`, { urls });
  return res.data;
}

export async function getMonitoringStats() {
  const res = await axios.get(`${API_BASE}/api/stats`);
  return res.data;
}
