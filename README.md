# StackWatch 
## Website Monitoring + URL Shortener

A small monorepo with three packages:
- Backend (Express + TypeScript): URL shortener and basic website monitoring (pings URLs periodically and records status, latency, and size) with integrated logging middleware.
- Frontend (React + TypeScript + MUI): UI to create short URLs, start monitoring multiple URLs, and view stats.
- Logging Middleware (TypeScript): Small client used by both backend and frontend to send logs to a remote evaluation service (skips remote calls locally unless configured).

## Project Structure
```
/Backend Test Submission      # Express backend
/Frontend Test Submission     # React frontend
/Logging Middleware           # Shared logging helper
```

## Prerequisites
- Node.js 18+ and npm

## Setup
1) Install and build all subprojects
```bash
cd "Logging Middleware" && npm ci && npm run build
cd "../Backend Test Submission" && npm ci
cd "../Frontend Test Submission" && npm ci
```

2) Start backend (port 4000)
```bash
cd "Backend Test Submission"
npm run dev
```

3) Start frontend (port 3000)
```bash
cd "Frontend Test Submission"
npm start
```
Open http://localhost:3000

## Features
- URL Shortener
  - Create short links with optional custom shortcode and validity
  - Redirect and track clicks (timestamp, referrer)
  - Endpoints:
    - POST /shorturls
    - GET /shorturls/:shortcode
    - GET /:shortcode
- Website Monitoring (basic)
  - Submit one or more URLs to monitor
  - Backend probes each URL every 15s and records:
    - HTTP status (or null on error)
    - Latency (ms)
    - Response size (bytes, if available)
  - Endpoints:
    - POST /api/urls       # start monitoring a list of URLs
    - GET /api/stats       # fetch monitoring results (recent history per URL)
- Logging
  - Both backend and frontend call `logging-middleware` to log events
  - By default, remote logging is skipped locally to avoid 401s

## API Examples
Start monitoring 3 URLs:
```bash
curl -s -X POST http://localhost:4000/api/urls \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://example.com","https://httpstat.us/404","https://10.255.255.1"]}'
```
Fetch monitoring stats (wait ~15s for a probe cycle):
```bash
curl -s http://localhost:4000/api/stats | jq
```
Create a short URL:
```bash
curl -s -X POST http://localhost:4000/shorturls \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","validity":5}' | jq
```
Get short URL stats (replace CODE):
```bash
curl -s http://localhost:4000/shorturls/CODE | jq
```

## Frontend Usage
- Navigate to `/` to:
  - Enter multiple URLs
  - Click "Shorten" to create short links
  - Click "Start Monitoring" to begin probes and see latest status/latency/errors
- Navigate to `/stats` to:
  - Fetch shortener stats by shortcode
  - Fetch monitoring stats JSON

## Logging Configuration (optional)
The logger posts to a remote evaluation service when configured.
- Environment variables (backend shell):
```bash
export LOG_API_KEY=YOUR_TOKEN
export LOG_API=http://20.244.56.144/evaluation-service/logs  # optional override
```
If `LOG_API_KEY` is not set and `LOG_API` points to the default evaluation service, logging is skipped locally.

## Notes
- Monitoring and shortener data are stored in memory for simplicity; restarting the backend clears data.
- Probe interval is 15 seconds; history length is capped to the latest 50 entries per URL.
- For production, replace the in-memory stores with a database and consider background job processing.

## Scripts
- Backend
  - `npm run dev` — start Express with ts-node-dev
  - `npm run build` — compile TypeScript to `dist/`
- Frontend
  - `npm start` — start CRA dev server
  - `npm run build` — production build to `build/`
- Logging Middleware
  - `npm run build` — build with type declarations

## License
MIT
