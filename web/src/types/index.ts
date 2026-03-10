// Types for ArgMetrics API

export interface USDRates {
  oficial: { buy: number; sell: number; updatedAt: string };
  blue: { buy: number; sell: number; updatedAt: string };
  oficial_euro: { buy: number; sell: number; updatedAt: string };
  blue_euro: { buy: number; sell: number; updatedAt: string };
  brecha: { value: number; unit: string };
}

export interface Metric {
  id: string;
  category: string;
  name: string;
  value: number;
  date: string;
  periodType: 'daily' | 'monthly' | 'quarterly' | 'annually';
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetricCategory {
  name: string;
  description: string;
  metricsCount: number;
}

export interface MetricsResponse {
  data: Metric[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  database: {
    status: string;
    latencyMs: number;
  };
  ingestions: {
    lastSuccess: {
      source: string;
      metric: string;
      executedAt: string;
      rowsProcessed: number;
    } | null;
    lastError: {
      source: string;
      metric: string;
      executedAt: string;
      errorMessage: string;
    } | null;
  };
}
