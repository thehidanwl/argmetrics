import { Router, Request, Response } from 'express';

/**
 * @swagger
 * /v1/health:
 *   get:
 *     summary: Health check endpoint
 */
const router = Router();

let startTime = Date.now();

// GET /v1/health - Health check
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    database: {
      status: 'disconnected',
      latencyMs: null,
    },
    mode: 'mock',
    message: 'API running in mock mode - database not available',
  });
});

export default router;
