import { Router } from 'express';
import { mockUSDRates, mockCountryRisk } from '../config/mockData.js';

/**
 * @swagger
 * /v1/live/usd:
 *   get:
 *     summary: Get current USD exchange rates
 */
const router = Router();

// Cache TTL constants (in minutes)
const USD_CACHE_TTL = 30;
const RISK_CACHE_TTL = 60;

// GET /v1/live/usd - Get USD exchange rates (mock)
router.get('/usd', (req, res) => {
  console.log('📦 Returning mock USD rates');
  res.json({
    data: mockUSDRates,
    mock: true,
    expiresAt: new Date(Date.now() + USD_CACHE_TTL * 60 * 1000).toISOString(),
  });
});

// GET /v1/live/country-risk - Get country risk index (mock)
router.get('/country-risk', (req, res) => {
  console.log('📦 Returning mock country risk');
  res.json({
    data: mockCountryRisk,
    mock: true,
    expiresAt: new Date(Date.now() + RISK_CACHE_TTL * 60 * 1000).toISOString(),
  });
});

export default router;
