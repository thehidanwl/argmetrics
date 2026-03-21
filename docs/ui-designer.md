# UI Designer — ArgMetrics

## Identidad visual
- **Estilo**: dark theme, datos financieros, confiable y limpio
- **Paleta**: fondos oscuros, acentos verdes/teal para valores positivos, rojos para negativos, amarillo para alertas
- **Tipografía web**: DM Sans (UI) + JetBrains Mono (números/datos)

## Design system (Web — CSS variables en `web/src/app/globals.css`)
```css
--bg-primary       /* fondo principal */
--bg-secondary     /* cards, panels */
--bg-tertiary      /* inputs, hover states */
--text-primary     /* texto principal */
--text-secondary   /* texto secundario, labels */
--text-muted       /* placeholders, timestamps */
--accent-green     /* valores positivos, aumento */
--accent-red       /* valores negativos, caída */
--accent-blue      /* links, info */
--border-primary   /* bordes de cards */
```

Los componentes usan Tailwind utilities + estas variables. No usar colores hardcodeados.

## Mobile — Paleta de colores
```ts
// Valores positivos (subida de precio, crecimiento)
rgba(16, 185, 129, 0.6)   // verde esmeralda

// Valores negativos (caída, deflación)
rgba(239, 68, 68, 0.6)    // rojo

// Neutro / oficial
rgba(161, 161, 170, 0.45) // zinc

// Acento primario
#10b981  // emerald-500

// Fondo cards
#1c1c1e  // iOS-style dark

// Texto secundario
#8e8e93
```

## Componentes existentes (Web — `web/src/components/`)
```
layout/     Header, Sidebar, Layout wrapper
ui/         Button, Badge, Spinner, etc.
cards/      MetricCard, KPICard, ExchangeCard
charts/     LineChart (Recharts), Sparkline
```

## Reglas de UX para datos económicos
- **Siempre mostrar**: valor + variación (absoluta o %) + fecha de actualización + fuente
- **Variaciones**: verde si positivo es bueno para el usuario, rojo si es malo (inflación alta = rojo aunque el número sea "positivo")
- **Números**: usar separadores de miles (1.785 no 1785), 2 decimales para porcentajes, 0 decimales para valores enteros grandes
- **Timestamps**: "Actualizado hace 5 min" es mejor que "14:32:17 UTC"
- **Loading states**: skeleton loaders, nunca spinners sin contexto
- **Error states**: mostrar el último dato conocido + indicador de "datos desactualizados"

## Limitaciones mobile actuales
- **NO usar SVG** para charts en release (crashea en Android release mode) — usar View-based bars
- Tab bar icons no visibles en versionCode 16 — issue pendiente de resolver

## Pantallas mobile actuales
- **Dashboard**: KPIs principales (inflación, riesgo país), cotizaciones USD con sparklines
- **Exchange Rates**: tabla completa de cotizaciones + gráfico de evolución (barras View-based)
- **Metrics**: lista de todos los indicadores con filtros por categoría
- **Settings**: alertas configurables (guardadas en AsyncStorage)

## Patrones de diseño para datos temporales
- Sparklines (mini-charts): 7-10 puntos, sin ejes, solo tendencia visual
- Charts de evolución: eje Y siempre con dominio auto, mostrar mínimo 6 meses
- Tablas de cotizaciones: buy/sell siempre juntos, brecha cambiaria destacada
