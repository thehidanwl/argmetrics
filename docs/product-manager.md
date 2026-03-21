# Product Manager — ArgMetrics

## Fase actual: MVP
App Android funcional en Internal Testing. Web deployada en Vercel. Backend con DB real conectada.

## Roadmap

### Fase 1 — Core (actual / completar)
- [x] Dashboard con KPIs principales
- [x] Cotizaciones USD en tiempo real
- [x] Riesgo país
- [x] App en Google Play (Internal Testing)
- [x] DB real conectada (Supabase)
- [ ] Ingesta automática de inflación (INDEC)
- [ ] Ingesta automática de tasas BCRA
- [ ] Riesgo país automático (no manual)
- [ ] Tab bar icons visibles en mobile
- [ ] Pantalla Metrics completa con datos reales
- [ ] Mover de Internal Testing a Open Testing

### Fase 2 — Datos completos
- [ ] PBI trimestral
- [ ] Pobreza e indigencia (semestral)
- [ ] Desempleo (trimestral)
- [ ] Salarios (RIPTE)
- [ ] Reservas internacionales (diario)
- [ ] MEP/CCL con precio real (no estimado)
- [ ] Histórico desde 2015 en base de datos
- [ ] Filtros y comparativas por período
- [ ] Charts SVG (resolver el crash de release)

### Fase 3 — Monetización Pro
- [ ] Sistema de autenticación (Supabase Auth)
- [ ] Tier Free vs Pro diferenciado en la API
- [ ] Pasarela de pago (MercadoPago para Argentina + Stripe para internacional)
- [ ] Push notifications para alertas
- [ ] Alertas configurables ilimitadas (Pro)
- [ ] Exportación CSV/JSON (Pro)
- [ ] Histórico extendido solo para Pro
- [ ] Widgets de pantalla de inicio

### Fase 4 — Expansión
- [ ] Datos provinciales
- [ ] Comparativas entre períodos/gobiernos
- [ ] Proyecciones e indicadores adelantados
- [ ] iOS (actualmente solo Android)
- [ ] API pública para desarrolladores (posible monetización B2B)

## Free vs Pro — Definición de límites

| Feature | Free | Pro |
|---------|------|-----|
| Dólar (oficial/blue/MEP/CCL) | ✅ | ✅ |
| Inflación mensual | ✅ | ✅ |
| Riesgo país | ✅ | ✅ |
| Histórico | 6 meses | Desde 2015 |
| Alertas | 1 | Ilimitadas |
| Push notifications | ❌ | ✅ |
| Exportación | ❌ | ✅ |
| PBI / Pobreza / Empleo | Vista previa | ✅ completo |
| Datos provinciales | ❌ | ✅ |
| Widgets | ❌ | ✅ |
| Publicidad | Posible | Sin publicidad |

## KPIs del producto
- Instalaciones activas (DAU/MAU)
- Retención a 7 días y 30 días
- Conversión Free → Pro
- Tiempo hasta primer "valor visto" (onboarding)
- Tasa de error en fetches de datos

## Decisiones de producto tomadas
- **Mobile-first**: la web es complementaria, el producto principal es la app
- **Datos siempre visibles**: no hay paywall en la pantalla principal — el usuario ve datos útiles sin registrarse
- **Fuentes explícitas**: cada dato muestra su fuente (confianza = retención)
- **Argentina primero**: el producto está pensado para usuarios argentinos, no para mercados internacionales en esta etapa
