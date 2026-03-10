# ArgMetrics - UI Design Specification

## 1. Design System

### 1.1 Color Palette
```typescript
colors: {
  // Primary
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',  // Main primary
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  
  // Backgrounds
  background: {
    primary: '#0D1117',    // Main dark bg
    secondary: '#161B22',   // Card bg
    tertiary: '#21262D',    // Elevated surfaces
  },
  
  // Text
  text: {
    primary: '#F0F6FC',    // Main text
    secondary: '#8B949E',   // Secondary text
    muted: '#6E7681',       // Disabled/placeholder
  },
  
  // Semantic
  semantic: {
    success: { light: '#22C55E', default: '#16A34A', dark: '#15803D' },
    warning: { light: '#F59E0B', default: '#D97706', dark: '#B45309' },
    error: { light: '#EF4444', default: '#DC2626', dark: '#B91C1C' },
    info: { light: '#3B82F6', default: '#2563EB', dark: '#1D4ED8' },
  },
  
  // Borders
  border: {
    default: '#30363D',
    focus: '#6366F1',
  },
  
  // Special
  blue: '#22C55E',          // USD Blue indicator
  brecha: '#F59E0B',         // Brecha cambiaria
  risco: '#EF4444',          // Riesgo país up
}
```

### 1.2 Typography
```typescript
typography: {
  fontFamily: {
    sans: 'System',  // Use system font (San Francisco on iOS, Roboto on Android)
    mono: 'Menlo',  // For numbers/data
  },
  
  sizes: {
    h1: { fontSize: 28, lineHeight: 36, fontWeight: '700' },
    h2: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
    h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
    h4: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
    overline: { fontSize: 10, lineHeight: 14, fontWeight: '500', letterSpacing: 0.5 },
  },
}
```

### 1.3 Spacing (Base 4px)
```typescript
spacing: {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  2xl: 24,
  3xl: 32,
  4xl: 40,
  5xl: 48,
}
```

### 1.4 Border Radius
```typescript
borderRadius: {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
}
```

### 1.5 Shadows
```typescript
shadow: {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
}
```

---

## 2. Screen Specifications

### 2.1 Dashboard (Home)

**Purpose:** Quick overview of key economic indicators

**Layout:**
```
┌─────────────────────────────────────┐
│ Header: "ArgMetrics"           [↻] │  ← Refresh button
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │     USD RATES SUMMARY CARD      │ │  ← Horizontal scroll for rates
│ │  Oficial: $860  |  Blue: $1020  │ │
│ │  [Mini sparkline chart]         │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Quick Stats Row                     │
│ ┌──────────┐ ┌──────────┐ ┌──────┐ │
│ │ Riesgo   │ │ Inflac.  │ │Brecha│ │
│ │   1850  │ │  4.6%    │ │ 18%  │ │
│ │   -15▼  │ │  +2.1%▲  │ │      │ │
│ └──────────┘ └──────────┘ └──────┘ │
├─────────────────────────────────────┤
│ 📈 Tendencias (Horizontal scroll)   │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │Inflation│ │  USD    │ │  Tasa   │ │
│ │  Chart  │ │  Chart  │ │  Chart  │ │
│ └─────────┘ └─────────┘ └─────────┘ │
├─────────────────────────────────────┤
│ Categories Grid                     │
│ ┌─────────────┐ ┌─────────────┐    │
│ │  ECONOMY    │ │   SOCIAL    │    │
│ │   12 items  │ │    5 items  │    │
│ └─────────────┘ └─────────────┘    │
│ ┌─────────────┐                    │
│ │ CONSUMPTION │                    │
│ │   4 items   │                    │
│ └─────────────┘                    │
└─────────────────────────────────────┘
│ [🏠Dashboard] [💱Cambio] [📊Métricas] [⚙️Ajustes] │
└─────────────────────────────────────┘
```

**Components:**
- **Header:** Title + refresh button (pull-to-refresh alternative)
- **USD Summary Card:** Compact horizontal showing 4 rates + mini trend
- **Quick Stats Row:** 3 KPI cards (Riesgo País, Inflación, Brecha)
- **Trend Preview:** Horizontal scroll of mini charts (30-day sparklines)
- **Category Grid:** Tappable category cards

**States:**
- Loading: Skeleton cards with shimmer animation
- Error: Retry button + error message
- Empty: "No data available" message

**Interactions:**
- Pull to refresh (native)
- Tap on any card → Navigate to detail screen
- Tap on mini chart → Full chart view

---

### 2.2 Exchange Rates (Tipo de Cambio)

**Purpose:** Detailed view of all USD exchange rates

