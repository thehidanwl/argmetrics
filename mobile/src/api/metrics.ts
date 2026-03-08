import { apiClient } from './client';
import {
  Metric,
  MetricSeries,
  USDExchangeRates,
  CountryRisk,
  CategoryInfo,
  MetricInfo,
  ApiResponse,
} from '../types';

export interface MetricsParams {
  category?: string;
  name?: string;
  from?: string;
  to?: string;
  period?: string;
  limit?: number;
  offset?: number;
}

export const metricsApi = {
  // Get metrics with filters
  getMetrics: async (params?: MetricsParams): Promise<ApiResponse<Metric[]>> => {
    return apiClient.get<Metric[]>('/metrics', params);
  },

  // Get specific metric by name
  getMetricByName: async (
    name: string,
    params?: Omit<MetricsParams, 'name'>
  ): Promise<ApiResponse<MetricSeries>> => {
    return apiClient.get<MetricSeries>(`/metrics/${name}`, params);
  },

  // Get available categories
  getCategories: async (): Promise<ApiResponse<CategoryInfo[]>> => {
    return apiClient.get<CategoryInfo[]>('/metrics/categories');
  },

  // Get all available metrics
  getAvailableMetrics: async (): Promise<ApiResponse<MetricInfo[]>> => {
    return apiClient.get<MetricInfo[]>('/metrics/available');
  },
};

export const liveApi = {
  // Get live USD rates
  getUSDRates: async (): Promise<ApiResponse<USDExchangeRates>> => {
    return apiClient.get<USDExchangeRates>('/live/usd');
  },

  // Get country risk
  getCountryRisk: async (): Promise<ApiResponse<CountryRisk>> => {
    return apiClient.get<CountryRisk>('/live/country-risk');
  },
};

export const healthApi = {
  getHealth: async (): Promise<ApiResponse<unknown>> => {
    return apiClient.get<unknown>('/health');
  },
};
