export type Category = 'economy' | 'social' | 'consumption';
export type PeriodType = 'daily' | 'monthly' | 'quarterly' | 'annually';
export type IngestionStatus = 'success' | 'error' | 'partial';

export interface Metric {
  id: string;
  category: Category;
  name: string;
  value: number;
  date: string;
  periodType: PeriodType;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LiveCache {
  key: string;
  value: Record<string, unknown>;
  fetchedAt: Date;
  expiresAt: Date;
}

export interface IngestionLog {
  id: string;
  source: string;
  metric: string;
  status: IngestionStatus;
  rowsProcessed: number;
  errorMessage?: string;
  executedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  pagination?: Pagination;
  cached?: boolean;
  expiresAt?: string;
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Metric query params
export interface MetricsQueryParams {
  category?: Category;
  name?: string;
  from?: string;
  to?: string;
  period?: PeriodType;
  limit?: number;
  offset?: number;
}

// Metric series data point
export interface DataPoint {
  date: string;
  value: number;
}

// Metric with full metadata
export interface MetricMetadata {
  name: string;
  category: Category;
  description: string;
  unit: string;
  periodType: PeriodType;
  source: string;
  dateRange: {
    from: string;
    to: string;
  };
}

// Live USD data
export interface USDExchangeRates {
  official: ExchangeRate;
  blue: ExchangeRate;
  mep: ExchangeRate;
  ccl: ExchangeRate;
  brecha: {
    value: number;
    unit: string;
  };
}

export interface ExchangeRate {
  buy: number;
  sell: number;
  updatedAt: string;
}

// Country risk data
export interface CountryRisk {
  value: number;
  unit: string;
  variation: number;
  variationType: string;
  updatedAt: string;
}

// Health check response
export interface HealthResponse {
  status: string;
  version: string;
  uptime: number;
  timestamp: string;
  database: {
    status: string;
    latencyMs: number;
  };
  ingestions: {
    lastSuccess?: IngestionSummary;
    lastError?: IngestionError;
  };
}

export interface IngestionSummary {
  source: string;
  metric: string;
  executedAt: string;
  rowsProcessed: number;
}

export interface IngestionError {
  source: string;
  metric: string;
  executedAt: string;
  errorMessage: string;
}
