# ArgMetrics — Documento de producto

> Este archivo es la fuente de verdad del producto. Define la arquitectura UX, el catálogo completo de indicadores (con fuentes, periodicidad y URLs), las especificaciones de interacción, y el roadmap.
>
> **Para Claude Code**: leé este archivo completo antes de implementar cualquier feature. Cada sección tiene el contexto necesario para implementar sin ambigüedad.
>
> **Para un PM/Arquitecto**: este documento tiene el nivel de detalle suficiente para asignar tareas a desarrolladores. Cada indicador especifica qué datos se necesitan, de dónde salen, con qué frecuencia se actualizan, y cómo se presentan en la UI.

---

## 1. Visión del producto

ArgMetrics es una app mobile-first de consulta de datos macroeconómicos argentinos. Permite comparar indicadores entre gobiernos de forma objetiva, con variantes oficiales vs alternativas y nominales vs reales. En el futuro incluirá una sección de apuestas/predicciones.

**Propuesta de valor**: Un solo lugar donde ver CUALQUIER dato macro argentino, ajustado como vos quieras (real, en dólares, per cápita), comparado entre gobiernos, con la fuente transparente.

**Audiencia primaria**: Argentinos interesados en economía que discuten en X/Twitter. Analistas, periodistas, inversores, ciudadanos informados.

**Plataforma**: Mobile-first (React Native o Flutter). También funciona como PWA.

---

## 2. Arquitectura UX

### 2.1 El problema de diseño

Cada indicador tiene **3 dimensiones ortogonales** que el usuario puede querer ajustar simultáneamente:

| Dimensión | Ejemplo | Cantidad de opciones |
|---|---|---|
| **Subcategoría / desglose** | IPC General, Núcleo, Regulados, Alimentos... | 3-15 por indicador |
| **Ventana temporal** | Mensual, interanual, acumulado, por mandato | 3-5 opciones |
| **Variante de ajuste** | Nominal, real, en USD, per cápita, fuente alternativa | 2-6 por indicador |

Meter todo en tabs anidados o botones produce una interfaz innavegable. La solución: separar **navegación** (qué dato miro) de **controles** (cómo lo miro).

### 2.2 Solución: Bottom bar dinámica + controles en capas

La bottom bar **muta** según el nivel de navegación. Esto libera toda la pantalla superior para el gráfico y sus controles.

#### Nivel 0 — Home

```
┌─────────────────────────────────────────┐
│  ArgMetrics                        🔔   │  Header fijo
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐ ┌──────────┐              │
│  │ Inflación│ │Dólar blue│              │  Dashboard: últimos datos
│  │  2.4% m  │ │  $1.285  │              │  (cards tocables → llevan
│  └──────────┘ └──────────┘              │   directo al indicador)
│  ┌──────────┐ ┌──────────┐              │
│  │ Pobreza  │ │   EMAE   │              │
│  │  38.1%   │ │ +5.2% ia │              │
│  └──────────┘ └──────────┘              │
│                                         │
│  [🏆 Comparar gobiernos]                │  CTA prominente
│                                         │
├─────────────────────────────────────────┤
│ [📈 Econ] [👥 Soc] [💼 Lab] [🏛️ Fisc] │  ← Bottom bar: 4 categorías
└─────────────────────────────────────────┘
```

#### Nivel 1 — Dentro de una categoría

Al tocar "Económicas", la bottom bar muta. Los 4 tabs de categoría **se reemplazan** por:

```
┌─────────────────────────────────────────┐
│  ← Económicas                           │  Header con back
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📊 Inflación         2.4% m  → │    │  Cards de indicadores
│  │    ▁▂▃▅▇▅▃▂▁ (sparkline)       │    │  con mini-sparkline
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 💱 Dólar             $1.285  → │    │
│  │    ▁▁▂▃▃▄▅▆▇ (sparkline)       │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 📈 Actividad        +5.2%   → │    │
│  └─────────────────────────────────┘    │
│                                         │
├─────────────────────────────────────────┤
│ [🏠] [Inflac.] [Dólar] [Activid.]      │  ← Bottom bar mutada:
│                                         │     Home + indicadores
└─────────────────────────────────────────┘
```

**Regla**: El botón 🏠 (Home) siempre aparece a la izquierda cuando se está dentro de una categoría. Los demás slots son los indicadores de esa categoría. Esto permite saltar entre indicadores sin volver atrás.

#### Nivel 2 — Vista de indicador (pantalla principal de uso)

```
┌─────────────────────────────────────────┐
│  ← Inflación                    ⚙️  📤 │  Header: back + engranaje + compartir
├─────────────────────────────────────────┤
│ ┌──────┐┌──────┐┌─────┐┌─────┐┌──────┐ │
│ │✓ IPC ││✓ Núc ││ Reg ││ Est ││ Alim │ │  Chips multi-select (scroll horiz.)
│ └──────┘└──────┘└─────┘└─────┘└──────┘ │  Se pueden activar varios
├─────────────────────────────────────────┤
│ [M] [IA] [Acum] [Mandato]   ☑ Real    │  Temporalidad (píldoras) + toggle Real
├─────────────────────────────────────────┤
│                                         │
│         📈 GRÁFICO PRINCIPAL            │  Gráfico: ~55-60% de pantalla
│    Bandas de color por mandato          │  Líneas superpuestas si multi-select
│    (fondo semitransparente)             │
│                                         │
│    CFK    │  Macri  │   AF   │  Milei  │  Labels de mandato abajo
├─────────────────────────────────────────┤
│  ▼ Ver tabla de datos                   │  Tabla colapsable
│  ─────────────────────────────────────  │
│  Mar 2026  │  2.4%  │  -0.3pp │ INDEC  │
│  Feb 2026  │  2.7%  │  +0.2pp │ INDEC  │
├─────────────────────────────────────────┤
│ [🏠] [●Inflac.] [Dólar] [Activid.]     │  Bottom bar: indicador activo marcado
└─────────────────────────────────────────┘
```

