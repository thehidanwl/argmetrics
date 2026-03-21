# Backend Developer — ArgMetrics

## Dónde vive el código
- **Producción**: `api/index.ts` — único Vercel serverless handler
- **Desarrollo local**: `backend/src/` — Express app completa (puerto 3000)

En producción todo pasa por `api/index.ts`. El código de `backend/` es para desarrollo local y testing.

## Endpoints actuales (`api/index.ts`)

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/v1/health` | Estado DB, latencia, modo (production/mock) |
| GET | `/v1/metrics` | Lista métricas (filtros: category, name, from, to, limit, offset) |
| GET | `/v1/metrics/categories` | Categorías disponibles con conteo |
| GET | `/v1/metrics/available` | Métricas disponibles con rango de fechas |
| GET | `/v1/metrics/:name` | Serie temporal de una métrica específica |
| GET | `/v1/live/usd` | Cotizaciones USD en tiempo real (Bluelytics) |
| GET | `/v1/live/country-risk` | Riesgo país (desde DB Metric) |
| POST | `/v1/ingest/usd` | Ingesta USD desde Bluelytics → guarda en Metric |
| POST | `/v1/ingest/seed` | Carga datos iniciales en la DB |

## Patrón de respuesta
```json
{ "data": ..., "pagination": { "total": 0, "limit": 100, "offset": 0, "hasMore": false } }
{ "data": ..., "mock": true }   // cuando usa mock fallback
{ "error": { "code": "ERROR_CODE", "message": "..." } }  // errores
```

## Patrón mock fallback
Cada endpoint:
1. Intenta la operación con `prisma` (si está inicializado)
2. Si falla o retorna vacío → usa los arrays/objetos `mock*` definidos al inicio del archivo
3. Agrega `"mock": true` a la respuesta

Nunca eliminar el fallback — la app debe funcionar aunque la DB no esté disponible.

## Cómo agregar un nuevo endpoint
1. Agregar la ruta en `api/index.ts` (con su bloque `if (path.includes('/v1/...')`)
2. Definir mock data para ese endpoint
3. Implementar la query Prisma con `tryDb()` wrapper
4. Fallback a mock si `!prisma` o si `tryDb` retorna null
5. Replicar la misma lógica en `backend/src/routes/` para desarrollo local

## Ingestion pipeline
- **Bluelytics**: `fetchBluelyticsRates()` → `/v1/ingest/usd` guarda `usd_oficial` y `usd_blue` en `Metric`
- **Inflation**: cron mensual → `/v1/ingest/inflation` (a implementar con INDEC)
- Toda ingesta debe ser **idempotente**: usar `upsert` con `id` determinístico (`${name}-${date}`)
- Toda ingesta debe loguear en `IngestionLog`

## Reglas críticas
- `pgbouncer=true` en la URL de conexión — nunca sacar esto (ver `architect.md`)
- Rate limiting: 100 req/min general, 10 req/min en `/v1/ingest`
- CORS: `Access-Control-Allow-Origin: *` en todos los endpoints
- Las Vercel cron calls NO llevan `CRON_SECRET` actualmente — si se agrega auth a crons, usar header `Authorization: Bearer ${CRON_SECRET}`

## Variables de entorno requeridas
```
POSTGRES_URL      Supabase connection string (pooler, puerto 6543)
CRON_SECRET       Secret para autenticar llamadas de cron
```
