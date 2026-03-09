# API Contract - ArgMetrics

## Base URL
```
Production: https://argmetrics.vercel.app
Local: http://localhost:3000
```

## Versioning
All endpoints use `/v1/` prefix. Breaking changes require version bump.

---

## Endpoints

### 1. GET /v1/health

Health check with database connection status.

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T14:30:00Z",
  "database": "connected"
}
```

---

### 2. GET /v1/metrics

Get time series metrics with optional filters.
**Data source:** PostgreSQL (Supabase) via Prisma

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| category | string | No | Filter by category: `economy`, `social`, `consumption` |
| name | string | No | Filter by metric name (e.g., `inflation`, `usd_oficial`, `usd_blue`) |
| from | string | No | Start date (ISO 8601: `YYYY-MM-DD`) |
| to | string | No | End date (ISO 8601: `YYYY-MM-DD`) |
| limit | number | No | Max results (default: 100, max: 10000) |
| offset | number | No | Pagination offset (default: 0) |

**Response 200:**
```json
{
  "data": [
    {
      "id": "usd_oficial-2024-01-15",
      "category": "economy",
      "name": "usd_oficial",
      "value": 820.50,
      "date": "2024-01-15T00:00:00Z",
      "periodType": "daily",
      "source": "Bluelytics",
      "createdAt": "2024-01-15T04:00:00Z",
      "updatedAt": "2024-01-15T04:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 3. GET /v1/metrics/categories

Get available categories with metric count.

**Response 200:**
```json
{
  "data": [
    {
      "name": "economy",
      "metricsCount": 15
    }
  ]
}
```

---

### 4. GET /v1/metrics/available

Get list of all available metrics with date ranges.

**Response 200:**
```json
{
  "data": [
    {
      "name": "inflation",
      "category": "economy",
      "source": "INDEC",
      "periodType": "monthly",
      "dateRange": {
        "from": "2023-01-01",
        "to": "2025-01-01"
      }
    },
    {
      "name": "usd_oficial",
      "category": "economy",
      "source": "Bluelytics",
      "periodType": "daily",
      "dateRange": {
        "from": "2024-01-01",
        "to": "2025-03-09"
      }
    }
  ]
}
```

---

### 5. GET /v1/live/usd

Get real-time USD exchange rates.
**Data source:** Bluelytics API (https://api.bluelytics.com.ar/v2/latest)
**Cache:** 30 minutes

**Response 200:**
```json
{
  "data": {
    "oficial": {
      "buy": 1390,
      "sell": 1441,
      "updatedAt": "2026-03-09T16:00:55.877104-03:00"
    },
    "blue": {
      "buy": 1405,
      "sell": 1425,
      "updatedAt": "2026-03-09T16:00:55.877104-03:00"
    },
    "oficial_euro": {
      "buy": 1511,
      "sell": 1566,
      "updatedAt": "2026-03-09T16:00:55.877104-03:00"
    },
    "blue_euro": {
      "buy": 1527,
      "sell": 1549,
      "updatedAt": "2026-03-09T16:00:55.877104-03:00"
    },
    "brecha": {
      "value": "-1.11",
      "unit": "%"
    }
  },
  "cached": false,
  "fetchedAt": "2026-03-09T19:15:00Z",
  "expiresAt": "2026-03-09T19:45:00Z"
}
```

---

## Cron Jobs (Internal)

These endpoints are called by Vercel Cron for data ingestion.

### 6. GET /v1/ingest/usd

Ingest daily USD rates from Bluelytics.
**Schedule:** Daily at 7:00 AM Argentina time
**Requires:** `Authorization: Bearer {CRON_SECRET}` header

**Response 200:**
```json
{
  "success": true,
  "records": 2,
  "timestamp": "2026-03-09T07:00:00Z"
}
```

### 7. GET /v1/ingest/inflation

Ingest monthly inflation data from INDEC.
**Schedule:** Monthly on the 1st at 8:00 AM Argentina time
**Requires:** `Authorization: Bearer {CRON_SECRET}` header

**Response 200:**
```json
{
  "success": true,
  "records": 25,
  "timestamp": "2026-03-01T08:00:00Z"
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_PARAMETER | 400 | Invalid query parameter |
| METRIC_NOT_FOUND | 404 | Metric does not exist |
| INTERNAL_ERROR | 500 | Server error |
| SERVICE_UNAVAILABLE | 503 | External service unavailable |

---

## Rate Limiting

- **Public endpoints:** 100 requests/minute per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Caching Strategy

| Endpoint | Cache TTL |
|----------|-----------|
| /v1/metrics | No cache (direct DB) |
| /v1/live/usd | 30 minutes |
| /v1/health | No cache |
| /v1/metrics/categories | 1 hour |
| /v1/metrics/available | 1 hour |

---

## Data Sources

| Metric | Source | Update Frequency |
|--------|--------|------------------|
| usd_oficial | Bluelytics API | Daily |
| usd_blue | Bluelytics API | Daily |
| inflation | INDEC IPC | Monthly |

---

## Response Shape Standard

```typescript
interface ApiResponse<T> {
  data: T;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  cached?: boolean;
  expiresAt?: string;
  fetchedAt?: string;
}

interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
```
