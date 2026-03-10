import { USDRates, MetricsResponse, Metric, HealthStatus, MetricCategory } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://argmetrics.vercel.app/api/v1';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Live Exchange Rates
export async function getUSDRates(): Promise<{ data: USDRates; cached: boolean; expiresAt: string }> {
  return fetchAPI<{ data: USDRates; cached: boolean; expiresAt: string }>('/live/usd');
}

// Health Check
export async function getHealth(): Promise<HealthStatus> {
  return fetchAPI<HealthStatus>('/health');
}

// Metrics
export async function getMetrics(params?: {
  category?: string;
  name?: string;
  from?: string;
  to?: string;
  period?: string;
  limit?: number;
  offset?: number;
}): Promise<MetricsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const queryString = searchParams.toString();
  return fetchAPI<MetricsResponse>(`/metrics${queryString ? `?${queryString}` : ''}`);
}

// Get specific metric by name
export async function getMetricByName(name: string): Promise<{ data: Metric[] }> {
  return fetchAPI<{ data: Metric[] }>(`/metrics/${name}`);
}

// Get categories
export async function getCategories(): Promise<{ data: MetricCategory[] }> {
  return fetchAPI<{ data: MetricCategory[] }>('/metrics/categories');
}

// Get available metrics
export async function getAvailableMetrics(): Promise<{ data: string[] }> {
  return fetchAPI<{ data: string[] }>('/metrics/available');
}
