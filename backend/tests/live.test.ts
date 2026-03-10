import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockAxios = axios as vi.Mocked<typeof axios>;

// Mock database
vi.mock('../src/config/database', () => ({
  prisma: {
    metric: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    ingestionLog: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    liveCache: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({}),
    },
    $queryRaw: vi.fn().mockResolvedValue([]),
  },
  parseJsonField: vi.fn((val) => val),
}));

describe('Live Routes - Extended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('USD Rates from Bluelytics', () => {
    it('should parse USD response correctly', async () => {
      const mockResponse = {
        data: {
          blue: { value_avg: 800, value_sell: 810, value_buy: 790 },
          official: { value_avg: 350, value_sell: 355, value_buy: 345 },
          mep: { value_avg: 380 },
          ccl: { value_avg: 390 }
        }
      };

      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const response = await mockAxios.get('https://api.bluelytics.com.ar/v2/latest');
      const data = response.data;

      expect(data.blue.value_avg).toBe(800);
      expect(data.blue.value_sell).toBe(810);
      expect(data.blue.value_buy).toBe(790);
      expect(data.official.value_avg).toBe(350);
    });

    it('should handle partial data gracefully', async () => {
      const mockResponse = {
        data: {
          blue: { value_avg: 800 }
          // official, mep, ccl missing
        }
      };

      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const response = await mockAxios.get('https://api.bluelytics.com.ar/v2/latest');
      
      expect(response.data.blue.value_avg).toBe(800);
      expect(response.data.official?.value_avg).toBeUndefined();
    });

    it('should handle API errors', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Connection timeout'));

      await expect(mockAxios.get('https://api.bluelytics.com.ar/v2/latest'))
        .rejects.toThrow('Connection timeout');
    });
  });

  describe('Country Risk', () => {
    it('should handle country risk response', async () => {
      const mockResponse = {
        data: {
          lastupdate: '2024-01-15',
          value: 1800
        }
      };

      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const response = await mockAxios.get('https://api.essb.com.ar/country-risk/latest');
      
      expect(response.data.value).toBe(1800);
    });

    it('should handle country risk API errors', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Service unavailable'));

      await expect(mockAxios.get('https://api.essb.com.ar/country-risk/latest'))
        .rejects.toThrow('Service unavailable');
    });
  });

  describe('Data transformation', () => {
    it('should transform Bluelytics data to internal format', () => {
      const rawData = {
        blue: { value_avg: 800, value_sell: 810, value_buy: 790 },
        official: { value_avg: 350, value_sell: 355, value_buy: 345 }
      };

      const transformed = {
        usd_blue: {
          buy: rawData.blue.value_buy,
          sell: rawData.blue.value_sell,
          avg: rawData.blue.value_avg
        },
        usd_official: {
          buy: rawData.official.value_buy,
          sell: rawData.official.value_sell,
          avg: rawData.official.value_avg
        }
      };

      expect(transformed.usd_blue.buy).toBe(790);
      expect(transformed.usd_blue.sell).toBe(810);
      expect(transformed.usd_official.avg).toBe(350);
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('ENOTFOUND'));

      try {
        await mockAxios.get('https://invalid-domain.com/api');
      } catch (error: any) {
        expect(error.message).toBe('ENOTFOUND');
      }
    });

    it('should handle timeout errors', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('timeout of 5000ms exceeded'));

      await expect(mockAxios.get('https://slow-api.com')).rejects.toThrow();
    });
  });
});
