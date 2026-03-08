# Plan de Trabajo - ArgMetrics

## Visión General

Proyecto de aplicación web y mobile para visualizar datos económicos de Argentina. Stack: React Native/Expo + Node.js/Express + Supabase + Vercel.

---

## Progreso Actual

### Fase 1 — Fundación

#### 1.1 Configuración del Proyecto
- [x] 1.1.1 Estructura de carpetas del proyecto (monorepo: /backend + /mobile)
- [x] 1.1.2 Contrato de API documentado en docs/api-contract.md
- [x] 1.1.3 Setup Git (repo, .gitignore, conventional commits)
- [ ] 1.1.4 Configurar Vercel para deploy

#### 1.2 Modelo de Datos (PostgreSQL/Supabase)
- [x] 1.2.1 Crear tabla **metrics** (id, category, name, value, date, period_type, source, created_at, updated_at)
- [x] 1.2.2 Crear tabla **live_cache** (key, value, fetched_at, expires_at)
- [x] 1.2.3 Crear tabla **ingestion_log** (id, source, metric, status, rows_processed, error_message, executed_at)
- [ ] 1.2.4 Configurar políticas RLS en Supabase
- [x] 1.2.5 Crear tipos TypeScript para las entidades

#### 1.3 Ingesta Tipo A - APIs con Cron
- [x] 1.3.1 Script ingesta dólar oficial (BCRA API)
- [x] 1.3.2 Script ingesta inflación (INDEC)
- [ ] 1.3.3 Script ingesta tasa de interés BCRA
- [ ] 1.3.4 Script ingesta reservas BCRA
- [x] 1.3.5 Implementar logging en ingestion_log
- [ ] 1.3.6 Configurar cron jobs (daily)

#### 1.4 Backend API
- [x] 1.4.1 Setup Express + TypeScript (estructura creada)
- [x] 1.4.2 Endpoint GET /v1/metrics?category=&from=&to=
- [x] 1.4.3 Endpoint GET /v1/metrics/{name}?from=&to=&period=
- [x] 1.4.4 Endpoint GET /v1/health
- [x] 1.4.5 Rate limiting básico
- [ ] 1.4.6 Deploy a Vercel

#### 1.5 Frontend - Core (Mobile)
- [x] 1.5.1 Setup React Navigation (bottom tabs)
- [x] 1.5.2 Configurar tema oscuro (dark mode)
- [x] 1.5.3 Estructura de componentes creada
- [x] 1.5.4 API client y store Zustand
- [x] 1.5.5 Implementar Dashboard con primeras métricas
- [x] 1.5.6 Filtro rango de fechas (año inicio/fin)

---

## Fase 2 — Datos en Vivo (Semana 5-7)

### 2.1 Sistema de Caché
- [x] 2.1.1 Implementar lógica de cache en backend
- [x] 2.1.2 Configurar TTL (30 min dólar, 1 hora riesgo país)
- [x] 2.1.3 Fallback a último valor si API falla

### 2.2 Ingesta Tipo C - Datos en Vivo
- [ ] 2.2.1 Integrar Bluelytics API (dólar blue)
- [ ] 2.2.2 Integrar API dólar MEP/CCL (Ámbito/Rava)
- [ ] 2.2.3 Integrar riesgo país (JP Morgan/Ámbito)
- [ ] 2.2.4 Guardar cierre diario en tabla metrics

### 2.3 Endpoints en Vivo
- [x] 2.3.1 Endpoint GET /v1/live/usd (blue, MEP, CCL, oficial)
- [x] 2.3.2 Endpoint GET /v1/live/country-risk

### 2.4 Frontend - Sección Tipo de Cambio
- [x] 2.4.1 Dashboard de tipos de cambio en vivo
- [x] 2.4.2 Indicador de última actualización
- [x] 2.4.3 Mostrar timestamp de datos cacheados
- [x] 2.4.4 Auto-refresh con polling (cada 30s)

---

## Fase 3 — Datos Históricos Completos (Semana 8-11)

