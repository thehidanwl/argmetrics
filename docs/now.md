# Ahora mismo — ArgMetrics

> **Claude Code debe actualizar este archivo al final de cada sesión** con el estado real del proyecto: qué se hizo, qué quedó pendiente, qué cambió. El dueño del proyecto puede editarlo antes de empezar una sesión para describir el foco del día.

---

## Última sesión — 2026-03-25

### Qué se hizo
- Creada estructura de documentación por roles (`docs/`) con 11 archivos especializados
- Cada archivo tiene dos capas: contexto de ArgMetrics + expertise de clase mundial para ese rol
- `CLAUDE.md` actualizado para importar todos los docs automáticamente
- Agregada regla de cierre de sesión para que Claude Code actualice este archivo siempre
- pgbouncer fix commiteado y pusheado (`api/index.ts`)

### Estado del proyecto hoy
- **API**: funcional en Vercel, conectada a Supabase, datos reales de USD via Bluelytics
- **Ingesta automática**: solo USD (cron diario a las 7am UTC). Inflación y riesgo país son manuales.
- **Mobile**: versionCode 16 en Google Play Internal Testing. Funciona. Sin tab bar icons visibles.
- **Web**: funcional con datos reales

### Próximos pasos (en orden de prioridad)
1. Implementar ingesta automática de tasas y reservas desde BCRA API
2. Implementar ingesta de inflación (INDEC Excel) — endpoint `POST /v1/ingest/inflation`
3. Automatizar riesgo país (Ámbito scrape o BCRA API)
4. Corregir tab bar icons en mobile (styling issue)
5. Avanzar hacia Open Testing en Google Play

### Ideas para no perder
_(agregar aquí ideas, conceptos, cosas a explorar antes de la próxima sesión)_
