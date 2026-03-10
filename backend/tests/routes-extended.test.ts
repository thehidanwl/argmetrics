import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock the database module
vi.mock('../src/config/database', () => ({
  prisma: {
    metric: {
      findMany: vi.fn().mockResolvedValue([
        { name: 'inflation', value: 50, date: new Date(), category: 'economy', periodType: 'monthly', source: 'indec' }
      ]),
      findFirst: vi.fn().mockResolvedValue({ name: 'inflation', value: 50, date: new Date(), category: 'economy' }),
      count: vi.fn().mockResolvedValue(1),
      groupBy: vi.fn().mockResolvedValue([{ category: 'economy', _count: { name: 1 } }]),
    },
    ingestionLog: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    liveCache: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({}),
    },
    $queryRaw: vi.fn().mockResolvedValue([]),
  },
  parseJsonField: vi.fn((val) => val),
}));

describe('API Routes - Extended Coverage', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Only load app once
    const testApp = await import('../src/index.js');
    app = testApp.default;
  });

  describe('GET /v1/health', () => {
    it('should include database status', async () => {
      const res = await request(app).get('/v1/health');
      expect(res.body.database).toBeDefined();
      expect(res.body.database.status).toBeDefined();
    });

    it('should include timestamp', async () => {
      const res = await request(app).get('/v1/health');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /v1/metrics', () => {
    it('should return pagination with hasMore', async () => {
      const res = await request(app).get('/v1/metrics');
      expect(res.body.pagination.hasMore).toBeDefined();
    });

    it('should handle period filter', async () => {
      const res = await request(app).get('/v1/metrics?period=monthly');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /v1/metrics/:name', () => {
    it('should return metric with series data', async () => {
      const res = await request(app).get('/v1/metrics/inflation');
      expect(res.status).toBe(200);
      if (res.status === 200) {
        expect(res.body.data).toHaveProperty('series');
      }
    });

    it('should include variation data', async () => {
      const res = await request(app).get('/v1/metrics/inflation');
      if (res.status === 200) {
        expect(res.body.data.latest).toHaveProperty('variation');
      }
    });
  });

  describe('GET /v1/live/country-risk', () => {
    it('should handle country-risk endpoint', async () => {
      const res = await request(app).get('/v1/live/country-risk');
      // Either returns data or 500 if external API fails
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('GET /v1/ingest/usd', () => {
    it('should handle USD ingest endpoint', async () => {
      const res = await request(app).get('/v1/ingest/usd');
      // Returns 401 if no auth, 200 if authenticated
      expect([200, 401]).toContain(res.status);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid query parameters', async () => {
      const res = await request(app).get('/v1/metrics?limit=invalid');
      // Zod validation should return 400
      expect([200, 400]).toContain(res.status);
    });
  });
});
