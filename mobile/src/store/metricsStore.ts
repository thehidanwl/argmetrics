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
  fetchUSDRates: (silent?: boolean) => Promise<void>;
  fetchCountryRisk: (silent?: boolean) => Promise<void>;
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
      // If no data, use fallback categories
      set({ 
        categories: [
          { name: 'economy', description: 'Economic indicators', metricsCount: 12 },
          { name: 'social', description: 'Social indicators', metricsCount: 5 },
          { name: 'consumption', description: 'Consumption indicators', metricsCount: 4 },
        ], 
        isLoadingCategories: false 
      });
    }
  },

  fetchUSDRates: async (silent = false) => {
    if (!silent) set({ isLoadingLive: true, error: null });
    try {
      const response = await liveApi.getUSDRates();
      set({ usdRates: response.data, isLoadingLive: false });
    } catch (error) {
      if (!get().usdRates) {
        // Only set fallback if we have no data at all
        set({
          usdRates: {
            official: { buy: 820, sell: 860, updatedAt: new Date().toISOString() },
            blue: { buy: 1000, sell: 1020, updatedAt: new Date().toISOString() },
            mep: { buy: 980, sell: 995, updatedAt: new Date().toISOString() },
            ccl: { buy: 1005, sell: 1020, updatedAt: new Date().toISOString() },
            brecha: { value: 18.6, unit: 'percentage' },
          },
          isLoadingLive: false,
        });
      } else {
        set({ isLoadingLive: false });
      }
    }
  },

  fetchCountryRisk: async (silent = false) => {
    if (!silent) set({ isLoadingLive: true, error: null });
    try {
      const response = await liveApi.getCountryRisk();
      set({ countryRisk: response.data, isLoadingLive: false });
    } catch (error) {
      if (!get().countryRisk) {
        set({
          countryRisk: {
            value: 1850,
            unit: 'basis_points',
            variation: -15,
            variationType: 'daily',
            updatedAt: new Date().toISOString(),
          },
          isLoadingLive: false,
        });
      } else {
        set({ isLoadingLive: false });
      }
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