**Layout:**
```
┌─────────────────────────────────────┐
│ Header: "Tipo de Cambio"            │
│ Subtitle: "Actualizado: HH:MM"     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │     📊 30 DÍAS CHART            │ │  ← Main chart (line chart)
│ │    _______----~~~               │ │
│ │   /                             │ │
│ │  ~~~----_______                 │ │
│ │                                 │ │
│ │ [1D] [7D] [30D] [90D] [1A]      │ │  ← Period selector tabs │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 💵 DÓLAR OFICIAL                    │
│ ┌─────────────────────────────────┐ │
│ │ Compra    │    Venta            │ │
│ │  $820.00  │    $860.00          │ │
│ │  ▲ +2.5%  │    ▲ +2.3%          │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 💵 DÓLAR BLUE                       │
│ ┌─────────────────────────────────┐ │
│ │ Compra    │    Venta            │ │
│ │  $1000.00 │    $1020.00  ← GREEN │ │
│ │  ▲ +1.8%  │    ▲ +1.5%          │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 💵 DÓLAR MEP                        │
│ ... (same format)                   │
├─────────────────────────────────────┤
│ 💵 DÓLAR CCL                        │
│ ... (same format)                   │
├─────────────────────────────────────┤
│ 📐 BRECHA CAMBIARIA                 │
│ ┌─────────────────────────────────┐ │
│ │          18.6%                  │ │  ← Large centered number
│ │  Official vs Blue difference   │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 💶 euros                            │
│ Expandable: Oficial € / Blue €      │
└─────────────────────────────────────┘
```

**Components:**
- **Main Chart:** 30-day line chart with period selector (1D, 7D, 30D, 90D, 1A)
- **Rate Cards:** Each with buy/sell + daily variation % (green/red)
- **Brecha Section:** Large display + explanation
- **Euros Section:** Collapsible with Official/Blue Euro rates

**Data Source:** `/v1/live/usd`

**Interactions:**
- Tap period tabs → Update chart
- Tap on rate card → Show detailed history for that rate
- Swipe down to refresh

---

### 2.3 Macro Indicators (Indicadores Macroeconómicos)

**Purpose:** Detailed view of inflation, interest rates, country risk

**Layout:**
```
┌─────────────────────────────────────┐
│ Header: "Indicadores"         [🔔] │  ← Alerts button
├─────────────────────────────────────┤
│ [Inflación] [Tasas] [Riesgo] [PBI] │  ← Category tabs
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │     INFLATION CHART            │ │  ← Main chart for selected
│ │    _______________              │ │
│ │   /               \             │ │
│ │  /                 \___         │ │
│ │                                │ │
│ │ [Mensual] [Acumulada] [ Anual] │ │  ← View toggle
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Current Value                        │
│ ┌─────────────────────────────────┐ │
│ │     4.6%                        │ │  ← Large hero number
│ │     Enero 2025                  │ │  ← Period label
│ │     ▲ +2.1% vs mes anterior     │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Historical Table                     │
│ ┌─────────────────────────────────┐ │
│ │ 2025  │  Ene  │   4.6%  │  ▲   │ │
│ │ 2024  │  Dic  │   2.4%  │  ▲   │ │
│ │ 2024  │  Nov  │   2.2%  │  ▼   │ │
│ │ ...   │  ...  │   ...   │      │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Sources: INDEC, BCRA, Ámbito        │
└─────────────────────────────────────┘
```

**Tabs:**
1. **Inflación:** IPC mensual, acumulada, anual
2. **Tasas:** Tasa de política monetaria, BADLAR, UVA
3. **Riesgo País:** EMBI+ Argentina
4. **PBI:** Producto Bruto Interno

**Components:**
- **Category Tabs:** Horizontal scrollable tabs
- **Main Chart:** Area/line chart with historical data
- **View Toggle:** Monthly / Accumulated / Annual
- **Current Value Card:** Hero number with comparison
- **Historical Table:** Scrollable table with last 12 months
- **Sources Footer:** Attribution

**Data Source:** `/v1/metrics?name=inflation`, `/v1/metrics?name=interest_rate`, etc.

**Interactions:**
- Swipe between category tabs
- Tap view toggle → Update chart data
- Tap table row → Show detail for that period

---

### 2.4 Trends/Chart Detail (Gráficos de Tendencia)

**Purpose:** Full-screen detailed chart view for any metric

