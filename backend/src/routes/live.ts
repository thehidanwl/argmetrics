import { Router } from 'express';
import { prisma, parseJsonField } from '../config/database';

/**
 * @swagger
 * /v1/live/usd:
 *   get:
 *     summary: Get current USD exchange rates
 *     description: Returns real-time USD exchange rates from multiple sources (official, blue, MEP, CCL)
 *     tags: [Live Data]
 *     responses:
 *       200:
 *         description: Current USD rates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     oficial:
 *                       type: object
 *                     blue:
 *                       type: object
 *       500:
 *         description: Error fetching rates
 */
const router = Router();

// Cache TTL constants (in minutes)
const USD_CACHE_TTL = 30;
const RISK_CACHE_TTL = 60;

// GET /v1/live/usd - Get USD exchange rates (cached)
router.get('/usd', async (req, res) => {
  try {
    const cache = await prisma.liveCache.findUnique({
      where: { key: 'usd_rates' },
    });

    // Check if cache is valid
    if (cache && new Date() < cache.expiresAt) {
      const value = parseJsonField<Record<string, unknown>>(cache.value, {});
      res.json({
        data: value,
        cached: true,
        expiresAt: cache.expiresAt.toISOString(),
      });
      return;
    }

    // Cache expired or missing - fetch from external APIs
    // This would normally call BCRA and Bluelytics APIs
    // For now, return mock data structure
    const mockData = {
      oficial: { buy: 1390, sell: 1441, updatedAt: new Date().toISOString() },
      blue: { buy: 1405, sell: 1425, updatedAt: new Date().toISOString() },
      oficial_euro: { buy: 1511, sell: 1566, updatedAt: new Date().toISOString() },
      blue_euro: { buy: 1527, sell: 1549, updatedAt: new Date().toISOString() },
      brecha: { value: -1.11, unit: 'percentage' },
    };

    // Save to cache (store JSON as string for SQLite)
    const expiresAt = new Date(Date.now() + USD_CACHE_TTL * 60 * 1000);
    await prisma.liveCache.upsert({
      where: { key: 'usd_rates' },
      update: { value: JSON.stringify(mockData), expiresAt },
      create: { key: 'usd_rates', value: JSON.stringify(mockData), expiresAt },
    });

    res.json({
      data: mockData,
      cached: false,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching USD rates:', error);

    // Try to return last cached value on error
    const cache = await prisma.liveCache.findUnique({
      where: { key: 'usd_rates' },
    });

    if (cache) {
      const value = parseJsonField<Record<string, unknown>>(cache.value, {});
      res.json({
        data: value,
        cached: true,
        error: 'Using stale cache due to API error',
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'USD_RATES_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch USD rates',
      },
    });
  }
});

/**
 * @swagger
 * /v1/live/country-risk:
 *   get:
 *     summary: Get country risk index
 *     description: Returns the current Argentina country risk (EMBI)
 *     tags: [Live Data]
 *     responses:
 *       200:
 *         description: Current country risk
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: number
 *                     updatedAt:
 *                       type: string
 */
router.get('/country-risk', async (req, res) => {
  try {
    const cache = await prisma.liveCache.findUnique({
      where: { key: 'country_risk' },
    });

    // Check if cache is valid
    if (cache && new Date() < cache.expiresAt) {
      const value = parseJsonField<Record<string, unknown>>(cache.value, {});
      res.json({
        data: value,
        cached: true,
        expiresAt: cache.expiresAt.toISOString(),
      });
      return;
    }

    // Cache expired or missing - fetch from external APIs
    // This would normally call BCRA API
    const mockData = {
      value: 1800,
      variation: -2.5,
      updatedAt: new Date().toISOString(),
    };

    // Save to cache
    const expiresAt = new Date(Date.now() + RISK_CACHE_TTL * 60 * 1000);
    await prisma.liveCache.upsert({
      where: { key: 'country_risk' },
      update: { value: JSON.stringify(mockData), expiresAt },
      create: { key: 'country_risk', value: JSON.stringify(mockData), expiresAt },
    });

    res.json({
      data: mockData,
      cached: false,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching country risk:', error);

    // Try to return last cached value on error
    const cache = await prisma.liveCache.findUnique({
      where: { key: 'country_risk' },
    });

    if (cache) {
      const value = parseJsonField<Record<string, unknown>>(cache.value, {});
      res.json({
        data: value,
        cached: true,
        error: 'Using stale cache due to API error',
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'COUNTRY_RISK_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch country risk',
      },
    });
  }
});

export default router;
