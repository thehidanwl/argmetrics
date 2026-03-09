import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url || '';
  
  // Health check
  if (path.includes('/v1/health')) {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'ArgMetrics API running'
    });
    return;
  }
  
  // Metrics - simple response for now
  if (path.includes('/v1/metrics')) {
    res.status(200).json({ 
      data: [],
      message: 'Metrics endpoint - DB not connected yet'
    });
    return;
  }
  
  // Live data
  if (path.includes('/v1/live')) {
    res.status(200).json({
      message: 'Live endpoint - coming soon'
    });
    return;
  }
  
  res.status(200).json({ 
    status: 'ok',
    message: 'ArgMetrics API working!' 
  });
}
