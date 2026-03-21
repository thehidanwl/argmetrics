# Data Researcher — ArgMetrics

## Fuentes de datos activas

### Bluelytics (`https://api.bluelytics.com.ar/v2/latest`)
- **Datos**: USD oficial buy/sell, USD blue buy/sell, EUR oficial, EUR blue
- **Frecuencia**: tiempo real (actualiza cada ~15 min)
- **Formato**: JSON limpio, estable
- **Uso actual**: `/v1/live/usd` y `/v1/ingest/usd`
- **Costo**: gratuito, sin auth

### BCRA API (`https://api.bcra.gob.ar`)
- **Datos**: tasas de interés, reservas internacionales, base monetaria, tipo de cambio oficial
- **Endpoints útiles**:
  - `/estadisticas/v2.0/datosvariable/1/{desde}/{hasta}` — reservas
  - `/estadisticas/v2.0/datosvariable/7/{desde}/{hasta}` — base monetaria
  - `/estadisticas/v2.0/datosvariable/6/{desde}/{hasta}` — tipo de cambio BNA
- **Frecuencia**: diaria (días hábiles)
- **Formato**: JSON, requiere header `Accept: application/json`
- **Estado**: no implementado aún en ingesta

### INDEC
- **Datos**: inflación (IPC), PBI, pobreza, desempleo, ventas minoristas (CAME), índice de producción industrial
- **Formato**: archivos Excel/CSV descargados de la web. **Cambian el formato sin aviso previo.**
- **URLs de descarga**: varían por publicación. No hay API oficial.
- **Frecuencia**: mensual (inflación), trimestral (PBI, pobreza, empleo)
- **Estado**: parsers pendientes. Requiere validar columnas antes de procesar.
- **Regla crítica**: siempre validar que las columnas esperadas existen antes de parsear.

### JPMorgan / Ámbito (Riesgo País)
- **Datos**: EMBI+ Argentina (riesgo país en puntos básicos)
- **Fuente real**: no hay API pública de JPMorgan. Se suele scrapear Ámbito o Cronista.
- **Estado actual**: datos manuales en DB seed (no hay ingesta automática)
- **Pendiente**: identificar fuente scrapeabe o API de tercero

## Indicadores por implementar (roadmap)

| Indicador | Fuente | Frecuencia | Prioridad |
|-----------|--------|-----------|-----------|
| Inflación mensual IPC | INDEC | Mensual | Alta |
| Tasas BCRA (LELIQ/PASES) | BCRA API | Diaria | Alta |
| Reservas internacionales | BCRA API | Diaria | Alta |
| Riesgo país (EMBI+) | Ámbito scrape | Diaria | Alta |
| PBI trimestral | INDEC | Trimestral | Media |
| Pobreza / Indigencia | INDEC | Semestral | Media |
| Desempleo | INDEC | Trimestral | Media |
| Ventas minoristas | CAME / INDEC | Mensual | Media |
| Dólar MEP / CCL real | MAE / BYMA | Diaria | Alta |
| Balanza comercial | INDEC | Mensual | Baja |
| Recaudación impositiva | AFIP | Mensual | Baja |
| Salarios (RIPTE) | MECON | Mensual | Media |
| Índices provinciales | INDEC / provincias | Variable | Baja |

## MEP y CCL
- **Fuente oficial**: MAE (Mercado Abierto Electrónico) y BYMA para el precio implícito
- **Situación actual**: estimados como % del blue (MEP ~98%, CCL ~99%) — no es preciso
- **Pendiente**: implementar cálculo real via precio de GD30 o acceso a API de broker
- **Alternativa**: scrapear cotizaciones de IOL, Balanz o similar

## Consideraciones para datos de INDEC
- Los archivos Excel de INDEC cambian estructura entre publicaciones
- Siempre leer y validar columnas antes de parsear valores
- Guardar el archivo original en S3/Storage antes de procesar (para auditoría)
- Los datos de pobreza se publican con 6-9 meses de retraso

## Datos históricos para Tier Pro
Para ofrecer histórico desde 2015 necesitamos:
1. Inflación mensual desde 2015 — disponible en INDEC (aunque hubo intervención estadística 2007-2015)
2. USD blue histórico — Bluelytics tiene API histórica (`/v2/evolution.json`)
3. Riesgo país histórico — necesita fuente o carga manual
4. Tasas BCRA — API estadística tiene datos desde 2003
