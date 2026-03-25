# Ahora mismo — ArgMetrics

> **Claude Code debe actualizar este archivo al final de cada sesión** con el estado real del proyecto: qué se hizo, qué quedó pendiente, qué cambió. El dueño del proyecto puede editarlo antes de empezar una sesión para describir el foco del día.

---

## Última sesión — 2026-03-25

### Qué se hizo
- Implementada arquitectura de navegación nueva del spec.md desde cero
- `CustomBottomBar` dinámico: Level 0 = 4 categorías, Level 1/2 = Home + indicadores de la categoría activa
- `navStore` (Zustand) para el estado de navegación separado del store de métricas
- `NavigationContainerRef` en App.tsx para que CustomBottomBar navegue desde fuera del Navigator
- `HomeScreen`: KPIs (dólar blue, inflación, riesgo país, oficial), CTA "Comparar gobiernos", shortcuts por categoría
- `CategoryScreen`: lista de indicadores con sparklines y último valor
- `IndicatorScreen`: chips multi-select, temporalidad (M/IA/Acum/Mandato), toggle Real/Nominal, gráfico View-based con bandas de mandato, tabla de datos colapsable
- Catálogo de 13 indicadores (`data/indicators.ts`) con chips, toggles, fuentes y metadatos
- Datos de mandatos presidenciales (`data/mandatos.ts`): Kirchner → Milei con colores de partido
- Cálculos derivados: interanual y acumulado client-side
- Tipos extendidos en `types/index.ts`: AppCategory, TemporalityMode, IndicatorDef, ChipDef, Mandato, etc.

### Estado del proyecto hoy
- **Mobile**: código nuevo en master. Necesita build de release para verificar en dispositivo físico (versionCode 16 = viejo código).
- **API**: funcional, DB conectada, datos reales de USD via Bluelytics
- **Ingesta**: solo USD automático. Inflación, riesgo país, reservas = manuales/seed
- **Web**: funcional, sin cambios recientes

### Lo que falta implementar del spec.md

**Alta prioridad (siguiente sesión):**
- [ ] Build de release con nuevo código (versionCode 17)
- [ ] Verificar que CustomBottomBar funciona en release (no usa SVG — debería estar OK)
- [ ] Ingesta automática de inflación (INDEC Excel)
- [ ] Ingesta automática de tasas y reservas (BCRA API)
- [ ] Ingesta automática de riesgo país

**Media prioridad:**
- [ ] Modo mandato: comparación indexada base 100 con presidentes seleccionables
- [ ] Bottom sheet ⚙️ con controles avanzados (rango fechas, fuente alternativa)
- [ ] Export PNG (marca de agua, formato X + stories)
- [ ] DashboardScreen viejo → puede retirarse (reemplazado por HomeScreen)
- [ ] ExchangeRatesScreen viejo → puede convertirse en sub-pantalla de IndicatorScreen "Dólar"
- [ ] MEP/CCL con precio real (no estimado)

**Baja prioridad:**
- [ ] Pinch-to-zoom en charts
- [ ] "Comparar gobiernos" CTA (conectar al modo mandato)
- [ ] Tab icons (aún sin resolver el styling issue)
- [ ] iOS build

### Ideas para no perder
- El IndicatorScreen tiene `Platform` importado pero no usado — limpiarlo
- La pantalla "Dólar" debería ser el primer indicador que funciona bien, ya que tenemos datos de USD en la DB
- El `genSparkline` en CategoryScreen es random en cada render — mejorar con datos reales cuando estén disponibles