#### Panel de controles avanzados (⚙️) — Bottom sheet

Se abre al tocar ⚙️. Es un bottom sheet (medio modal que sube desde abajo). **Los controles que aparecen acá cambian según el indicador** — el sistema sabe qué ajustes aplican a cada dato.

```
┌─────────────────────────────────────────┐
│  ━━━━  (drag handle)                    │
│                                         │
│  Rango de fechas                        │
│  [Dic 2015 ▼]  →  [Mar 2026 ▼]         │
│  ──●━━━━━━━━━━━━━━━━━●──               │  Slider visual
│                                         │
│  Ajustes disponibles                    │  Estos toggles cambian
│  ☐ Valor real (ajustado por IPC)        │  según el indicador.
│  ☐ En USD (al blue)                     │  Solo se muestran los
│  ☐ Per cápita                           │  que aplican.
│                                         │
│  Fuente de datos                        │  Radio buttons si hay
│  ● INDEC (oficial)                      │  fuentes alternativas
│  ○ UCA (multidimensional)               │
│  ○ Rozada (UTDT)                        │
│                                         │
│  [Aplicar]                              │
└─────────────────────────────────────────┘
```

### 2.3 Especificaciones de interacción

#### Chips multi-select

- Los chips de subcategoría admiten **selección múltiple**. Al activar varios, se superponen las series en el mismo gráfico con colores distintos (ver palette de series en sección 5).
- Ejemplo: seleccionar "IPC General" + "Núcleo" + "Regulados" → se ven 3 líneas superpuestas, cada una con su color y leyenda.
- Cada chip tiene un estado: inactivo (fondo gris, texto gris) / activo (fondo oscuro, texto blanco).
- Al tocar un chip activo, se desactiva. Siempre debe quedar al menos 1 activo.
- Si hay más de 5-6 chips, se scrollean horizontalmente. Un fade sutil en el borde derecho indica que hay más.

#### Temporalidad (píldoras estilo TradingView)

- `M` = Mensual (dato puntual de cada mes)
- `IA` = Interanual (variación % vs mismo mes del año anterior)
- `Acum` = Acumulado en el año / en el periodo seleccionado
- `Mandato` = Modo especial de comparación indexada (ver sección 2.4)
- Las píldoras están siempre visibles en la barra debajo de los chips.
- La píldora activa tiene fondo sólido; las inactivas tienen fondo secundario.
- No todos los indicadores soportan todas las temporalidades (ej: pobreza solo tiene dato semestral → no se muestra `M`). Las píldoras no disponibles se ocultan o se muestran disabled.

#### Toggle Real/Nominal

- Checkbox siempre visible junto a las píldoras de temporalidad (no escondido en ⚙️).
- Al activar "Real", el label del eje Y cambia (ej: de "%" a "% real") y aparece un badge sutil "Ajustado por IPC base dic-2016" sobre el gráfico.
- Para indicadores donde "Real" no tiene sentido (ej: tasa de desocupación, que ya es un %), el toggle no se muestra.

#### Gráfico

- **Tipo default**: Línea temporal con área sombreada debajo.
- **Multi-serie**: Si hay varios chips activos, se muestran múltiples líneas con colores del palette de series (ver sección 5). Leyenda debajo del gráfico con el color + nombre de cada serie.
- **Bandas de mandato**: Siempre visibles como fondo semitransparente (colores del partido político). Se intensifican en modo mandato.
- **Interacciones**:
  - **Tap en un punto** → tooltip con: valor exacto, fecha, fuente, variación vs periodo anterior.
  - **Pinch-to-zoom** → zoom temporal (acercar para ver meses, alejar para ver años).
  - **Pan horizontal** → desplazar en el tiempo.
- **Compartir (📤)**: Exporta el gráfico como imagen PNG con: marca de agua "ArgMetrics", fuentes citadas, rango temporal, y variante activa. Dos formatos: X/Twitter (1200×675px) y stories (1080×1920px).

#### Tabla de datos

- Colapsada por default. Se expande al tocar "Ver tabla de datos".
- Columnas: Fecha | Valor | Variación % (vs anterior) | Fuente.
- Scroll vertical dentro de la tabla.
- Botón "Exportar CSV" al final de la tabla.

### 2.4 Modo "Comparar mandatos" (indexado a base 100)

Este es el modo killer de la app para debates en X. Se activa de dos formas:

1. **Desde la home**: Botón prominente "Comparar gobiernos".
2. **Desde cualquier indicador**: Píldora `Mandato` en la barra de temporalidad.

**Comportamiento**:

- Los chips cambian: en vez de subcategorías, muestran **presidentes** (multi-select).
- El usuario elige qué mandatos comparar.
- Cada serie se **indexa a base 100 en el día de asunción** del presidente correspondiente.
- El eje X pasa de fechas absolutas a **"Meses desde asunción"** (0, 6, 12, 18, 24...).
- Cada línea tiene el color del partido político.
- Esto permite ver, por ejemplo, que la inflación acumulada de Macri a los 12 meses fue X% vs Milei que fue Y%.
- Si se entra desde un indicador, ese indicador queda seleccionado. Si se entra desde la home, se muestra un dropdown para elegir indicador.

**Wireframe modo mandato**:

