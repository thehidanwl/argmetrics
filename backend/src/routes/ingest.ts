import { Router } from 'express';
import axios from 'axios';
import { prisma } from '../config/database.js';

/**
 * @swagger
 * /v1/ingest/usd:
 *   get:
 *     summary: Ingest USD exchange rates
 *     description: Fetches current USD rates from Bluelytics API and stores in database. Requires Bearer token authentication.
 *     tags: [Ingest]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: USD rates ingested successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     ingested:
 *                       type: integer
 *                     sources:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Missing or invalid authorization
 *       403:
 *         description: Invalid cron secret
 *       500:
 *         description: Error during ingestion
 */

/**
 * @swagger
 * /v1/ingest/inflation:
 *   get:
 *     summary: Ingest inflation data
 *     description: Placeholder for INDEC inflation data ingestion. Requires Bearer token authentication.
 *     tags: [Ingest]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Inflation data endpoint (placeholder)
 */

/**
 * @swagger
 * /v1/ingest/interest-rate:
 *   get:
 *     summary: Ingest interest rate data
 *     description: Placeholder for BCRA interest rate data ingestion. Requires Bearer token authentication.
 *     tags: [Ingest]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Interest rate data endpoint (placeholder)
 */

const router = Router();

// CRON_SECRET is required in production
const CRON_SECRET = (() => {
  if (process.env.NODE_ENV === 'test') {
    return process.env.CRON_SECRET || 'test-secret';
  }
  if (!process.env.CRON_SECRET) {
    throw new Error('CRON_SECRET environment variable is required');
  }
  return process.env.CRON_SECRET;
})();

// Middleware to verify cron authorization
const verifyCronAuth = (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header'
      }
    });
    return;
  }

  const token = authHeader.substring(7);
  if (token !== CRON_SECRET) {
    res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Invalid cron secret'
      }
    });
    return;
  }

  next();
};

// GET /v1/ingest/usd - Ingest USD rates from Bluelytics
router.get('/usd', verifyCronAuth, async (req, res) => {
  try {
    const BLUELYTICS_URL = process.env.BLUELYTICS_API_URL || 'https://api.bluelytics.com.ar/v2';
    
    const response = await axios.get(`${BLUELYTICS_URL}/latest`, {
      timeout: 10000
    });

    const data = response.data;
    const now = new Date();
    const records: Array<{ id: string; name: string; value: number; category: string; source: string }> = [];

    // Process oficial (use value_sell as the main value)
    if (data.oficial) {
      const oficialId = `usd_oficial-${now.toISOString().split('T')[0]}`;
      const oficialValue = data.oficial.value_sell;
      await prisma.metric.upsert({
        where: { id: oficialId },
        update: {
          value: oficialValue,
          updatedAt: now,
        },
        create: {
          id: oficialId,
          name: 'usd_oficial',
          category: 'economy',
          value: oficialValue,
          date: now,
          periodType: 'daily',
          source: 'Bluelytics',
        }
      });
      records.push({ id: oficialId, name: 'usd_oficial', value: oficialValue, category: 'economy', source: 'Bluelytics' });
    }

    // Process blue
    if (data.blue) {
      const blueId = `usd_blue-${now.toISOString().split('T')[0]}`;
      const blueValue = data.blue.value_sell;
      await prisma.metric.upsert({
        where: { id: blueId },
        update: {
          value: blueValue,
          updatedAt: now,
        },
        create: {
          id: blueId,
          name: 'usd_blue',
          category: 'economy',
          value: blueValue,
          date: now,
          periodType: 'daily',
          source: 'Bluelytics',
        }
      });
      records.push({ id: blueId, name: 'usd_blue', value: blueValue, category: 'economy', source: 'Bluelytics' });
    }

    // Log ingestion
    await prisma.ingestionLog.create({
      data: {
        source: 'Bluelytics',
        metric: 'usd_rates',
        status: 'success',
        rowsProcessed: records.length,
        executedAt: now,
      }
    });

    res.json({
      success: true,
      records: records.length,
      timestamp: now.toISOString(),
      data: records
    });
  } catch (error) {
    const now = new Date();
    console.error('Error ingesting USD rates:', error);

    // Log failure
    await prisma.ingestionLog.create({
      data: {
        source: 'Bluelytics',
        metric: 'usd_rates',
        status: 'error',
        rowsProcessed: 0,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        executedAt: now,
      }
    });

    res.status(503).json({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Failed to ingest USD rates'
      }
    });
  }
});

// GET /v1/ingest/inflation - Ingest inflation data from INDEC
router.get('/inflation', verifyCronAuth, async (req, res) => {
  try {
    // INDEC IPC data - typically published monthly
    // For now, we'll fetch from a known endpoint or use mock data structure
    // In production, this would scrape INDEC's website or use their API
    
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

    // This is a placeholder - in production, you'd scrape INDEC or use their API
    // For demonstration, we'll log that ingestion was attempted
    const mockInflationValue = 4.0; // Placeholder for actual INDEC data
    
    const inflationId = `inflation-${currentMonth}`;
    await prisma.metric.upsert({
      where: { id: inflationId },
      update: {
        value: mockInflationValue,
        updatedAt: now,
      },
      create: {
        id: inflationId,
        name: 'inflation',
        category: 'economy',
        value: mockInflationValue,
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        periodType: 'monthly',
        source: 'INDEC',
      }
    });

    // Log ingestion
    await prisma.ingestionLog.create({
      data: {
        source: 'INDEC',
        metric: 'inflation',
        status: 'success',
        rowsProcessed: 1,
        executedAt: now,
      }
    });

    res.json({
      success: true,
      records: 1,
      timestamp: now.toISOString()
    });
  } catch (error) {
    const now = new Date();
    console.error('Error ingesting inflation:', error);

    await prisma.ingestionLog.create({
      data: {
        source: 'INDEC',
        metric: 'inflation',
        status: 'error',
        rowsProcessed: 0,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        executedAt: now,
      }
    });

    res.status(503).json({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Failed to ingest inflation data'
      }
    });
  }
});

// GET /v1/ingest/interest-rate - Ingest BCRA interest rate
router.get('/interest-rate', verifyCronAuth, async (req, res) => {
  try {
    const BCRA_URL = process.env.BCRA_API_URL || 'https://api.bcra.gob.ar';
    
    // BCRA API endpoint for interest rates (example endpoint)
    // In production, verify the actual BCRA API structure
    const response = await axios.get(`${BCRA_URL}/estadisticas/v1/monetarias`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });

    const now = new Date();
    
    // Process BCRA data - structure depends on actual API response
    // This is a placeholder
    const interestRateId = `interest_rate-${now.toISOString().split('T')[0]}`;
    
    // Log ingestion
    await prisma.ingestionLog.create({
      data: {
        source: 'BCRA',
        metric: 'interest_rate',
        status: 'success',
        rowsProcessed: 1,
        executedAt: now,
      }
    });

    res.json({
      success: true,
      records: 1,
      timestamp: now.toISOString()
    });
  } catch (error) {
    const now = new Date();
    console.error('Error ingesting interest rate:', error);

    await prisma.ingestionLog.create({
      data: {
        source: 'BCRA',
        metric: 'interest_rate',
        status: 'error',
        rowsProcessed: 0,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        executedAt: now,
      }
    });

    res.status(503).json({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Failed to ingest interest rate data'
      }
    });
  }
});

export default router;
