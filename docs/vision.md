# Vision — ArgMetrics

## Qué es
ArgMetrics es una app móvil (con web complementaria) que centraliza todos los indicadores económicos, sociales y de mercado de Argentina en un solo lugar. El usuario puede ver inflación, dólar, riesgo país, pobreza, empleo, reservas, tasas, PBI y más — en tiempo real o con histórico — sin tener que buscar en múltiples fuentes oficiales.

## Problema que resuelve
La información económica de Argentina está dispersa: INDEC, BCRA, MECON, Bluelytics, Ámbito, portales provinciales. No existe una app que unifique todo con buena UX, datos actualizados y contexto histórico.

## Público objetivo
- Ciudadanos que quieren entender qué pasa con la economía
- Inversores y analistas que necesitan datos rápidos
- Periodistas y estudiantes de economía
- Emprendedores y empresas que toman decisiones con estos datos

## Modelo de negocio

### Tier Free
- Indicadores principales: dólar (oficial/blue/MEP/CCL), inflación mensual, riesgo país
- Histórico limitado (últimos 6 meses)
- Alertas básicas (1 alerta activa)
- Sin exportación

### Tier Pro (monetización futura)
- Todos los indicadores: empleo, PBI, pobreza, ventas minoristas, reservas, tasas, índices provinciales
- Histórico completo desde 2015
- Alertas ilimitadas con push notifications
- Exportación de datos (CSV, JSON)
- Widgets de pantalla de inicio
- Sin publicidad
- Comparación entre períodos (interanual, contra gobierno anterior, etc.)

## Dirección del producto
1. **Fase 1 (actual)**: core económico — dólar, inflación, riesgo país, tasas. App funcional en Play Store.
2. **Fase 2**: completar indicadores sociales, añadir histórico rico, mejorar charts.
3. **Fase 3**: monetización Pro, alertas push, widgets.
4. **Fase 4**: cobertura provincial, comparativas regionales, proyecciones.

## Principios de diseño del producto
- Datos primero: cada número visible debe tener fuente y fecha explícitas
- Velocidad: live data con cache agresivo, no esperar 3 segundos para ver el dólar
- Sin fricción: abrir la app y ver los datos. Sin registro obligatorio para el tier free
- Confianza: mostrar siempre la fuente (INDEC, BCRA, Bluelytics, JPMorgan)