```
┌─────────────────────────────────────────┐
│  ← Inflación (por mandato)      ⚙️  📤 │
├─────────────────────────────────────────┤
│ ┌──────┐┌──────┐┌──────┐┌──────┐       │
│ │✓ CFK ││✓Macri││✓ AF  ││✓Milei│       │  Chips = presidentes
│ │celest││amari ││celest││violet│       │  (multi-select)
│ └──────┘└──────┘└──────┘└──────┘       │
├─────────────────────────────────────────┤
│  Indicador: [IPC General ▼]            │  Dropdown del indicador
│  Base 100 = día de asunción            │  (o heredado del contexto)
├─────────────────────────────────────────┤
│         📈 GRÁFICO INDEXADO             │
│                                         │
│  150 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─        │
│       ╱ (Milei, violeta)                │
│  125 ─ ─╱─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─        │
│       ╱    ╲ (AF, celeste)              │
│  100 ●━━━━━━━━━━━━━━━━━━━━━━━━━━        │  Todas arrancan en 100
│       ╲  (Macri, amarillo)              │
│   75 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─        │
│                                         │
│  Mes:  0    6    12   18   24   30      │  Eje X: meses desde asunción
├─────────────────────────────────────────┤
│  ▼ Resumen por mandato                  │
│  CFK: entró 100, salió 340 (+240%)     │
│  Macri: entró 100, salió 285 (+185%)   │
│  AF: entró 100, salió 890 (+790%)      │
│  Milei: entró 100, actual 120 (+20%)   │
└─────────────────────────────────────────┘
```

**Datos de mandatos presidenciales (para indexación)**:

| Presidente | Asunción | Fin | Partido | Color | Notas |
|---|---|---|---|---|---|
| Néstor Kirchner | 25/05/2003 | 10/12/2007 | FPV | `#5DADE2` | |
| Cristina Fernández (1er) | 10/12/2007 | 10/12/2011 | FPV | `#2E86C1` | Configurable: tratar como 1 o 2 mandatos |
| Cristina Fernández (2do) | 10/12/2011 | 10/12/2015 | FPV | `#2E86C1` | |
| Mauricio Macri | 10/12/2015 | 10/12/2019 | PRO/Cambiemos | `#F4D03F` | |
| Alberto Fernández | 10/12/2019 | 10/12/2023 | FdT | `#85C1E9` | |
| Javier Milei | 10/12/2023 | en curso | LLA | `#8E44AD` | |

### 2.5 Home / Landing

La home muestra:

1. **Dashboard rápido**: 4-6 cards con los últimos datos más relevantes (inflación mensual, dólar blue, pobreza, EMAE). Cada card es tocable y lleva directo al indicador.
2. **CTA "Comparar gobiernos"**: Botón prominente que abre el modo mandato.
3. **Bottom bar con las 4 categorías**.

Los datos del dashboard se actualizan automáticamente cuando hay nuevos datos en la DB.

---

## 3. Catálogo de indicadores

> Cada indicador se documenta con: chips disponibles, controles contextuales, fuentes con URL, periodicidad de actualización, y serie histórica disponible.
>
> **Convención para los controles (⚙️)**:
> - ☐ = Toggle (checkbox). El usuario lo activa o no.
> - ● / ○ = Radio button. Solo uno activo a la vez dentro de un grupo.
> - [▼] = Dropdown / selector.
> - Todos los indicadores tienen "Comparar por mandato" como opción en la píldora `Mandato` — no se repite en cada uno.

---

### Tab 1: ECONÓMICAS 📈

---

#### 1a. Inflación

| Campo | Detalle |
|---|---|
| **Dato principal** | Variación % del IPC |
| **Periodicidad** | Mensual (INDEC publica ~15 del mes siguiente) |
| **Serie histórica** | Desde 1943 (empalme). Confiable desde 2016 (nueva metodología). 2007-2015 intervenido (usar Congreso). |
| **Unidad** | Porcentaje (%) |

**Chips de subcategoría** (multi-select):

| Chip | Qué mide | Fuente | Notas |
|---|---|---|---|
| `IPC General` (default) | Nivel general de precios al consumidor | INDEC | Base dic-2016=100 |
| `Núcleo` | IPC sin estacionales ni regulados | INDEC | Proxy de tendencia inflacionaria |
| `Regulados` | Precios regulados por el Estado (tarifas, combustibles) | INDEC | Muy sensible a política tarifaria |
| `Estacionales` | Productos con variación estacional (frutas, verduras, turismo) | INDEC | |
| `Alimentos y bebidas` | Componente alimentario del IPC | INDEC | El más sentido por la población |
| `Servicios` | Componente servicios del IPC | INDEC | |
| `Transporte` | Componente transporte del IPC | INDEC | |
| `Vivienda` | Componente vivienda del IPC | INDEC | |
| `Mayorista (IPIM)` | Índice de Precios Internos al por Mayor | INDEC SIPM | Anticipa inflación minorista |
| `Mayorista (IPIB)` | Índice de Precios Internos Básicos al por Mayor | INDEC SIPM | Sin IVA ni impuestos internos |
| `Mayorista (IPP)` | Índice de Precios al Productor | INDEC SIPM | |
| `No oficial (Congreso)` | IPC calculado por diputados de la oposición durante intervención INDEC | Congreso Nacional | Solo 2007-2015 |
| `IPC San Luis` | IPC provincial, usado como proxy durante intervención | DPEyC San Luis | Solo 2007-2015 |
| `IPC CABA` | IPC de Ciudad de Buenos Aires | DGEyC CABA | Desde 2012. Metodología independiente |

**Controles contextuales (⚙️)**:
- Temporalidad: `M` (mensual) | `IA` (interanual, var % vs mismo mes año anterior) | `Acum` (acumulada en el año o periodo elegido)
- Rango de fechas: selector inicio/fin

**Fuentes y URLs de descarga**:

