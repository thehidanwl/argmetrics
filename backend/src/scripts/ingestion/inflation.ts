/**
 * Ingestion script for inflation data from INDEC
 * 
 * Usage: npx tsx src/scripts/ingestion/inflation.ts
 * 
 * Cron: Monthly (first week of each month)
 * 
 * INDEC publishes IPC (Consumer Price Index) data monthly
 * This script would need to parse the official Excel/CSV files from INDEC
 */

import axios from 'axios';
import { prisma } from '../config/database.js';

const CACHE_KEY = 'inflation';

/**
 * Calculate YoY (year-over-year) inflation from monthly data
 */
function calculateYoY(monthlyData: { date: Date; value: number }[]): number | null {
  if (monthlyData.length < 12) return null;
  
  const latest = monthlyData[0];
  const yearAgo = monthlyData.find(m => {
    const diff = latest.date.getFullYear() - m.date.getFullYear();
    const monthDiff = latest.date.getMonth() - m.date.getMonth();
    return diff === 1 && monthDiff === 0;
  });

  if (!yearAgo) return null;

  return ((latest.value - yearAgo.value) / yearAgo.value) * 100;
}

/**
 * Fetch inflation data from INDEC
 * Note: INDEC changes their file formats frequently
 * This is a simplified example - real implementation needs robust parsing
 */
async function fetchInflation(): Promise<{ month: string; value: number }[] | null> {
  try {
    // INDEC IPC URL - typically changes quarterly
    // This would need to be updated based on current INDEC publications
    const INDEC_IPC_URL = 'https://www.indec.gob.ar/ftp/cuadros/menusuperior/ipc/ipc_coeficiente.xlsx';

    console.log('Fetching INDEC IPC data...');
    
    // In production, download and parse Excel file
    // For now, return null to indicate no data fetched
    // Real implementation would use xlsx library to parse
    
    return null;
  } catch (error) {
    console.error('Error fetching inflation data:', error instanceof Error ? error.message : error);
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
 * Save inflation data to database
 */
async function saveInflation(data: { month: string; value: number }[]): Promise<number> {
  let saved = 0;

  for (const item of data) {
    const date = new Date(item.month + '-01');
    
    try {
      await prisma.metric.upsert({
        where: {
          id: `inflation-${item.month}`,
        },
        update: {
          value: item.value,
          updatedAt: new Date(),
        },
        create: {
          id: `inflation-${item.month}`,
          category: 'economy',
          name: 'inflation',
          value: item.value,
          date,
          periodType: 'monthly',
          source: 'INDEC',
        },
      });
      saved++;
    } catch (error) {
      console.error(`Error saving inflation for ${item.month}:`, error);
    }
  }

  return saved;
}

/**
 * Main ingestion function
 */
async function runIngestion(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Starting inflation ingestion...`);

  try {
    const data = await fetchInflation();

    if (!data || data.length === 0) {
      await logIngestion('indec', 'inflation', 'error', 0, 'No data fetched from INDEC');
      console.log('No inflation data available');
      return;
    }

    const saved = await saveInflation(data);
    
    await logIngestion('indec', 'inflation', saved > 0 ? 'success' : 'error', saved);

    console.log(`[${new Date().toISOString()}] Inflation ingestion completed: ${saved} records`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logIngestion('indec', 'inflation', 'error', 0, errorMessage);
    console.error('Ingestion failed:', errorMessage);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
runIngestion();
