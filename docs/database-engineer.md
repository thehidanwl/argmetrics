# Database Engineer — ArgMetrics

## Stack
- **DB**: PostgreSQL via Supabase (producción)
- **ORM**: Prisma
- **Schema**: `backend/prisma/schema.prisma`
- **Local dev**: SQLite (descomentar datasource alternativo en schema.prisma)

## Conexión en producción
Usar el **Supabase pooler** (puerto 6543), no la conexión directa (5432).
La URL debe incluir `?pgbouncer=true` — Supabase usa PgBouncer en modo transaction que no soporta prepared statements:

```
postgres://postgres.[ref]:[pass]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x&pgbouncer=true
```

En `api/index.ts` esto se aplica en runtime:
```ts
if (databaseUrl && !databaseUrl.includes('pgbouncer=true')) {
  databaseUrl += (databaseUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
}
```

## Schema

### Metric
Tabla unificada para todas las series temporales. No hay tablas separadas por indicador.
```prisma
model Metric {
  id          String   @id           // determinístico: "${name}-${date}" ej: "inflation-2026-02-01"
  category    String                 // "economy" | "social" | "consumption"
  name        String                 // "inflation" | "usd_oficial" | "country_risk" | etc.
  value       Float
  date        DateTime
  periodType  String   @default("monthly")  // "daily" | "monthly" | "quarterly"
  source      String                 // "INDEC" | "BCRA" | "Bluelytics" | "JPMorgan"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### LiveCache
Cache de datos live (USD, riesgo país). Alternativa a in-memory para persistir entre invocaciones frías de Vercel.
```prisma
model LiveCache {
  key       String   @id    // "usd_rates" | "country_risk"
  value     String          // JSON serializado
  fetchedAt DateTime @default(now())
  expiresAt DateTime
}
```

### IngestionLog
Auditoría de cada corrida de ingesta.
```prisma
model IngestionLog {
  id            String   @id @default(uuid())
  source        String   // "BCRA" | "INDEC" | "Bluelytics"
  metric        String   // nombre de la métrica ingestada
  status        String   // "success" | "error" | "partial"
  rowsProcessed Int      @default(0)
  errorMessage  String?
  executedAt    DateTime @default(now())
}
```

## Convenciones de IDs
Los IDs de `Metric` son determinísticos para permitir upserts idempotentes:
- Daily: `inflation-2026-03-21`
- Monthly: `inflation-2026-02` (primer día del mes en la date)
- Quarterly: `gdp-2025-Q4` o `gdp-2025-12-31`

## Comandos Prisma
```bash
cd backend
npm run db:generate   # regenera el cliente después de cambiar schema
npm run db:push       # aplica schema a la DB sin migración (dev)
npm run db:migrate    # crea y aplica migración (producción)
```

## Binaries para Vercel
Vercel Lambda corre en Amazon Linux (RHEL). El schema debe incluir:
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}
```
Y `vercel.json` debe incluir `"includeFiles": "node_modules/.prisma/client/**"`.

## Índices actuales
- `Metric`: `category`, `name`, `date`
- `IngestionLog`: `source`, `metric`, `status`

## Agregar una nueva métrica
1. No se necesita cambiar el schema — `Metric` es genérica
2. Definir un nombre en snake_case: `wage_index`, `construction_index`, etc.
3. Elegir `category` y `periodType` apropiados
4. Crear endpoint de ingesta en `api/index.ts`
5. Agregar mock data al array `mockMetrics`
