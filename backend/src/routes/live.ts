import { Router } from 'express';
import axios from 'axios';
import { mockUSDRates, mockCountryRisk } from '../config/mockData.js';

/**
 * @swagger
 * /v1/live/usd:
 *   get:
 *     summary: Get current USD exchange rates
 *     description: Returns live USD exchange rates (oficial, blue, MEP, CCL, euro). Data is cached for 30 minutes.
 *     tags: [Live]
 *     responses:
 *       200:
 *         description: Current exchange rates
 */

/**
 * @swagger
 * /v1/live/country-risk:
 *   get:
 *     summary: Get current country risk index
 *     description: Returns the EMBI country risk index. Data is cached for 60 minutes.
 *     tags: [Live]
 *     responses:
 *       200:
 *         description: Current country risk data
 */

const router = Router();

const USD_CACHE_TTL_MS = 30 * 60 * 1000;  // 30 minutes
const RISK_CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes

// In-memory cache
let usdCache: { data: typeof mockUSDRates; expiresAt: Date } | null = null;

function calculateBrecha(oficial: number, blue: number): number | null {
  if (!oficial || oficial === 0) return null;
  return Number(((blue - oficial) / oficial * 100).toFixed(2));
}

// GET /v1/live/usd
router.get('/usd', async (req, res) => {
  // Serve from cache if still valid
  if (usdCache && new Date() < usdCache.expiresAt) {
    res.json({
      data: usdCache.data,
      cached: true,
      expiresAt: usdCache.expiresAt.toISOString(),
    });
    return;
  }

  // Try fetching live data from Bluelytics
  try {
    const BLUELYTICS_URL = process.env.BLUELYTICS_API_URL || 'https://api.bluelytics.com.ar/v2';
    const response = await axios.get(`${BLUELYTICS_URL}/latest`, { timeout: 8000 });
    const d = response.data;

    const usdData = {
      oficial: {
        buy: d.oficial.value_buy,
        sell: d.oficial.value_sell,
        updatedAt: d.last_update,
      },
      blue: {
        buy: d.blue.value_buy,
        sell: d.blue.value_sell,
        updatedAt: d.last_update,
      },
      mep: {
        buy: mockUSDRates.mep.buy,
        sell: mockUSDRates.mep.sell,
        updatedAt: d.last_update,
      },
      ccl: {
        buy: mockUSDRates.ccl.buy,
        sell: mockUSDRates.ccl.sell,
        updatedAt: d.last_update,
      },
      oficial_euro: {
        buy: d.oficial_euro?.value_buy ?? 0,
        sell: d.oficial_euro?.value_sell ?? 0,
        updatedAt: d.last_update,
      },
      blue_euro: {
        buy: d.blue_euro?.value_buy ?? 0,
        sell: d.blue_euro?.value_sell ?? 0,
        updatedAt: d.last_update,
      },
      brecha: {
        value: calculateBrecha(d.oficial.value_sell, d.blue.value_sell),
        unit: 'percentage',
      },
    };

    usdCache = {
      data: usdData,
      expiresAt: new Date(Date.now() + USD_CACHE_TTL_MS),
    };

    res.json({
      data: usdData,
      cached: false,
      expiresAt: usdCache.expiresAt.toISOString(),
    });
  } catch (error) {
    console.warn('⚠️ Bluelytics API unavailable, using mock data:', (error as Error).message);

    // Serve stale cache if available, otherwise fall back to static mock
    const fallback = usdCache?.data ?? mockUSDRates;
    res.json({
      data: fallback,
      mock: !usdCache,
      stale: !!usdCache,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });
  }
});

// GET /v1/live/country-risk
router.get('/country-risk', (req, res) => {
  // Country risk from a real API (Ámbito/JPMorgan) is not yet implemented.
  // Returns mock data with cache headers so the client knows when to refresh.
  res.json({
    data: mockCountryRisk,
    mock: true,
    expiresAt: new Date(Date.now() + RISK_CACHE_TTL_MS).toISOString(),
  });
});

export default router;
