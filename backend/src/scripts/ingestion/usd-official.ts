/**
 * Ingestion script for USD official rate from BCRA API
 * 
 * Usage: npx tsx src/scripts/ingestion/usd-official.ts
 * 
 * Cron: Daily at 4:00 AM Argentina time
 */

import axios from 'axios';
import { prisma } from '../config/database.js';

const BCRA_API_URL = process.env.BCRA_API_URL || 'https://api.bcra.gob.ar';
const CACHE_KEY = 'usd_official';

/**
 * Fetch USD official rate from BCRA API
 * BCRA API provides reference exchange rates
 */
async function fetchUSDOfficial(): Promise<{ buy: number; sell: number; date: string } | null> {
  try {
    // BCRA API endpoint for exchange rates
    // Note: This is a simplified example - real implementation may need different endpoints
    const response = await axios.get(`${BCRA_API_URL}/estadisticas/v1/monzas`, {
      timeout: 10000,
    });

    if (response.data && Array.isArray(response.data)) {
      // Find USD official rate from response
      const usdData = response.data.find(
        (item: { moneda: string }) => moneda === 'Dolar Oficial'
      );

      if (usdData) {
        return {
          buy: usdData.compra,
          sell: usdData.venta,
          date: usdData.fecha,
        };
      }
    }

    console.log('No USD official data found in BCRA response');
    return null;
  } catch (error) {
    console.error('Error fetching USD official from BCRA:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Log ingestion result to database
 */
async function logIngestion(
  source: string,
  metric: string,
  status: 'success' | 'error' | 'partial',
  rowsProcessed: number,
  errorMessage?: string
): Promise<void> {
  await prisma.ingestionLog.create({
    data: {
      source,
      metric,
      status,
      rowsProcessed,
      errorMessage,
      executedAt: new Date(),
    },
  });
}

/**
 * Save USD official rate to database
 */
async function saveUSDOfficial(data: { buy: number; sell: number; date: string }): Promise<void> {
  const date = new Date(data.date);

  await prisma.metric.upsert({
    where: {
      id: `${CACHE_KEY}-${data.date}`,
    },
    update: {
      value: data.sell,
      updatedAt: new Date(),
    },
    create: {
      id: `${CACHE_KEY}-${data.date}`,
      category: 'economy',
      name: 'usd_official',
      value: data.sell,
      date,
      periodType: 'daily',
      source: 'BCRA',
    },
  });
}

/**
 * Main ingestion function
 */
async function runIngestion(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Starting USD official ingestion...`);

  try {
    const data = await fetchUSDOfficial();

    if (!data) {
      await logIngestion('bcra', 'usd_official', 'error', 0, 'No data fetched from API');
      console.error('Failed to fetch USD official data');
      return;
    }

    await saveUSDOfficial(data);
    await logIngestion('bcra', 'usd_official', 'success', 1);

    console.log(`[${new Date().toISOString()}] USD official ingestion completed: $${data.sell}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logIngestion('bcra', 'usd_official', 'error', 0, errorMessage);
    console.error('Ingestion failed:', errorMessage);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
runIngestion();
