import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '../backend/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url || '';
  
  // Health check
  if (path === '/v1/health' || path === '/api/v1/health') {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        database: 'disconnected',
        error: String(error)
      });
    }
    return;
  }
  
  // Metrics
  if (path.startsWith('/v1/metrics') || path.startsWith('/api/v1/metrics')) {
    try {
      const metrics = await prisma.metric.findMany({
        take: 100,
        orderBy: { date: 'desc' }
      });
      res.status(200).json({ data: metrics });
      return;
    } catch (error) {
      res.status(500).json({ error: String(error) });
      return;
    }
  }
  
  res.status(404).json({ error: 'Not found' });
}
