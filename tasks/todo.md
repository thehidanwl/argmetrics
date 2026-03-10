# Plan de Trabajo - ArgMetrics

## Visión General

Proyecto de aplicación web y mobile para visualizar datos económicos de Argentina. Stack: React Native/Expo + Node.js/Express + SQLite local + Vercel.

---

## Progreso Actual

### Fase 1 — Fundación

#### 1.1 Configuración del Proyecto
- [x] 1.1.1 Estructura de carpetas del proyecto (monorepo: /backend + /mobile)
- [x] 1.1.2 Contrato de API documentado en docs/api-contract.md
- [x] 1.1.3 Setup Git (repo, .gitignore, conventional commits)
- [x] 1.1.4 Backend ejecutándose localmente

#### 1.2 Modelo de Datos (SQLite local)
- [x] 1.2.1 Crear tabla **metrics** (id, category, name, value, date, period_type, source, created_at, updated_at)
- [x] 1.2.2 Crear tabla **live_cache** (key, value, fetched_at, expires_at)
- [x] 1.2.3 Crear tabla **ingestion_log** (id, source, metric, status, rows_processed, error_message, executed_at)
- [x] 1.2.4 Base de datos SQLite local funcionando
- [x] 1.2.5 Crear tipos TypeScript para las entidades

#### 1.3 Ingesta Tipo A - APIs con Cron
- [x] 1.3.1 Script ingesta dólar oficial (BCRA API) - estructura
- [x] 1.3.2 Script ingesta inflación (INDEC) - estructura
- [ ] 1.3.3 Script ingesta tasa de interés BCRA
- [ ] 1.3.4 Script ingesta reservas BCRA
- [x] 1.3.5 Implementar logging en ingestion_log
- [ ] 1.3.6 Configurar cron jobs (daily)

#### 1.4 Backend API
- [x] 1.4.1 Setup Express + TypeScript
- [x] 1.4.2 Endpoint GET /v1/metrics?category=&from=&to=
- [x] 1.4.3 Endpoint GET /v1/metrics/{name}?from=&to=&period=
- [x] 1.4.4 Endpoint GET /v1/health
- [x] 1.4.5 Rate limiting básico
- [x] 1.4.6 Base de datos SQLite local funcionando
- [x] 1.4.7 GET /v1/metrics/categories
- [x] 1.4.8 GET /v1/metrics/available
- [x] 1.4.9 GET /v1/live/usd
- [x] 1.4.10 GET /v1/ingest/usd (cron)
- [x] 1.4.11 GET /v1/ingest/inflation (cron)

#### 1.5 Frontend - Core (Mobile)
- [x] 1.5.1 Setup React Navigation (bottom tabs)
- [x] 1.5.2 Configurar tema oscuro (dark mode)
- [x] 1.5.3 Estructura de componentes creada
- [x] 1.5.4 API client y store Zustand
- [x] 1.5.5 Implementar Dashboard con primeras métricas
- [x] 1.5.6 Filtros y datos de fallback

---

## Fase 2 — Datos en Vivo

### 2.1 Sistema de Caché
- [x] 2.1.1 Implementar lógica de cache en backend
- [x] 2.1.2 Configurar TTL (30 min dólar, 1 hora riesgo país)
- [x] 2.1.3 Fallback a último valor si API falla

### 2.2 Endpoints en Vivo
- [x] 2.2.1 Endpoint GET /v1/live/usd
- [x] 2.2.2 Endpoint GET /v1/live/country-risk

### 2.3 Ingestión de Datos (Cron Jobs)
- [x] 2.3.1 GET /v1/ingest/usd (Bluelytics API)
- [x] 2.3.2 GET /v1/ingest/inflation (INDEC)
- [ ] 2.3.3 GET /v1/ingest/interest-rate (BCRA)
- [ ] 2.3.4 Configurar Vercel Cron jobs

### 2.3 Frontend - Sección Tipo de Cambio
- [x] 2.3.1 Dashboard de tipos de cambio
- [x] 2.3.2 Indicador de última actualización
- [x] 2.3.3 Datos de fallback si el servidor no responde

---

## Estado del Proyecto

**Último commit:** 453d7a9 - docs: update todo.md with progress
**Rama:** master
**Repositorio:** https://github.com/thehidanwl/argmetrics
**Backend:** Corriendo en http://localhost:3001

### Pendiente - Requiere Acción de Jashin:

1. **Probar la app mobile:**
   - Ejecutar `cd mobile && npm install && npx expo start`
   - Probar la app en el emulador

2. **Migrar a Supabase (cuando el proyecto esté funcionando):**
   - Cambiar provider en prisma/schema.prisma a "postgresql"
   - Actualizar DATABASE_URL
   - Ejecutar `npx prisma db push`

3. **Configurar Vercel (cuando esté listo para producción):**
   - Importar el repositorio en Vercel
   - Configurar variables de entorno
   - Deploy del backend

---

## Cómo ejecutar

### Backend:
```bash
cd backend
npm install
npx prisma db push  # Crear base de datos SQLite
npm run dev          # Iniciar en http://localhost:3001
```

### Mobile:
```bash
cd mobile
npm install
npx expo start      # Iniciar Expo
```

---

*Actualizado: 2026-03-08 - Backend funcionando con SQLite local*