| Fuente | URL | Formato | Notas |
|---|---|---|---|
| INDEC — IPC | https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31 | XLS/CSV | Series con aperturas desde 2016 |
| INDEC — SIPM (mayoristas) | https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-32 | XLS | |
| IPC Congreso | Buscar en archivos legislativos / compilaciones privadas | PDF | Discontinuado post-2015 |
| DGEyC CABA | https://www.estadisticaciudad.gob.ar/eyc/?p=27386 | XLS | |

---

#### 1b. Dólar y tipo de cambio

| Campo | Detalle |
|---|---|
| **Dato principal** | Cotización ARS/USD |
| **Periodicidad** | Diaria (hábil) |
| **Serie histórica** | Oficial desde 1970s (BCRA). Blue confiable desde ~2011. MEP/CCL desde ~2019 con volumen. |
| **Unidad** | Pesos argentinos por 1 USD |

**Chips de subcategoría** (multi-select):

| Chip | Qué mide | Fuente | Notas |
|---|---|---|---|
| `Oficial (mayorista)` (default) | Tipo de cambio interbancario (comunicación A3500 BCRA) | BCRA | El que se usa para comercio exterior |
| `Oficial (minorista)` | Promedio de venta en bancos | BCRA / bancos | ~1-2% spread sobre mayorista |
| `Blue` | Tipo de cambio informal / paralelo | Ámbito, DolarHoy, ValorDolarBlue | No hay fuente "oficial". Se scrapea |
| `MEP` | Dólar bolsa (compra-venta de bonos AL30/GD30 en ARS y USD) | BYMA / Bolsar | Legal. Refleja expectativas |
| `CCL` | Contado con liquidación (bonos que cotizan afuera) | BYMA / Bolsar | El "dólar fuga" legal |
| `Brecha % (blue vs oficial)` | (Blue - Oficial) / Oficial × 100 | Cálculo propio | Termómetro de desconfianza |
| `Brecha % (MEP vs oficial)` | (MEP - Oficial) / Oficial × 100 | Cálculo propio | |
| `Índice Big Mac` | Precio Big Mac Argentina vs EEUU → TC implícito | The Economist | Semestral |

**Controles contextuales (⚙️)**:
- Temporalidad: `Diario` | `M` (promedio mensual) | `IA` (var % interanual)
- Rango de fechas
- ☐ **Valor real (ajustado por IPC Argentina)** — Deflacta por IPC INDEC. "¿Cuánto sería este dólar a precios de hoy?"
- ☐ **Valor real bilateral (IPC Arg + CPI EEUU)** — TC real simplificado. "¿Argentina está cara o barata en dólares?"

**Fuentes y URLs**:

| Fuente | URL | Formato | Notas |
|---|---|---|---|
| BCRA — Tipo de cambio | https://www.bcra.gob.ar/PublicacionesEstadisticas/Tipos_de_cambio.asp | Series diarias | API disponible |
| BCRA — Series estadísticas | https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp | CSV | Variables cambiarias históricas |
| Ámbito — Blue histórico | https://www.ambito.com/contenidos/dolar-informal-historico.html | Scraping | Mejor fuente histórica de blue |
| DolarHoy | https://dolarhoy.com | Scraping | Alternativa para blue diario |
| BLS — CPI EEUU | https://www.bls.gov/cpi/ | CSV | Para TC real bilateral |
| The Economist — Big Mac Index | https://www.economist.com/big-mac-index | CSV en GitHub | Semestral |

---

#### 1c. Actividad económica

| Campo | Detalle |
|---|---|
| **Dato principal** | PBI / EMAE |
| **Periodicidad** | PBI trimestral, EMAE mensual |
| **Serie histórica** | PBI desde 1993. EMAE desde 2004. |
| **Unidad** | Millones de pesos (constantes o corrientes) / Índice base 2004=100 |

**Chips de subcategoría** (multi-select):

| Chip | Qué mide | Fuente | Periodicidad |
|---|---|---|---|
| `PBI trimestral` (default) | Producto bruto interno | INDEC | Trimestral (~2 meses después) |
| `PBI anual` | PBI consolidado anual | INDEC | Anual |
| `PBI per cápita` | PBI / población estimada | INDEC + proyecciones | Anual |
| `EMAE` | Estimador mensual de actividad económica | INDEC | Mensual (~2 meses después) |
| `Consumo privado` | Gasto de hogares (componente PBI) | INDEC cuentas nacionales | Trimestral |
| `Consumo carne per cápita` | Total: bovina + aviar + porcina | Sec. Agricultura / BCR | Anual |
| `Consumo carne (bovina)` | Per cápita de carne vacuna | IPCVA / BCR | Anual. Muy simbólico |
| `Consumo carne (aviar)` | Per cápita de pollo | CEPA / Sec. Agricultura | Anual |
| `Consumo carne (porcina)` | Per cápita de cerdo | Sec. Agricultura | Anual |
| `Consumo leche per cápita` | Litros equivalente per cápita | OCLA | Anual |
| `Ventas supermercados` | Facturación de grandes cadenas | INDEC | Mensual |
| `Ventas mayoristas` | Facturación autoservicios mayoristas | INDEC | Mensual |
| `Ventas online` | Facturación e-commerce | CACE | Semestral/anual |
| `Escrituras inmuebles` | Compraventas escrituradas (CABA) | Colegio Escribanos CABA | Mensual |
| `Patentamientos 0km` | Unidades patentadas de autos nuevos | ACARA | Mensual |

**Controles contextuales (⚙️)**:
- Temporalidad: `M` | `Trim` | `Anual` | `IA` (variación %)
- Rango de fechas
- ☐ **Precios constantes** (default ON para PBI/EMAE)
- ☐ **Precios corrientes**
- ☐ **Per cápita** (solo PBI, consumo)
- ☐ **En USD** (convierte al TC oficial del periodo)

**Fuentes y URLs**:

