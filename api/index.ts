import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// In-memory cache for live data (simple approach for serverless)
const cache: Record<string, { data: any; fetchedAt: string; expiresAt: string }> = {};
const CACHE_TTL_MINUTES = 30;

/**
 * Fetch USD rates from Bluelytics API
 */
async function fetchBluelyticsRates(): Promise<{
  oficial: { buy: number; sell: number };
  blue: { buy: number; sell: number };
  oficial_euro: { buy: number; sell: number };
  blue_euro: { buy: number; sell: number };
  last_update: string;
} | null> {
  try {
    const response = await fetch('https://api.bluelytics.com.ar/v2/latest', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      console.error(`Bluelytics API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return {
      oficial: {
        buy: data.oficial.value_buy,
        sell: data.oficial.value_sell
      },
      blue: {
        buy: data.blue.value_buy,
        sell: data.blue.value_sell
      },
      oficial_euro: {
        buy: data.oficial_euro.value_buy,
        sell: data.oficial_euro.value_sell
      },
      blue_euro: {
        buy: data.blue_euro.value_buy,
        sell: data.blue_euro.value_sell
      },
      last_update: data.last_update
    };
  } catch (error) {
    console.error('Error fetching Bluelytics:', error);
    return null;
  }
}

/**
 * Calculate brecha (difference between official and blue)
 */
function calculateBrecha(official: number, blue: number): number {
  return ((blue - official) / official) * 100;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url || '';
  const now = new Date();
  
  // Health check
  if (path.includes('/v1/health')) {
    try {
      // Test database connection
      await prisma.$connect();
      await prisma.$disconnect();
      
      res.status(200).json({
        status: 'ok',
        timestamp: now.toISOString(),
        database: 'connected'
      });
    } catch (error) {
      res.status(200).json({
        status: 'ok',
        timestamp: now.toISOString(),
        database: 'disconnected'
      });
    }
    return;
  }
  
  // Get metrics from database
  if (path.includes('/v1/metrics')) {
    try {
      const { category, name, from, to, limit = '100', offset = '0' } = req.query;
      
      const where: any = {};
      
      if (category) where.category = String(category);
      if (name) where.name = String(name);
      if (from || to) {
        where.date = {};
        if (from) where.date.gte = new Date(String(from));
        if (to) where.date.lte = new Date(String(to));
      }
      
      const limitNum = Math.min(parseInt(String(limit)), 10000);
      const offsetNum = parseInt(String(offset));
      
      const [data, total] = await Promise.all([
        prisma.metric.findMany({
          where,
          orderBy: { date: 'desc' },
          take: limitNum,
          skip: offsetNum
        }),
        prisma.metric.count({ where })
      ]);
      
      res.status(200).json({
        data,
        pagination: {
          total,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + data.length < total
        }
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch metrics'
        }
      });
    }
    return;
  }
  
  // Live USD data with cache - now using Bluelytics!
  if (path.includes('/v1/live/usd')) {
    const cached = cache['usd_rates'];
    const cacheAge = cached 
      ? (now.getTime() - new Date(cached.fetchedAt).getTime()) / 1000 / 60 
      : Infinity;
    
    if (cached && cacheAge < CACHE_TTL_MINUTES) {
      res.status(200).json({ 
        data: cached.data, 
        cached: true,
        fetchedAt: cached.fetchedAt,
        expiresAt: cached.expiresAt
      });
      return;
    }
    
    // Fetch fresh data from Bluelytics
    const bluelyticsData = await fetchBluelyticsRates();
    
    if (!bluelyticsData) {
      // Return cached data if available, even if expired
      if (cached) {
        res.status(200).json({ 
          data: cached.data, 
          cached: true,
          fetchedAt: cached.fetchedAt,
          expired: true,
          error: 'Failed to fetch fresh data'
        });
        return;
      }
      
      res.status(503).json({
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Unable to fetch USD rates'
        }
      });
      return;
    }
    
    const expiresAt = new Date(now.getTime() + CACHE_TTL_MINUTES * 60 * 1000);
    
    const formattedData = {
      oficial: { 
        buy: bluelyticsData.oficial.buy, 
        sell: bluelyticsData.oficial.sell, 
        updatedAt: bluelyticsData.last_update 
      },
      blue: { 
        buy: bluelyticsData.blue.buy, 
        sell: bluelyticsData.blue.sell, 
        updatedAt: bluelyticsData.last_update 
      },
      oficial_euro: {
        buy: bluelyticsData.oficial_euro.buy,
        sell: bluelyticsData.oficial_euro.sell,
        updatedAt: bluelyticsData.last_update
      },
      blue_euro: {
        buy: bluelyticsData.blue_euro.buy,
        sell: bluelyticsData.blue_euro.sell,
        updatedAt: bluelyticsData.last_update
      },
      brecha: { 
        value: calculateBrecha(bluelyticsData.oficial.sell, bluelyticsData.blue.sell).toFixed(2), 
        unit: '%' 
      }
    };
    
    cache['usd_rates'] = { 
      data: formattedData, 
      fetchedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };
    
    res.status(200).json({ 
      data: formattedData, 
      cached: false,
      fetchedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    });
    return;
  }
  
  // Categories endpoint
  if (path.includes('/v1/metrics/categories')) {
    try {
      const categories = await prisma.metric.groupBy({
        by: ['category'],
        _count: { name: true }
      });
      
      res.status(200).json({
        data: categories.map(c => ({
          name: c.category,
          metricsCount: c._count.name
        }))
      });
    } catch (error) {
      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch categories' }
      });
    }
    return;
  }
  
  // Available metrics endpoint
  if (path.includes('/v1/metrics/available')) {
    try {
      const metrics = await prisma.metric.groupBy({
        by: ['name', 'category', 'source', 'periodType'],
        orderBy: { name: 'asc' }
      });
      
      // Get date range for each metric
      const result = await Promise.all(
        metrics.map(async (m) => {
          const [minDate, maxDate] = await Promise.all([
            prisma.metric.findFirst({ where: { name: m.name }, orderBy: { date: 'asc' }, select: { date: true } }),
            prisma.metric.findFirst({ where: { name: m.name }, orderBy: { date: 'desc' }, select: { date: true } })
          ]);
          
          return {
            name: m.name,
            category: m.category,
            source: m.source,
            periodType: m.periodType,
            dateRange: {
              from: minDate?.date?.toISOString().split('T')[0] || null,
              to: maxDate?.date?.toISOString().split('T')[0] || null
            }
          };
        })
      );
      
      res.status(200).json({ data: result });
    } catch (error) {
      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch metrics' }
      });
    }
    return;
  }
  
  res.status(200).json({ 
    status: 'ok',
    message: 'ArgMetrics API - use /v1/health, /v1/metrics, /v1/live/usd' 
  });
}
