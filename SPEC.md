# SPEC.md - ArgMetrics

## Descripción del proyecto
Aplicación web y mobile para visualizar datos económicos y sociales de Argentina en forma de series temporales, con gráficos interactivos y datos actualizados automáticamente.

---

## Objetivo
Recopilar y visualizar datos económicos de Argentina (inflación, dólar, desempleo, PBI, PBI per cápita, pobreza, etc) en dashboards y trends atractivos. Nuestro fuerte es la app mobile.

## Features Prioritarias
- [ ] App mobile como producto principal
- [ ] Dashboard con gráficos de trends
- [ ] Filtros: año inicio/fin, interanual, real/ajustado por inflación/nominal
- [ ] Base de datos propia + consumo de APIs externas (mezcla)
- [ ] Diseño atractivo visualmente

## Usuario Objetivo
Argentinos que quieren seguir la economía del país, analistas, inversores, curiosos.

## Tech Stack Preferido
- Mobile: React Native/Expo
- Backend: Node.js + Express + Supabase (PostgreSQL)
- Deploy: Vercel

---

## Arquitectura general

- Arquitectura híbrida: base de datos propia para datos históricos + consumo en vivo para datos que cambian frecuentemente
- Base de datos: PostgreSQL (Supabase)
- Cache para datos en vivo: tabla cache en Supabase con timestamp de expiración (o Redis si escala)
- Capa de ingesta separada del backend de la app
- Un solo backend API que expone todos los datos al frontend, independientemente de la fuente

---

## Modelo de datos

Todas las métricas siguen el mismo esquema base de serie temporal:

**metrics**
- id: UUID
- category: string (economy, social, consumption)
- name: string (inflation, usd_official, poverty, etc.)
- value: decimal
- date: date
- period_type: string (daily, monthly, quarterly, annually)
- source: string (INDEC, BCRA, CICCRA, etc.)
- created_at: timestamp
- updated_at: timestamp

**live_cache** (Tabla auxiliar para cache de datos en vivo)
- key: string (PK)
- value: jsonb
- fetched_at: timestamp
- expires_at: timestamp

**ingestion_log** (Tabla de log de ingestas)
- id: UUID
- source: string
- metric: string
- status: success / error / partial
- rows_processed: int
- error_message: text
- executed_at: timestamp

---

## Datos a incluir

### Grupo 1 — Economía (prioridad alta)

| Métrica | Fuente | Frecuencia | Estrategia |
|---------|--------|------------|------------|
| Inflación mensual (IPC) | INDEC | Mensual | Ingesta programada → BD |
| Inflación interanual | Calculado desde IPC | - | Calculado en query |
| Dólar oficial | BCRA API | Diaria | Ingesta diaria → BD |
| Dólar blue | bluelytics.com.ar | Tiempo real | En vivo + cache 30 min |
| Dólar MEP | Ámbito / Rava | Tiempo real | En vivo + cache 30 min |
| Dólar CCL | Ámbito / Rava | Tiempo real | En vivo + cache 30 min |
| Riesgo país (EMBI) | Ámbito / JP Morgan | Tiempo real | En vivo + cache 1 hora |
| Tasa de interés BCRA | BCRA API | Diaria | Ingesta diaria → BD |
| Reservas BCRA | BCRA API | Diaria | Ingesta diaria → BD |
| PBI total | INDEC / Banco Mundial | Anual | Ingesta manual → BD |
| PBI per cápita | INDEC / Banco Mundial | Anual | Ingesta manual → BD |
| Deuda externa | Ministerio de Economía | Trimestral | Ingesta programada → BD |

### Grupo 2 — Mercado laboral y social (prioridad media)

| Métrica | Fuente | Frecuencia | Estrategia |
|---------|--------|------------|------------|
| Pobreza (% población) | INDEC EPH | Semestral | Ingesta manual → BD |
| Indigencia (% población) | INDEC EPH | Semestral | Ingesta manual → BD |
| Desempleo | INDEC EPH | Trimestral | Ingesta programada → BD |
| Salario mínimo (SMVM) | Ministerio de Trabajo | Según paritarias | Ingesta manual → BD |
| Salario promedio registrado | INDEC | Mensual | Ingesta programada → BD |

### Grupo 3 — Consumo (prioridad media-baja)

| Métrica | Fuente | Frecuencia | Estrategia |
|---------|--------|------------|------------|
| Consumo de carne vacuna (kg/hab) | CICCRA | Mensual | Ingesta programada → BD |
| Consumo de leche (litros/hab) | OCLA | Mensual | Ingesta programada → BD |
| Producción industrial | INDEC | Mensual | Ingesta programada → BD |
| Ventas en supermercados | INDEC | Mensual | Ingesta programada → BD |
| Patentamiento de autos | ACARA | Mensual | Ingesta programada → BD |

---

## Capa de ingesta — requisitos

### Principios
- Cada ingesta logea su ejecución en ingestion_log (éxito, error, filas procesadas)
- Antes de guardar, validar que el dato tiene sentido (rango razonable, fecha correcta, no duplicado)
- Los parsers de Excel/PDF deben ser tolerantes a cambios de formato — INDEC cambia sus archivos sin aviso
- Si una ingesta falla, no debe romper las demás — fallos aislados
- Toda ingesta es idempotente: correrla dos veces no duplica datos

### Tipos de ingesta a implementar

