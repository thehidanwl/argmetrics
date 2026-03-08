# Plan de Trabajo - ArgMetrics

## Fase 1: Setup y Arquitectura (Semana 1-2)

### 1.1 Configuración de Proyecto
- [ ] 1.1.1 Inicializar proyecto Expo con TypeScript
- [ ] 1.1.2 Configurar ESLint + Prettier
- [ ] 1.1.3 Setup Git (repo, .gitignore, conventional commits)
- [ ] 1.1.4 Configurar Vercel para deploy preview

### 1.2 Arquitectura de Datos
- [ ] 1.2.1 Diseñar esquema de Supabase (tablas, relaciones)
- [ ] 1.2.2 Implementar scripts de migración
- [ ] 1.2.3 Crear типы TypeScript para indicadores
- [ ] 1.2.4 Setup cliente Supabase en frontend

### 1.3 Integración de APIs
- [ ] 1.3.1 Investigar APIs disponibles (BCRA, INDEC, etc.)
- [ ] 1.3.2 Crear módulo de fetchers para cada fuente
- [ ] 1.3.3 Implementar capa de abstracción con caché
- [ ] 1.3.4 Manejo de errores y retry logic

---

## Fase 2: Core UI y Dashboard (Semana 3-4)

### 2.1 Navigation y Layout
- [ ] 2.1.1 Implementar React Navigation (bottom tabs)
- [ ] 2.1.2 Crear estructura de carpetas por feature
- [ ] 2.1.3 Setup tema (dark/light) con React Native Paper
- [ ] 2.1.4 Implementar layout base con Header

### 2.2 Dashboard
- [ ] 2.2.1 Crear componente IndicatorCard
- [ ] 2.2.2 Implementar mini-sparklines con victory-native
- [ ] 2.2.3 Conectar con store de indicadores
- [ ] 2.2.4 Implementar pull-to-refresh
- [ ] 2.2.5 Skeleton loaders durante carga

### 2.3 Gráficos de Trends
- [ ] 2.3.1 Seleccionar librería de charts (victory-native o react-native-gifted-charts)
- [ ] 2.3.2 Implementar LineChart interactivo
- [ ] 2.3.3 Tooltips y touch handling
- [ ] 2.3.4 Zoom y pan gestures
- [ ] 2.3.5 Animaciones de entrada

---

## Fase 3: Filtros y Detalles (Semana 5-6)

### 3.1 Sistema de Filtros
- [ ] 3.1.1 Componente DateRangePicker (año inicio/fin)
- [ ] 3.1.2 Toggle Interanual vs. Mensual
- [ ] 3.1.3 Toggle Real vs. Nominal
- [ ] 3.1.4 Persistencia de filtros (AsyncStorage/Zustand)
- [ ] 3.1.5 Aplicar filtros a queries de datos

### 3.2 Vista Detail de Indicador
- [ ] 3.2.1 Pantalla de detalle con gráfico completo
- [ ] 3.2.2 Tabla de datos históricos
- [ ] 3.2.3 Información de fuente y última actualización
- [ ] 3.2.4 Variación porcentual con indicador visual

### 3.3 Settings y Personalización
- [ ] 3.3.1 Pantalla de Settings
- [ ] 3.3.2 Selector de indicadores favoritos
- [ ] 3.3.3 Toggle tema oscuro/claro
- [ ] 3.3.4 Configuración de frecuencia de sync
- [ ] 3.3.5 Persistencia de preferencias

---

## Fase 4: Offline y Performance (Semana 7)

### 4.1 Modo Offline
- [ ] 4.1.1 Implementar AsyncStorage para caché
- [ ] 4.1.2 Detección de estado de conexión
- [ ] 4.1.3 Indicador visual offline
- [ ] 4.1.4 Graceful degradation de features

### 4.2 Performance
- [ ] 4.2.1 Optimizar render de listas
- [ ] 4.2.2 Memoización de componentes
- [ ] 4.2.3 Lazy loading de gráficos
- [ ] 4.2.4 Testing de performance (Flipper/Chronos)

---

## Fase 5: QA y Launch (Semana 8)

### 5.1 Testing
- [ ] 5.1.1 Tests unitarios覆盖率 > 70%
- [ ] 5.1.2 Tests de integración ( Detox / Cypress)
- [ ] 5.1.3 Beta testing con TestFlight/Play Store

### 5.2 Preparación para Launch
- [ ] 5.2.1 Assets (iconos, splash screen)
- [ ] 5.2.2 Metadata para stores
- [ ] 5.2.3 Setup CI/CD (GitHub Actions)
- [ ] 5.2.4 Build de producción (iOS + Android)

### 5.3 Documentación
- [ ] 5.3.1 README del proyecto
- [ ] 5.3.2 Documentación de APIs internas
- [ ] 5.3.3 Changelog / Release notes

---

## Dependencias entre Tareas

```
1.1 → 1.2 → 1.3 → 2.1 → 2.2 → 2.3 → 3.1 → 3.2 → 3.3 → 4.1 → 4.2 → 5.1 → 5.2 → 5.3
```

**Paralelizables:**
- 1.3 (APIs) puede avanzar en paralelo con 2.1 (Navigation)
- 3.3 (Settings) puede empezar junto con 3.1 (Filtros)

---

## Stack Tecnológico Elegido

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| Mobile | Expo SDK 52 + React Native | Desarrollo más rápido |
| Language | TypeScript | Type safety |
| Navigation | React Navigation v7 | Estándar |
| State | Zustand | Simple y performante |
| Charts | react-native-gifted-charts | Mucha variedad, buena performance |
| UI Components | React Native Paper | Material Design 3 |
| Backend/DB | Supabase | PostgreSQL + APIs + Auth (opcional) |
| HTTP | Axios | Mejor DX |
| Storage | AsyncStorage + Zustand persist | Persistencia offline |
| Deploy | Vercel | Backend serverless + hosting |

---

## milestones

| Milestone | Entregable | Semana |
|-----------|------------|--------|
| M1: Setup | Proyecto andando, DB diseñada | 2 |
| M2: Core UI | Dashboard + navegación | 4 |
| M3: Features | Filtros + Detail + Settings | 6 |
| M4: Offline | App funciona sin internet | 7 |
| M5: Launch | .ipa y .aab ready | 8 |

---

*Este plan es una guía. Ajustar según avances reales.*
