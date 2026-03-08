# API Contract - ArgMetrics

## Base URL
```
Production: https://argmetrics-api.vercel.app
Staging: https://argmetrics-api-staging.vercel.app
Local: http://localhost:3000
```

## Versioning
All endpoints use `/v1/` prefix. Breaking changes require version bump.

---

## Endpoints

### 1. GET /v1/metrics

Get time series metrics with optional filters.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| category | string | No | Filter by category: `economy`, `social`, `consumption` |
| name | string | No | Filter by metric name (e.g., `inflation`, `usd_official`) |
| from | string | No | Start date (ISO 8601: `YYYY-MM-DD`) |
| to | string | No | End date (ISO 8601: `YYYY-MM-DD`) |
| period | string | No | Aggregation: `daily`, `monthly`, `quarterly`, `annually` |
| limit | number | No | Max results (default: 1000, max: 10000) |
| offset | number | No | Pagination offset (default: 0) |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "category": "economy",
      "name": "inflation",
      "value": 6.2,
      "date": "2024-01-01",
      "periodType": "monthly",
      "source": "INDEC",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 1000,
    "offset": 0,
    "hasMore": true
  }
}
```

**Response 400:**
```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Invalid date format. Use YYYY-MM-DD"
  }
}
```

---

### 2. GET /v1/metrics/:name

Get specific metric time series.

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| name | string | Metric name (e.g., `inflation`, `usd_blue`, `poverty`) |

**Query Parameters:** Same as `/v1/metrics`

**Response 200:**
```json
{
  "data": {
    "name": "inflation",
    "category": "economy",
    "description": "Índice de Precios al Consumidor (IPC) - Inflation rate",
    "unit": "percentage",
    "latest": {
      "value": 6.2,
      "date": "2024-01-01",
      "variation": 2.1,
      "variationType": "monthly"
    },
    "series": [
      {
        "date": "2024-01-01",
        "value": 6.2
      }
    ]
  }
}
```

**Response 404:**
```json
{
  "error": {
    "code": "METRIC_NOT_FOUND",
    "message": "Metric 'xyz' does not exist"
  }
}
```

---

### 3. GET /v1/live/usd

Get real-time USD exchange rates (cached).

**Response 200:**
```json
{
  "data": {
    "official": {
      "buy": 820.50,
      "sell": 860.50,
      "updatedAt": "2024-01-15T14:30:00Z"
    },
    "blue": {
      "buy": 1020.00,
      "sell": 1040.00,
      "updatedAt": "2024-01-15T14:25:00Z"
    },
    "mep": {
      "buy": 985.00,
      "sell": 995.00,
      "updatedAt": "2024-01-15T14:20:00Z"
    },
    "ccl": {
      "buy": 1010.00,
      "sell": 1025.00,
      "updatedAt": "2024-01-15T14:20:00Z"
    },
    "brecha": {
      "value": 20.5,
      "unit": "percentage"
    }
  },
  "cached": true,
  "expiresAt": "2024-01-15T15:00:00Z"
}
```

---

### 4. GET /v1/live/country-risk

Get country risk (EMBI Argentina) - cached.

**Response 200:**
```json
{
  "data": {
    "value": 1850,
    "unit": "basis_points",
    "variation": -15,
    "variationType": "daily",
    "updatedAt": "2024-01-15T14:00:00Z"
  },
  "cached": true,
  "expiresAt": "2024-01-15T15:00:00Z"
}
```

---

### 5. GET /v1/health

Health check with ingestion status.

**Response 200:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 86400,
  "timestamp": "2024-01-15T14:30:00Z",
  "database": {
    "status": "connected",
    "latencyMs": 12
  },
  "ingestions": {
    "lastSuccess": {
      "source": "bcra",
      "metric": "usd_official",
      "executedAt": "2024-01-15T04:00:00Z",
      "rowsProcessed": 1
    },
    "lastError": {
      "source": "indec",
      "metric": "inflation",
      "executedAt": "2024-01-14T04:00:00Z",
      "errorMessage": "Failed to parse Excel file"
    }
  }
}
```

---

### 6. GET /v1/metrics/categories

Get available categories.

**Response 200:**
```json
{
  "data": [
    {
      "name": "economy",
      "description": "Economic indicators",
      "metricsCount": 12
    },
    {
      "name": "social",
      "description": "Social indicators",
      "metricsCount": 5
    },
    {
      "name": "consumption",
      "description": "Consumption indicators",
      "metricsCount": 4
    }
  ]
}
```

---

### 7. GET /v1/metrics/available

Get list of all available metrics.

**Response 200:**
```json
{
  "data": [
    {
      "name": "inflation",
      "category": "economy",
      "description": "Índice de Precios al Consumidor",
      "unit": "percentage",
      "periodType": "monthly",
      "source": "INDEC",
      "dateRange": {
        "from": "2017-01-01",
        "to": "2024-01-01"
      }
    },
    {
      "name": "usd_official",
      "category": "economy",
      "description": "Dólar Oficial BCRA",
      "unit": "ars",
      "periodType": "daily",
      "source": "BCRA",
      "dateRange": {
        "from": "2020-01-01",
        "to": "2024-01-15"
      }
    }
  ]
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_PARAMETER | 400 | Invalid query parameter |
| METRIC_NOT_FOUND | 404 | Metric does not exist |
| CATEGORY_NOT_FOUND | 404 | Category does not exist |
| INTERNAL_ERROR | 500 | Server error |
| RATE_LIMITED | 429 | Too many requests |
| SERVICE_UNAVAILABLE | 503 | External service unavailable |

---

## Rate Limiting

- **Public endpoints:** 100 requests/minute per IP
- **Authenticated:** 1000 requests/minute
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Authentication

Currently not required for read endpoints. Future versions may add API keys for higher rate limits.

---

## Caching Strategy

| Endpoint | Cache TTL |
|----------|-----------|
| /v1/metrics | 5 minutes |
| /v1/live/usd | 30 minutes |
| /v1/live/country-risk | 1 hour |
| /v1/health | 1 minute |
| /v1/metrics/categories | 1 hour |
| /v1/metrics/available | 1 hour |

---

## Response Shape Standard

All responses follow this structure:

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
}

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
```
