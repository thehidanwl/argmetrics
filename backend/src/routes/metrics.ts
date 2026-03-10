import { Router } from 'express';
import * as metricsController from '../controllers/metricsController.js';

/**
 * @swagger
 * /v1/metrics:
 *   get:
 *     summary: Get metrics with filters
 *     description: Retrieve economic metrics with optional filters for category, date range, and period
 *     tags: [Metrics]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [economy, social, consumption]
 *         description: Filter by category
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by metric name
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, monthly, quarterly, annually]
 *         description: Period type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 1000
 *         description: Maximum number of results
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Pagination offset
 *     responses:
 *       200:
 *         description: List of metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 */
const router = Router();

// GET /v1/metrics - Get metrics with filters
router.get('/', metricsController.getMetrics);

/**
 * @swagger
 * /v1/metrics/categories:
 *   get:
 *     summary: Get available categories
 *     description: Returns all metric categories with their descriptions and count
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       metricsCount:
 *                         type: integer
 */
router.get('/categories', metricsController.getCategories);

/**
 * @swagger
 * /v1/metrics/available:
 *   get:
 *     summary: Get available metrics
 *     description: Returns all available metric names with their details
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: List of available metrics
 */
router.get('/available', metricsController.getAvailableMetrics);

/**
 * @swagger
 * /v1/metrics/{name}:
 *   get:
 *     summary: Get specific metric by name
 *     description: Returns detailed information about a specific metric including its series data
 *     tags: [Metrics]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Metric name (e.g., inflation, usd_blue, poverty)
 *     responses:
 *       200:
 *         description: Metric details with series
 *       404:
 *         description: Metric not found
 */
router.get('/:name', metricsController.getMetricByName);

export default router;
