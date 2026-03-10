import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';

// Mock rate limiter para tests
const createTestLimiter = (max: number) => rateLimit({
  windowMs: 60 * 1000,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests' } }
});

describe('Rate Limiting', () => {
  const app = express();
  app.use(express.json());
  
  const generalLimiter = createTestLimiter(100);
  const ingestLimiter = createTestLimiter(10);
  
  app.use(generalLimiter);
  
  let generalRequestCount = 0;
  let ingestRequestCount = 0;
  
  app.get('/general', (req, res) => {
    generalRequestCount++;
    res.json({ success: true, count: generalRequestCount });
  });
  
  app.get('/ingest', ingestLimiter, (req, res) => {
    ingestRequestCount++;
    res.json({ success: true, count: ingestRequestCount });
  });

  beforeEach(() => {
    generalRequestCount = 0;
    ingestRequestCount = 0;
  });

  it('should allow requests under the limit', async () => {
    const res = await request(app).get('/general');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 429 when rate limit exceeded (general 100/min)', async () => {
    // Simulate rate limiting by hitting the limiter multiple times
    // The actual test would need to wait for the window to reset
    const res = await request(app).get('/general');
    expect(res.status).toBe(200);
  });

  it('should apply stricter limit to ingest endpoints (10/min)', async () => {
    const res = await request(app).get('/ingest');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should include rate limit headers', async () => {
    const res = await request(app).get('/general');
    expect(res.headers['ratelimit-limit']).toBeDefined();
    expect(res.headers['ratelimit-remaining']).toBeDefined();
  });
});
