# Requisitos Funcionales y No Funcionales - ArgMetrics

## Requisitos Funcionales

### RF-01: Visualización de Indicadores Económicos
- **RF-01.01** La app debe mostrar gráficos de trends para: inflación mensual/anual, dólar (oficial, blue, CCL, MEP), tasa de desempleo, PBI, PBI per cápita, índice de pobreza, índice de indigencia, balanza comercial, riesgo país.
- **RF-01.02** Cada indicador debe tener su propia vista detail con historial de datos.
- **RF-01.03** Los gráficos deben ser interactivos (zoom, pan, tooltip con valores).

### RF-02: Sistema de Filtros
- **RF-02.01** Filtro de rango de fechas (año inicio - año fin).
- **RF-02.02** Filtro de tipo de dato: interanual (YoY) vs. mensual/acumulado.
- **RF-02.03** Filtro de valor: real (ajustado por inflación) vs. nominal.
- **RF-02.04** Los filtros deben persistir entre sesiones.

### RF-03: Dashboard Principal
- **RF-03.01** Dashboard con vista resumida de los 5 indicadores más relevantes.
- **RF-03.02** Tarjetas de resumen con valor actual, variación vs. período anterior, y mini-sparkline.
- **RF-03.03** Navegación rápida entre indicadores desde el dashboard.

### RF-04: Gestión de Datos
- **RF-04.01** Consumo de APIs externas (BCRA, INDEC, etc.) para datos en tiempo real.
- **RF-04.02** Base de datos propia (Supabase) para caché y datos históricos no disponibles vía API.
- **RF-04.03** Sincronización automática en background cuando hay conexión.
- **RF-04.04** Modo offline: mostrar últimos datos disponibles con indicador de antigüedad.

### RF-05: Alertas y Notificaciones
- **RF-05.01** Notificaciones push cuando un indicador supera un umbral configurable.
- **RF-05.02** Alertas de "nuevo dato disponible" cuando se actualiza alguna fuente.

### RF-06: Interfaz de Usuario
- **RF-06.01** Diseño atractivo visualmente con tema oscuro (dark mode por defecto).
- **RF-06.02** Soporte para modo claro.
- **RF-06.03** Gráficos animados con transiciones suaves.
- **RF-06.04** Loading states y skeleton loaders durante carga de datos.

### RF-07: Configuración y Personalización
- **RF-07.01** Selector de indicadores favoritos para el dashboard.
- **RF-07.02** Configuración de umbrales de alerta por indicador.
- **RF-07.03** Opción de cambiar frecuencia de actualización (manual, cada 1h, cada 6h).

---

## Requisitos No Funcionales

### RNF-01: Performance
- **RNF-01.01** La app debe cargar el dashboard en menos de 2 segundos en condiciones normales.
- **RNF-01.02** Los gráficos deben renderizarse a 60fps durante interacciones.
- **RNF-01.03** Tiempo de respuesta de APIs propias < 500ms.

### RNF-02: Compatibilidad
- **RNF-02.01** Soporte para iOS 14+ y Android 8+ (API 26+).
- **RNF-02.02**适配多种屏幕尺寸 (phones y tablets).

### RNF-03: Disponibilidad
- **RNF-03.01** Modo offline funcional con últimos datos cacheados.
- **RNF-03.02** Graceful degradation: si una API falla, mostrar datos de fallback.

### RNF-04: Seguridad
- **RNF-04.01** Datos almacenados de forma segura en el dispositivo.
- **RNF-04.02** HTTPS obligatorio para todas las comunicaciones.
- **RNF-04.03** No almacenar credenciales sensibles en texto plano.

### RNF-05: Mantenibilidad
- **RNF-05.01** Código modular con separación clara de responsabilidades.
- **RNF-05.02** Documentación de APIs y estructura de datos.
- **RNF-05.03** Tests unitarios覆盖率 > 70%.

### RNF-06: Accesibilidad
- **RNF-06.01** Soporte para VoiceOver/TalkBack.
- **RNF-06.02** Contraste mínimo WCAG AA (4.5:1 para texto).
- **RNF-06.03** Tamaño de touch targets mínimo 44x44pt.

---

## Datos a Visualizar (Indicadores)

| ID | Indicador | Fuente Primaria | Frecuencia |
|----|-----------|-----------------|------------|
| IND-01 | Inflación Mensual | INDEC / BCRA | Mensual |
| IND-02 | Inflación Anual (Acumulada) | INDEC | Anual |
| IND-03 | Dólar Oficial (BCRA) | BCRA | Diaria |
| IND-04 | Dólar Blue | Ámbito / Reuters | Diaria |
| IND-05 | Dólar CCL | BCRA | D-06 | Dólar MEP | BCRA | Diaria |
| INDiaria |
| IND-07 | Tasa de Desempleo | INDEC | Trimestral |
| IND-08 | PBI (Producto Bruto Interno) | INDEC | Trimestral |
| IND-09 | PBI Per Cápita | INDEC | Trimestral |
| IND-10 | Índice de Pobreza | INDEC | Semestral |
| IND-11 | Índice de Indigencia | INDEC | Semestral |
| IND-12 | Balanza Comercial | INDEC | Mensual |
| IND-13 | Riesgo País (EMBI+) | JP Morgan | Diaria |
| IND-14 | Tasa de Política Monetaria | BCRA | Diaria |
| IND-15 | Reservas Internacionales | BCRA | Diaria |

---

*Documento vivo: actualizar según evolución del proyecto.*
