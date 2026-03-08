export type Category = 'economy' | 'social' | 'consumption';
export type PeriodType = 'daily' | 'monthly' | 'quarterly' | 'annually';

export interface Metric {
  id: string;
  category: Category;
  name: string;
  value: number;
  date: string;
  periodType: PeriodType;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetricDataPoint {
  date: string;
  value: number;
}

export interface MetricSeries {
  name: string;
  category: Category;
  description: string;
  unit: string;
  latest: {
    value: number;
    date: string;
    variation: number;
    variationType: string;
  };
  series: MetricDataPoint[];
}

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

export interface CountryRisk {
  value: number;
  unit: string;
  variation: number;
  variationType: string;
  updatedAt: string;
}

export interface CategoryInfo {
  name: Category;
  description: string;
  metricsCount: number;
}

export interface MetricInfo {
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

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  cached?: boolean;
  expiresAt?: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
