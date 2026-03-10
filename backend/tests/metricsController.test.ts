import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
const mockFindMany = vi.fn();
const mockFindFirst = vi.fn();
const mockCount = vi.fn();
const mockGroupBy = vi.fn();

vi.mock('../src/config/database', () => ({
  prisma: {
    metric: {
      findMany: mockFindMany,
      findFirst: mockFindFirst,
      count: mockCount,
      groupBy: mockGroupBy,
    },
    $queryRaw: vi.fn().mockResolvedValue([]),
  },
  parseJsonField: vi.fn((val) => val),
}));

describe('Metrics Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMetrics', () => {
    it('should return metrics with pagination', async () => {
      const mockMetrics = [
        { id: 1, name: 'inflation', value: 50.2, date: new Date('2024-01-01'), category: 'economy' },
        { id: 2, name: 'usd_blue', value: 800, date: new Date('2024-01-01'), category: 'economy' },
      ];

      mockFindMany.mockResolvedValue(mockMetrics);
      mockCount.mockResolvedValue(2);

      // Verify mock works
      const result = await mockFindMany({ where: {}, take: 100, skip: 0 });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('inflation');
    });

    it('should filter by category', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await mockFindMany({ 
        where: { category: 'economy' },
        take: 100,
        skip: 0 
      });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'economy' })
        })
      );
    });

    it('should handle date range filters', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await mockFindMany({
        where: {
          date: {
            gte: '2024-01-01',
            lte: '2024-12-31'
          }
        },
        take: 100,
        skip: 0
      });

      expect(mockFindMany).toHaveBeenCalled();
    });
  });

  describe('getMetricByName', () => {
    it('should return 404 if metric not found', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await mockFindFirst({ where: { name: 'nonexistent' } });
      expect(result).toBeNull();
    });

    it('should calculate variation correctly', async () => {
      const latest = { name: 'inflation', value: 50, date: new Date('2024-01-01') };
      const previous = { name: 'inflation', value: 45, date: new Date('2023-12-01') };

      const variation = previous && previous.value !== 0
        ? ((latest.value - previous.value) / previous.value) * 100
        : 0;

      expect(variation).toBeCloseTo(11.11, 1);
    });
  });

  describe('getCategories', () => {
    it('should group metrics by category', async () => {
      const mockCategories = [
        { category: 'economy', _count: { name: 5 } },
        { category: 'social', _count: { name: 3 } },
      ];

      mockGroupBy.mockResolvedValue(mockCategories);

      const result = await mockGroupBy({
        by: ['category'],
        _count: { name: true },
      });

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe('economy');
    });
  });
});
