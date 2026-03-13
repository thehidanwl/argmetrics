import { Router, Request, Response } from 'express';
import { checkDatabaseConnection, getPrisma } from '../config/database.js';

/**
 * @swagger
 * /v1/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns API status, database connectivity, and last ingestion info
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System health status
 */
const router = Router();

const startTime = Date.now();

router.get('/', async (req: Request, res: Response) => {
  const dbConnected = await checkDatabaseConnection();
  const prisma = getPrisma();

  let lastSuccess = null;
  let lastError = null;

  if (prisma && dbConnected) {
    try {
      const [successLog, errorLog] = await Promise.all([
        prisma.ingestionLog.findFirst({
          where: { status: 'success' },
          orderBy: { executedAt: 'desc' },
        }),
        prisma.ingestionLog.findFirst({
          where: { status: 'error' },
          orderBy: { executedAt: 'desc' },
        }),
      ]);

      if (successLog) {
        lastSuccess = {
          source: successLog.source,
          metric: successLog.metric,
          executedAt: successLog.executedAt.toISOString(),
          rowsProcessed: successLog.rowsProcessed,
        };
      }

      if (errorLog) {
        lastError = {
          source: errorLog.source,
          metric: errorLog.metric,
          executedAt: errorLog.executedAt.toISOString(),
          errorMessage: errorLog.errorMessage ?? 'Unknown error',
        };
      }
    } catch (error) {
      console.error('Error fetching ingestion logs:', error);
    }
  }

  res.json({
    status: 'healthy',
    version: '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    database: {
      status: dbConnected ? 'connected' : 'disconnected',
      latencyMs: null,
    },
    mode: dbConnected ? 'production' : 'mock',
    ingestions: {
      lastSuccess,
      lastError,
    },
  });
});

export default router;
