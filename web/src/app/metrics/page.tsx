'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { getMetrics, getCategories } from '@/lib/api';
import { Metric, MetricCategory } from '@/types';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Percent,
  DollarSign,
  BarChart3,
  ShoppingCart,
  Users,
} from 'lucide-react';

type TabCategory = 'all' | 'economy' | 'social' | 'consumption';

const CATEGORY_LABELS: Record<TabCategory, string> = {
  all: 'Todos',
  economy: 'Economía',
  social: 'Social',
  consumption: 'Consumo',
};

function getMetricMeta(name: string): { icon: React.ReactNode; color: string; label: string } {
  if (name.includes('inflation')) {
    return { icon: <Percent className="w-4 h-4" />, color: '#f59e0b', label: 'Inflación (IPC)' };
  }
  if (name.includes('usd') || name.includes('oficial') || name.includes('blue') || name.includes('ccl') || name.includes('mep')) {
    return { icon: <DollarSign className="w-4 h-4" />, color: '#10b981', label: 'Tipo de cambio' };
  }
  if (name.includes('country_risk')) {
    return { icon: <AlertTriangle className="w-4 h-4" />, color: '#ef4444', label: 'Riesgo País' };
  }
  if (name.includes('interest_rate')) {
    return { icon: <Percent className="w-4 h-4" />, color: '#818cf8', label: 'Tasa BCRA' };
  }
  if (name.includes('reserves')) {
    return { icon: <BarChart3 className="w-4 h-4" />, color: '#3b82f6', label: 'Reservas BCRA' };
  }
  if (name.includes('gdp')) {
    return { icon: <TrendingUp className="w-4 h-4" />, color: '#6366f1', label: 'PBI' };
  }
  if (name.includes('poverty') || name.includes('pobreza')) {
    return { icon: <Users className="w-4 h-4" />, color: '#ef4444', label: 'Pobreza' };
  }
  if (name.includes('unemployment') || name.includes('desempleo')) {
    return { icon: <Users className="w-4 h-4" />, color: '#f59e0b', label: 'Desempleo' };
  }
  if (name.includes('retail') || name.includes('ventas')) {
    return { icon: <ShoppingCart className="w-4 h-4" />, color: '#10b981', label: 'Ventas' };
  }
  return { icon: <BarChart3 className="w-4 h-4" />, color: '#a1a1aa', label: name };
}

function formatMetricValue(value: number, name: string): string {
  if (name.includes('usd') || name.includes('oficial') || name.includes('blue') || name.includes('ccl') || name.includes('mep')) {
    return `$${value.toLocaleString('es-AR')}`;
  }
  if (name.includes('reserves')) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (name.includes('gdp') || name.includes('inflation') || name.includes('poverty') ||
      name.includes('unemployment') || name.includes('interest') || name.includes('retail')) {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }
  if (name.includes('country_risk')) {
    return value.toLocaleString('es-AR');
  }
  return value.toLocaleString('es-AR');
}

function formatPeriod(periodType: string): string {
  const labels: Record<string, string> = {
    daily: 'Diario',
    monthly: 'Mensual',
    quarterly: 'Trimestral',
    annually: 'Anual',
  };
  return labels[periodType] ?? periodType;
}

// Returns semantic color for a metric value (danger/warning/ok)
function getValueSeverity(value: number, name: string): 'red' | 'yellow' | 'green' | 'neutral' {
  if (name.includes('country_risk')) {
    return value > 1500 ? 'red' : value > 800 ? 'yellow' : 'green';
  }
  if (name.includes('inflation')) {
    return value > 5 ? 'red' : value > 3 ? 'yellow' : 'green';
  }
  if (name.includes('poverty')) {
    return value > 35 ? 'red' : value > 25 ? 'yellow' : 'green';
  }
  if (name.includes('unemployment')) {
    return value > 10 ? 'red' : value > 7 ? 'yellow' : 'green';
  }
  return 'neutral';
}

