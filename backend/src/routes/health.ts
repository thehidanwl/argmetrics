import { Router } from 'express';
import { prisma } from '../config/database';

const router = Router();

let startTime = Date.now();

// GET /v1/health - Health check with ingestion status
router.get('/', async (req, res) => {
  try {
    const startDb = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startDb;

    // Get last successful ingestion
    const lastSuccess = await prisma.ingestionLog.findFirst({
      where: { status: 'success' },
      orderBy: { executedAt: 'desc' },
    });

    // Get last error
    const lastError = await prisma.ingestionLog.findFirst({
      where: { status: 'error' },
      orderBy: { executedAt: 'desc' },
    });

    res.json({
      status: 'healthy',
      version: '1.0.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        latencyMs: dbLatency,
      },
      ingestions: {
        lastSuccess: lastSuccess
          ? {
              source: lastSuccess.source,
              metric: lastSuccess.metric,
              executedAt: lastSuccess.executedAt.toISOString(),
              rowsProcessed: lastSuccess.rowsProcessed,
            }
          : undefined,
        lastError: lastError
          ? {
              source: lastError.source,
              metric: lastError.metric,
              executedAt: lastError.executedAt.toISOString(),
              errorMessage: lastError.errorMessage,
            }
          : undefined,
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      version: '1.0.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        latencyMs: null,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
