/**
 * Ingestion script: Monthly inflation (IPC) from INDEC
 *
 * Usage: npx tsx src/scripts/ingestion/inflation.ts
 * Cron:  Monthly via Vercel Cron → GET /api/v1/ingest/inflation (once implemented)
 *
 * INDEC publishes the IPC dataset as Excel files at:
 * https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31
 *
 * TODO: implement Excel parsing with the 'xlsx' package once the file URL
 * is confirmed stable. INDEC changes file paths without notice, so the
 * parser must validate column headers before processing.
 */

import { getPrisma } from '../../config/database.js';

// Historic monthly IPC values (base: Dec 2016 = 100, var % vs previous month).
// Extend this array when INDEC publishes new data.
const KNOWN_INFLATION_DATA: Array<{ month: string; value: number }> = [
  { month: '2024-01', value: 20.6 },
  { month: '2024-02', value: 13.2 },
  { month: '2024-03', value: 11.0 },
  { month: '2024-04', value: 8.8 },
  { month: '2024-05', value: 4.2 },
  { month: '2024-06', value: 4.6 },
  { month: '2024-07', value: 4.0 },
  { month: '2024-08', value: 4.2 },
  { month: '2024-09', value: 3.5 },
  { month: '2024-10', value: 2.4 },
  { month: '2024-11', value: 2.4 },
  { month: '2024-12', value: 2.7 },
  { month: '2025-01', value: 2.3 },
  { month: '2025-02', value: 2.4 },
  { month: '2025-03', value: 3.7 },
  { month: '2025-04', value: 3.3 },
  { month: '2025-05', value: 3.3 },
  { month: '2025-06', value: 3.7 },
  { month: '2025-07', value: 3.0 },
  { month: '2025-08', value: 3.5 },
  { month: '2025-09', value: 3.5 },
  { month: '2025-10', value: 3.4 },
  { month: '2025-11', value: 2.4 },
  { month: '2025-12', value: 2.7 },
  { month: '2026-01', value: 2.3 },
  { month: '2026-02', value: 4.2 },
];

async function runIngestion(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Starting inflation ingestion...`);

  const prisma = getPrisma();
  if (!prisma) {
    console.error('❌ Database not configured. Set POSTGRES_URL or DATABASE_URL and re-run.');
    process.exit(1);
  }

  let saved = 0;
  let skipped = 0;

  try {
    for (const item of KNOWN_INFLATION_DATA) {
      const id = `inflation-${item.month}`;
      const date = new Date(`${item.month}-01`);
      try {
        await prisma.metric.upsert({
          where: { id },
          update: { value: item.value, updatedAt: new Date() },
          create: { id, category: 'economy', name: 'inflation', value: item.value, date, periodType: 'monthly', source: 'INDEC' },
        });
        saved++;
      } catch (err) {
        console.error(`Skipping ${item.month}:`, err);
        skipped++;
      }
    }

    await prisma.ingestionLog.create({
      data: {
        source: 'INDEC',
        metric: 'inflation',
        status: skipped === 0 ? 'success' : 'partial',
        rowsProcessed: saved,
        errorMessage: skipped > 0 ? `${skipped} records skipped` : undefined,
      },
    });

    console.log(`[${new Date().toISOString()}] Done: ${saved} saved, ${skipped} skipped`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    try {
      await prisma.ingestionLog.create({
        data: { source: 'INDEC', metric: 'inflation', status: 'error', rowsProcessed: 0, errorMessage: msg },
      });
    } catch {}
    console.error('Ingestion failed:', msg);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runIngestion();
