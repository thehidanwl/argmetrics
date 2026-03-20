import type { VercelRequest, VercelResponse } from '@vercel/node';
// require at top level so Vercel's file tracer bundles the query engine binary
const { PrismaClient } = require('@prisma/client');

// Mock data for fallback when database is not available
const mockMetrics = [
  { name: 'inflation', category: 'economy', value: 4.2, date: '2026-02-01', unit: 'percentage', periodType: 'monthly', source: 'INDEC' },
  { name: 'usd_oficial', category: 'economy', value: 1415.5, date: '2026-03-10', unit: 'ars', periodType: 'daily', source: 'BCRA' },
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
  official: { buy: 1390, sell: 1441, updatedAt: new Date().toISOString() },
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

// Add pgbouncer=true for Supabase transaction-mode pooler compatibility
let databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
if (databaseUrl && !databaseUrl.includes('pgbouncer=true')) {
  databaseUrl += (databaseUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
}
const hasDatabaseUrl = databaseUrl !== '';

// Try to initialize Prisma only if a database URL exists
let prisma: any = null;
let prismaInitError: string | null = null;

if (hasDatabaseUrl) {
  try {
    prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
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
      oficial: { buy: data.oficial.value_buy, sell: data.oficial.value_sell },
      blue: { buy: data.blue.value_buy, sell: data.blue.value_sell },
      oficial_euro: { buy: data.oficial_euro?.value_buy || 0, sell: data.oficial_euro?.value_sell || 0 },
      blue_euro: { buy: data.blue_euro?.value_buy || 0, sell: data.blue_euro?.value_sell || 0 },
      last_update: data.last_update,
    };
  } catch (error) {
    console.error('Error fetching Bluelytics:', error);
    return null;
  }
}

function calculateBrecha(official: number, blue: number): number {
  return ((blue - official) / official) * 100;
}

// Helper: try a DB operation, return null on failure
async function tryDb<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.error('DB operation failed:', error);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url || '';
  const now = new Date();

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  // ─── Health check ──────────────────────────────────────────────────
  if (path.includes('/v1/health')) {
    let dbStatus = 'disconnected';
    let dbLatency: number | null = null;

    if (prisma) {
      const t0 = Date.now();
      const ok = await tryDb(() => prisma.$queryRaw`SELECT 1`);
      if (ok) {
        dbStatus = 'connected';
        dbLatency = Date.now() - t0;
        prismaInitError = null;
      } else {
        dbStatus = 'error';
      }
    }

    res.status(200).json({
      status: 'healthy',
      version: '1.0.0',
      uptime: Math.floor(process.uptime()),
      timestamp: now.toISOString(),
      database: {
        status: dbStatus,
        latencyMs: dbLatency,
        error: prismaInitError,
        hasUrl: hasDatabaseUrl,
      },
      mode: dbStatus === 'connected' ? 'production' : 'mock',
    });
    return;
  }

  // ─── Seed endpoint — populates DB with initial metric data ─────────
  if (path.includes('/v1/ingest/seed')) {
    if (!prisma) {
      res.status(503).json({ error: { code: 'DB_UNAVAILABLE', message: 'Database not configured' } });
      return;
    }

    // Seed data: metrics that aren't fetched from live APIs
    const seedMetrics = [
      { id: 'inflation-2026-02', name: 'inflation', category: 'economy', value: 4.2, date: new Date('2026-02-01'), periodType: 'monthly', source: 'INDEC' },
      { id: 'inflation-2026-01', name: 'inflation', category: 'economy', value: 3.8, date: new Date('2026-01-01'), periodType: 'monthly', source: 'INDEC' },
      { id: 'inflation-2025-12', name: 'inflation', category: 'economy', value: 3.5, date: new Date('2025-12-01'), periodType: 'monthly', source: 'INDEC' },
      { id: 'inflation-2025-11', name: 'inflation', category: 'economy', value: 3.2, date: new Date('2025-11-01'), periodType: 'monthly', source: 'INDEC' },
      { id: 'inflation-2025-10', name: 'inflation', category: 'economy', value: 3.5, date: new Date('2025-10-01'), periodType: 'monthly', source: 'INDEC' },
      { id: 'inflation-2025-09', name: 'inflation', category: 'economy', value: 3.9, date: new Date('2025-09-01'), periodType: 'monthly', source: 'INDEC' },
      { id: 'interest_rate-2026-03-20', name: 'interest_rate', category: 'economy', value: 29.0, date: new Date('2026-03-20'), periodType: 'daily', source: 'BCRA' },
      { id: 'interest_rate-2026-03-10', name: 'interest_rate', category: 'economy', value: 29.0, date: new Date('2026-03-10'), periodType: 'daily', source: 'BCRA' },
      { id: 'interest_rate-2026-02-15', name: 'interest_rate', category: 'economy', value: 32.0, date: new Date('2026-02-15'), periodType: 'daily', source: 'BCRA' },
      { id: 'country_risk-2026-03-20', name: 'country_risk', category: 'economy', value: 785, date: new Date('2026-03-20'), periodType: 'daily', source: 'JPMorgan' },
      { id: 'country_risk-2026-03-10', name: 'country_risk', category: 'economy', value: 810, date: new Date('2026-03-10'), periodType: 'daily', source: 'JPMorgan' },
      { id: 'country_risk-2026-02-15', name: 'country_risk', category: 'economy', value: 850, date: new Date('2026-02-15'), periodType: 'daily', source: 'JPMorgan' },
      { id: 'reserves-2026-03-20', name: 'reserves', category: 'economy', value: 28500, date: new Date('2026-03-20'), periodType: 'daily', source: 'BCRA' },
      { id: 'reserves-2026-03-10', name: 'reserves', category: 'economy', value: 28200, date: new Date('2026-03-10'), periodType: 'daily', source: 'BCRA' },
      { id: 'gdp-2025-Q4', name: 'gdp', category: 'economy', value: 2.1, date: new Date('2025-12-31'), periodType: 'quarterly', source: 'INDEC' },
      { id: 'gdp-2025-Q3', name: 'gdp', category: 'economy', value: 1.8, date: new Date('2025-09-30'), periodType: 'quarterly', source: 'INDEC' },
      { id: 'poverty-2025-S2', name: 'poverty', category: 'social', value: 36.8, date: new Date('2025-12-31'), periodType: 'quarterly', source: 'INDEC' },
      { id: 'poverty-2025-S1', name: 'poverty', category: 'social', value: 38.5, date: new Date('2025-06-30'), periodType: 'quarterly', source: 'INDEC' },
      { id: 'unemployment-2025-Q4', name: 'unemployment', category: 'social', value: 6.4, date: new Date('2025-12-31'), periodType: 'quarterly', source: 'INDEC' },
      { id: 'unemployment-2025-Q3', name: 'unemployment', category: 'social', value: 6.9, date: new Date('2025-09-30'), periodType: 'quarterly', source: 'INDEC' },
      { id: 'retail_sales-2026-02', name: 'retail_sales', category: 'consumption', value: 1.5, date: new Date('2026-02-28'), periodType: 'monthly', source: 'INDEC' },
      { id: 'retail_sales-2026-01', name: 'retail_sales', category: 'consumption', value: -0.8, date: new Date('2026-01-31'), periodType: 'monthly', source: 'INDEC' },
    ];

    try {
      let upserted = 0;
      for (const m of seedMetrics) {
        await prisma.metric.upsert({
          where: { id: m.id },
          update: { value: m.value, date: m.date, updatedAt: now },
          create: { ...m, createdAt: now, updatedAt: now },
        });
        upserted++;
      }
      res.status(200).json({ success: true, upserted, timestamp: now.toISOString() });
    } catch (error: any) {
      console.error('Seed error:', error);
      res.status(500).json({ error: { code: 'SEED_FAILED', message: String(error?.message ?? error) } });
    }
    return;
  }

  // ─── Ingest USD rates from Bluelytics ──────────────────────────────
  if (path.includes('/v1/ingest/usd')) {
    if (!prisma) {
      res.status(503).json({ error: { code: 'DB_UNAVAILABLE', message: 'Database not configured' } });
      return;
    }

    const today = now.toISOString().split('T')[0];
    try {
      const bluelyticsData = await fetchBluelyticsRates();
      if (!bluelyticsData) {
        res.status(502).json({ error: { code: 'API_FAILED', message: 'Could not fetch Bluelytics data' } });
        return;
      }

      const records: Array<{ id: string; name: string; value: number }> = [];
      const upserts: Promise<unknown>[] = [];

      const rates: Array<{ name: string; value: number }> = [
        { name: 'usd_oficial', value: bluelyticsData.oficial.sell },
        { name: 'usd_blue', value: bluelyticsData.blue.sell },
      ];

      for (const r of rates) {
        const id = `${r.name}-${today}`;
        upserts.push(
          prisma.metric.upsert({
            where: { id },
            update: { value: r.value, updatedAt: now },
            create: { id, name: r.name, category: 'economy', value: r.value, date: now, periodType: 'daily', source: 'Bluelytics' },
          })
        );
        records.push({ id, name: r.name, value: r.value });
      }

      await Promise.all(upserts);
      res.json({ success: true, records: records.length, timestamp: now.toISOString(), data: records });
    } catch (error: any) {
      console.error('Error ingesting USD:', error);
      res.status(503).json({ error: { code: 'INGESTION_FAILED', message: String(error?.message ?? error) } });
    }
    return;
  }

  // ─── GET /v1/metrics/:name ─────────────────────────────────────────
  const metricsNameMatch = path.match(/\/v1\/metrics\/([^/?]+)/);
  const metricName = metricsNameMatch ? metricsNameMatch[1] : null;

  if (path.includes('/v1/metrics')) {
    const { category, name, from, to, limit = '100', offset = '0' } = req.query;
    const limitNum = Math.min(parseInt(String(limit)), 10000);
    const offsetNum = parseInt(String(offset));

    // ── /v1/metrics/categories ──
    if (metricName === 'categories') {
      if (prisma) {
        const dbResult = await tryDb(async () => {
          const rows = await prisma.$queryRaw`
            SELECT category, COUNT(DISTINCT name)::int as "metricsCount"
            FROM "Metric"
            GROUP BY category
            ORDER BY category
          `;
          return rows;
        });
        if (dbResult && Array.isArray(dbResult) && dbResult.length > 0) {
          const categoryDescriptions: Record<string, string> = {
            economy: 'Economic indicators',
            social: 'Social indicators',
            consumption: 'Consumption indicators',
          };
          const categories = dbResult.map((r: any) => ({
            name: r.category,
            description: categoryDescriptions[r.category] || r.category,
            metricsCount: r.metricsCount,
          }));
          res.status(200).json({ data: categories });
          return;
        }
      }
      // Fallback to mock
      res.status(200).json({
        data: [
          { name: 'economy', description: 'Economic indicators', metricsCount: 9 },
          { name: 'social', description: 'Social indicators', metricsCount: 2 },
          { name: 'consumption', description: 'Consumption indicators', metricsCount: 1 },
        ],
        mock: true,
      });
      return;
    }

    // ── /v1/metrics/available ──
    if (metricName === 'available') {
      if (prisma) {
        const dbResult = await tryDb(async () => {
          const rows = await prisma.$queryRaw`
            SELECT name, category,
                   MAX("periodType") as "periodType",
                   MAX(source) as source,
                   MIN(date) as "dateFrom",
                   MAX(date) as "dateTo"
            FROM "Metric"
            GROUP BY name, category
            ORDER BY category, name
          `;
          return rows;
        });
        if (dbResult && Array.isArray(dbResult) && dbResult.length > 0) {
          const metrics = dbResult.map((r: any) => ({
            name: r.name,
            category: r.category,
            description: r.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            periodType: r.periodType,
            source: r.source,
            dateRange: { from: r.dateFrom, to: r.dateTo },
          }));
          res.status(200).json({ data: metrics });
          return;
        }
      }
      // Fallback to mock
      const metrics = mockMetrics.map((m: any) => ({
        name: m.name,
        category: m.category,
        description: m.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        unit: m.unit,
        periodType: m.periodType,
        source: m.source,
        dateRange: { from: m.date, to: m.date },
      }));
      res.status(200).json({ data: metrics, mock: true });
      return;
    }

    // ── /v1/metrics/:name (specific metric) ──
    if (metricName) {
      if (prisma) {
        const dbResult = await tryDb(async () => {
          const data = await prisma.metric.findMany({
            where: { name: metricName },
            orderBy: { date: 'desc' },
            take: limitNum,
            skip: offsetNum,
          });
          const total = await prisma.metric.count({ where: { name: metricName } });
          return { data, total };
        });
        if (dbResult && dbResult.data.length > 0) {
          res.status(200).json({
            data: dbResult.data,
            pagination: { total: dbResult.total, limit: limitNum, offset: offsetNum, hasMore: offsetNum + dbResult.data.length < dbResult.total },
          });
          return;
        }
      }
      // Fallback to mock
      const metric = mockMetrics.find((m: any) => m.name === metricName);
      if (!metric) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: `Metric '${metricName}' not found` } });
        return;
      }
      res.status(200).json({
        data: [{ id: metric.name, ...metric, createdAt: now.toISOString(), updatedAt: now.toISOString() }],
        pagination: { total: 1, limit: limitNum, offset: 0, hasMore: false },
        mock: true,
      });
      return;
    }

    // ── /v1/metrics (list all) ──
    if (prisma) {
      const dbResult = await tryDb(async () => {
        const where: any = {};
        if (category) where.category = String(category);
        if (name) where.name = String(name);
        if (from || to) {
          where.date = {};
          if (from) where.date.gte = new Date(String(from));
          if (to) where.date.lte = new Date(String(to));
        }
        const [data, total] = await Promise.all([
          prisma.metric.findMany({ where, orderBy: { date: 'desc' }, take: limitNum, skip: offsetNum }),
          prisma.metric.count({ where }),
        ]);
        return { data, total };
      });
      if (dbResult && dbResult.data.length > 0) {
        res.status(200).json({
          data: dbResult.data,
          pagination: { total: dbResult.total, limit: limitNum, offset: offsetNum, hasMore: offsetNum + dbResult.data.length < dbResult.total },
        });
        return;
      }
    }
    // Fallback to mock
    let filtered = [...mockMetrics];
    if (category) filtered = filtered.filter((m: any) => m.category === category);
    if (name) filtered = filtered.filter((m: any) => m.name === name);
    res.status(200).json({
      data: filtered.slice(offsetNum, offsetNum + limitNum),
      pagination: { total: filtered.length, limit: limitNum, offset: offsetNum, hasMore: offsetNum + limitNum < filtered.length },
      mock: true,
    });
    return;
  }

  // ─── GET /v1/live/usd ─────────────────────────────────────────────
  if (path.includes('/v1/live/usd')) {
    const cacheKey = 'usd_rates';
    const cached = cache[cacheKey];

    if (cached && new Date(cached.expiresAt) > now) {
      res.status(200).json({ data: cached.data, cached: true, expiresAt: cached.expiresAt });
      return;
    }

    // Try DB cache first
    if (prisma) {
      const dbCache: any = await tryDb(() => prisma.liveCache.findUnique({ where: { key: 'usd_rates' } }));
      if (dbCache && new Date(dbCache.expiresAt) > now) {
        const cacheData = JSON.parse(dbCache.value);
        cache[cacheKey] = { data: cacheData, fetchedAt: dbCache.fetchedAt, expiresAt: dbCache.expiresAt };
        res.status(200).json({ data: cacheData, cached: true, expiresAt: dbCache.expiresAt });
        return;
      }
    }

    // Fetch fresh data from Bluelytics
    const bluelyticsData = await fetchBluelyticsRates();
    let usdData;

    if (bluelyticsData) {
      const updatedAt = bluelyticsData.last_update;
      // Estimate MEP/CCL from oficial/blue spread (MEP ~98% of blue, CCL ~99% of blue)
      const mepBuy = Math.round(bluelyticsData.blue.buy * 0.98);
      const mepSell = Math.round(bluelyticsData.blue.sell * 0.98);
      const cclBuy = Math.round(bluelyticsData.blue.buy * 0.99);
      const cclSell = Math.round(bluelyticsData.blue.sell * 0.99);
      usdData = {
        oficial: { buy: bluelyticsData.oficial.buy, sell: bluelyticsData.oficial.sell, updatedAt },
        official: { buy: bluelyticsData.oficial.buy, sell: bluelyticsData.oficial.sell, updatedAt },
        blue: { buy: bluelyticsData.blue.buy, sell: bluelyticsData.blue.sell, updatedAt },
        mep: { buy: mepBuy, sell: mepSell, updatedAt },
        ccl: { buy: cclBuy, sell: cclSell, updatedAt },
        oficial_euro: { buy: bluelyticsData.oficial_euro.buy, sell: bluelyticsData.oficial_euro.sell, updatedAt },
        blue_euro: { buy: bluelyticsData.blue_euro.buy, sell: bluelyticsData.blue_euro.sell, updatedAt },
        brecha: { value: calculateBrecha(bluelyticsData.oficial.sell, bluelyticsData.blue.sell).toFixed(2), unit: 'percentage' },
      };
    } else {
      usdData = mockUSDRates;
    }

    const expiresAt = new Date(now.getTime() + CACHE_TTL_MINUTES * 60 * 1000).toISOString();
    cache[cacheKey] = { data: usdData, fetchedAt: now.toISOString(), expiresAt };

    // Save to DB cache
    if (prisma) {
      await tryDb(() =>
        prisma.liveCache.upsert({
          where: { key: 'usd_rates' },
          update: { value: JSON.stringify(usdData), expiresAt: new Date(expiresAt) },
          create: { key: 'usd_rates', value: JSON.stringify(usdData), expiresAt: new Date(expiresAt) },
        })
      );
    }

    res.status(200).json({ data: usdData, cached: false, expiresAt, mock: !bluelyticsData || undefined });
    return;
  }

  // ─── GET /v1/live/country-risk ─────────────────────────────────────
  if (path.includes('/v1/live/country-risk')) {
    const cacheKey = 'country_risk';
    const cached = cache[cacheKey];

    if (cached && new Date(cached.expiresAt) > now) {
      res.status(200).json({ data: cached.data, cached: true, expiresAt: cached.expiresAt });
      return;
    }

    // Try to get from DB metrics table (latest country_risk entry)
    if (prisma) {
      const latest: any = await tryDb(() =>
        prisma.metric.findFirst({ where: { name: 'country_risk' }, orderBy: { date: 'desc' } })
      );
      if (latest) {
        const riskData = { value: latest.value, variation: -2.5, updatedAt: latest.date.toISOString() };
        const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
        cache[cacheKey] = { data: riskData, fetchedAt: now.toISOString(), expiresAt };
        res.status(200).json({ data: riskData, cached: false, expiresAt });
        return;
      }
    }

    // Fallback to mock
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    res.status(200).json({ data: mockCountryRisk, mock: true, expiresAt });
    return;
  }

  // 404 for unknown routes
  res.status(404).json({ error: 'Not found' });
}