**Tipo A — API con cron diario (BCRA, bluelytics para histórico):**
- Script que llama a la API, parsea el response y upsert en la base
- Cron: una vez por día en horario de baja actividad

**Tipo B — Descarga y parseo de Excel/CSV (INDEC, CICCRA, OCLA):**
- Script que descarga el archivo de la URL oficial, parsea las columnas relevantes y upsert
- Cron: según la frecuencia del dato (mensual, trimestral)
- Requiere mapeo explícito de columnas porque los archivos cambian

**Tipo C — Cache de datos en vivo (blue, MEP, CCL, riesgo país):**
- El backend verifica si el cache expiró antes de llamar a la API externa
- Si expiró: llama, guarda en live_cache, devuelve el dato
- Si no expiró: devuelve el cache directamente
- TTL por tipo: dólar blue = 30 min, riesgo país = 1 hora

**Tipo D — Carga manual (pobreza, indigencia, PBI, datos de publicación irregular):**
- Script o interfaz simple de admin para cargar datos cuando se publican
- El dato se valida antes de guardarse

---

## Backend API — requisitos

- Un endpoint unificado por métrica o grupo de métricas
- Soporte de parámetros: rango de fechas, período de agregación (diario/mensual/anual)
- Respuestas en formato JSON consistente con el shape estándar del proyecto
- Endpoint de health check que incluya estado de las últimas ingestas
- Rate limiting en endpoints públicos
- Cache de responses en endpoints de alta demanda

### Endpoints mínimos
```
GET /v1/metrics?category=economy&from=2020-01-01&to=2024-12-31
GET /v1/metrics/{name}?from=...&to=...&period=monthly
GET /v1/live/usd → dólar blue, MEP, CCL, oficial en tiempo real
GET /v1/live/country-risk → riesgo país en tiempo real
GET /v1/health → estado del sistema y últimas ingestas
```

---

## Frontend — requisitos

### Visualizaciones
- Gráfico de línea para series temporales (el tipo principal)
- Selector de rango de fechas interactivo
- Comparación de múltiples métricas en el mismo gráfico (eje dual si las escalas son muy distintas)
- Tabla de datos descargable (CSV)
- Indicadores de "último valor" con variación vs período anterior

### UX
- Los datos en vivo muestran el timestamp de última actualización
- Indicador de carga mientras se obtienen datos
- Estado de error con mensaje útil si una fuente falla (el resto sigue funcionando)
- Responsive: funciona en mobile y desktop

### Organización del dashboard
- Sección: Tipo de cambio (oficial, blue, MEP, CCL, brecha)
- Sección: Inflación (mensual, interanual, acumulada)
- Sección: Actividad (PBI, producción industrial, salarios)
- Sección: Social (pobreza, indigencia, desempleo)
- Sección: Consumo (carne, leche, autos, supermercados)
- Sección: Finanzas (riesgo país, reservas, tasa, deuda)

---

## Orden de implementación recomendado

### Fase 1 — Fundación (prioridad crítica)
1. Modelo de datos en PostgreSQL (tablas de series temporales, cache, log)
2. Ingesta tipo A: dólar oficial desde BCRA API
3. Ingesta tipo A: inflación desde INDEC API (si existe) o Excel
4. Backend API básico con los primeros endpoints
5. Dashboard con gráficos de las primeras métricas

### Fase 2 — Datos en vivo (prioridad alta)
6. Cache de dólar blue, MEP, CCL (bluelytics + ámbito)
7. Cache de riesgo país
8. Sección de tipo de cambio en el frontend con datos en vivo
9. Indicadores de último valor y variación

### Fase 3 — Datos históricos completos (prioridad media)
10. Ingesta de PBI, reservas, tasa de interés
11. Ingesta de pobreza, indigencia, desempleo (tipo D — manual)
12. Ingesta de consumo: carne (CICCRA), leche (OCLA)
13. Secciones restantes del dashboard

### Fase 4 — Calidad y extras (prioridad baja)
14. Interfaz de admin para carga manual de datos
15. Descarga de datos en CSV
16. Comparación de múltiples métricas en el mismo gráfico
17. Alertas cuando un dato nuevo es publicado
18. Modo oscuro

---

## Fuentes de datos — referencia

| Fuente | URL base | Tipo de acceso |
|--------|----------|----------------|
| BCRA | api.bcra.gob.ar | API REST oficial |
| INDEC | indec.gob.ar/indec/web/Nivel4-Tema | Excel/CSV descargable |
| Bluelytics | api.bluelytics.com.ar/v2/latest | API REST informal |
| Ámbito | ambito.com | Scraping o API no oficial |
| Banco Mundial | api.worldbank.org/v2 | API REST oficial |
| CICCRA | ciccra.com.ar | Excel descargable |
| OCLA | ocla.com.ar | Excel descargable |
| ACARA | acara.org.ar | PDF/Excel descargable |

---

## Consideraciones importantes

- INDEC cambia el formato de sus archivos sin aviso: los parsers deben validar columnas antes de procesar y loguear si el formato cambió
- Las APIs informales (bluelytics, ámbito) pueden caer: el sistema debe degradar elegantemente — si la fuente del blue falla, mostrar el último valor cacheado con timestamp
- Los datos históricos son lo más valioso: una vez cargados son estables — priorizá tenerlos completos y correctos
- No guardar datos en vivo con alta frecuencia: el tipo de cambio blue no necesita guardarse cada 30 minutos para siempre — guardar el cierre diario es suficiente para el histórico
