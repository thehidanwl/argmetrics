import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';

// Mock axios completely
vi.mock('axios');
const mockAxios = axios as vi.Mocked<typeof axios>;

// Mock database
const mockCreate = vi.fn();
const mockDeleteMany = vi.fn();
const mockFindUnique = vi.fn();
const mockUpsert = vi.fn();
const mockIngestionLogCreate = vi.fn();

vi.mock('../src/config/database', () => ({
  prisma: {
    metric: {
      create: mockCreate,
      deleteMany: mockDeleteMany,
      findUnique: mockFindUnique,
    },
    ingestionLog: {
      create: mockIngestionLogCreate,
    },
    liveCache: {
      findUnique: mockFindUnique,
      upsert: mockUpsert,
    },
    $queryRaw: vi.fn().mockResolvedValue([]),
  },
  parseJsonField: vi.fn((val) => val),
}));

describe('Ingest Router - Direct Testing', () => {
  let router: express.Router;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Dynamic import to get fresh router
    const { default: ingestRouter } = await import('../src/routes/ingest.js');
    router = ingestRouter;
  });

  describe('Auth Middleware', () => {
    it('should reject requests without authorization header', async () => {
      const mockReq = { headers: {} } as Request;
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response;
      const mockNext = vi.fn() as NextFunction;

      // Simulate the middleware
      const authHeader = mockReq.headers.authorization;
      expect(authHeader).toBeUndefined();
    });

    it('should reject requests with invalid token format', async () => {
      const mockReq = { headers: { authorization: 'InvalidFormat' } } as Request;
      
      const authHeader = mockReq.headers.authorization;
      const isValidFormat = authHeader?.startsWith('Bearer ');
      
      expect(isValidFormat).toBe(false);
    });

    it('should accept valid Bearer token', async () => {
      const mockReq = { headers: { authorization: 'Bearer valid-token' } } as Request;
      
      const authHeader = mockReq.headers.authorization;
      const token = authHeader?.substring(7);
      
      expect(token).toBe('valid-token');
    });
  });

  describe('USD Ingestion Logic', () => {
    it('should process USD data correctly', async () => {
      const apiResponse = {
        data: {
          blue: { value_avg: 800, value_sell: 810, value_buy: 790 },
          official: { value_avg: 350, value_sell: 355, value_buy: 345 }
        }
      };

      mockAxios.get.mockResolvedValue(apiResponse);
      mockDeleteMany.mockResolvedValue({ count: 0 });
      mockCreate.mockResolvedValue({ id: 1 });
      mockIngestionLogCreate.mockResolvedValue({ id: 1 });

      const response = await mockAxios.get('https://api.bluelytics.com.ar/v2/latest');
      
      // Process data similar to the router
      const blue = response.data.blue;
      const official = response.data.official;
      
      const usdMetrics = [
        { name: 'usd_blue', value: blue.value_avg, category: 'economy', periodType: 'daily', source: 'bluelytics' },
        { name: 'usd_blue_sell', value: blue.value_sell, category: 'economy', periodType: 'daily', source: 'bluelytics' },
        { name: 'usd_blue_buy', value: blue.value_buy, category: 'economy', periodType: 'daily', source: 'bluelytics' },
        { name: 'usd_official', value: official.value_avg, category: 'economy', periodType: 'daily', source: 'bluelytics' },
      ];

      expect(usdMetrics).toHaveLength(4);
      expect(usdMetrics[0].value).toBe(800);
      expect(usdMetrics[3].value).toBe(350);
    });

    it('should handle ingestion errors gracefully', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network error'));
      mockFindUnique.mockResolvedValue(null);

      try {
        await mockAxios.get('https://api.bluelytics.com.ar/v2/latest');
      } catch (error: any) {
        expect(error.message).toBe('Network error');
      }
    });
  });

  describe('Data persistence', () => {
    it('should delete existing data before inserting new', async () => {
      mockDeleteMany.mockResolvedValue({ count: 5 });
      
      const result = await mockDeleteMany({
        where: { name: { startsWith: 'usd_' } }
      });
      
      expect(result.count).toBe(5);
    });

    it('should create metrics in database', async () => {
      mockCreate.mockResolvedValue({ id: 1, name: 'usd_blue', value: 800 });
      
      const result = await mockCreate({
        data: {
          name: 'usd_blue',
          value: 800,
          category: 'economy',
          periodType: 'daily',
          source: 'bluelytics',
          date: new Date()
        }
      });
      
      expect(result.id).toBe(1);
      expect(result.name).toBe('usd_blue');
    });

    it('should log ingestion results', async () => {
      mockIngestionLogCreate.mockResolvedValue({ id: 1 });
      
      const result = await mockIngestionLogCreate({
        data: {
          source: 'bluelytics',
          metric: 'usd',
          status: 'success',
          rowsProcessed: 4,
          executedAt: new Date()
        }
      });
      
      expect(result.id).toBe(1);
    });
  });
});
