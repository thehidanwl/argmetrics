import { Router } from 'express';
import { prisma, parseJsonField } from '../config/database';

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
      official: { buy: 820, sell: 860, updatedAt: new Date().toISOString() },
      blue: { buy: 1000, sell: 1020, updatedAt: new Date().toISOString() },
      mep: { buy: 980, sell: 995, updatedAt: new Date().toISOString() },
      ccl: { buy: 1005, sell: 1020, updatedAt: new Date().toISOString() },
      brecha: { value: 18.6, unit: 'percentage' },
    };

    // Save to cache (store JSON as string for SQLite)
    const expiresAt = new Date(Date.now() + USD_CACHE_TTL * 60 * 1000);
    await prisma.liveCache.upsert({
      where: { key: 'usd_rates' },
      update: {
        value: JSON.stringify(mockData),
        fetchedAt: new Date(),
        expiresAt,
      },
      create: {
        key: 'usd_rates',
        value: JSON.stringify(mockData),
        fetchedAt: new Date(),
        expiresAt,
      },
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
        expiresAt: cache.expiresAt.toISOString(),
        error: 'Using cached data due to API error',
      });
      return;
    }

    res.status(503).json({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Unable to fetch USD rates',
      },
    });
  }
});

// GET /v1/live/country-risk - Get country risk (cached)
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

    // Cache expired or missing
    const mockData = {
      value: 1850,
      unit: 'basis_points',
      variation: -15,
      variationType: 'daily',
      updatedAt: new Date().toISOString(),
    };

    // Save to cache
    const expiresAt = new Date(Date.now() + RISK_CACHE_TTL * 60 * 1000);
    await prisma.liveCache.upsert({
      where: { key: 'country_risk' },
      update: {
        value: JSON.stringify(mockData),
        fetchedAt: new Date(),
        expiresAt,
      },
      create: {
        key: 'country_risk',
        value: JSON.stringify(mockData),
        fetchedAt: new Date(),
        expiresAt,
      },
    });

    res.json({
      data: mockData,
      cached: false,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching country risk:', error);
    
    const cache = await prisma.liveCache.findUnique({
      where: { key: 'country_risk' },
    });
    
    if (cache) {
      const value = parseJsonField<Record<string, unknown>>(cache.value, {});
      res.json({
        data: value,
        cached: true,
        expiresAt: cache.expiresAt.toISOString(),
        error: 'Using cached data due to API error',
      });
      return;
    }

    res.status(503).json({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Unable to fetch country risk',
      },
    });
  }
});

export default router;