const severityStyles = {
  red: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', text: '#ef4444' },
  yellow: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#f59e0b' },
  green: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', text: '#10b981' },
  neutral: { bg: 'rgba(99,102,241,0.10)', border: 'rgba(99,102,241,0.20)', text: '#818cf8' },
};

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [categories, setCategories] = useState<MetricCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TabCategory>('all');

  const fetchData = async () => {
    try {
      setError(null);
      const [metricsRes, categoriesRes] = await Promise.all([
        getMetrics({ limit: 50 }),
        getCategories(),
      ]);
      setMetrics(metricsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredMetrics =
    selectedCategory === 'all' ? metrics : metrics.filter(m => m.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Header title="Indicadores" />
        <div className="p-5 space-y-4 pb-28">
          <div className="flex gap-1.5 p-1 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)]">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton rounded-xl h-9 flex-1" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton rounded-2xl h-20" />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Header title="Indicadores" onRefresh={handleRefresh} isRefreshing={refreshing} />
        <div className="p-4 flex flex-col items-center justify-center h-[60vh]">
          <AlertTriangle className="w-12 h-12 text-[var(--error)] mb-4" />
          <p className="text-[var(--text-secondary)] text-sm mb-4 text-center">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-[var(--primary-600)] text-white rounded-xl text-sm font-medium"
          >
            Reintentar
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-28">
      <Header title="Indicadores" onRefresh={handleRefresh} isRefreshing={refreshing} />

      <main className="p-5 space-y-5 max-w-2xl mx-auto">

        {/* Category Filter - pill tabs style */}
        <div className="flex gap-1.5 p-1 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)]">
          {(['all', 'economy', 'social', 'consumption'] as TabCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-[var(--primary-600)] text-white shadow-lg shadow-purple-500/30'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Summary stats */}
        {categories.length > 0 && (
          <div className="flex gap-3">
            {categories
              .filter(c => selectedCategory === 'all' || c.name === selectedCategory)
              .map(cat => (
                <Card key={cat.name} variant="gradient" padding="sm" className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-[var(--text-primary)]">
                    {cat.metricsCount}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {CATEGORY_LABELS[cat.name as TabCategory] ?? cat.name}
                  </div>
                </Card>
              ))}
          </div>
        )}

        {/* Metrics List */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-0.5 h-4 rounded-full bg-[var(--primary-500)]" />
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {filteredMetrics.length} métricas
            </h2>
          </div>

          <div className="space-y-2">
            {filteredMetrics.length === 0 ? (
              <Card padding="lg" className="text-center">
                <BarChart3 className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-sm text-[var(--text-muted)]">No hay métricas disponibles</p>
              </Card>
            ) : (
              filteredMetrics.map(metric => {
                const meta = getMetricMeta(metric.name);
                const value = formatMetricValue(metric.value, metric.name);
                const severity = getValueSeverity(metric.value, metric.name);
                const sev = severityStyles[severity];
                const showTrend = metric.name.includes('gdp') || metric.name.includes('retail');
                const isPositive = metric.value >= 0;

                return (
                  <Card
                    key={metric.id ?? metric.name}
                    variant="gradient"
                    padding="md"
                    className="flex items-center gap-4 group hover:border-[var(--primary-500)]/20 transition-colors"
                  >
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors"
                      style={{
                        backgroundColor: `${meta.color}12`,
                        borderColor: `${meta.color}25`,
                        color: meta.color,
                      }}
                    >
                      {meta.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {meta.label}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                          style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}
                        >
                          {metric.source}
                        </span>
                        <span className="text-[9px] text-[var(--text-muted)]">·</span>
                        <span className="text-[9px] text-[var(--text-muted)]">
                          {formatPeriod(metric.periodType)}
                        </span>
                        <span className="text-[9px] text-[var(--text-muted)]">·</span>
                        <span className="text-[9px] text-[var(--text-muted)]">
                          {new Date(metric.date).toLocaleDateString('es-AR', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Value with severity badge */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {showTrend && (
                        isPositive
                          ? <TrendingUp className="w-3.5 h-3.5 text-[var(--success)]" />
                          : <TrendingDown className="w-3.5 h-3.5 text-[var(--error)]" />
                      )}
                      <div
                        className="px-2.5 py-1.5 rounded-xl border"
                        style={{
                          backgroundColor: sev.bg,
                          borderColor: sev.border,
                        }}
                      >
                        <span
                          className="text-sm font-bold font-mono"
                          style={{ color: severity === 'neutral' ? meta.color : sev.text }}
                        >
                          {value}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </section>

        <div className="text-center text-[10px] text-[var(--text-muted)] py-2">
          Fuentes: INDEC · BCRA · JPMorgan
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
