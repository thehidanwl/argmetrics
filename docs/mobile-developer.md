# Mobile Developer — ArgMetrics

## Stack
- **Framework**: Expo 52 + React Native
- **Navegación**: React Navigation (tab navigator)
- **Estado global**: Zustand (`mobile/src/store/metricsStore.ts`)
- **Build de release**: `./gradlew bundleRelease` → AAB subido a Google Play

## Arquitectura de la app

### Navegación
```
App.tsx
└── TabNavigator (mobile/src/navigation/TabNavigator.tsx)
    ├── DashboardScreen   — indicadores principales, KPIs
    ├── ExchangeRatesScreen — cotizaciones USD con histórico
    ├── MetricsScreen     — todos los indicadores con filtros
    └── SettingsScreen    — configuración y alertas
```

### Store (Zustand)
Toda la lógica de API y estado global vive en `metricsStore.ts`. Las pantallas solo llaman acciones del store y leen estado.
```ts
const { usdRates, metrics, fetchUSDRates, fetchMetrics, loading, error } = useMetricsStore();
```

### API base URL
- Dev: `http://localhost:3000/v1` (o la URL configurada en el store)
- Prod: `https://argmetrics.vercel.app/api/v1`

## Reglas críticas para release

### NO usar react-native-svg ni react-native-gifted-charts `<LineChart>` para renderizar
`react-native-gifted-charts` crashea al **renderizar** SVG en release mode (Hermes + Android). El import funciona, el render falla. Reemplazar SIEMPRE con charts basados en `View`:

```tsx
// ✅ Correcto — View-based sparkline
function Sparkline({ base, color }: { base: number; color: string }) {
  const data = genSparkline(base);
  const min = Math.min(...data); const max = Math.max(...data);
  const range = max - min || 1;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: 60, height: 28, gap: 2 }}>
      {data.map((v, i) => (
        <View key={i} style={{ flex: 1,
          height: Math.max(3, Math.round(((v - min) / range) * 24) + 4),
          backgroundColor: color, opacity: 0.5 + 0.5 * (i / (data.length - 1)), borderRadius: 2 }} />
      ))}
    </View>
  );
}
```

### Double optional chaining en datos del store
Los datos de la API pueden llegar null o con estructura parcial en el primer render. Siempre:
```ts
// ✅ Correcto
rates?.blue?.sell
rates?.oficial?.buy

// ❌ Incorrecto — crashea si blue es undefined
rates?.blue.sell
```

## Proceso de release
Node.js está instalado via **fnm**, no en PATH por defecto:
```bash
export PATH="/home/kakuzu/.local/share/fnm/node-versions/v20.20.1/installation/bin:$PATH"
node mobile/scripts/release.mjs internal
```
El script auto-incrementa `versionCode` en `android/app/build.gradle`, compila el AAB y lo sube a Google Play Internal Testing.

**Secrets requeridos** (no commitear):
- `mobile/secrets/service-account.json` — Google Play API
- `mobile/secrets/argmetrics-release-v2.keystore` — signing key

## Diagnóstico de crashes sin adb
Cuando la app crashea y no hay adb disponible:
1. **Pantalla negra < 1 seg** → crash nativo o pre-JS. ErrorBoundary no ayuda.
2. **Pantalla blanca** → crash de render JS. Agregar ErrorBoundary a `App.tsx`.
3. Orden de diagnóstico: Hello World → navegación → Ionicons → import charts → render charts.

## Estado conocido (versionCode 16)
- App funcional con datos de API
- Charts = barras con View puro (sin SVG)
- Tab bar icons no visibles — issue de styling pendiente
- MEP/CCL estimados como % del blue (no hay fuente real todavía)

## Pendientes mobile
- [ ] Restaurar tab bar icons (styling)
- [ ] Push notifications para alertas (Tier Pro)
- [ ] Widgets de pantalla de inicio (Tier Pro)
- [ ] Charts SVG cuando se resuelva el problema de release
