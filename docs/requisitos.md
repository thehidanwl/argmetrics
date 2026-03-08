# Requisitos Funcionales y No Funcionales - ArgMetrics

## Requisitos Funcionales

### RF-01: Visualización de Indicadores Económicos
- **RF-01.01** La app debe mostrar gráficos de trends para las 22 métricas definidas (inflación, dólar, PBI, pobreza, etc.)
- **RF-01.02** Cada indicador debe tener su propia vista detail con historial de datos.
- **RF-01.03** Los gráficos deben ser interactivos (zoom, pan, tooltip con valores).

### RF-02: Sistema de Filtros
- **RF-02.01** Filtro de rango de fechas (año inicio - año fin).
- **RF-02.02** Filtro de tipo de dato: interanual (YoY) vs. mensual/acumulado.
- **RF-02.03** Filtro de valor: real (ajustado por inflación) vs. nominal.
- **RF-02.04** Los filtros deben persistir entre sesiones.

### RF-03: Dashboard Principal
- **RF-03.01** Dashboard con vista resumida de los indicadores por categoría.
- **RF-03.02** Tarjetas de resumen con valor actual, variación vs. período anterior.
- **RF-03.03** Navegación rápida entre indicadores desde el dashboard.

### RF-04: Gestión de Datos
- **RF-04.01** Consumo de APIs externas (BCRA, INDEC, Bluelytics, etc.) para datos en tiempo real.
- **RF-04.02** Base de datos propia (Supabase/PostgreSQL) para caché y datos históricos.
- **RF-04.03** Sistema de caché con TTL configurable (30 min para dólar, 1 hora para riesgo país).
- **RF-04.04** Log de ingestas para auditoría y diagnóstico.

---

## Modelo de Datos

### Tabla: metrics (Series temporales)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| category | string | economy, social, consumption |
| name | string | inflation, usd_official, poverty, etc. |
| value | decimal | Valor numérico |
| date | date | Fecha del dato |
| period_type | string | daily, monthly, quarterly, annually |
| source | string | INDEC, BCRA, CICCRA, etc. |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de actualización |

### Tabla: live_cache (Caché de datos en vivo)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| key | string | PK - identificador del dato |
| value | jsonb | Valor cacheado |
| fetched_at | timestamp | Cuándo se obtuvo |
| expires_at | timestamp | Cuándo expira el cache |

### Tabla: ingestion_log (Log de ingestas)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| source | string | Fuente del dato |
| metric | string | Métrica ingestada |
| status | string | success, error, partial |
| rows_processed | int | Filas procesadas |
| error_message | text | Mensaje de error si falló |
| executed_at | timestamp | Cuándo se ejecutó |

---

## Tipos de Ingesta

### Tipo A - API con cron diario
- Script que llama a APIs (BCRA, bluelytics histórico)
- Ejecución: una vez por día en horario de baja actividad
- Ejemplo: dólar oficial, inflación

### Tipo B - Descarga y parseo de Excel/CSV
- Script que descarga archivos de INDEC, CICCRA, OCLA
- Requiere mapeo explícito de columnas
- Tolerante a cambios de formato

### Tipo C - Caché de datos en vivo
- Verifica TTL antes de llamar a API externa
- TTL: dólar blue = 30 min, riesgo país = 1 hora
- Si expira: llama, guarda, devuelve
- Si no expira: devuelve cache

### Tipo D - Carga manual
- Interfaz de admin para datos de publicación irregular
- Pobreza, indigencia, PBI, etc.
- Validación antes de guardar

---

## Endpoints del Backend API

```
GET /v1/metrics?category=economy&from=2020-01-01&to=2024-12-31
GET /v1/metrics/{name}?from=...&to=...&period=monthly
GET /v1/live/usd → dólar blue, MEP, CCL, oficial en tiempo real
GET /v1/live/country-risk → riesgo país en tiempo real
GET /v1/health → estado del sistema y últimas ingestas
```

