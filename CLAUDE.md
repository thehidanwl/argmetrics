# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ArgMetrics is an Argentine economic data visualization platform (web + mobile). It aggregates metrics like inflation, USD exchange rates, country risk, poverty, and employment from official sources (INDEC, BCRA) and live APIs (bluelytics, Ámbito).

## Monorepo Structure

```
argmetrics/
├── backend/     Node.js + Express API (port 3000)
├── web/         Next.js web frontend (deployed to Vercel)
├── mobile/      React Native + Expo mobile app
└── api/         Vercel serverless functions for cron ingestion
```

## Commands

### Backend
```bash
cd backend
npm run dev          # Start dev server with tsx watch
npm test             # Run all tests with Vitest
npm test -- --run tests/metricsController.test.ts  # Run single test file
npm run build        # Compile TypeScript
npm run lint         # ESLint
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Push schema to DB
npm run db:migrate   # Run migrations
```

### Web
```bash
cd web
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint
```

### Mobile
```bash
cd mobile
npm start            # Start Expo dev server
npm run android      # Run on Android
npm run ios          # Run on iOS
```

## Backend Architecture

The Express API (`backend/src/index.ts`) exposes four route groups:

| Prefix | Module | Purpose |
|--------|--------|---------|
| `/v1/metrics` | `routes/metrics.ts` | Historical time series data |
| `/v1/live` | `routes/live.ts` | Real-time USD rates and country risk |
| `/v1/ingest` | `routes/ingest.ts` | Data ingestion endpoints (stricter rate limit: 10/min) |
| `/v1/health` | `routes/health.ts` | System health + last ingestion status |

Swagger UI is available at `/api-docs` in development.

**Mock mode**: The database (`backend/src/config/database.ts`) is currently stubbed to return `null` — all controllers check `isDatabaseConnected()` and fall back to mock data from `backend/src/config/mockData.ts`. To enable real DB, configure `POSTGRES_URL` and restore the actual Prisma initialization.

**Rate limiting**: 100 req/min general, 10 req/min on `/v1/ingest`.

## Data Model

Three Prisma models (PostgreSQL via Supabase in production):

- **Metric** — unified time-series table for all economic indicators. Key fields: `category` (economy/social/consumption), `name` (inflation, usd_official, etc.), `value`, `date`, `periodType`, `source`
- **LiveCache** — key/value cache with `expiresAt` for real-time data (USD blue TTL: 30 min, country risk: 60 min)
- **IngestionLog** — audit log for each ingestion run (success/error/partial, rows processed)

## Ingestion Architecture

Ingestion runs as Vercel cron jobs (defined in `vercel.json`):
- USD official: daily at 7:00 UTC via `/api/v1/ingest/usd`
- Inflation: 1st of each month at 8:00 UTC via `/api/v1/ingest/inflation`

All ingestion must be **idempotent** (upsert, not insert) and log to `IngestionLog`. INDEC changes file formats without notice — parsers must validate columns before processing.

## Web Frontend

Next.js app router (`web/src/app/`). Uses a dark-themed design system with CSS custom properties (`var(--bg-primary)`, `var(--text-primary)`, etc.) defined in `globals.css`. Components use Tailwind utilities combined with these CSS variables.

Pages: `/` (dashboard), `/metrics`, `/exchange`, `/settings`.

The web API client (`web/src/lib/api.ts`) calls the backend. The API base URL must be configured for production — currently defaults to relative paths for Vercel deployment.

## Mobile Architecture

Expo + React Native with tab navigation. Global state managed by Zustand (`mobile/src/store/metricsStore.ts`) — all API calls and loading/error states live in `useMetricsStore`. Charts use `react-native-gifted-charts`.

## Environment Setup

Copy `backend/.env.example` to `backend/.env` and set:
- `POSTGRES_URL` — Supabase PostgreSQL connection string
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — for Supabase client
- External API URLs are pre-filled (BCRA, bluelytics)

## API Response Shape

All endpoints return a consistent JSON shape:
```json
{
  "data": ...,
  "pagination": { "total": 0, "limit": 1000, "offset": 0, "hasMore": false },
  "mock": true   // present only when returning mock fallback data
}
```
Errors: `{ "error": { "code": "ERROR_CODE", "message": "..." } }`
