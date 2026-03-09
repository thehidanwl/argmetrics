/**
 * Ingestion API endpoint for USD rates from Bluelytics
 * Called by Vercel Cron: daily at 7:00 AM Argentina time
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BluelyticsResponse {
  oficial: { value_avg: number; value_sell: number; value_buy: number };
  blue: { value_avg: number; value_sell: number; value_buy: number };
  last_update: string;
}

async function fetchBluelytics(): Promise<BluelyticsResponse | null> {
  try {
    const response = await fetch('https://api.bluelytics.com.ar/v2/latest');
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Bluelytics fetch error:', error);
    return null;
  }
}

async function logIngestion(
  source: string,
  metric: string,
  status: 'success' | 'error',
  rowsProcessed: number,
  errorMessage?: string
) {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify cron secret for security
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  console.log('[Ingest USD] Starting ingestion...');
  
  try {
    const data = await fetchBluelytics();
    
    if (!data) {
      await logIngestion('bluelytics', 'usd_rates', 'error', 0, 'Failed to fetch from Bluelytics');
      res.status(500).json({ error: 'Failed to fetch data' });
      return;
    }
    
    const now = new Date();
    let rowsSaved = 0;
    
    // Save oficial rate
    await prisma.metric.upsert({
      where: { id: `usd_oficial-${now.toISOString().split('T')[0]}` },
      update: { value: data.oficial.value_sell, updatedAt: now },
      create: {
        id: `usd_oficial-${now.toISOString().split('T')[0]}`,
        category: 'economy',
        name: 'usd_oficial',
        value: data.oficial.value_sell,
        date: now,
        periodType: 'daily',
        source: 'Bluelytics',
      },
    });
    rowsSaved++;
    
    // Save blue rate
    await prisma.metric.upsert({
      where: { id: `usd_blue-${now.toISOString().split('T')[0]}` },
      update: { value: data.blue.value_sell, updatedAt: now },
      create: {
        id: `usd_blue-${now.toISOString().split('T')[0]}`,
        category: 'economy',
        name: 'usd_blue',
        value: data.blue.value_sell,
        date: now,
        periodType: 'daily',
        source: 'Bluelytics',
      },
    });
    rowsSaved++;
    
    // Also save to LiveCache for quick access
    const cacheData = {
      oficial: { buy: data.oficial.value_buy, sell: data.oficial.value_sell },
      blue: { buy: data.blue.value_buy, sell: data.blue.value_sell },
      last_update: data.last_update
    };
    
    await prisma.liveCache.upsert({
      where: { key: 'usd_rates' },
      update: { 
        value: JSON.stringify(cacheData),
        fetchedAt: now,
        expiresAt: new Date(now.getTime() + 30 * 60 * 1000) // 30 min
      },
      create: {
        key: 'usd_rates',
        value: JSON.stringify(cacheData),
        fetchedAt: now,
        expiresAt: new Date(now.getTime() + 30 * 60 * 1000)
      },
    });
    
    await logIngestion('bluelytics', 'usd_rates', 'success', rowsSaved);
    
    console.log(`[Ingest USD] Completed: ${rowsSaved} records saved`);
    
    res.status(200).json({ 
      success: true, 
      records: rowsSaved,
      timestamp: now.toISOString()
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logIngestion('bluelytics', 'usd_rates', 'error', 0, errorMessage);
    console.error('[Ingest USD] Error:', errorMessage);
    res.status(500).json({ error: errorMessage });
  } finally {
    await prisma.$disconnect();
  }
}
