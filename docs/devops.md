# DevOps — ArgMetrics

## Plataformas
- **API + Web**: Vercel (auto-deploy en push a `master`)
- **DB**: Supabase (PostgreSQL managed)
- **Mobile**: Google Play (Internal Testing → Production)

## Vercel

### Build pipeline
```json
{
  "buildCommand": "npm install && npx prisma generate --schema=backend/prisma/schema.prisma && cd web && npm install && npm run build",
  "installCommand": "npm install",
  "outputDirectory": "web/out"
}
```

### Serverless function
```json
{
  "functions": {
    "api/index.ts": { "includeFiles": "node_modules/.prisma/client/**" }
  }
}
```
`includeFiles` es obligatorio para que Vercel bundlee el query engine binary de Prisma (NFT no lo detecta solo).

### Rewrites
```json
{ "source": "/api/(.*)", "destination": "/api" }
```
Todo `/api/*` va al mismo handler.

### Cron jobs
```json
{ "path": "/api/v1/ingest/usd",       "schedule": "0 7 * * *"  }  // diario 7am UTC
{ "path": "/api/v1/ingest/inflation", "schedule": "0 8 1 * *"  }  // 1ro de mes 8am UTC
```

### Variables de entorno en Vercel
Configurar en el dashboard de Vercel (no en archivos):
- `POSTGRES_URL` — Supabase pooler connection string con pgbouncer=true ya incluido en la URL

## Supabase
- Proyecto: `pfwenbcuorekeawqguio`
- Región: `us-west-2` (pooler endpoint: `aws-0-us-west-2.pooler.supabase.com`)
- Puerto directo: 5432 (no usar en producción)
- Puerto pooler: 6543 (usar siempre en Vercel)

## Google Play (Mobile)

### Track actual
Internal Testing. Para avanzar: Internal → Closed Testing → Open Testing → Production.

### Proceso de release
```bash
export PATH="/home/kakuzu/.local/share/fnm/node-versions/v20.20.1/installation/bin:$PATH"
node mobile/scripts/release.mjs internal
```
El script:
1. Auto-incrementa `versionCode` en `android/app/build.gradle`
2. Compila el AAB con `./gradlew bundleRelease`
3. Sube a Google Play Internal Testing via API

### Secrets requeridos (NO en git)
- `mobile/secrets/service-account.json` — Google Play API key
- `mobile/secrets/argmetrics-release-v2.keystore` — Android signing key

### Node.js en el entorno
Node no está en PATH por defecto. Instalado via fnm:
```bash
~/.local/share/fnm/node-versions/v20.20.1/installation/bin/node
```

## Monitoreo
- **Vercel Functions**: logs disponibles en el dashboard de Vercel → Functions tab
- **DB**: Supabase dashboard → Table Editor / Logs
- **Errores de API**: `/api/v1/health` expone `database.status` y `database.latencyMs`

## Checklist de deploy
- [ ] Variables de entorno seteadas en Vercel
- [ ] `POSTGRES_URL` usa el pooler (puerto 6543), no directo (5432)
- [ ] `npx prisma generate` incluido en buildCommand
- [ ] `binaryTargets` incluye `rhel-openssl-3.0.x` en schema.prisma
- [ ] `includeFiles` configurado en vercel.json para la function
