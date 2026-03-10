import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'healthy',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: 'disconnected',
      latencyMs: null,
    },
    ingestions: {
      lastSuccess: null,
      lastError: null,
    },
    mode: 'mock'
  });
}