### Requisitos de API
- Formato JSON consistente
- Parámetros: rango de fechas, período de agregación
- Rate limiting en endpoints públicos
- Cache de responses en alta demanda

---

## 22 Métricas por Grupos

### Grupo 1 — Economía (12 métricas)
| Métrica | Fuente | Frecuencia | Tipo Ingesta |
|---------|--------|------------|--------------|
| Inflación mensual (IPC) | INDEC | Mensual | A |
| Inflación interanual | Calculado | - | Query |
| Dólar oficial | BCRA API | Diaria | A |
| Dólar blue | Bluelytics | Tiempo real | C (30min) |
| Dólar MEP | Ámbito/Rava | Tiempo real | C (30min) |
| Dólar CCL | Ámbito/Rava | Tiempo real | C (30min) |
| Riesgo país (EMBI) | JP Morgan | Tiempo real | C (1h) |
| Tasa de interés BCRA | BCRA API | Diaria | A |
| Reservas BCRA | BCRA API | Diaria | A |
| PBI total | INDEC/BM | Anual | D |
| PBI per cápita | INDEC/BM | Anual | D |
| Deuda externa | Min. Economía | Trimestral | A |

### Grupo 2 — Mercado laboral y social (5 métricas)
| Métrica | Fuente | Frecuencia | Tipo Ingesta |
|---------|--------|------------|--------------|
| Pobreza | INDEC EPH | Semestral | D |
| Indigencia | INDEC EPH | Semestral | D |
| Desempleo | INDEC EPH | Trimestral | A |
| Salario mínimo (SMVM) | Min. Trabajo | Según paritarias | D |
| Salario promedio registrado | INDEC | Mensual | A |

### Grupo 3 — Consumo (5 métricas)
| Métrica | Fuente | Frecuencia | Tipo Ingesta |
|---------|--------|------------|--------------|
| Consumo de carne vacuna | CICCRA | Mensual | B |
| Consumo de leche | OCLA | Mensual | B |
| Producción industrial | INDEC | Mensual | A |
| Ventas en supermercados | INDEC | Mensual | A |
| Patentamiento de autos | ACARA | Mensual | B |

---

## Fuentes de Datos

| Fuente | URL base | Tipo de acceso |
|--------|----------|----------------|
| BCRA | api.bcra.gob.ar | API REST oficial |
| INDEC | indec.gob.ar | Excel/CSV descargable |
| Bluelytics | api.bluelytics.com.ar/v2 | API REST informal |
| Ámbito | ambito.com | Scraping/API no oficial |
| Banco Mundial | api.worldbank.org/v2 | API REST oficial |
| CICCRA | ciccra.com.ar | Excel descargable |
| OCLA | ocla.com.ar | Excel descargable |
| ACARA | acara.org.ar | PDF/Excel descargable |

---

## Requisitos No Funcionales

### RNF-01: Performance
- **RNF-01.01** Dashboard carga en menos de 2 segundos.
- **RNF-01.02** Gráficos a 60fps durante interacciones.
- **RNF-01.03** Tiempo de respuesta APIs propias < 500ms.

### RNF-02: Compatibilidad
- **RNF-02.01** iOS 14+ y Android 8+ (API 26+).
- **RNF-02.02** Responsive: phones y tablets.

### RNF-03: Disponibilidad
- **RNF-03.01** Modo offline con últimos datos cacheados.
- **RNF-03.02** Graceful degradation: si una API falla, mostrar fallback.

### RNF-04: Seguridad
- **RNF-04.01** HTTPS obligatorio.
- **RNF-04.2** No almacenar credenciales en texto plano.

### RNF-05: Mantenibilidad
- **RNF-05.01** Código modular con separación de responsabilidades.
- **RNF-05.02** Tests unitarios覆盖率 > 70%.

---

*Documento vivo: actualizar según evolución del proyecto.*
