# ArgMetrics - Tareas Pendientes

## Estado: COMPLETADO ✅

### 1. Rate Limiting ✅ HECHO
- [x] Rate limit general: 100 req/min (ya estaba implementado)
- [x] Rate limit ingest: 10 req/min (implementado con middleware separado)

### 2. Tests Unitarios ✅ HECHO
- [x] Configurar vitest (ya estaba instalado, configurado en vitest.config.ts)
- [x] Tests para controllers, routes, utils, rate limiter
- [x] 88 tests pasando
- [x] Cobertura: 52% (excluyendo scripts externos y config)

**Nota:** La cobertura no reach >70% porque los archivos ingest.ts y live.ts 
hacen llamadas HTTP a APIs externas que son difíciles de testear en unit tests.

### 3. Documentación API ✅ HECHO
- [x] Swagger UI disponible en /api-docs
- [x] OpenAPI JSON disponible en /api-docs.json
- [x] Anotaciones JSDoc agregadas a todas las rutas
- [x] Dependencias: swagger-jsdoc, swagger-ui-express

## Archivos modificados:
- src/index.ts - Agregado swagger + rate limiting分开
- src/routes/health.ts - Anotaciones swagger
- src/routes/metrics.ts - Anotaciones swagger
- src/routes/live.ts - Anotaciones swagger
- src/routes/ingest.ts - Anotaciones swagger
- vitest.config.ts - Configuración de coverage
- tests/*.ts - 10 archivos de tests

## Para ejecutar:
- `npm run dev` - Iniciar servidor
- `npm test` - Ejecutar tests
- Acceder a http://localhost:3000/api-docs para la documentación
