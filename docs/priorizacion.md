# Priorización de Features - MoSCoW

## 🟢 Must Have (Crítico - MVP)
> Sin estas features, el proyecto NO tiene sentido. Deben estar en la primera iteración.

| ID | Feature | Justificación |
|----|---------|----------------|
| M-01 | Dashboard con 5 indicadores principales | Es la propuesta de valor core |
| M-02 | Gráficos de trends interactivos | Visualización de datos económicos |
| M-03 | Filtro rango de fechas (año inicio/fin) | Análisis histórico básico |
| M-04 | Indicadores: Inflación, Dólar, PBI, Desempleo, Pobreza | Los 5 más relevantes para usuarios |
| M-05 | Base de datos propia (Supabase) | Almacenamiento y caché |
| M-06 | Consumo APIs externas (BCRA, INDEC) | Fuente de datos en tiempo real |
| M-07 | Modo offline con datos cacheados | Disponibilidad sin conexión |
| M-08 | Tema oscuro (dark mode) | Diseño atractivo como requisito |
| M-09 | Navegación bottom tabs | UX básica |

---

## 🟡 Should Have (Importante - versión 1.0)
> Agregan valor significativo. Incluir si el tiempo lo permite.

| ID | Feature | Justificación |
|----|---------|----------------|
| S-01 | Filtro interanual vs. acumulado | Análisis más profundo |
| S-02 | Filtro real vs. nominal | Diferenciación clave para Argentina |
| S-03 | Más indicadores (Balanza, Riesgo País, Reservas) | Completar propuesta de valor |
| S-04 | Pull-to-refresh | UX estándar |
| S-05 | Skeleton loaders durante carga | Percepción de performance |
| S-06 | Selector de favoritos para dashboard | Personalización básica |
| S-07 | Tabla de datos históricos | Para análisis granular |
| S-08 | Persistencia de filtros entre sesiones | Conveniencia |

---

## 🟠 Could Have (Deseable - versión 1.1+)
> Nice to have. Mejoran experiencia pero no son esenciales.

| ID | Feature | Justificación |
|----|---------|----------------|
| C-01 | Notificaciones push de alertas | Engagement del usuario |
| C-02 | Configuración de umbrales de alerta | Valor agregado |
| C-03 | Tema claro (light mode) | Preferencias de usuario |
| C-04 | Gráficos animados | Mejora visual |
| C-05 | Indicador de última actualización | Transparencia |
| C-06 | Widgets en home screen | Acceso rápido |
| C-07 | Exportar datos (CSV/PDF) | Para analistas08 | Comparación de indicadores |
| C- | Análisis avanzado |
| C-09 | Modo widget para Apple Watch/Android Wear | Acceso rápido |

---

## 🔴 Won't Have (Scope out - versiones futuras)
> No para esta iteración. Documentar para roadmap.

| ID | Feature | Justificación |
|----|---------|----------------|
| W-01 | Autenticación / usuario | No es necesario para MVP |
| W-02 | Widgets interactivos | Complejidad innecesaria inicial |
| W-03 | Alertas por email | MVP no lo requiere |
| W-04 | Comparación entre países | Fuera de scope inicial |
| W-05 | Predicciones / ML | Roadmap a largo plazo |
| W-06 | Chat con otros usuarios | No es una red social |
| W-07 | Integración con trading platforms | Fuera de scope |

---

## Notas de Priorización

### Dependencias Técnicas
- M-05 y M-06 son prerequisito para casi todo lo demás (datos)
- M-08 (tema) debe estar desde el inicio para mantener consistencia
- M-02 (gráficos) necesita definirse temprano para elegir librería

### Risks Identificados
- APIs de BCRA/INDEC pueden cambiar sin aviso → tener plan B con BD propia
- Datos económicos sensibles a volatilidad → cachear agresivamente
- Diseño "atractivo" es subjetivo → iterar con feedback

---

*Revisar priorización cada 2 semanas según feedback y avances.*
