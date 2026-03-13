/**
 * Ingestion script: USD official rate from BCRA API
 *
 * Usage: npx tsx src/scripts/ingestion/usd-official.ts
 * Cron:  Daily at 07:00 UTC via Vercel Cron → GET /api/v1/ingest/usd
 *
 * Note: This standalone script is for manual runs.
 * Production ingestion is handled by the /v1/ingest/usd HTTP endpoint.
 */

import axios from 'axios';
import { getPrisma } from '../../config/database.js';

const BCRA_API_URL = process.env.BCRA_API_URL || 'https://api.bcra.gob.ar';

async function fetchUSDOfficial(): Promise<{ buy: number; sell: number; date: string } | null> {
  try {
    const response = await axios.get(`${BCRA_API_URL}/estadisticas/v1/monzas`, { timeout: 10000 });

    if (Array.isArray(response.data)) {
      const usdData = response.data.find((item: { moneda: string }) => item.moneda === 'Dolar Oficial');
      if (usdData) {
        return { buy: usdData.compra, sell: usdData.venta, date: usdData.fecha };
      }
    }

    console.log('USD official not found in BCRA response');
    return null;
  } catch (error) {
    console.error('Error fetching from BCRA:', error instanceof Error ? error.message : error);
    return null;
  }
}

async function runIngestion(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Starting USD official ingestion...`);

  const prisma = getPrisma();
  if (!prisma) {
    console.error('❌ Database not configured. Set POSTGRES_URL or DATABASE_URL and re-run.');
    process.exit(1);
  }

  try {
    const data = await fetchUSDOfficial();

    if (!data) {
      await prisma.ingestionLog.create({
        data: { source: 'BCRA', metric: 'usd_official', status: 'error', rowsProcessed: 0, errorMessage: 'No data from API' },
      });
      console.error('No data fetched');
      process.exit(1);
    }

    const date = new Date(data.date);
    const id = `usd_official-${data.date}`;

    await prisma.metric.upsert({
      where: { id },
      update: { value: data.sell, updatedAt: new Date() },
      create: { id, category: 'economy', name: 'usd_official', value: data.sell, date, periodType: 'daily', source: 'BCRA' },
    });

    await prisma.ingestionLog.create({
      data: { source: 'BCRA', metric: 'usd_official', status: 'success', rowsProcessed: 1 },
    });

    console.log(`[${new Date().toISOString()}] Done: $${data.sell}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    try {
      await prisma.ingestionLog.create({
        data: { source: 'BCRA', metric: 'usd_official', status: 'error', rowsProcessed: 0, errorMessage: msg },
      });
    } catch {}
    console.error('Ingestion failed:', msg);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runIngestion();
