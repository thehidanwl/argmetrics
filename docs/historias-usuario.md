# Historias de Usuario - ArgMetrics

## Dashboard y Visualización

### US-01: Ver Dashboard Principal
**Como** usuario de la app,
**Quiero** ver un dashboard con los indicadores económicos más importantes,
**Para** tener una visión rápida del estado de la economía argentina.

**Criterios de Aceptación:**
- [ ] Dashboard muestra 5 indicadores configurables como默认值
- [ ] Cada tarjeta muestra: nombre, valor actual, variación %, mini-gráfico
- [ ] Tapping en tarjeta navega a vista detail del indicador
- [ ] Pull-to-refresh actualiza todos los datos

---

### US-02: Visualizar Trend de Indicador
**Como** usuario,
**Quiero** ver un gráfico de tendencia de un indicador económico,
**Para** analizar su evolución histórica.

**Criterios de Aceptación:**
- [ ] Gráfico de línea muestra serie temporal completa
- [ ] Eje X: fechas/meses/años según frecuencia del indicador
- [ ] Eje Y: valores del indicador
- [ ] Tooltip al tocar muestra fecha exacta y valor
- [ ] Soporte para zoom y pan en el gráfico
- [ ] Animación suave al cargar datos

---

### US-03: Aplicar Filtros a Gráficos
**Como** usuario,
**Quiero** filtrar los datos por rango de fechas y tipo de valor,
**Para** analizar períodos específicos o comparar valores reales vs. nominales.

**Criterios de Aceptación:**
- [ ] Selector de año inicio y año fin
- [ ] Toggle: interanual ON/OFF
- [ ] Toggle: real/ajustado por inflación vs. nominal
- [ ] Filtros se aplican instantáneamente al gráfico
- [ ] Estado de filtros persiste entre pantallas

---

## Datos y Sincronización

### US-04: Ver Datos en Modo Offline
**Como** usuario sin conexión,
**Quiero** ver los últimos datos disponibles,
**Para** consultar la app incluso sin internet.

**Criterios de Aceptación:**
- [ ] App muestra datos cacheados cuando no hay conexión
- [ ] Indicador visual muestra "sin conexión" y antigüedad de datos
- [ ] Pull-to-refresh muestra mensaje de error claro si no hay conexión
- [ ] Datos se actualizan automáticamente al recuperar conexión

---

### US-05: Sincronización Automática
**Como** usuario,
**Quiero** que los datos se actualicen automáticamente,
**Para** siempre tener información actualizada sin acción manual.

**Criterios de Aceptación:**
- [ ] Sincronización en background al abrir app
- [ ] Frecuencia configurable: manual, 1h, 6h, 12h, 24h
- [ ] Indicador de última actualización visible
- [ ] Notificación cuando hay nuevos datos disponibles (opcional)

---

## Alertas

### US-06: Configurar Alertas de Umbral
**Como** usuario,
**Quiero** recibir notificaciones cuando un indicador supere un umbral,
**Para** estar informado de cambios significativos.

**Criterios de Aceptación:**
- [ ] En vista detail, opción "Crear alerta"
- [ ] Selector de umbral (mayor que / menor que)
- [ ] Input para valor numérico
- [ ] Notificación push cuando se cumple condición
- [ ] Lista de alertas activas en Settings

---

## Personalización

### US-07: Personalizar Dashboard
**Como** usuario,
**Quiero** elegir qué indicadores aparecen en mi dashboard,
**Para** enfocarme en los datos que me interesan.

**Criterios de Aceptación:**
- [ ] Botón "Editar dashboard" en pantalla principal
- [ ] Lista de todos los indicadores disponibles
- [ ] Reordenar mediante drag & drop
- [ ] Seleccionar hasta 8 indicadores
- [ ] Guardar preferencias en almacenamiento local

---

### US-08: Cambiar Tema (Dark/Light)
**Como** usuario,
**Quiero** poder usar tema claro o tema oscuro,
**Para** adaptar la app a mis preferencias.

**Criterios de Aceptación:**
- [ ] En Settings, toggle para tema oscuro
- [ ] Tema por defecto: oscuro
- [ ] Cambio instantáneo sin reiniciar app
- [ ] Preferencias persisten entre sesiones

---

## Usabilidad

### US-09: Navegación Intuitiva
**Como** usuario nuevo,
**Quiero** una navegación clara y predecible,
**Para** no perderme dentro de la app.

**Criterios de Aceptación:**
- [ ] Bottom tab navigation con 3 tabs: Dashboard, Indicadores, Settings
- [ ] Iconos claros con etiquetas
- [ ] Breadcrumb o título claro en cada pantalla
- [ ] Botón atrás funcional en todas las pantallas

---

### US-10: Ver Detalle de Indicador
**Como** usuario,
**Quiero** ver información completa de un indicador,
**Para** analizar en profundidad.

**Criterios de Aceptación:**
- [ ] Título y descripción del indicador
- [ ] Valor actual con unidad
- [ ] Variación vs. período anterior (%)
- [ ] Gráfico de trend interactivo
- [ ] Tabla de datos históricos
- [ ] Fuente de los datos
- [ ] Botón para configurar alerta

---

*Historias priorizadas por valor de usuario y complejidad técnica.*
