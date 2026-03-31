/**
 * Carga histórica inicial de datos de dólar desde ArgentinaDatos API.
 * Fuente: https://argentinadatos.com/docs/
 *
 * Uso:
 *   cd backend
 *   export POSTGRES_URL="postgres://..."
 *   npx tsx scripts/loadHistoricalUSD.ts
 *
 * Cobertura esperada:
 *   - oficial: desde ~2002
 *   - blue:    desde ~2011 (inicio del cepo)
 *   - mep:     desde ~2019
 *   - ccl:     desde ~2019
 *   - mayorista: desde ~2002
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const TIPOS: Record<string, string> = {
  oficial: 'usd_oficial',
  blue: 'usd_blue',
  bolsa: 'usd_mep',
  contadoconliqui: 'usd_ccl',
  mayorista: 'usd_mayorista',
};

interface ArgentinaDatosEntry {
  casa: string;
  compra: number | null;
  venta: number;
  fecha: string; // "YYYY-MM-DD" o "YYYY/MM/DD"
}

function normalizeDate(fechaStr: string): string {
  // Normaliza "YYYY/MM/DD" → "YYYY-MM-DD"
  return fechaStr.replace(/\//g, '-');
}

async function fetchHistorico(casa: string): Promise<ArgentinaDatosEntry[]> {
  const url = `https://api.argentinadatos.com/v1/cotizaciones/dolares/${casa}`;
  const resp = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'ArgMetrics/1.0' },
  });
  if (!resp.ok) {
    throw new Error(`ArgentinaDatos error para ${casa}: ${resp.status} ${resp.statusText}`);
  }
  return resp.json();
}

async function main() {
  const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
  if (!databaseUrl) {
    console.error('❌ POSTGRES_URL no está configurada. Exportarla antes de correr el script.');
    process.exit(1);
  }

  // Para conexión directa (puerto 5432) no se necesita pgbouncer=true
  // Solo agregarlo si es el pooler de Supabase (puerto 6543)
  const finalUrl = databaseUrl.includes(':6543') && !databaseUrl.includes('pgbouncer=true')
    ? databaseUrl + (databaseUrl.includes('?') ? '&' : '?') + 'pgbouncer=true'
    : databaseUrl;

  const prisma = new PrismaClient({ datasources: { db: { url: finalUrl } } });

  try {
    await prisma.$connect();
    console.log('✅ Conectado a la DB\n');
  } catch (err) {
    console.error('❌ No se pudo conectar a la DB:', err);
    process.exit(1);
  }

  let totalInserted = 0;
  const now = new Date();

  for (const [casa, metricName] of Object.entries(TIPOS)) {
    console.log(`📥 Descargando ${casa} → ${metricName}...`);
    try {
      const datos = await fetchHistorico(casa);
      console.log(`   ${datos.length} registros descargados.`);

      // Construir todos los registros válidos
      const records = datos
        .filter(d => d.venta != null && isFinite(d.venta) && d.venta > 0)
        .map(d => {
          const fecha = normalizeDate(d.fecha);
          return {
            id: `${metricName}-${fecha}`,
            name: metricName,
            category: 'economy',
            value: d.venta,
            date: new Date(fecha + 'T00:00:00.000Z'),
            periodType: 'daily',
            source: 'ArgentinaDatos',
            createdAt: now,
            updatedAt: now,
          };
        });

      if (records.length === 0) {
        console.log(`   ⚠️  Sin registros válidos para ${metricName}`);
        continue;
      }

      // Insertar en lotes de 500 para no saturar la conexión
      const BATCH = 500;
      let inserted = 0;
      for (let i = 0; i < records.length; i += BATCH) {
        const batch = records.slice(i, i + BATCH);
        const result = await prisma.metric.createMany({
          data: batch,
          skipDuplicates: true,
        });
        inserted += result.count;
        process.stdout.write(`   Lote ${Math.floor(i / BATCH) + 1}/${Math.ceil(records.length / BATCH)}: ${result.count} insertados\r`);
      }
      console.log(`\n   ✅ ${inserted} registros nuevos para ${metricName} (${records.length - inserted} ya existían)`);
      totalInserted += inserted;

      // Log de ingesta
      await prisma.ingestionLog.create({
        data: {
          source: 'ArgentinaDatos',
          metric: metricName,
          status: 'success',
          rowsProcessed: inserted,
        },
      });
    } catch (err: any) {
      console.error(`   ❌ Error al cargar ${metricName}:`, err.message);
      await prisma.ingestionLog.create({
        data: {
          source: 'ArgentinaDatos',
          metric: metricName,
          status: 'error',
          rowsProcessed: 0,
          errorMessage: String(err.message),
        },
      });
    }

    // Pausa breve entre casas para no sobrecargar la API
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n🎉 Carga completa. Total insertados: ${totalInserted}`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
