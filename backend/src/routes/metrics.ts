import { Router } from 'express';
import { mockMetrics } from '../config/mockData.js';

/**
 * @swagger
 * /v1/metrics:
 *   get:
 *     summary: Get metrics with filters
 *     description: Retrieve economic metrics with optional filters for category, date range, and period
 *     tags: [Metrics]
 */
const router = Router();

// GET /v1/metrics - Get metrics with filters
router.get('/', (req, res) => {
  console.log('📦 Returning mock metrics');
  
  const { category, name, from, to, period, limit = '1000', offset = '0' } = req.query;
  
  let filtered = [...mockMetrics];
  
  if (category) {
    filtered = filtered.filter(m => m.category === category);
  }
  if (name) {
    filtered = filtered.filter(m => m.name === name);
  }
  if (from) {
    filtered = filtered.filter(m => new Date(m.date) >= new Date(from as string));
  }
  if (to) {
    filtered = filtered.filter(m => new Date(m.date) <= new Date(to as string));
  }
  if (period) {
    filtered = filtered.filter(m => m.periodType === period);
  }
  
  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);
  
  res.json({
    data: filtered.slice(offsetNum, offsetNum + limitNum),
    pagination: {
      total: filtered.length,
      limit: limitNum,
      offset: offsetNum,
      hasMore: offsetNum + limitNum < filtered.length,
    },
    mock: true,
  });
});

/**
 * @swagger
 * /v1/metrics/categories:
 *   get:
 *     summary: Get available categories
 */
router.get('/categories', (req, res) => {
  const categories = [
    { name: 'economy', description: 'Economic indicators', metricsCount: 9 },
    { name: 'social', description: 'Social indicators', metricsCount: 2 },
    { name: 'consumption', description: 'Consumption indicators', metricsCount: 1 },
  ];
  res.json({ data: categories, mock: true });
});

/**
 * @swagger
 * /v1/metrics/available:
 *   get:
 *     summary: Get available metrics
 */
router.get('/available', (req, res) => {
  const metrics = mockMetrics.map(m => ({
    name: m.name,
    category: m.category,
    description: getMetricDescription(m.name),
    unit: m.unit,
    periodType: m.periodType,
    source: m.source,
    dateRange: {
      from: m.date.toISOString().split('T')[0],
      to: m.date.toISOString().split('T')[0],
    },
  }));
  res.json({ data: metrics, mock: true });
});

/**
 * @swagger
 * /v1/metrics/{name}:
 *   get:
 *     summary: Get specific metric by name
 */
router.get('/:name', (req, res) => {
  const { name } = req.params;
  const metric = mockMetrics.find(m => m.name === name);
  
  if (!metric) {
    res.status(404).json({
      error: {
        code: 'METRIC_NOT_FOUND',
        message: `Metric '${name}' does not exist`,
      },
    });
    return;
  }

  res.json({
    data: {
      name: metric.name,
      category: metric.category,
      description: getMetricDescription(metric.name),
      unit: metric.unit,
      latest: {
        value: metric.value,
        date: metric.date.toISOString().split('T')[0],
        variation: 0,
        variationType: 'period',
      },
      series: [{
        date: metric.date.toISOString().split('T')[0],
        value: metric.value,
      }],
    },
    mock: true,
  });
});

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

export default router;
