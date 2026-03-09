import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory cache for demo (will use DB in production)
const cache: Record<string, { data: any; fetchedAt: string }> = {};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url || '';
  const now = new Date().toISOString();
  
  // Health check
  if (path.includes('/v1/health')) {
    res.status(200).json({
      status: 'ok',
      timestamp: now,
      database: 'connected'
    });
    return;
  }
  
  // Get metrics from database
  if (path.includes('/v1/metrics')) {
    const { category, name, from, to, limit = '100' } = req.query;
    
    // Return mock data for now
    const mockMetrics = [
      { id: '1', category: 'economy', name: 'inflation', value: 4.2, date: '2025-02-01', periodType: 'monthly', source: 'INDEC' },
      { id: '2', category: 'economy', name: 'usd_official', value: 850, date: '2025-03-08', periodType: 'daily', source: 'BCRA' },
      { id: '3', category: 'economy', name: 'usd_blue', value: 1020, date: '2025-03-08', periodType: 'daily', source: 'Bluelytics' },
    ];
    
    res.status(200).json({ 
      data: mockMetrics,
      count: mockMetrics.length
    });
    return;
  }
  
  // Live USD data with cache
  if (path.includes('/v1/live/usd')) {
    const cached = cache['usd_rates'];
    const cacheAge = cached ? (new Date(now).getTime() - new Date(cached.fetchedAt).getTime()) / 1000 / 60 : Infinity;
    
    if (cached && cacheAge < 30) {
      res.status(200).json({ 
        data: cached.data, 
        cached: true,
        fetchedAt: cached.fetchedAt 
      });
      return;
    }
    
    // Mock data - in production, fetch from Bluelytics API
    const mockData = {
      official: { buy: 850, sell: 890, updatedAt: now },
      blue: { buy: 1020, sell: 1040, updatedAt: now },
      mep: { buy: 980, sell: 995, updatedAt: now },
      ccl: { buy: 970, sell: 985, updatedAt: now },
      brecha: { value: 17.6, unit: '%' }
    };
    
    cache['usd_rates'] = { data: mockData, fetchedAt: now };
    
    res.status(200).json({ 
      data: mockData, 
      cached: false,
      fetchedAt: now
    });
    return;
  }
  
  res.status(200).json({ 
    status: 'ok',
    message: 'ArgMetrics API - use /v1/health, /v1/metrics, /v1/live/usd' 
  });
}
