import { Router } from 'express';
import axios from 'axios';
import { getPrisma } from '../config/database.js';

/**
 * @swagger
 * /v1/ingest/usd:
 *   get:
 *     summary: Ingest USD exchange rates
 *     description: Fetches current USD rates from Bluelytics API and stores in database. Requires Bearer token.
 *     tags: [Ingest]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: USD rates ingested successfully
 *       401:
 *         description: Missing or invalid authorization
 *       503:
 *         description: Database not configured or ingestion failed
 */

/**
 * @swagger
 * /v1/ingest/inflation:
 *   get:
 *     summary: Ingest inflation data from INDEC
 *     tags: [Ingest]
 *     security:
 *       - BearerAuth: []
 */

/**
 * @swagger
 * /v1/ingest/interest-rate:
 *   get:
 *     summary: Ingest BCRA interest rate data
 *     tags: [Ingest]
 *     security:
 *       - BearerAuth: []
 */

const router = Router();

// CRON_SECRET must be set in production; tests can use a default.
const CRON_SECRET = (() => {
  if (process.env.NODE_ENV === 'test') {
    return process.env.CRON_SECRET || 'test-secret';
  }
  if (!process.env.CRON_SECRET) {
    throw new Error('CRON_SECRET environment variable is required');
  }
  return process.env.CRON_SECRET;
})();

// Middleware: verify the cron Bearer token.
const verifyCronAuth = (
  req: import('express').Request,
  res: import('express').Response,
  next: import('express').NextFunction
) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' } });
    return;
  }
  if (auth.substring(7) !== CRON_SECRET) {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Invalid cron secret' } });
    return;
  }
  next();
};

// Helper: log an ingestion run. Silently skips if no DB is available.
async function logIngestion(
  source: string,
  metric: string,
  status: 'success' | 'error' | 'partial',
  rowsProcessed: number,
  errorMessage?: string
): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  try {
    await prisma.ingestionLog.create({
      data: { source, metric, status, rowsProcessed, errorMessage, executedAt: new Date() },
    });
  } catch (err) {
    console.error('Failed to write ingestion log:', err);
  }
}

// GET /v1/ingest/usd — Fetch USD rates from Bluelytics and save to DB.
router.get('/usd', verifyCronAuth, async (req, res) => {
  const prisma = getPrisma();
  if (!prisma) {
    res.status(503).json({ error: { code: 'DB_UNAVAILABLE', message: 'Database not configured' } });
    return;
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  try {
    const BLUELYTICS_URL = process.env.BLUELYTICS_API_URL || 'https://api.bluelytics.com.ar/v2';
    const response = await axios.get(`${BLUELYTICS_URL}/latest`, { timeout: 10000 });
    const d = response.data;

    const records: Array<{ id: string; name: string; value: number }> = [];

    const upserts: Array<Promise<unknown>> = [];

    if (d.oficial) {
      const id = `usd_oficial-${today}`;
      upserts.push(
        prisma.metric.upsert({
          where: { id },
          update: { value: d.oficial.value_sell, updatedAt: now },
          create: { id, name: 'usd_oficial', category: 'economy', value: d.oficial.value_sell, date: now, periodType: 'daily', source: 'Bluelytics' },
        })
      );
      records.push({ id, name: 'usd_oficial', value: d.oficial.value_sell });
    }

    if (d.blue) {
      const id = `usd_blue-${today}`;
      upserts.push(
        prisma.metric.upsert({
          where: { id },
          update: { value: d.blue.value_sell, updatedAt: now },
          create: { id, name: 'usd_blue', category: 'economy', value: d.blue.value_sell, date: now, periodType: 'daily', source: 'Bluelytics' },
        })
      );
      records.push({ id, name: 'usd_blue', value: d.blue.value_sell });
    }

    await Promise.all(upserts);
    await logIngestion('Bluelytics', 'usd_rates', 'success', records.length);

    res.json({ success: true, records: records.length, timestamp: now.toISOString(), data: records });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error ingesting USD rates:', msg);
    await logIngestion('Bluelytics', 'usd_rates', 'error', 0, msg);
    res.status(503).json({ error: { code: 'INGESTION_FAILED', message: 'Failed to ingest USD rates' } });
  }
});

// GET /v1/ingest/inflation — Placeholder for INDEC IPC data ingestion.
router.get('/inflation', verifyCronAuth, async (req, res) => {
  const prisma = getPrisma();
  if (!prisma) {
    res.status(503).json({ error: { code: 'DB_UNAVAILABLE', message: 'Database not configured' } });
    return;
  }

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

  try {
    // TODO: replace with real INDEC Excel/API parsing.
    // INDEC publishes IPC data at: https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31
    // For now, this is a no-op placeholder — returns success without writing.
    res.status(501).json({
      success: false,
      message: 'INDEC inflation ingestion not yet implemented. Requires Excel parsing.',
      month: currentMonth,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error ingesting inflation:', msg);
    await logIngestion('INDEC', 'inflation', 'error', 0, msg);
    res.status(503).json({ error: { code: 'INGESTION_FAILED', message: 'Failed to ingest inflation data' } });
  }
});

// GET /v1/ingest/interest-rate — Placeholder for BCRA interest rate ingestion.
router.get('/interest-rate', verifyCronAuth, async (req, res) => {
  const prisma = getPrisma();
  if (!prisma) {
    res.status(503).json({ error: { code: 'DB_UNAVAILABLE', message: 'Database not configured' } });
    return;
  }

  const now = new Date();

  try {
    // TODO: implement BCRA API call.
    // BCRA API: https://api.bcra.gob.ar — requires identifying the correct endpoint for tasa de política monetaria.
    res.status(501).json({
      success: false,
      message: 'BCRA interest rate ingestion not yet implemented.',
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error ingesting interest rate:', msg);
    await logIngestion('BCRA', 'interest_rate', 'error', 0, msg);
    res.status(503).json({ error: { code: 'INGESTION_FAILED', message: 'Failed to ingest interest rate' } });
  }
});

export default router;