| Fuente | URL | Formato |
|---|---|---|
| INDEC — PBI | https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-9-47 | XLS |
| INDEC — EMAE | https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-9-48 | XLS |
| INDEC — Supermercados/mayoristas | https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-1-61 | XLS |
| BCR — Carne | https://www.bcr.com.ar | Informes PDF/XLS anuales |
| IPCVA | https://www.ipcva.com.ar | Informes mensuales |
| ACARA | https://www.acara.org.ar | Estadísticas mensuales |
| Colegio Escribanos CABA | https://www.colegio-escribanos.org.ar | Informes mensuales |

---

### Tab 2: SOCIALES 👥

---

#### 2a. Pobreza e indigencia

| Campo | Detalle |
|---|---|
| **Dato principal** | % de personas bajo la línea de pobreza |
| **Periodicidad** | Semestral (INDEC), trimestral/anual (UCA) |
| **Serie histórica** | INDEC desde 2003 (interrupción 2007-2015). UCA desde 2004 (continua). Rozada desde ~2016. |
| **Unidad** | Porcentaje (%) |
| **Controversia** | Alta. Diferencias metodológicas dan cifras muy distintas. UCA suele dar valores más altos. |

**Chips de subcategoría** (multi-select):

| Chip | Qué mide | Fuente |
|---|---|---|
| `Pobreza (personas)` (default) | % personas con ingresos < canasta básica total | INDEC / UCA / Rozada |
| `Pobreza (hogares)` | % hogares bajo la línea | INDEC / UCA |
| `Indigencia (personas)` | % personas con ingresos < canasta básica alimentaria | INDEC / UCA / Rozada |
| `Indigencia (hogares)` | % hogares bajo línea de indigencia | INDEC / UCA |

**Controles contextuales (⚙️)**:
- Temporalidad: `Sem` (semestral, único para INDEC)
- Rango de fechas
- Fuente (radio buttons):
  - ● **INDEC (EPH)** — Oficial. Mide ingresos vs canasta.
  - ○ **UCA (ODSA)** — Multidimensional (salud, educación, vivienda).
  - ○ **Martín Rozada (UTDT)** — Estimación mensual econométrica.
- ☐ **Mostrar todas las fuentes superpuestas** — Grafica las 3 series juntas.

**Fuentes y URLs**:

| Fuente | URL | Formato | Notas |
|---|---|---|---|
| INDEC — EPH | https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-46-152 | XLS | Semestral. Interrupción 2007-2015 |
| UCA — ODSA | https://www.uca.edu.ar/observatorio-deuda-social | PDF/XLS | Serie continua desde 2004 |
| Martín Rozada | https://sites.google.com/view/martin-rozada | XLS/Sheets | Estimación mensual |

---

#### 2b. Distribución del ingreso

| Campo | Detalle |
|---|---|
| **Dato principal** | Coeficiente de Gini |
| **Periodicidad** | Semestral (INDEC) |
| **Serie histórica** | Desde 2003 |
| **Unidad** | Índice 0-1 (Gini), Ratio (brecha) |

**Chips** (multi-select):

| Chip | Qué mide |
|---|---|
| `Coeficiente de Gini` (default) | Desigualdad 0=igualdad, 1=total desigualdad |
| `Brecha decil 10/decil 1` | Veces que gana el 10% más rico vs 10% más pobre |
| `Participación trabajo en ingreso` | % del ingreso nacional que va a salarios |

**Controles (⚙️)**: Temporalidad: `Sem` | `Anual`. Rango de fechas.

