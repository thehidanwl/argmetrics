import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma, parseJsonField } from '../config/database';

// Query validation schema
const metricsQuerySchema = z.object({
  category: z.enum(['economy', 'social', 'consumption']).optional(),
  name: z.string().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  period: z.enum(['daily', 'monthly', 'quarterly', 'annually']).optional(),
  limit: z.coerce.number().min(1).max(10000).default(1000),
  offset: z.coerce.number().min(0).default(0),
});

export const getMetrics = async (req: Request, res: Response) => {
  try {
    const query = metricsQuerySchema.parse(req.query);

    const where: Record<string, unknown> = {};

    if (query.category) {
      where.category = query.category;
    }

    if (query.name) {
      where.name = query.name;
    }

    if (query.from || query.to) {
      where.date = {};
      if (query.from) {
        (where.date as Record<string, string>).gte = query.from;
      }
      if (query.to) {
        (where.date as Record<string, string>).lte = query.to;
      }
    }

    if (query.period) {
      where.periodType = query.period;
    }

    const [metrics, total] = await Promise.all([
      prisma.metric.findMany({
        where,
        orderBy: { date: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.metric.count({ where }),
    ]);

    res.json({
      data: metrics,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + metrics.length < total,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: {
          code: 'INVALID_PARAMETER',
          message: error.errors[0].message,
        },
      });
      return;
    }
    throw error;
  }
};

export const getMetricByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const query = metricsQuerySchema.parse(req.query);

    const where = {
      name,
      ...(query.from || query.to
        ? {
            date: {
              ...(query.from ? { gte: query.from } : {}),
              ...(query.to ? { lte: query.to } : {}),
            },
          }
        : {}),
      ...(query.period ? { periodType: query.period } : {}),
    };

    const [series, latest] = await Promise.all([
      prisma.metric.findMany({
        where,
        orderBy: { date: 'desc' },
        take: 100,
      }),
      prisma.metric.findFirst({
        where: { name },
        orderBy: { date: 'desc' },
      }),
    ]);

    if (!latest) {
      res.status(404).json({
        error: {
          code: 'METRIC_NOT_FOUND',
          message: `Metric '${name}' does not exist`,
        },
      });
      return;
    }

    // Get previous value for variation
    const previous = await prisma.metric.findFirst({
      where: {
        name,
        date: { lt: latest.date },
      },
      orderBy: { date: 'desc' },
    });

    const variation = previous && previous.value !== 0
      ? ((latest.value - previous.value) / previous.value) * 100
      : 0;

    res.json({
      data: {
        name: latest.name,
        category: latest.category,
        description: getMetricDescription(latest.name),
        unit: getMetricUnit(latest.name),
        latest: {
          value: latest.value,
          date: latest.date.toISOString().split('T')[0],
          variation: Number(variation.toFixed(2)),
          variationType: 'period',
        },
        series: series.reverse().map((m) => ({
          date: m.date.toISOString().split('T')[0],
          value: m.value,
        })),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: {
          code: 'INVALID_PARAMETER',
          message: error.errors[0].message,
        },
      });
      return;
    }
    throw error;
  }
};

export const getCategories = async (req: Request, res: Response) => {
  const categories = await prisma.metric.groupBy({
    by: ['category'],
    _count: { name: true },
  });

  res.json({
    data: categories.map((c) => ({
      name: c.category,
      description: getCategoryDescription(c.category),
      metricsCount: c._count.name,
    })),
  });
};

export const getAvailableMetrics = async (req: Request, res: Response) => {
  const metrics = await prisma.metric.findMany({
    distinct: ['name'],
    select: {
      name: true,
      category: true,
      source: true,
      periodType: true,
      date: true,
    },
    orderBy: { name: 'asc' },
  });

  // Group by name and get date range
  const metricsMap = new Map<
    string,
    { category: string; source: string; periodType: string; dates: Date[] }
  >();

  for (const m of metrics) {
    if (!metricsMap.has(m.name)) {
      metricsMap.set(m.name, {
        category: m.category,
        source: m.source,
        periodType: m.periodType,
        dates: [],
      });
    }
    const entry = metricsMap.get(m.name)!;
    if (m.date) {
      entry.dates.push(m.date);
    }
  }

  res.json({
    data: Array.from(metricsMap.entries()).map(([name, data]) => ({
      name,
      category: data.category,
      description: getMetricDescription(name),
      unit: getMetricUnit(name),
      periodType: data.periodType,
      source: data.source,
      dateRange: {
        from: data.dates.length ? new Date(Math.min(...data.dates.map(d => d.getTime()))).toISOString().split('T')[0] : null,
        to: data.dates.length ? new Date(Math.max(...data.dates.map(d => d.getTime()))).toISOString().split('T')[0] : null,
      },
    })),
  });
};

function getMetricDescription(name: string): string {
  const descriptions: Record<string, string> = {
    inflation: 'Índice de Precios al Consumidor (IPC)',
    usd_official: 'Dólar Oficial BCRA',
    usd_blue: 'Dólar Blue',
    usd_mep: 'Dólar MEP',
    usd_ccl: 'Dólar CCL',
    poverty: 'Pobreza',
    unemployment: 'Desempleo',
    gdp: 'Producto Bruto Interno',
    interest_rate: 'Tasa de interés BCRA',
    reserves: 'Reservas Internacionales',
    country_risk: 'Riesgo País (EMBI)',
  };
  return descriptions[name] || name;
}

function getMetricUnit(name: string): string {
  if (name.includes('usd') || name.includes('gdp') || name.includes('reserves')) {
    return 'ars';
  }
  if (name.includes('poverty') || name.includes('unemployment') || name.includes('interest')) {
    return 'percentage';
  }
  return 'number';
}

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    economy: 'Economic indicators',
    social: 'Social indicators',
    consumption: 'Consumption indicators',
  };
  return descriptions[category] || category;
}
