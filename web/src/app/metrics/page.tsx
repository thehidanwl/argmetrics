'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { getMetrics, getCategories } from '@/lib/api';
import { Metric, MetricCategory } from '@/types';
import {
  AlertTriangle, TrendingUp, TrendingDown, Percent,
  DollarSign, BarChart3, ShoppingCart, Users,
} from 'lucide-react';

type TabCategory = 'all' | 'economy' | 'social' | 'consumption';
const CATEGORY_LABELS: Record<TabCategory, string> = { all: 'Todos', economy: 'Economía', social: 'Social', consumption: 'Consumo' };

function getMetricMeta(name: string) {
  if (name.includes('inflation'))    return { icon: <Percent size={16} />,     color: '#f59e0b', label: 'Inflación IPC' };
  if (name.includes('usd') || name.includes('oficial') || name.includes('blue') || name.includes('ccl') || name.includes('mep'))
    return { icon: <DollarSign size={16} />, color: '#10b981', label: 'Tipo de cambio' };
  if (name.includes('country_risk')) return { icon: <AlertTriangle size={16} />, color: '#ef4444', label: 'Riesgo País' };
  if (name.includes('interest_rate')) return { icon: <Percent size={16} />,    color: '#818cf8', label: 'Tasa BCRA' };
  if (name.includes('reserves'))     return { icon: <BarChart3 size={16} />,   color: '#3b82f6', label: 'Reservas BCRA' };
  if (name.includes('gdp'))          return { icon: <TrendingUp size={16} />,  color: '#6366f1', label: 'PBI' };
  if (name.includes('poverty') || name.includes('pobreza'))
    return { icon: <Users size={16} />, color: '#ef4444', label: 'Pobreza' };
  if (name.includes('unemployment') || name.includes('desempleo'))
    return { icon: <Users size={16} />, color: '#f59e0b', label: 'Desempleo' };
  if (name.includes('retail') || name.includes('ventas'))
    return { icon: <ShoppingCart size={16} />, color: '#10b981', label: 'Ventas' };
  return { icon: <BarChart3 size={16} />, color: '#a1a1aa', label: name };
}

function formatValue(value: number, name: string): string {
  if (name.includes('usd') || name.includes('oficial') || name.includes('blue') || name.includes('ccl') || name.includes('mep'))
    return `$${value.toLocaleString('es-AR')}`;
  if (name.includes('reserves'))
    return `$${(value / 1_000_000).toFixed(1)}M`;
  if (['gdp','inflation','poverty','unemployment','interest','retail'].some(k => name.includes(k)))
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  if (name.includes('country_risk'))
    return value.toLocaleString('es-AR');
  return value.toLocaleString('es-AR');
}

function getSeverity(value: number, name: string): { bg: string; border: string; text: string } {
  let level: 'red' | 'yellow' | 'green' | 'neutral' = 'neutral';
  if (name.includes('country_risk'))  level = value > 1500 ? 'red' : value > 800 ? 'yellow' : 'green';
  else if (name.includes('inflation'))level = value > 5 ? 'red' : value > 3 ? 'yellow' : 'green';
  else if (name.includes('poverty'))  level = value > 35 ? 'red' : value > 25 ? 'yellow' : 'green';
  else if (name.includes('unemployment')) level = value > 10 ? 'red' : value > 7 ? 'yellow' : 'green';
  const MAP = {
    red:     { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   text: '#ef4444' },
    yellow:  { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  text: '#f59e0b' },
    green:   { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  text: '#10b981' },
    neutral: { bg: 'rgba(99,102,241,0.10)',  border: 'rgba(99,102,241,0.2)', text: '#818cf8' },
  };
  return MAP[level];
}

function formatPeriod(p: string): string {
  return ({ daily: 'Diario', monthly: 'Mensual', quarterly: 'Trimestral', annually: 'Anual' } as Record<string, string>)[p] ?? p;
}

const sectionLabel: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: 2, color: '#71717a', marginBottom: 12,
};

export default function MetricsPage() {
  const [metrics, setMetrics]       = useState<Metric[]>([]);
  const [categories, setCategories] = useState<MetricCategory[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TabCategory>('all');

  const fetchData = async () => {
    try {
      setError(null);
      const [m, c] = await Promise.all([getMetrics({ limit: 50 }), getCategories()]);
      setMetrics(m.data);
      setCategories(c.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => { fetchData(); }, []);
  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const filtered = selectedCategory === 'all' ? metrics : metrics.filter(m => m.category === selectedCategory);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header title="Indicadores" />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: 16 }}>
          <div className="skeleton" style={{ height: 46, borderRadius: 12, marginBottom: 14 }} />
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 68, borderRadius: 14, marginBottom: 10 }} />)}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header title="Indicadores" onRefresh={handleRefresh} isRefreshing={refreshing} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
          <AlertTriangle size={40} color="var(--error)" />
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>{error}</p>
          <button onClick={handleRefresh} style={{ padding: '8px 20px', background: 'var(--primary-600)', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Reintentar
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 96 }}>
      <Header title="Indicadores" onRefresh={handleRefresh} isRefreshing={refreshing} />

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '16px 16px 0' }}>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', borderRadius: 14, padding: 4, border: '1px solid rgba(255,255,255,0.07)', marginBottom: 14 }}>
          {(['all', 'economy', 'social', 'consumption'] as TabCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                background: selectedCategory === cat ? 'var(--primary-600)' : 'transparent',
                color: selectedCategory === cat ? 'white' : '#71717a',
                boxShadow: selectedCategory === cat ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Category count row */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {categories
              .filter(c => selectedCategory === 'all' || c.name === selectedCategory)
              .map(cat => (
                <div key={cat.name} style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>{cat.metricsCount}</div>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: '#71717a', marginTop: 2 }}>
                    {CATEGORY_LABELS[cat.name as TabCategory] ?? cat.name}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Section label */}
        <div style={sectionLabel}>
          <div style={{ width: 3, height: 14, background: 'var(--primary-500)', borderRadius: 99 }} />
          {filtered.length} métricas
        </div>

        {/* Metrics list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {filtered.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
              <BarChart3 size={32} color="#71717a" style={{ marginBottom: 12 }} />
              <p style={{ color: '#71717a', fontSize: 13 }}>No hay métricas disponibles</p>
            </div>
          ) : filtered.map(metric => {
            const meta = getMetricMeta(metric.name);
            const val  = formatValue(metric.value, metric.name);
            const sev  = getSeverity(metric.value, metric.name);
            const showTrend = metric.name.includes('gdp') || metric.name.includes('retail');

            return (
              <div key={metric.id ?? metric.name} style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Icon */}
                <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${meta.color}12`, border: `1px solid ${meta.color}25`, color: meta.color }}>
                  {meta.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {meta.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#71717a', flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 5, fontWeight: 600 }}>{metric.source}</span>
                    <span>·</span>
                    <span>{formatPeriod(metric.periodType)}</span>
                    <span>·</span>
                    <span>{new Date(metric.date).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Value badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {showTrend && (metric.value >= 0
                    ? <TrendingUp size={14} color="var(--success)" />
                    : <TrendingDown size={14} color="var(--error)" />
                  )}
                  <div style={{ padding: '6px 10px', borderRadius: 10, background: sev.bg, border: `1px solid ${sev.border}` }}>
                    <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: sev.text }}>{val}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', fontSize: 10, color: '#52525b', paddingBottom: 8 }}>
          Fuentes: INDEC · BCRA · JPMorgan
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
