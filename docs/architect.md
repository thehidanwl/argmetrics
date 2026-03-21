# Architect — ArgMetrics

## Stack
| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Mobile | React Native + Expo 52 | Cross-platform, OTA updates, ecosistema amplio |
| Web | Next.js (App Router) | SEO, SSR, misma lógica que mobile |
| API | Express (dev) / Vercel Serverless (prod) | Un solo `api/index.ts` sirve todo en Vercel |
| Base de datos | PostgreSQL via Supabase | Managed, free tier, buena integración con Prisma |
| ORM | Prisma | Type-safety, migraciones, compatible con PgBouncer |
| Deployment | Vercel | Crons, serverless functions, CI automático |
| Estado mobile | Zustand | Simple, sin boilerplate Redux |
| Charts web | Recharts | Declarativo, SSR-compatible |
| Charts mobile | View-based (custom) | react-native-svg crashea en release — ver `mobile-developer.md` |

## Estructura del monorepo
```
argmetrics/
├── backend/      Express API para desarrollo local (puerto 3000)
├── web/          Next.js, desplegado como static export en Vercel
├── mobile/       Expo + React Native
├── api/          Vercel serverless handler (único punto de entrada en prod)
└── docs/         Contexto del proyecto para Claude Code
```

## Flujo de datos
```
Fuentes externas              API (api/index.ts)              Clientes
──────────────                ──────────────────              ────────
Bluelytics API  ──────────►  fetchBluelyticsRates()  ──────► Mobile
BCRA API        ──────────►  /v1/ingest/*             ──────► Web
INDEC (archivos)──────────►  Supabase DB
                             LiveCache (in-memory + DB)
```

## Decisiones de arquitectura

### Un solo handler en Vercel (`api/index.ts`)
En lugar de múltiples funciones Vercel, todo el routing pasa por un único handler. Simplifica el deploy y la lógica de CORS/middleware. Las rewrites en `vercel.json` redirigen `/api/(.*)` a `/api`.

### Mock fallback obligatorio
Cada endpoint que toca la DB tiene fallback a mock data. Esto permite que la app funcione aunque la DB esté caída o no configurada. El campo `"mock": true` en la respuesta indica que se está usando mock.

### Cache en dos niveles
Live data (USD rates, country risk) se cachea:
1. In-memory dentro de la Vercel function (dura mientras el container está caliente)
2. En `LiveCache` tabla de Supabase (persiste entre invocaciones frías)

### PgBouncer — regla crítica
Supabase usa PgBouncer en modo transaction. Prisma debe conectar con `?pgbouncer=true` en la URL. Sin esto: `prepared statement "s0" already exists`. La URL se modifica en runtime en `api/index.ts` antes de pasarla a `PrismaClient({ datasources: { db: { url } } })`.

## Modelos de datos
Ver `database-engineer.md` para el schema completo.

## Consideraciones para Free vs Pro
- El backend debe soportar autenticación JWT para identificar usuarios Pro
- Los endpoints de datos históricos extendidos deben estar protegidos por middleware de auth
- Supabase Auth es el candidato natural para manejar usuarios
- La lógica free/pro debe estar en el API, nunca solo en el cliente