### 3.1 Ingesta Tipo D - Carga Manual
- [ ] 3.1.1 Script ingesta PBI total (Banco Mundial/INDEC)
- [ ] 3.1.2 Script ingesta PBI per cápita
- [ ] 3.1.3 Script ingesta pobreza (INDEC EPH)
- [ ] 3.1.4 Script ingesta indigencia (INDEC EPH)
- [ ] 3.1.5 Script ingesta salario mínimo (SMVM)

### 3.2 Ingesta Programadas Adicionales
- [ ] 3.2.1 Script ingesta desempleo (INDEC - trimestral)
- [ ] 3.2.2 Script ingesta salario promedio registrado
- [ ] 3.2.3 Script ingesta producción industrial
- [ ] 3.2.4 Script ingesta ventas en supermercados
- [ ] 3.2.5 Script ingesta deuda externa (Min. Economía)

### 3.3 Ingesta Tipo B - Excel/CSV
- [ ] 3.3.1 Script ingesta consumo carne (CICCRA - Excel)
- [ ] 3.3.2 Script ingesta consumo leche (OCLA - Excel)
- [ ] 3.3.3 Script ingesta patentamiento autos (ACARA - PDF/Excel)
- [ ] 3.3.4 Manejo de cambios de formato (parsers tolerantes)
- [ ] 3.3.5 Validación de datos antes de guardar

### 3.4 Frontend - Dashboard Completo
- [ ] 3.4.1 Sección: Inflación (mensual, interanual, acumulada)
- [ ] 3.4.2 Sección: Actividad (PBI, producción industrial, salarios)
- [ ] 3.4.3 Sección: Social (pobreza, indigencia, desempleo)
- [ ] 3.4.4 Sección: Consumo (carne, leche, autos, supermercados)
- [ ] 3.4.5 Sección: Finanzas (riesgo país, reservas, tasa, deuda)

### 3.5 Filtros Avanzados
- [ ] 3.5.1 Toggle interanual vs. mensual
- [ ] 3.5.2 Toggle real vs. nominal (ajustado por inflación)
- [ ] 3.5.3 Persistencia de filtros

---

## Fase 4 — Calidad y Extras (Semana 12-13)

### 4.1 Interfaz de Admin
- [ ] 4.1.1 Dashboard de administración
- [ ] 4.1.2 Formulario de carga manual de datos
- [ ] 4.1.3 Visualización de ingestion_log
- [ ] 4.1.4 Estados de ingestas (success/error/partial)

### 4.2 Exportación y Análisis
- [ ] 4.2.1 Exportar datos a CSV
- [ ] 4.2.2 Comparación de múltiples métricas
- [ ] 4.2.3 Gráfico con eje dual para escalas distintas

### 4.3 UX/UI
- [ ] 4.3.1 Modo claro (light theme)
- [ ] 4.3.2 Animaciones de transiciones
- [ ] 4.3.3 Skeleton loaders
- [ ] 4.3.4 Pull-to-refresh

### 4.4 Notificaciones
- [ ] 4.4.1 Sistema de alertas
- [ ] 4.4.2 Notificaciones cuando se publica nuevo dato

### 4.5 Performance
- [ ] 4.5.1 Lazy loading de gráficos
- [ ] 4.5.2 Memoización de componentes
- [ ] 4.5.3 Optimización de queries

### 4.6 QA y Launch
- [ ] 4.6.1 Tests unitarios (>70% coverage)
- [ ] 4.6.2 Build de producción (iOS + Android)
- [ ] 4.6.3 Metadata para stores

---

## Estado del Proyecto

**Último commit:** dc058a1 - feat: add ingestion scripts and mobile config
**Rama:** master
**Repositorio:** https://github.com/thehidanwl/argmetrics

### Pendiente - Requiere Acción de Jashin:

1. **Crear proyecto en Supabase:**
   - Crear nuevo proyecto en supabase.com
   - Obtener DATABASE_URL
   - Ejecutar `npx prisma db push` para crear tablas

2. **Configurar Vercel:**
   - Importar el repositorio en Vercel
   - Configurar variables de entorno (DATABASE_URL, etc.)
   - Deploy del backend

3. **Assets del Mobile:**
   - Crear icon.png, splash.png, adaptive-icon.png, favicon.png reales

---

*Actualizado: 2026-03-08 - Fase 1 casi completa, Fase 2 completa*