**Layout:**
```
┌─────────────────────────────────────┐
│ [←] Header: "Inflación"      [📤] │  ← Back + Share
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │         LINE CHART              │ │  ← Full height chart
│ │                                 │ │
│ │    _______________              │ │
│ │   /               \            │ │
│ │  /                 \___        │ │
│ │                                │ │
│ │                                │ │
│ │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │ │  ← Reference lines
│ │                                │ │
│ └─────────────────────────────────┘ │
│ Period: [Desde] → [Hasta]           │  ← Date range picker
├─────────────────────────────────────┤
│ [1M] [3M] [6M] [1A] [MAX] [Custom] │  ← Quick periods
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │  Min: $820    Max: $1,020      │ │
│ │  Avg: $920    Var: +24.4%      │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Statistics Summary                   │
└─────────────────────────────────────┘
```

**Components:**
- **Chart:** Full-screen line/area chart (use react-native-svg-charts or victory-native)
- **Date Range:** Custom date picker
- **Quick Periods:** 1M, 3M, 6M, 1A, MAX, Custom
- **Stats Summary:** Min, Max, Average, Variation

**Interactions:**
- Pinch to zoom chart
- Pan to scroll through time
- Tap and hold to see exact value at point (tooltip)
- Double tap to reset zoom

---

### 2.5 Settings & Alerts (Configuración y Alertas)

**Purpose:** User preferences and notification management

**Layout:**
```
┌─────────────────────────────────────┐
│ Header: "Ajustes"                   │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🔔 ALERTAS                     │ │
│ │ ──────────────────────────────  │ │
│ │ □ Dólar oficial > $900        │ │  ← Toggle + threshold
│ │ □ Dólar blue > $1,100          │ │
│ │ □ Inflación mensual > 5%       │ │
│ │ □ Riesgo país > 2000 pts       │ │
│ │ [+ Agregar alerta]             │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 📱 APARIENCIA                  │ │
│ │ ──────────────────────────────  │ │
│ │ Modo Oscuro           [ON ●]   │ │
│ │ Moneda preferida      [USD ▼]   │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🔄 DATOS                        │ │
│ │ ──────────────────────────────  │ │
│ │ Auto-actualizar        [ON ●]   │ │
│ │ Frecuencia            [15min ▼] │ │
│ │ WiFi solo            [OFF ○]    │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ ℹ️ ACERCA DE                    │ │
│ │ ──────────────────────────────  │ │
│ │ Versión              1.0.0      │ │
│ │ Fuentes de datos   INDEC, BCRA  │ │
│ │ Términos y Condiciones    [→]   │ │
│ │ Política de Privacidad   [→]    │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ArgMetrics © 2024                    │
│ Datos con fines informativos        │
└─────────────────────────────────────┘
```

**Alert Configuration:**
- **Alert Item:** Toggle + threshold input + notification type
- **Default Alerts:** Pre-configured common alerts
- **Custom Alert:** User can create custom threshold alerts

**Components:**
- **Alert Card:** Toggle switch, metric name, threshold input
- **Appearance Section:** Dark mode toggle, preferred currency
- **Data Section:** Auto-refresh toggle, frequency, WiFi-only option
- **About Section:** Version, data sources, legal links

**State Management:**
- Alerts stored in AsyncStorage or backend
- Use expo-notifications for push notifications (future)

---

## 3. Navigation Structure

### 3.1 Tab Navigation (Bottom Tabs)
```
┌─────────────────────────────────────┐
│           Content Area              │
├─────────────────────────────────────┤
│ [🏠]    [💱]    [📊]    [⚙️]       │
│ Dashboard  Cambio  Métricas  Ajustes│
└─────────────────────────────────────┘
```

### 3.2 Stack Navigation (Screen Flow)
```
MainTabs (Bottom Tabs)
├── Dashboard
│   └── DashboardScreen
│       └── [Tap Card] → RateDetail
│       └── [Tap Category] → Metrics
│
├── Exchange (Tipo de Cambio)
│   └── ExchangeRatesScreen
│       └── [Tap Period] → Chart updates
│       └── [Tap Rate] → RateHistory
│
├── Metrics (Métricas)
│   └── MetricsScreen
│       └── [Tap Metric] → MetricDetail
│           └── [Tap Chart] → FullChart
│
└── Settings (Ajustes)
    └── SettingsScreen
        └── [Tap Alert] → AlertConfig
```

### 3.3 Deep Links (Future)
```
argmetrics://dashboard
argmetrics://exchange
argmetrics://exchange/usd-blue
argmetrics://metrics/inflation
argmetrics://settings/alerts
```

---

## 4. Component Library

### 4.1 Base Components

