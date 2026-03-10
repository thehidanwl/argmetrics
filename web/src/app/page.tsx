'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { KPICard } from '@/components/cards/KPICard';
import { RateCard } from '@/components/cards/RateCard';
import { Sparkline } from '@/components/charts/Sparkline';
import { getUSDRates, getHealth } from '@/lib/api';
import { USDRates, HealthStatus } from '@/types';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [rates, setRates] = useState<USDRates | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const [ratesRes, healthRes] = await Promise.all([
        getUSDRates(),
        getHealth()
      ]);
      setRates(ratesRes.data);
      setHealth(healthRes);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Header title="ArgMetrics" />
        <div className="p-4 space-y-4 pb-20">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-[var(--bg-secondary)] rounded-lg h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Header title="ArgMetrics" onRefresh={handleRefresh} isRefreshing={refreshing} />
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
        title="ArgMetrics" 
        subtitle={health ? `Actualizado: ${new Date(health.timestamp).toLocaleTimeString('es-AR')}` : undefined}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <main className="p-4 space-y-6">
        {/* USD Summary Card */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-default)]">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-secondary)] mb-3">
            Resumen USD
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-[var(--text-muted)] mb-1">Oficial</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-mono font-bold">
                  ${rates?.oficial.sell.toLocaleString('es-AR')}
                </span>
                <Sparkline data={[1350, 1380, 1400, 1420, 1441]} color="#8B949E" width={60} height={20} />
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-muted)] mb-1">Blue</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-mono font-bold text-[var(--success)]">
                  ${rates?.blue.sell.toLocaleString('es-AR')}
                </span>
                <Sparkline data={[1350, 1380, 1400, 1410, 1425]} color="#22C55E" width={60} height={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <KPICard
            title="Riesgo País"
            value="1,850"
            trend={{ direction: 'down', value: '-15', label: 'puntos' }}
            variant="error"
          />
          <KPICard
            title="Inflación"
            value="4.6%"
            trend={{ direction: 'up', value: '+2.1%', label: 'vs mes ant.' }}
            variant="warning"
          />
          <KPICard
            title="Brecha"
            value={`${rates?.brecha.value?.toFixed(1) || 0}%`}
            variant="default"
          />
        </div>

        {/* Exchange Rates */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Tipos de Cambio
          </h2>
          <div className="space-y-3">
            <RateCard
              title="Dólar Oficial"
              buy={rates?.oficial.buy || 0}
              sell={rates?.oficial.sell || 0}
              variation={2.3}
              icon="💵"
            />
            <RateCard
              title="Dólar Blue"
              buy={rates?.blue.buy || 0}
              sell={rates?.blue.sell || 0}
              variation={1.5}
              icon="💵"
            />
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Categorías</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-default)]">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-[var(--primary-500)]" />
                <span className="font-medium">Economía</span>
              </div>
              <div className="text-sm text-[var(--text-secondary)]">12 indicadores</div>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-default)]">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-[var(--success)]" />
                <span className="font-medium">Social</span>
              </div>
              <div className="text-sm text-[var(--text-secondary)]">5 indicadores</div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

import { DollarSign } from 'lucide-react';
