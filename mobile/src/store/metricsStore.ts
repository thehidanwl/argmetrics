import { create } from 'zustand';
import {
  Metric,
  MetricSeries,
  USDExchangeRates,
  CountryRisk,
  CategoryInfo,
} from '../types';
import { metricsApi, liveApi } from '../api/metrics';

interface MetricsState {
  // Metrics data
  metrics: Metric[];
  selectedMetric: MetricSeries | null;
  categories: CategoryInfo[];
  
  // Live data
  usdRates: USDExchangeRates | null;
  countryRisk: CountryRisk | null;
  
  // Loading states
  isLoadingMetrics: boolean;
  isLoadingLive: boolean;
  isLoadingCategories: boolean;
  
  // Error state
  error: string | null;
  
  // Filters
  dateRange: {
    from: string;
    to: string;
  };
  selectedPeriod: string;
  selectedCategory: string | null;
  
  // Actions
  fetchMetrics: (params?: Record<string, unknown>) => Promise<void>;
  fetchMetricByName: (name: string, params?: Record<string, unknown>) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchUSDRates: () => Promise<void>;
  fetchCountryRisk: () => Promise<void>;
  setDateRange: (from: string, to: string) => void;
  setSelectedPeriod: (period: string) => void;
  setSelectedCategory: (category: string | null) => void;
  clearError: () => void;
}

export const useMetricsStore = create<MetricsState>((set, get) => ({
  // Initial state
  metrics: [],
  selectedMetric: null,
  categories: [],
  usdRates: null,
  countryRisk: null,
  isLoadingMetrics: false,
  isLoadingLive: false,
  isLoadingCategories: false,
  error: null,
  dateRange: {
    from: '2020-01-01',
    to: new Date().toISOString().split('T')[0],
  },
  selectedPeriod: 'monthly',
  selectedCategory: null,

  // Actions
  fetchMetrics: async (params) => {
    set({ isLoadingMetrics: true, error: null });
    try {
      const { dateRange, selectedPeriod, selectedCategory } = get();
      const response = await metricsApi.getMetrics({
        from: dateRange.from,
        to: dateRange.to,
        period: selectedPeriod,
        category: selectedCategory || undefined,
        ...params,
      });
      set({ metrics: response.data, isLoadingMetrics: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error fetching metrics',
        isLoadingMetrics: false,
      });
    }
  },

  fetchMetricByName: async (name, params) => {
    set({ isLoadingMetrics: true, error: null });
    try {
      const { dateRange, selectedPeriod } = get();
      const response = await metricsApi.getMetricByName(name, {
        from: dateRange.from,
        to: dateRange.to,
        period: selectedPeriod,
        ...params,
      });
      set({ selectedMetric: response.data, isLoadingMetrics: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error fetching metric',
        isLoadingMetrics: false,
      });
    }
  },

  fetchCategories: async () => {
    set({ isLoadingCategories: true, error: null });
    try {
      const response = await metricsApi.getCategories();
      set({ categories: response.data, isLoadingCategories: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error fetching categories',
        isLoadingCategories: false,
      });
    }
  },

  fetchUSDRates: async () => {
    set({ isLoadingLive: true, error: null });
    try {
      const response = await liveApi.getUSDRates();
      set({ usdRates: response.data, isLoadingLive: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error fetching USD rates',
        isLoadingLive: false,
      });
    }
  },

  fetchCountryRisk: async () => {
    set({ isLoadingLive: true, error: null });
    try {
      const response = await liveApi.getCountryRisk();
      set({ countryRisk: response.data, isLoadingLive: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error fetching country risk',
        isLoadingLive: false,
      });
    }
  },

  setDateRange: (from, to) => {
    set({ dateRange: { from, to } });
  },

  setSelectedPeriod: (period) => {
    set({ selectedPeriod: period });
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },

  clearError: () => {
    set({ error: null });
  },
}));
