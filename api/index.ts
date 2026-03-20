import type { VercelRequest, VercelResponse } from '@vercel/node';
// require at top level so Vercel's file tracer bundles the query engine binary
const { PrismaClient } = require('@prisma/client');

// Mock data for fallback when database is not available
const mockMetrics = [
  { name: 'inflation', category: 'economy', value: 4.2, date: '2026-02-01', unit: 'percentage', periodType: 'monthly', source: 'INDEC' },
  { name: 'usd_official', category: 'economy', value: 1415.5, date: '2026-03-10', unit: 'ars', periodType: 'daily', source: 'BCRA' },
  { name: 'usd_blue', category: 'economy', value: 1420.0, date: '2026-03-10', unit: 'ars', periodType: 'daily', source: 'Blue Markets' },
  { name: 'usd_mep', category: 'economy', value: 1385.25, date: '2026-03-10', unit: 'ars', periodType: 'daily', source: 'MAE' },
  { name: 'usd_ccl', category: 'economy', value: 1395.0, date: '2026-03-10', unit: 'ars', periodType: 'daily', source: 'CNV' },
  { name: 'interest_rate', category: 'economy', value: 38.0, date: '2026-03-10', unit: 'percentage', periodType: 'daily', source: 'BCRA' },
  { name: 'reserves', category: 'economy', value: 28500000, date: '2026-03-09', unit: 'ars', periodType: 'daily', source: 'BCRA' },
  { name: 'country_risk', category: 'economy', value: 1785, date: '2026-03-10', unit: 'points', periodType: 'daily', source: 'JPMorgan' },
  { name: 'gdp', category: 'economy', value: -1.5, date: '2025-12-31', unit: 'percentage', periodType: 'quarterly', source: 'INDEC' },
  { name: 'poverty', category: 'social', value: 38.5, date: '2025-09-30', unit: 'percentage', periodType: 'quarterly', source: 'INDEC' },
  { name: 'unemployment', category: 'social', value: 7.2, date: '2025-12-31', unit: 'percentage', periodType: 'quarterly', source: 'INDEC' },
  { name: 'retail_sales', category: 'consumption', value: -2.3, date: '2026-01-31', unit: 'percentage', periodType: 'monthly', source: 'INDEC' },
];

const mockUSDRates = {
  oficial: { buy: 1390, sell: 1441, updatedAt: new Date().toISOString() },
  blue: { buy: 1405, sell: 1425, updatedAt: new Date().toISOString() },
  mep: { buy: 1378, sell: 1395, updatedAt: new Date().toISOString() },
  ccl: { buy: 1388, sell: 1412, updatedAt: new Date().toISOString() },
  oficial_euro: { buy: 1511, sell: 1566, updatedAt: new Date().toISOString() },
  blue_euro: { buy: 1527, sell: 1549, updatedAt: new Date().toISOString() },
  brecha: { value: -1.11, unit: 'percentage' },
};

const mockCountryRisk = {
  value: 1785,
  variation: -2.5,
  updatedAt: new Date().toISOString(),
};

// Check if DATABASE_URL is available
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
const hasDatabaseUrl = databaseUrl !== '';

// Try to initialize Prisma only if a database URL exists
let prisma: any = null;
let prismaInitError: string | null = null;

if (hasDatabaseUrl) {
  try {
    prisma = new PrismaClient();
    console.log('✅ Prisma initialized');
  } catch (error: any) {
    prismaInitError = String(error?.message ?? error);
    console.warn('⚠️ Failed to initialize Prisma:', prismaInitError);
  }
} else {
  prismaInitError = 'No POSTGRES_URL / DATABASE_URL set';
  console.warn('⚠️ No database URL set (POSTGRES_URL / DATABASE_URL), using mock data');
}

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
        sell: data.oficial.value_sell,
      },
      blue: {
        buy: data.blue.value_buy,
        sell: data.blue.value_sell,
      },
      oficial_euro: {
        buy: data.oficial_euro?.value_buy || 0,
        sell: data.oficial_euro?.value_sell || 0,
      },
      blue_euro: {
        buy: data.blue_euro?.value_buy || 0,
        sell: data.blue_euro?.value_sell || 0,
      },
      last_update: data.last_update,
    };
  } catch (error) {
    console.error('Error fetching Bluelytics:', error);
    return null;
  }
}

/**
 * Calculate brecha (gap) between official and blue exchange rate
 */
