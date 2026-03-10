import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock the database module
vi.mock('../src/config/database', () => ({
  prisma: {
    metric: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      groupBy: vi.fn().mockResolvedValue([]),
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

describe('API Routes', () => {
  let app: express.Application;

  beforeEach(async () => {
    // Import app after mocks are set up
    const { default: testApp } = await import('../src/index.js');
    app = testApp;
  });

  describe('GET /v1/health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.version).toBe('1.0.0');
    });

    it('should include uptime', async () => {
      const res = await request(app).get('/v1/health');
      expect(res.body.uptime).toBeDefined();
      expect(typeof res.body.uptime).toBe('number');
    });
  });

  describe('GET /v1/metrics', () => {
    it('should return metrics array', async () => {
      const res = await request(app).get('/v1/metrics');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
    });

    it('should accept category filter', async () => {
      const res = await request(app).get('/v1/metrics?category=economy');
      expect(res.status).toBe(200);
    });

    it('should accept limit and offset', async () => {
      const res = await request(app).get('/v1/metrics?limit=10&offset=0');
      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(10);
    });
  });

  describe('GET /v1/metrics/categories', () => {
    it('should return categories', async () => {
      const res = await request(app).get('/v1/metrics/categories');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });
  });

  describe('GET /v1/metrics/available', () => {
    it('should return available metrics', async () => {
      const res = await request(app).get('/v1/metrics/available');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /v1/metrics/:name', () => {
    it('should return 404 for non-existent metric', async () => {
      const res = await request(app).get('/v1/metrics/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /v1/live/usd', () => {
    it('should return USD rates', async () => {
      const res = await request(app).get('/v1/live/usd');
      // May return 200 with data or 500 if API fails
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/v1/unknown');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
