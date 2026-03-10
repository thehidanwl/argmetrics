'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { RateCard } from '@/components/cards/RateCard';
import { getUSDRates } from '@/lib/api';
import { USDRates } from '@/types';
import { AlertTriangle, TrendingUp } from 'lucide-react';

type Period = '1D' | '7D' | '30D' | '90D' | '1A';

export default function ExchangePage() {
  const [rates, setRates] = useState<USDRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30D');

  const periods: Period[] = ['1D', '7D', '30D', '90D', '1A'];

  const fetchData = async () => {
    try {
      setError(null);
      const ratesRes = await getUSDRates();
      setRates(ratesRes.data);
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

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Header title="Tipo de Cambio" />
        <div className="p-4 space-y-4 pb-20">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-[var(--bg-secondary)] rounded-lg h-32" />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Header title="Tipo de Cambio" onRefresh={handleRefresh} isRefreshing={refreshing} />
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
        title="Tipo de Cambio" 
        subtitle={`Actualizado: ${rates ? formatTime(rates.oficial.updatedAt) : '--'}`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <main className="p-4 space-y-6">
        {/* Period Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedPeriod === period
                  ? 'bg-[var(--primary-600)] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-default)]'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Main Chart Placeholder */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-default)]">
          <h3 className="text-sm uppercase tracking-wide text-[var(--text-secondary)] mb-4">
            30 Días
          </h3>
          <div className="h-40 flex items-center justify-center">
            <div className="text-center text-[var(--text-muted)]">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Gráfico de tendencia</p>
              <p className="text-xs">Período: {selectedPeriod}</p>
            </div>
          </div>
        </div>

        {/* Exchange Rates Cards */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Dólares</h2>
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
            <RateCard
              title="Dólar MEP"
              buy={1400}
              sell={1420}
              variation={0.8}
              icon="📊"
            />
            <RateCard
              title="Dólar CCL"
              buy={1380}
              sell={1410}
              variation={-0.3}
              icon="📈"
            />
          </div>
        </section>

        {/* Brecha Cambiaria */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Brecha Cambiaria</h2>
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-default)] text-center">
            <div className="text-[var(--warning)] text-5xl font-bold font-mono mb-2">
              {rates?.brecha.value?.toFixed(1) || 0}%
            </div>
            <div className="text-[var(--text-secondary)]">
              Diferencia Oficial vs Blue
            </div>
          </div>
        </section>

        {/* Euros */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Euros</h2>
          <div className="space-y-3">
            <RateCard
              title="Euro Oficial"
              buy={rates?.oficial_euro.buy || 0}
              sell={rates?.oficial_euro.sell || 0}
              variation={1.8}
              icon="💶"
            />
            <RateCard
              title="Euro Blue"
              buy={rates?.blue_euro.buy || 0}
              sell={rates?.blue_euro.sell || 0}
              variation={1.2}
              icon="💶"
            />
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