function calculateBrecha(official: number, blue: number): number {
  return ((blue - official) / official) * 100;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url || '';
  const now = new Date();
  
  // Health check
  if (path.includes('/v1/health')) {
    res.status(200).json({
      status: prisma ? 'healthy' : 'healthy',
      version: '1.0.0',
      uptime: Math.floor(process.uptime()),
      timestamp: now.toISOString(),
      database: {
        status: prisma ? 'connected' : 'disconnected',
        latencyMs: null,
        error: prismaInitError,
        hasUrl: hasDatabaseUrl,
      },
      ingestions: {
        lastSuccess: null,
        lastError: null,
      },
      mode: prisma ? 'production' : 'mock'
    });
    return;
  }
  
  // Get metric by name - specific endpoint /v1/metrics/:name
  const metricsNameMatch = path.match(/\/v1\/metrics\/([^/?]+)/);
  const metricName = metricsNameMatch ? metricsNameMatch[1] : null;
  
  // Get metrics from database or mock
  if (path.includes('/v1/metrics')) {
    const { category, name, from, to, limit = '100', offset = '0' } = req.query;
    
    // Handle specific metric by name (e.g., /v1/metrics/inflation)
    if (metricName && metricName !== 'categories' && metricName !== 'available') {
      if (!prisma) {
        const metric = mockMetrics.find((m: any) => m.name === metricName);
        if (!metric) {
          res.status(404).json({
            error: { code: 'NOT_FOUND', message: `Metric '${metricName}' not found` }
          });
          return;
        }
        res.status(200).json({
          data: [{
            id: metric.name,
            ...metric,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }],
          mock: true
        });
        return;
      }
      // Database implementation would go here
    }
    
    // Handle /v1/metrics/categories
    if (metricName === 'categories') {
      if (!prisma) {
        const categories = [
          { name: 'economy', description: 'Economic indicators', metricsCount: 9 },
          { name: 'social', description: 'Social indicators', metricsCount: 2 },
          { name: 'consumption', description: 'Consumption indicators', metricsCount: 1 },
        ];
        res.status(200).json({ data: categories, mock: true });
        return;
      }
    }
    
    // Handle /v1/metrics/available
    if (metricName === 'available') {
      if (!prisma) {
        const metrics = mockMetrics.map((m: any) => ({
          name: m.name,
          category: m.category,
          description: m.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          unit: m.unit,
          periodType: m.periodType,
          source: m.source,
          dateRange: { from: m.date, to: m.date }
        }));
        res.status(200).json({ data: metrics, mock: true });
        return;
      }
    }
    
    // Use mock data if Prisma is not available
    if (!prisma) {
      let filtered = [...mockMetrics];
      
      if (category) {
        filtered = filtered.filter((m: any) => m.category === category);
      }
      if (name) {
        filtered = filtered.filter((m: any) => m.name === name);
      }
      
      const limitNum = Math.min(parseInt(String(limit)), 10000);
      const offsetNum = parseInt(String(offset));
      
      res.status(200).json({
        data: filtered.slice(offsetNum, offsetNum + limitNum),
        pagination: {
          total: filtered.length,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < filtered.length,
        },
        mock: true,
      });
      return;
    }
    
    try {
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
          skip: offsetNum,
        }),
        prisma.metric.count({ where }),
      ]);
      
      res.status(200).json({
        data,
        pagination: {
          total,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + data.length < total,
        },
      });
    } catch (error) {
      console.error('Error fetching metrics, falling back to mock:', error);
      // DB failed — return mock data as fallback
      const limitNum = Math.min(parseInt(String(limit)), 10000);
      const offsetNum = parseInt(String(offset));
      let filtered = [...mockMetrics];
      if (category) filtered = filtered.filter((m: any) => m.category === category);
      if (name) filtered = filtered.filter((m: any) => m.name === name);
      res.status(200).json({
        data: filtered.slice(offsetNum, offsetNum + limitNum),
        pagination: { total: filtered.length, limit: limitNum, offset: offsetNum, hasMore: offsetNum + limitNum < filtered.length },
        mock: true,
      });
    }
    return;
  }
  
  // Get live USD rates (with caching)
  if (path.includes('/v1/live/usd')) {
    const cacheKey = 'usd_rates';
    const cached = cache[cacheKey];
    
    // Check cache
    if (cached && new Date(cached.expiresAt) > now) {
      res.status(200).json({
        data: cached.data,
        cached: true,
        expiresAt: cached.expiresAt,
      });
      return;
    }
    
    // If no Prisma, return mock data
    if (!prisma) {
      res.status(200).json({
        data: mockUSDRates,
        mock: true,
        expiresAt: new Date(now.getTime() + CACHE_TTL_MINUTES * 60 * 1000).toISOString(),
      });
      return;
    }
    
    // Try to fetch from external API or database
    try {
      // First try to get from DB cache
      const dbCache = await prisma.liveCache.findUnique({
        where: { key: 'usd_rates' },
      });
      
      if (dbCache && new Date(dbCache.expiresAt) > now) {
        const cacheData = JSON.parse(dbCache.value);
        cache[cacheKey] = {
          data: cacheData,
          fetchedAt: dbCache.expiresAt,
          expiresAt: dbCache.expiresAt,
        };
        
        res.status(200).json({
          data: cacheData,
          cached: true,
          expiresAt: dbCache.expiresAt,
        });
        return;
      }
      
      // Fetch fresh data from external API
      const bluelyticsData = await fetchBluelyticsRates();
      
      let usdData;
      
      if (bluelyticsData) {
        usdData = {
          oficial: {
            buy: bluelyticsData.oficial.buy,
            sell: bluelyticsData.oficial.sell,
            updatedAt: bluelyticsData.last_update,
          },
          blue: {
            buy: bluelyticsData.blue.buy,
            sell: bluelyticsData.blue.sell,
            updatedAt: bluelyticsData.last_update,
          },
          oficial_euro: {
            buy: bluelyticsData.oficial_euro.buy,
            sell: bluelyticsData.oficial_euro.sell,
            updatedAt: bluelyticsData.last_update,
          },
          blue_euro: {
            buy: bluelyticsData.blue_euro.buy,
            sell: bluelyticsData.blue_euro.sell,
            updatedAt: bluelyticsData.last_update,
          },
          brecha: {
            value: calculateBrecha(
              bluelyticsData.oficial.sell,
              bluelyticsData.blue.sell
            ).toFixed(2),
            unit: 'percentage',
          },
        };
      } else {
        // Fallback to mock data if external API fails
        usdData = mockUSDRates;
      }
      
      // Cache in memory and optionally in DB
      const expiresAt = new Date(now.getTime() + CACHE_TTL_MINUTES * 60 * 1000).toISOString();
      cache[cacheKey] = {
        data: usdData,
        fetchedAt: now.toISOString(),
        expiresAt,
      };
      
      // Save to DB if available
      if (prisma) {
        try {
          await prisma.liveCache.upsert({
            where: { key: 'usd_rates' },
            update: { value: JSON.stringify(usdData), expiresAt: new Date(expiresAt) },
            create: { key: 'usd_rates', value: JSON.stringify(usdData), expiresAt: new Date(expiresAt) },
          });
        } catch (dbError) {
          console.error('Error saving to DB cache:', dbError);
        }
      }
      
      res.status(200).json({
        data: usdData,
        cached: false,
        expiresAt,
      });
    } catch (error) {
      console.error('Error fetching USD rates:', error);
      
      // Return mock data on error
      res.status(200).json({
        data: mockUSDRates,
        mock: true,
        error: 'Using mock data due to API error',
        expiresAt: new Date(now.getTime() + CACHE_TTL_MINUTES * 60 * 1000).toISOString(),
      });
    }
    return;
  }
  
  // Get country risk
  if (path.includes('/v1/live/country-risk')) {
    // If no Prisma, return mock data
    if (!prisma) {
      res.status(200).json({
        data: mockCountryRisk,
        mock: true,
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      });
      return;
    }
    
    const cacheKey = 'country_risk';
    const cached = cache[cacheKey];
    
    // Check cache
    if (cached && new Date(cached.expiresAt) > now) {
      res.status(200).json({
        data: cached.data,
        cached: true,
        expiresAt: cached.expiresAt,
      });
      return;
    }
    
    // Mock data for now (would normally fetch from external API)
    const riskData = mockCountryRisk;
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    
    cache[cacheKey] = {
      data: riskData,
      fetchedAt: now.toISOString(),
      expiresAt,
    };
    
    res.status(200).json({
      data: riskData,
      cached: false,
      expiresAt,
    });
    return;
  }
  
  // 404 for unknown routes
  res.status(404).json({ error: 'Not found' });
}
