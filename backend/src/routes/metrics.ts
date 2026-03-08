import { Router } from 'express';
import * as metricsController from '../controllers/metricsController.js';

const router = Router();

// GET /v1/metrics - Get metrics with filters
router.get('/', metricsController.getMetrics);

// GET /v1/metrics/categories - Get available categories
router.get('/categories', metricsController.getCategories);

// GET /v1/metrics/available - Get list of all available metrics
router.get('/available', metricsController.getAvailableMetrics);

// GET /v1/metrics/:name - Get specific metric by name
router.get('/:name', metricsController.getMetricByName);

export default router;