**Fuentes**: INDEC EPH (https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-46-152), CEPAL (https://statistics.cepal.org).

---

#### 2c. Tarifas de servicios públicos

| Campo | Detalle |
|---|---|
| **Dato principal** | Precio de referencia del servicio |
| **Periodicidad** | Mensual (cuando hay ajustes) |
| **Unidad** | Pesos argentinos |
| **Controversia** | Alta. Subsidios, segmentación, impacto en IPC regulados. |

**Chips** (multi-select):

| Chip | Fuente |
|---|---|
| `Electricidad (residencial)` | ENRE / Edenor / Edesur |
| `Gas natural (residencial)` | ENARGAS |
| `Agua` | AySA / ERAS |
| `Transporte público (AMBA)` | Min. Transporte |
| `Índice compuesto tarifas` | Cálculo propio |

**Controles (⚙️)**: Temporalidad: `M` | `IA`. ☐ Valor real (por IPC). ☐ En USD.

**Fuentes**: ENRE (https://www.enre.gov.ar), ENARGAS (https://www.enargas.gob.ar). Muchos datos hay que compilar de resoluciones oficiales.

---

#### 2d. Crédito a familias y empresas

| Campo | Detalle |
|---|---|
| **Dato principal** | Stock de créditos al sector privado |
| **Periodicidad** | Mensual |
| **Serie histórica** | Desde 2003 (BCRA) |
| **Unidad** | Millones de pesos / porcentaje (mora) |

**Chips** (multi-select):

| Chip | Fuente |
|---|---|
| `Stock créditos al sector privado` (default) | BCRA |
| `Créditos hipotecarios` | BCRA |
| `Créditos personales` | BCRA |
| `Mora crediticia (familias)` | BCRA — IEF |
| `Mora crediticia (empresas)` | BCRA — IEF |

**Controles (⚙️)**: Temporalidad: `M`. ☐ Nominal (default). ☐ Real (por IPC). ☐ En USD.

**Fuentes**: BCRA (https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp), IEF (https://www.bcra.gob.ar/Pdfs/PublicacionesEstadisticas/IEF.htm).

---

### Tab 3: LABORALES 💼

---

#### 3a. Salarios

| Campo | Detalle |
|---|---|
| **Dato principal** | Salario promedio nominal en pesos |
| **Periodicidad** | Mensual |
| **Serie histórica** | RIPTE desde 2001. Índice de Salarios INDEC desde 2016. |
| **Unidad** | Pesos argentinos |
| **Controversia** | Muy alta. "¿Los salarios le ganan a la inflación?" es LA pregunta argentina. |

**Chips** (multi-select):

| Chip | Qué mide | Fuente | Notas |
|---|---|---|---|
| `RIPTE` (default) | Remuneración promedio trabajadores estables | Min. Trabajo (AFIP) | Solo registrados. El más usado |
| `Salario privado registrado` | Promedio sector privado formal | INDEC — Índice de Salarios | |
| `Salario público` | Promedio sector público | INDEC — Índice de Salarios | |
| `Salario informal (estimado)` | Estimación para no registrados | INDEC EPH microdatos | Menos confiable |
| `Salario mínimo vital y móvil` | Piso legal | Min. Trabajo | Bajo impacto real, alto simbólico |

**Controles (⚙️)**:
- Temporalidad: `M` | `IA`
- ☐ **Nominal** (default)
- ☐ **Real (ajustado por IPC)** — EL toggle más importante de toda la app
- ☐ **En USD (al oficial)**
- ☐ **En USD (al blue)**

**Fuentes y URLs**:

| Fuente | URL | Formato |
|---|---|---|
| Min. Trabajo — RIPTE | https://www.argentina.gob.ar/trabajo/seguridadsocial/ripte | PDF (hay que parsear) |
| INDEC — Índice de Salarios | https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-31-61 | XLS |
| INDEC — EPH microdatos | https://www.indec.gob.ar/indec/web/Institucional-Indec-BasesDeDatos | Bases trimestrales |
| Min. Trabajo — SMVM | https://www.argentina.gob.ar/trabajo/consejodelsalario | Resoluciones |

---

#### 3b. Empleo y desocupación

| Campo | Detalle |
|---|---|
| **Dato principal** | Tasa de desocupación |
| **Periodicidad** | Trimestral (EPH) |
| **Serie histórica** | Desde 2003 (EPH continua) |
| **Unidad** | Porcentaje (%) de la PEA |

**Chips** (multi-select):

| Chip | Qué mide |
|---|---|
| `Tasa de desocupación` (default) | % PEA que busca trabajo y no encuentra |
| `Tasa de empleo` | % población total con trabajo |
| `Tasa de actividad` | % población económicamente activa |
| `Tasa de informalidad` | % ocupados sin aportes jubilatorios |
| `Empleo público vs privado` | Composición del empleo registrado (dos series) |

**Controles (⚙️)**: Temporalidad: `Trim`. Rango de fechas.

**Fuentes**: INDEC EPH (https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-31-58), Min. Trabajo — SIPA (https://www.trabajo.gob.ar/estadisticas/Bel/index.asp).

---

#### 3c. Poder adquisitivo del salario

| Campo | Detalle |
|---|---|
| **Dato principal** | Cantidad de bienes comprables con un salario promedio |
| **Periodicidad** | Mensual (cruce propio) |
| **Unidad** | Unidades del bien (kg, litros, m², unidades) |
| **Nota estratégica** | **Este es el sub-tab más viral.** Lo que se comparte en X. Priorizar: diseño impactante, botón compartir, imagen exportable. |

**Chips** (multi-select):

| Chip | Fórmula | Fuente del precio |
|---|---|---|
| `En kg de asado` | RIPTE ÷ precio kg asado | INDEC IPC carnes |
| `En litros de nafta` | RIPTE ÷ precio litro súper | YPF / Sec. Energía |
| `En Big Macs` | RIPTE ÷ precio Big Mac AR | McDonald's / Economist |
| `En m² (CABA)` | RIPTE ÷ precio m² usado CABA | ZonaProp / Reporte Inmobiliario |
| `En 0km (auto popular)` | RIPTE ÷ precio auto referencia | Listas oficiales |
| `Meses para depto 2amb` | Precio depto 2amb CABA ÷ RIPTE | ZonaProp / Reporte Inmobiliario |

**Controles (⚙️)**: Rango de fechas. Salario base: ● RIPTE | ○ Privado registrado | ○ Mínimo.

**Fuentes**: Cruce propio. Salario de Min. Trabajo / INDEC. Precio del bien de INDEC, YPF, inmobiliarias, etc.

---

### Tab 4: FISCALES 🏛️

---

#### 4a. Deuda pública

| Campo | Detalle |
|---|---|
| **Dato principal** | Stock de deuda en USD |
| **Periodicidad** | Trimestral |
| **Serie histórica** | Desde 2004 (Min. Economía) |
| **Unidad** | Miles de millones de USD |
| **Controversia** | Alta. ¿Se cuenta deuda BCRA? ¿Neta o bruta? ¿Creció en términos reales? |

**Chips** (multi-select):

| Chip | Qué mide | Fuente |
|---|---|---|
| `Deuda bruta total` (default) | Total pasivos sector público nacional | Sec. Finanzas |
| `Deuda Tesoro Nacional` | Solo Tesoro | Sec. Finanzas |
| `Pasivos remunerados BCRA` | LELIQs, pases, NOTALIQs, etc. | BCRA |
| `Deuda consolidada (Tesoro + BCRA)` | Suma. El "verdadero" peso | Cálculo propio |
| `Deuda neta (bruta − reservas)` | Descuenta reservas | Cálculo propio |

**Controles (⚙️)**:
- Temporalidad: `Trim` | `Anual`
- ☐ **En USD** (default)
- ☐ **En % del PBI**
- ☐ **En USD reales (ajustados por CPI EEUU)** — Poder adquisitivo real de la deuda entre periodos

**Fuentes**:

| Fuente | URL | Formato |
|---|---|---|
| Sec. Finanzas — Deuda | https://www.argentina.gob.ar/economia/finanzas/deudapublica/informes-trimestrales | PDF/XLS |
| Min. Economía — Gráficos | https://www.argentina.gob.ar/economia/finanzas/graficos-de-deuda | Interactivo |
| BCRA — Pasivos remunerados | https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp | Series diarias |

---

#### 4b. Resultado fiscal

| Campo | Detalle |
|---|---|
| **Dato principal** | Resultado primario (ingresos − gastos sin intereses) |
| **Periodicidad** | Mensual |
| **Serie histórica** | Desde 2004 |
| **Unidad** | Millones de pesos |

**Chips** (multi-select):

| Chip | Qué mide |
|---|---|
| `Resultado primario` (default) | Ingresos − gasto primario (sin intereses) |
| `Resultado financiero` | Primario − intereses. El "verdadero" resultado |
| `Ingresos totales` | Recaudación tributaria + otros |
| `Gasto primario` | Erogaciones sin intereses |
| `Gasto en intereses` | Pago de intereses de deuda |

**Controles (⚙️)**: Temporalidad: `M` | `Acum` | `IA`. ☐ Nominal. ☐ Real (por IPC). ☐ En % del PBI.

**Fuentes**: Sec. Hacienda (https://www.argentina.gob.ar/economia/sechacienda), ASAP (https://www.asap.org.ar).

---

#### 4c. Reservas internacionales

| Campo | Detalle |
|---|---|
| **Dato principal** | Stock de reservas BCRA en USD |
| **Periodicidad** | Diaria |
| **Serie histórica** | Desde 2003 |
| **Unidad** | Millones de USD |
| **Controversia** | Media-alta. BCRA no publica netas. Se estiman descontando encajes, swaps, DEGs. |

**Chips** (multi-select):

| Chip | Fuente |
|---|---|
| `Reservas brutas` (default) | BCRA |
| `Reservas netas (estimadas)` | Consultoras (1816, Eco Go, etc.) |

**Controles (⚙️)**: Temporalidad: `Diario` | `M` (fin de mes).

**Fuentes**: BCRA (https://www.bcra.gob.ar/PublicacionesEstadisticas/Reservas_internacionales.asp).

---

#### 4d. Comercio exterior

| Campo | Detalle |
|---|---|
| **Dato principal** | Exportaciones e importaciones en USD |
| **Periodicidad** | Mensual |
| **Serie histórica** | Desde 1986 (INDEC) |
| **Unidad** | Millones de USD / Índice base 2004=100 |

**Chips** (multi-select):

| Chip | Fuente |
|---|---|
| `Exportaciones (valor USD)` (default) | INDEC |
| `Importaciones (valor USD)` | INDEC |
| `Balanza comercial` | Cálculo propio |
| `Exportaciones (volumen físico)` | INDEC |
| `Importaciones (volumen físico)` | INDEC |
| `Términos de intercambio` | INDEC |

**Controles (⚙️)**:
- Temporalidad: `M` | `Acum` | `IA`
- ☐ **Valor USD nominal** (default)
- ☐ **Valor USD real (ajustado CPI EEUU)**
- ☐ **Composición** — Cambia gráfico a torta/barras apiladas: Productos primarios, MOA, MOI, Combustibles

**Fuentes**:

| Fuente | URL | Formato |
|---|---|---|
| INDEC — Comercio exterior | https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-2-39 | XLS |
| INDEC — Índices precios/cantidades | https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-2-40 | XLS |

---

## 4. Especificaciones técnicas

### 4.1 Modelo de datos (conceptual)

```
Indicador
  ├── id: string (ej: "inflacion_ipc_general")
  ├── tab: enum (economicas | sociales | laborales | fiscales)
  ├── grupo: string (ej: "inflacion", "dolar", "actividad")
  ├── nombre: string (ej: "IPC General")
  ├── nombre_corto: string (ej: "IPC") — para chips y bottom bar
  ├── unidad: string (ej: "%", "ARS", "USD", "índice")
  ├── periodicidad: enum (diaria | mensual | trimestral | semestral | anual)
  ├── temporalidades_disponibles: [enum] (ej: [mensual, interanual, acumulada])
  ├── serie_desde: date (ej: 2016-06)
  ├── fuente_primaria: string (ej: "INDEC")
  ├── fuente_url: string
  ├── fuentes_alternativas: [{ nombre, url, serie_desde }]
  ├── toggles_disponibles: [{ id, label, formula, aplica_a }]
  │     Ejemplos:
  │     { id: "real", label: "Valor real", formula: "valor * (IPC_ref / IPC_fecha)" }
  │     { id: "usd_oficial", label: "En USD (oficial)", formula: "valor / TC_oficial" }
  │     { id: "per_capita", label: "Per cápita", formula: "valor / poblacion" }
  │     { id: "pct_pbi", label: "En % del PBI", formula: "valor / PBI * 100" }
  └── notas_metodologicas: string

Dato
  ├── indicador_id: FK → Indicador
  ├── fecha: date
  ├── valor: decimal
  ├── fuente: string (ej: "INDEC", "UCA")
  └── metadata: json (notas, revisiones)

Mandato
  ├── presidente: string
  ├── fecha_asuncion: date
  ├── fecha_fin: date | null
  ├── partido: string
  ├── color_hex: string
  └── orden: int
```

### 4.2 Cálculos derivados (on-the-fly, no en DB)

| Cálculo | Fórmula | Inputs |
|---|---|---|
| **Variación interanual** | `(V_mes - V_mes_año_ant) / V_mes_año_ant × 100` | Serie del indicador |
| **Acumulado año** | `Π(1 + var_m/100) - 1` (inflación) o `Σ valores` (flujos) | Serie mensual |
| **Valor real (IPC)** | `V_nominal × (IPC_ref / IPC_fecha)` | Serie IPC INDEC |
| **En USD** | `V_ARS / TC_fecha` | Serie TC (oficial o blue) |
| **Per cápita** | `V / población_fecha` | Proyecciones INDEC |
| **Base 100 (mandatos)** | `V_fecha / V_asunción × 100` | Fecha asunción |
| **TC real bilateral** | `TC_nom × (CPI_EEUU / IPC_ARG)` indexado | IPC ARG + CPI EEUU |

### 4.3 Prioridad de implementación

| Prioridad | Indicadores | Justificación |
|---|---|---|
| **P0 (MVP)** | IPC General, Dólar (oficial + blue), RIPTE, Pobreza INDEC | Los 4 más discutidos |
| **P1** | EMAE, IPC subdivisiones, Brecha, Salario real | Variantes más pedidas |
| **P2** | PBI, Deuda, Reservas, Resultado fiscal | Panorama macro completo |
| **P3** | Consumo carne, Poder adquisitivo, Tarifas, Comercio exterior | Nicho pero virales |
| **P4** | Distribución ingreso, Empleo, Crédito, Mayoristas | Completan catálogo |

### 4.4 Pipeline de datos

```
Fuente (INDEC, BCRA, etc.)
  │
  ├── Descarga manual (XLS/CSV) → carga inicial, una vez
  │     └── Script de parseo + normalización → PostgreSQL
  │
  ├── Scraping automático (blue, algunos indicadores)
  │     └── Cron job diario/mensual → parseo → DB
  │
  └── API (BCRA tiene API; INDEC NO tiene API pública)
        └── Llamada periódica → DB

PostgreSQL
  │
  └── API propia (REST o GraphQL)
        │
        └── App mobile (React Native / Flutter / PWA)
              └── Cálculos derivados on-the-fly en frontend
```

**APIs conocidas**:
- BCRA: https://www.bcra.gob.ar/BCRAyVos/Catalogo_de_APIs_702.asp (TC, reservas, tasas)
- INDEC: NO tiene API. Descargar XLS de su web y parsear.
- Blue: Scraping de Ámbito u otro portal. O usar APIs no oficiales (ej: dolarapi.com).

---

## 5. Identidad visual

### Colores por mandato presidencial

| Presidente | Partido | Color | Hex |
|---|---|---|---|
| Néstor Kirchner | FPV | Celeste | `#5DADE2` |
| Cristina Fernández | FPV | Celeste oscuro | `#2E86C1` |
| Mauricio Macri | PRO/Cambiemos | Amarillo | `#F4D03F` |
| Alberto Fernández | FdT | Celeste grisáceo | `#85C1E9` |
| Javier Milei | LLA | Violeta | `#8E44AD` |

### Palette de series (multi-select de chips)

Cuando se superponen varias subcategorías, asignar en orden:

| Orden | Color | Hex |
|---|---|---|
| Serie 1 | Azul | `#2563EB` |
| Serie 2 | Coral | `#E85D3A` |
| Serie 3 | Verde | `#16A34A` |
| Serie 4 | Ámbar | `#D97706` |
| Serie 5 | Rosa | `#DB2777` |
| Serie 6 | Teal | `#0D9488` |

### Principios de diseño

1. **"Un gráfico, muchas perillas"** — La pantalla muestra UN gráfico principal. Todo lo demás son controles.
2. **Mobile-first** — 375px de ancho. Todo funciona con el pulgar.
3. **Compartible** — Cada gráfico exportable como PNG con marca de agua + fuentes. Formatos: X (1200×675px) y stories (1080×1920px).
4. **Transparente** — Para cada dato: fuente, fecha de publicación, nota metodológica.
5. **Modo oscuro** — Soporte desde el día 1.

---

## 6. Roadmap

| Fase | Qué | Estado |
|---|---|---|
| **Fase 0** | Documento de producto (este archivo) | ✅ Completo |
| **Fase 1** | Cargar datos P0 (IPC, Dólar, RIPTE, Pobreza). Pipeline básico | 🔲 Pendiente |
| **Fase 2** | MVP mobile: 4 tabs, bottom bar dinámica, gráfico, chips, temporalidad | 🔲 Pendiente |
| **Fase 3** | Modo mandato: comparación indexada base 100, multi-select presidentes | 🔲 Pendiente |
| **Fase 4** | Datos P1-P2: completar económicos y fiscales | 🔲 Pendiente |
| **Fase 5** | Compartir: export PNG con marca de agua, deep links | 🔲 Pendiente |
| **Fase 6** | Datos P3-P4: completar catálogo | 🔲 Pendiente |
| **Fase 7** | Apuestas: predicciones y leaderboard | 🔲 Futuro |

---

## 7. Sección Apuestas (futuro)

- Sección separada (5to tab o desde la home).
- "¿La inflación de marzo va a ser mayor o menor a 2.5%?"
- Sistema de puntos/ranking. Sin dinero real (por ahora).
- Resolución automática cuando sale dato oficial.
- Leaderboard de mejores pronosticadores.
- Integración con REM del BCRA (expectativas de analistas vs realidad vs predicciones de usuarios).

---

## 8. Ideas sin priorizar

- Notificaciones push cuando sale dato nuevo de INDEC/BCRA
- "¿Sabías que?" con datos curiosos
- Idioma inglés para inversores extranjeros
- API pública para devs
- Widget iOS/Android con dólar blue + inflación
- Alertas configurables ("Avisame si brecha > 50%")
- Comparación con países de la región
- Sección educativa: "¿Qué es el IPC?", "¿Cómo se calcula la pobreza?"
- Integración con Google Sheets para analistas
