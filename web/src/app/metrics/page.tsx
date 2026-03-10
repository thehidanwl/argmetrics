'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { getMetrics, getCategories } from '@/lib/api';
import { Metric, MetricCategory } from '@/types';
import { AlertTriangle, TrendingUp, TrendingDown, Percent, Building, Globe, Wallet } from 'lucide-react';

type TabCategory = 'all' | 'economy' | 'social' | 'consumption';
type MetricTab = 'Inflación' | 'Tasas' | 'Riesgo' | 'PBI';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [categories, setCategories] = useState<MetricCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TabCategory>('all');
  const [selectedTab, setSelectedTab] = useState<MetricTab>('Inflación');

  const tabs: MetricTab[] = ['Inflación', 'Tasas', 'Riesgo', 'PBI'];

  const fetchData = async () => {
    try {
      setError(null);
      const [metricsRes, categoriesRes] = await Promise.all([
        getMetrics({ limit: 50 }),
        getCategories()
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'economy': return <Wallet className="w-4 h-4" />;
      case 'social': return <Globe className="w-4 h-4" />;
      case 'consumption': return <TrendingDown className="w-4 h-4" />;
      default: return <Percent className="w-4 h-4" />;
    }
  };

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === selectedCategory);

  const formatValue = (value: number, name: string) => {
    if (name.includes('usd') || name.includes('blue') || name.includes('oficial')) {
      return `$${value.toLocaleString('es-AR')}`;
    }
    if (name.includes('inflation') || name.includes('rate') || name.includes('riesgo')) {
      return `${value}%`;
    }
    return value.toLocaleString('es-AR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Header title="Indicadores" />
        <div className="p-4 space-y-4 pb-20">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-[var(--bg-secondary)] rounded-lg h-8 flex-1" />
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-[var(--bg-secondary)] rounded-lg h-24" />
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
          <p className="text-[var(--text-secondary)] mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-[var(--primary-600)] text-white rounded-lg"
          >
            Reintentar
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-20">
      <Header 
        title="Indicadores" 
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <main className="p-6 space-y-6 pb-24">
        {/* Metric Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-2 px-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTab === tab
                  ? 'bg-[var(--primary-600)] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-default)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'economy', 'social', 'consumption'] as TabCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedCategory === cat
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-focus)]'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-default)]'
              }`}
            >
              {getCategoryIcon(cat)}
              {cat === 'all' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Current Value Card - Enhanced */}
        <Card className="text-center py-8 px-6">
          <div className="text-[var(--text-secondary)] text-base mb-2">Valor Actual</div>
          <div className="text-5xl font-bold font-mono text-[var(--text-primary)] mb-3">
            {selectedTab === 'Inflación' ? '4.6%' : selectedTab === 'Riesgo' ? '1,850' : '42.5%'}
          </div>
          <div className="text-[var(--text-secondary)] text-sm mb-4">Enero 2026</div>
          <div className="flex items-center justify-center gap-2 text-[var(--success)] bg-[var(--success-bg)] px-4 py-2 rounded-full w-fit mx-auto">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">+2.1% vs mes anterior</span>
          </div>
        </Card>

        {/* Metrics List - Better spacing */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Métricas Disponibles</h2>
          <div className="space-y-3">
            {filteredMetrics.slice(0, 10).map((metric) => (
              <Card key={metric.id} className="flex justify-between items-center py-4 px-5">
                <div>
                  <div className="font-medium text-[var(--text-primary)] text-base">
                    {metric.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    {metric.source} • {new Date(metric.date).toLocaleDateString('es-AR')}
                  </div>
                </div>
                <div className="text-right pl-4">
                  <div className="font-mono font-bold text-lg text-[var(--text-primary)]">
                    {formatValue(metric.value, metric.name)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Sources */}
        <div className="text-center text-xs text-[var(--text-muted)] py-4">
          Fuentes: INDEC, BCRA, Ámbito Financiero
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
