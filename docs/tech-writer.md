# Tech Writer — ArgMetrics

## Documentación existente

### Swagger / OpenAPI
Disponible en desarrollo en `http://localhost:3000/api-docs` (backend Express).
No disponible en producción (Vercel).

### Este sistema de docs (`docs/`)
Archivos Markdown organizados por rol, importados desde `CLAUDE.md`. Son el contexto principal para desarrollo con Claude Code.

## Cómo documentar un nuevo endpoint

Al agregar un endpoint a `api/index.ts`:
1. Agregar la fila a la tabla de endpoints en `backend-developer.md`
2. Si el endpoint expone datos nuevos, actualizar `data-researcher.md` con la fuente
3. Si hay un nuevo modelo de respuesta, documentarlo en `backend-developer.md`

## Cómo documentar una nueva fuente de datos

En `data-researcher.md`:
- Agregar a la tabla "Indicadores por implementar" si es pendiente
- Mover a "Fuentes de datos activas" cuando esté implementado
- Incluir: URL, formato, frecuencia, auth requerido, caveats

## Cómo documentar un bug resuelto

En `qa-engineer.md`:
- Mover de "Bugs conocidos" a "Bugs resueltos"
- Incluir la solución concisa

## Changelog informal
Los commits siguen el formato `tipo(scope): descripción`. Los tipos usados:
- `feat` — nueva funcionalidad
- `fix` — bug fix
- `refactor` — refactor sin cambio de comportamiento
- `docs` — solo documentación
- `chore` — cambios de configuración/build

## API para consumidores externos (futuro)
Cuando se abra la API pública (Fase 4), documentar:
- Autenticación con API key
- Rate limits por tier
- Endpoints disponibles por plan
- Ejemplos en curl, Python, JavaScript
- Changelog de versiones de la API
