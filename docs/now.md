# Ahora mismo — ArgMetrics

> Este archivo lo actualiza el dueño del proyecto. Describe el foco actual, el contexto de la sesión, y las ideas que no deben perderse. Claude Code lo lee en cada conversación para saber dónde estamos parados.

---

## Foco actual
Infraestructura de documentación y contexto del proyecto lista.
Base de datos Supabase conectada con pgbouncer fix aplicado.
App mobile funcional en Google Play Internal Testing (versionCode 16).

## Estado del proyecto hoy
- API en Vercel: conectada a Supabase, datos reales de USD via Bluelytics
- Ingesta automática: solo USD (cron diario). Inflación y riesgo país son datos manuales (seed).
- Mobile: funciona, sin tab bar icons visibles, MEP/CCL son estimados
- Web: funciona con datos reales

## Próximos pasos (en orden de prioridad)
1. Implementar ingesta automática de tasas y reservas desde BCRA API
2. Implementar ingesta de inflación (INDEC Excel)
3. Automatizar riesgo país
4. Corregir tab bar icons en mobile

## Ideas para no perder
_(agregar aquí ideas, conceptos, cosas a explorar)_
