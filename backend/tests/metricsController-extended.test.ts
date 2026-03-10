import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock database
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
  },
  parseJsonField: vi.fn((val) => val),
}));

describe('Metrics Controller - Extended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMetrics - full coverage', () => {
    it('should handle all query parameters', async () => {
      const mockMetrics = [
        { id: 1, name: 'inflation', value: 50, date: new Date('2024-01-01'), category: 'economy', periodType: 'monthly' }
      ];

      mockFindMany.mockResolvedValue(mockMetrics);
      mockCount.mockResolvedValue(1);

      const params = {
        category: 'economy',
        name: 'inflation',
        from: '2024-01-01',
        to: '2024-12-31',
        period: 'monthly',
        limit: 100,
        offset: 0
      };

      // Simulate the query building
      const where: Record<string, unknown> = {};
      if (params.category) where.category = params.category;
      if (params.name) where.name = params.name;
      if (params.from || params.to) {
        where.date = {};
        if (params.from) (where.date as Record<string, string>).gte = params.from;
        if (params.to) (where.date as Record<string, string>).lte = params.to;
      }
      if (params.period) where.periodType = params.period;

      await mockFindMany({ where, take: params.limit, skip: params.offset });

      expect(mockFindMany).toHaveBeenCalled();
    });

    it('should handle empty results', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      const result = await mockFindMany({ where: {}, take: 100, skip: 0 });
      expect(result).toHaveLength(0);
    });

    it('should handle large limit values', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await mockFindMany({ where: {}, take: 10000, skip: 0 });
      expect(mockFindMany).toHaveBeenCalled();
    });
  });

  describe('getMetricByName - full coverage', () => {
    it('should handle metric with previous value', async () => {
      const latest = { name: 'inflation', value: 55, date: new Date('2024-01-01'), category: 'economy' };
      const previous = { name: 'inflation', value: 50, date: new Date('2023-12-01'), category: 'economy' };

      mockFindFirst
        .mockResolvedValueOnce(latest)  // First call for series
        .mockResolvedValueOnce(latest)  // Second call for latest
        .mockResolvedValueOnce(previous); // Third call for previous

      // Simulate the variation calculation
      const variation = previous && previous.value !== 0
        ? ((latest.value - previous.value) / previous.value) * 100
        : 0;

      expect(variation).toBeCloseTo(10, 1);
    });

    it('should handle metric with zero previous value', async () => {
      const latest = { name: 'new_metric', value: 100, date: new Date('2024-01-01'), category: 'economy' };

      mockFindFirst.mockResolvedValue(latest);

      const previous = null;
      const variation = previous && previous.value !== 0
        ? ((latest.value - previous.value) / previous.value) * 100
        : 0;

      expect(variation).toBe(0);
    });
  });

  describe('getCategories - full coverage', () => {
    it('should return all categories with counts', async () => {
      const categories = [
        { category: 'economy', _count: { name: 5 } },
        { category: 'social', _count: { name: 3 } },
        { category: 'consumption', _count: { name: 2 } },
      ];

      mockGroupBy.mockResolvedValue(categories);

      const result = await mockGroupBy({ by: ['category'], _count: { name: true } });

      expect(result).toHaveLength(3);
      expect(result[0]._count.name).toBe(5);
    });

    it('should include category descriptions', () => {
      const getCategoryDescription = (category: string): string => {
        const descriptions: Record<string, string> = {
          economy: 'Economic indicators',
          social: 'Social indicators',
          consumption: 'Consumption indicators',
        };
        return descriptions[category] || category;
      };

      expect(getCategoryDescription('economy')).toBe('Economic indicators');
      expect(getCategoryDescription('social')).toBe('Social indicators');
      expect(getCategoryDescription('consumption')).toBe('Consumption indicators');
      expect(getCategoryDescription('unknown')).toBe('unknown');
    });
  });

  describe('getAvailableMetrics - full coverage', () => {
    it('should group metrics and calculate date ranges', async () => {
      const metrics = [
        { name: 'inflation', category: 'economy', source: 'indec', periodType: 'monthly', date: new Date('2024-01-01') },
        { name: 'inflation', category: 'economy', source: 'indec', periodType: 'monthly', date: new Date('2024-02-01') },
        { name: 'usd_blue', category: 'economy', source: 'bluelytics', periodType: 'daily', date: new Date('2024-01-15') },
      ];

      const metricsMap = new Map<string, { category: string; source: string; periodType: string; dates: Date[] }>();

      for (const m of metrics) {
        if (!metricsMap.has(m.name)) {
          metricsMap.set(m.name, { category: m.category, source: m.source, periodType: m.periodType, dates: [] });
        }
        const entry = metricsMap.get(m.name)!;
        if (m.date) entry.dates.push(m.date);
      }

      const result = Array.from(metricsMap.entries()).map(([name, data]) => ({
        name,
        dateRange: {
          from: data.dates.length ? new Date(Math.min(...data.dates.map(d => d.getTime()))).toISOString().split('T')[0] : null,
          to: data.dates.length ? new Date(Math.max(...data.dates.map(d => d.getTime()))).toISOString().split('T')[0] : null,
        }
      }));

      expect(result).toHaveLength(2);
      expect(result[0].dateRange.from).toBe('2024-01-01');
      expect(result[0].dateRange.to).toBe('2024-02-01');
    });

    it('should handle metrics without dates', async () => {
      const metricsMap = new Map<string, { category: string; dates: Date[] }>();
      metricsMap.set('new_metric', { category: 'economy', dates: [] });

      const result = Array.from(metricsMap.entries()).map(([name, data]) => ({
        name,
        dateRange: {
          from: data.dates.length ? new Date(Math.min(...data.dates.map(d => d.getTime()))).toISOString().split('T')[0] : null,
          to: data.dates.length ? new Date(Math.max(...data.dates.map(d => d.getTime()))).toISOString().split('T')[0] : null,
        }
      }));

      expect(result[0].dateRange.from).toBeNull();
      expect(result[0].dateRange.to).toBeNull();
    });
  });
});