| Component | Description | States |
|-----------|-------------|--------|
| `Card` | Elevated surface container | default, pressed, loading |
| `Button` | Primary action trigger | default, pressed, disabled, loading |
| `Text` | Typography component | h1-h4, body, caption |
| `Input` | Text/number entry | default, focused, error, disabled |
| `Switch` | Toggle control | on, off, disabled |
| `Badge` | Status/count indicator | default, success, warning, error |
| `Skeleton` | Loading placeholder | animated shimmer |
| `EmptyState` | No data display | default |
| `ErrorState` | Error with retry | default |
| `Header` | Screen header | default, with actions |

### 4.2 Chart Components

| Component | Description |
|-----------|-------------|
| `LineChart` | Time series line chart |
| `AreaChart` | Filled line chart |
| `Sparkline` | Mini inline chart |
| `BarChart` | Bar comparison chart |
| `ChartPeriodSelector` | Period tabs (1D, 7D, 30D, etc.) |

### 4.3 Data Components

| Component | Description |
|-----------|-------------|
| `KPICard` | Single metric display with trend |
| `RateCard` | Exchange rate display (buy/sell) |
| `MetricListItem` | Tappable metric row |
| `HistoricalTable` | Scrollable data table |
| `DateRangePicker` | From/To date selection |

---

## 5. API Integration

### 5.1 Data Flow
```
Screen Mount
    ↓
Show Loading State
    ↓
Call API (via store)
    ↓
Success → Show Data | Error → Show Error + Retry
    ↓
Render Components
```

### 5.2 Endpoints Used
| Screen | Endpoint | Cache |
|--------|----------|-------|
| Dashboard | `/v1/live/usd` | 30 min |
| Dashboard | `/v1/metrics?name=risk` | 30 min |
| Exchange | `/v1/live/usd` | 30 min |
| Exchange Chart | `/v1/metrics?name=usd_*` | none |
| Metrics | `/v1/metrics/categories` | 1 hour |
| Metrics Detail | `/v1/metrics?name={metric}` | none |
| Indicators | `/v1/metrics?name={inflation|rate|risk}` | none |

### 5.3 Error Handling
- **Network Error:** Show retry button + offline message
- **Empty Data:** Show empty state with explanation
- **API Error:** Show error code + retry option

---

## 6. Implementation Priority

### Phase 1: Core (MVP)
1. ✅ Tab Navigation (existing)
2. ✅ Dashboard with KPIs
3. ✅ Exchange Rates screen
4. ✅ Basic Metrics list
5. ✅ Settings screen

### Phase 2: Enhancement
1. 📈 Charts integration (react-native-svg-charts)
2. 📊 Trend detail screen
3. 🔔 Alert configuration
4. 📱 Push notifications (expo-notifications)

### Phase 3: Polish
1. 🎨 Animation polish
2. ♿ Accessibility improvements
3. 🌐 Offline support
4. 📲 Widget support (future)

---

## 7. Tech Stack

- **Framework:** Expo SDK 52+
- **Navigation:** React Navigation 7 (bottom tabs + stack)
- **UI Library:** React Native Paper (Material Design 3)
- **Charts:** react-native-svg-charts or victory-native
- **State Management:** Zustand (existing)
- **API Client:** Axios (existing)
- **Storage:** AsyncStorage (for preferences/alerts)

---

## 8. File Structure

```
mobile/
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   ├── LineChart.tsx
│   │   │   ├── AreaChart.tsx
│   │   │   ├── Sparkline.tsx
│   │   │   └── ChartPeriodSelector.tsx
│   │   ├── cards/
│   │   │   ├── KPICard.tsx
│   │   │   ├── RateCard.tsx
│   │   │   └── MetricCard.tsx
│   │   └── common/
│   │       ├── Card.tsx
│   │       ├── Button.tsx
│   │       └── Header.tsx
│   ├── screens/
│   │   ├── DashboardScreen.tsx (enhanced)
│   │   ├── ExchangeRatesScreen.tsx (enhanced)
│   │   ├── MacroIndicatorsScreen.tsx (NEW)
│   │   ├── MetricDetailScreen.tsx (NEW)
│   │   ├── ChartDetailScreen.tsx (NEW)
│   │   └── SettingsScreen.tsx (enhanced)
│   ├── navigation/
│   │   └── TabNavigator.tsx
│   ├── store/
│   │   └── metricsStore.ts (enhanced)
│   ├── hooks/
│   │   ├── useCharts.ts
│   │   └── useAlerts.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── chartHelpers.ts
│   └── theme/
│       └── index.ts
└── ...
```

---

*Document Version: 1.0*
*Last Updated: 2026-03-10*
*Author: Designer Agent*
