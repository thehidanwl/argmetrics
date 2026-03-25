# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentación del proyecto
@docs/now.md
@docs/ideas.md
@docs/spec.md
@docs/vision.md

@docs/architect.md
@docs/backend-developer.md
@docs/mobile-developer.md
@docs/database-engineer.md
@docs/devops.md
@docs/data-researcher.md
@docs/ui-designer.md
@docs/product-manager.md
@docs/qa-engineer.md
@docs/tech-writer.md

---

## Regla de cierre de sesión

**Al finalizar cada sesión donde se hizo trabajo real, Claude Code DEBE:**
1. Actualizar `docs/now.md` con el estado actual del proyecto
2. Reflejar qué se completó, qué quedó pendiente, y qué cambió
3. Hacer commit y push de `docs/now.md` con mensaje `docs: update session state`

Esto es obligatorio, no opcional. El objetivo es que la próxima sesión arranque con contexto real.

---

## Comandos rápidos

### Backend (desarrollo local)
```bash
cd backend
npm run dev                                            # servidor en puerto 3000
npm test                                               # todos los tests (Vitest)
npm test -- --run tests/metricsController.test.ts      # test específico
npm run lint
npm run db:generate   # regenerar cliente Prisma
npm run db:push       # aplicar schema a DB
```

### Web
```bash
cd web
npm run dev     # Next.js en puerto 3001
npm run build
npm run lint
```

### Mobile
```bash
cd mobile
npm start           # Expo dev server
npm run android     # Android en emulador

# Release a Google Play:
export PATH="/home/kakuzu/.local/share/fnm/node-versions/v20.20.1/installation/bin:$PATH"
node mobile/scripts/release.mjs internal
```

## Monorepo
```
argmetrics/
├── backend/    Express API — desarrollo local
├── web/        Next.js — desplegado en Vercel
├── mobile/     Expo + React Native — Google Play
├── api/        Vercel serverless handler (único en producción)
└── docs/       Contexto del proyecto por rol
```
