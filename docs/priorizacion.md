# Priorización de Features - 4 Fases de Implementación

## Visión General

El proyecto se implementa en 4 fases progresivas, desde la fundación hasta la calidad y extras. Cada fase construye sobre la anterior.

---

## Fase 1 — Fundación (Prioridad Crítica)

### Objetivo
Establecer la base técnica: modelo de datos, primeras ingestas, backend básico, dashboard inicial.

### Entregables

| ID | Entregable | Descripción |
|----|------------|-------------|
| F1.1 | Modelo de datos PostgreSQL | Tablas metrics, live_cache, ingestion_log |
| F1.2 | Ingesta dólar oficial (BCRA API) | Tipo A - cron diario |
| F1.3 | Ingesta inflación (INDEC) | Tipo A - mensual |
| F1.4 | Backend API básico | Endpoints GET /v1/metrics |
| F1.5 | Dashboard con primeras métricas | Gráficos de trends básicos |

### Métricas Incluidas
- Inflación mensual (IPC)
- Inflación interanual (calculada)
- Dólar oficial (BCRA)
- Tasa de interés BCRA
- Reservas BCRA

### Criterio de Éxito
App muestra gráficos funcionales con datos de al menos 3 métricas económicas core.

---

## Fase 2 — Datos en Vivo (Prioridad Alta)

### Objetivo
Implementar sistema de caché en tiempo real para tipos de cambio y riesgo país.

### Entregables

| ID | Entregable | Descripción |
|----|------------|-------------|
| F2.1 | Caché dólar blue (Bluelytics) | TTL 30 minutos |
| F2.2 | Caché dólar MEP/CCL | TTL 30 minutos |
| F2.3 | Caché riesgo país | TTL 1 hora |
| F2.4 | Endpoint /v1/live/usd | Todos los dólares en vivo |
| F2.5 | Endpoint /v1/live/country-risk | Riesgo país en vivo |
| F2.6 | Sección tipo de cambio en frontend | Dashboard en vivo |
| F2.7 | Indicadores de último valor | Timestamp de actualización |

### Métricas Incluidas
- Dólar blue
- Dólar MEP
- Dólar CCL
- Riesgo país (EMBI)

### Criterio de Éxito
Los tipos de cambio se actualizan en tiempo real con cacheo inteligente.

---

## Fase 3 — Datos Históricos Completos (Prioridad Media)

### Objetivo
Completar la base de datos con todas las métricas definidas (22 en total).

### Entregables

| ID | Entregable | Descripción |
|----|------------|-------------|
| F3.1 | Ingesta PBI y PBI per cápita | Tipo D - manual |
| F3.2 | Ingesta pobreza e indigencia | Tipo D - manual |
| F3.3 | Ingesta desempleo | Tipo A - trimestral |
| F3.4 | Ingesta salario mínimo (SMVM) | Tipo D - manual |
| F3.5 | Ingesta salario promedio registrado | Tipo A - mensual |
| F3.6 | Ingesta consumo carne (CICCRA) | Tipo B - Excel/CSV |
| F3.7 | Ingesta consumo leche (OCLA) | Tipo B - Excel/CSV |
| F3.8 | Ingesta producción industrial | Tipo A - mensual |
| F3.9 | Ingesta ventas en supermercados | Tipo A - mensual |
| F3.10 | Ingesta patentamiento autos (ACARA) | Tipo B - PDF/Excel |
| F3.11 | Ingesta deuda externa | Tipo A - trimestral |
| F3.12 | Secciones completas del dashboard | Todas las categorías |

### Métricas Incluidas
- PBI total
- PBI per cápita
- Pobreza
- Indigencia
- Desempleo
- Salario mínimo
- Salario promedio registrado
- Consumo de carne vacuna
- Consumo de leche
- Producción industrial
- Ventas en supermercados
- Patentamiento de autos
- Deuda externa

### Criterio de Éxito
Las 22 métricas están disponibles en la aplicación con datos históricos.

---

## Fase 4 — Calidad y Extras (Prioridad Baja)

### Objetivo
Mejoras de UX, admin, exportación y polish final.

### Entregables

| ID | Entregable | Descripción |
|----|------------|-------------|
| F4.1 | Interfaz de admin | Carga manual de datos |
| F4.2 | Exportación CSV | Descarga de datos históricos |
| F4.3 | Comparación de métricas | Gráfico con eje dual |
| F4.4 | Alertas de nuevos datos | Notificaciones push |
| F4.5 | Modo oscuro | Theme completo |
| F4.6 | Modo claro | Theme alternativo |
| F4.7 | Optimizaciones de performance | Lazy loading, memoización |

### Criterio de Éxito
App lista para producción con features premium.

---

## Matriz de Priorización MoSCoW por Fase

### Fase 1 (Must Have)
| Feature | Categoría |
|---------|-----------|
| Dashboard con 5 indicadores principales | M-01 |
| Gráficos de trends interactivos | M-02 |
| Filtro rango de fechas | M-03 |
| Base de datos Supabase | M-05 |
| Consumo APIs (BCRA, INDEC) | M-06 |
| Tema oscuro | M-08 |
| Navegación bottom tabs | M-09 |

### Fase 2 (Should Have)
| Feature | Categoría |
|---------|-----------|
| Datos en vivo (blue, MEP, CCL) | S-01 |
| Riesgo país en vivo | S-02 |
| Indicadores de última actualización | S-03 |
| Pull-to-refresh | S-04 |

### Fase 3 (Should Have - extensión)
| Feature | Categoría |
|---------|-----------|
| 22 métricas completas | S-05 |
| Secciones del dashboard por categoría | S-06 |
| Filtro interanual vs. acumulado | S-07 |
| Filtro real vs. nominal | S-08 |

### Fase 4 (Could Have)
| Feature | Categoría |
|---------|-----------|
| Interfaz admin | C-01 |
| Exportación CSV | C-02 |
| Comparación de métricas | C-03 |
| Notificaciones push | C-04 |
| Tema claro | C-05 |

---

## Dependencias entre Fases

```
Fase 1 (Fundación)
    ↓
Fase 2 (Datos en Vivo)
    ↓
Fase 3 (Históricos Completos)
    ↓
Fase 4 (Calidad y Extras)
```

**Notas:**
- Fase 1 es prerequisito para todo
- Fase 2 y 3 pueden paralelizar parcialmente
- Fase 4 requiere todas las anteriores

---

## Timeline Sugerido

| Fase | Duración | Entregable Principal |
|------|----------|---------------------|
| Fase 1 | 3-4 semanas | MVP funcional |
| Fase 2 | 2-3 semanas | Tipos de cambio en vivo |
| Fase 3 | 3-4 semanas | 22 métricas disponibles |
| Fase 4 | 2 semanas | App lista para producción |

**Total estimado: 10-13 semanas**

---

*Revisar priorización según feedback y avances reales del proyecto.*
