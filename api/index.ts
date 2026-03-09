import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '../backend/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url || '';
  
  // Health check
  if (path.includes('/v1/health')) {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Get metrics from database
  if (path.includes('/v1/metrics')) {
    try {
      const { category, name, from, to, period, limit = '100' } = req.query;
      
      const where: any = {};
      
      if (category) where.category = String(category);
      if (name) where.name = String(name);
      
      if (from || to) {
        where.date = {};
        if (from) where.date.gte = new Date(String(from));
        if (to) where.date.lte = new Date(String(to));
      }
      
      const metrics = await prisma.metric.findMany({
        where,
        take: parseInt(String(limit)),
        orderBy: { date: 'desc' }
      });
      
      res.status(200).json({ data: metrics });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
    return;
  }
  
  // Live USD data with cache
  if (path.includes('/v1/live/usd')) {
    try {
      // Check cache first
      const cache = await prisma.liveCache.findUnique({
        where: { key: 'usd_rates' }
      });
      
      const now = new Date();
      const cacheAge = cache ? (now.getTime() - new Date(cache.fetchedAt).getTime()) / 1000 / 60 : Infinity;
      
      if (cache && cacheAge < 30) {
        res.status(200).json({ 
          data: JSON.parse(cache.value), 
          cached: true,
          fetchedAt: cache.fetchedAt 
        });
        return;
      }
      
      // Fetch fresh data from external API (bluelytics)
      // For now, return mock data
      const mockData = {
        official: { buy: 850, sell: 890, updatedAt: now.toISOString() },
        blue: { buy: 1020, sell: 1040, updatedAt: now.toISOString() },
        mep: { buy: 980, sell: 995, updatedAt: now.toISOString() },
        ccl: { buy: 970, sell: 985, updatedAt: now.toISOString() },
        brecha: { value: 17.6, unit: '%' }
      };
      
      // Save to cache
      await prisma.liveCache.upsert({
        where: { key: 'usd_rates' },
        update: { 
          value: JSON.stringify(mockData),
          fetchedAt: now,
          expiresAt: new Date(now.getTime() + 30 * 60 * 1000)
        },
        create: { 
          key: 'usd_rates',
          value: JSON.stringify(mockData),
          fetchedAt: now,
          expiresAt: new Date(now.getTime() + 30 * 60 * 1000)
        }
      });
      
      res.status(200).json({ 
        data: mockData, 
        cached: false,
        fetchedAt: now.toISOString()
      });
    } catch (error) {
      console.error('Error fetching USD rates:', error);
      res.status(500).json({ error: 'Failed to fetch USD rates' });
    }
    return;
  }
  
  res.status(404).json({ error: 'Not found' });
}
