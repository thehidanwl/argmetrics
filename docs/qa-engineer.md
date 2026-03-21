# QA Engineer — ArgMetrics

## Estrategia de testing

### Backend (`backend/`)
- Framework: Vitest
- Correr todos los tests: `cd backend && npm test`
- Correr un test específico: `npm test -- --run tests/metricsController.test.ts`
- Los tests deben poder correr sin DB (usar mocks de Prisma)

### Mobile
- Testing manual en dispositivo físico (release build)
- Sin suite de tests automatizados actualmente
- Diagnóstico de crashes: ver `mobile-developer.md` — sección "Diagnóstico de crashes sin adb"

### Web
- `cd web && npm run lint` — ESLint
- Testing E2E pendiente

## Bugs conocidos abiertos

| ID | Área | Descripción | Severidad | Estado |
|----|------|-------------|-----------|--------|
| M-01 | Mobile | Tab bar icons no visibles (versionCode 16) | Media | Abierto |
| M-02 | Mobile | MEP/CCL estimados, no reales | Baja | Abierto |
| B-01 | Backend | Riesgo país sin ingesta automática (dato manual) | Media | Abierto |
| B-02 | Backend | Inflación sin ingesta automática de INDEC | Alta | Abierto |
| B-03 | Backend | IngestionLog no se usa en `/v1/ingest/usd` | Baja | Abierto |

## Bugs resueltos (referencia)

| ID | Descripción | Solución |
|----|-------------|----------|
| M-03 | App crashea en release (pantalla negra) | `react-native-gifted-charts <LineChart>` crashea en release. Reemplazado por View-based charts |
| M-04 | Pantalla blanca en DashboardScreen | `rates?.blue.sell` → `rates?.blue?.sell` (double optional chaining) |
| B-04 | `prepared statement "s0" already exists` | Agregar `pgbouncer=true` a la URL de conexión |
| B-05 | Prisma binary incompatible en Vercel | Agregar `rhel-openssl-3.0.x` a binaryTargets |

## Checklist de release mobile (antes de subir a Play Store)

**Build**
- [ ] versionCode incrementado
- [ ] versionName actualizado si corresponde
- [ ] Build `bundleRelease` exitoso sin warnings críticos

**Smoke test en dispositivo físico**
- [ ] App abre sin crash (pantalla negra o blanca)
- [ ] Dashboard carga datos (mock o real)
- [ ] Cotizaciones USD visibles
- [ ] Navegación entre tabs funciona
- [ ] App no crashea al navegar 30 segundos
- [ ] App funciona sin conexión a internet (muestra error gracioso)

**Datos**
- [ ] `/api/v1/health` responde `database.status: "connected"` en Vercel
- [ ] `/api/v1/live/usd` retorna datos sin `"mock": true`
- [ ] `/api/v1/metrics/inflation` retorna datos reales

## Checklist de deploy web/API (antes de pushear a master)

- [ ] `npm run lint` pasa sin errores en `web/` y `backend/`
- [ ] `npm test` pasa en `backend/`
- [ ] `/api/v1/health` funciona después del deploy
- [ ] El mock fallback sigue funcionando (no rompimos la lógica de fallback)

## Ambientes
- **Producción**: `https://argmetrics.vercel.app`
- **Local API**: `http://localhost:3000/v1`
- **Local web**: `http://localhost:3001`
- No hay ambiente de staging actualmente
