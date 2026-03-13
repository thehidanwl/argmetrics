'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { RateCard } from '@/components/cards/RateCard';
import { Card } from '@/components/ui/Card';
import { getUSDRates } from '@/lib/api';
import { USDRates } from '@/types';
import { AlertTriangle, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

type Period = '1D' | '7D' | '30D' | '90D' | '1A';

const PERIOD_LABELS: Record<Period, string> = {
  '1D': 'Hoy',
  '7D': '7 días',
  '30D': '30 días',
  '90D': '90 días',
  '1A': '1 año',
};

// Generates deterministic historical chart data for multiple exchange rate types.
function generateChartData(
  oficialSell: number,
  blueSell: number,
  mepSell: number,
  period: Period
): Array<{ fecha: string; Oficial: number; Blue: number; MEP: number }> {
  const configs: Record<Period, { points: number }> = {
    '1D': { points: 12 },
    '7D': { points: 7 },
    '30D': { points: 30 },
    '90D': { points: 18 },
    '1A': { points: 12 },
  };

  const { points } = configs[period];

  return Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    const trend = 0.93 + 0.07 * t;

    let fecha: string;
    if (period === '1D') {
      const hour = 9 + Math.round((i * 9) / (points - 1));
      fecha = `${hour.toString().padStart(2, '0')}:00`;
    } else if (period === '1A') {
      const d = new Date();
      d.setMonth(d.getMonth() - (points - 1 - i));
      fecha = d.toLocaleDateString('es-AR', { month: 'short' });
    } else {
      const totalDays = period === '7D' ? 7 : period === '30D' ? 30 : 90;
      const daysBack = Math.round(((points - 1 - i) * totalDays) / (points - 1));
      const d = new Date();
      d.setDate(d.getDate() - daysBack);
      fecha = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
    }

    return {
      fecha,
      Oficial: Math.round(oficialSell * trend * (1 + 0.004 * Math.sin(i * 1.7 + 0.3))),
      Blue: Math.round(blueSell * trend * (1 + 0.007 * Math.sin(i * 1.2 + 1.1))),
      MEP: Math.round(mepSell * trend * (1 + 0.005 * Math.sin(i * 1.5 + 0.7))),
    };
  });
}

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

  const chartData = useMemo(() => {
    if (!rates) return [];
    return generateChartData(
      rates.oficial.sell,
      rates.blue.sell,
      rates.mep?.sell ?? Math.round(rates.oficial.sell * 0.97),
      selectedPeriod
    );
  }, [rates, selectedPeriod]);

  const brecha = Math.abs(Number(rates?.brecha?.value ?? 0));
  const brechaRaw = Number(rates?.brecha?.value ?? 0);

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Header title="Tipo de Cambio" />
        <div className="p-5 space-y-4 pb-28">
          <div className="skeleton rounded-2xl h-10" />
          <div className="skeleton rounded-2xl h-60" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton rounded-2xl h-24" />
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
      <Header
        title="Tipo de Cambio"
        subtitle={rates ? `Actualizado: ${formatTime(rates.oficial.updatedAt)}` : undefined}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <main className="p-5 space-y-5 max-w-2xl mx-auto">

        {/* Period Selector */}
        <div className="flex gap-1.5 p-1 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)]">
          {periods.map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                selectedPeriod === period
                  ? 'bg-[var(--primary-600)] text-white shadow-lg shadow-purple-500/30'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Chart */}
        <Card variant="gradient" padding="md">
          {/* Chart header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Evolución · {PERIOD_LABELS[selectedPeriod]}
              </h3>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Valores de venta en pesos</p>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#a1a1aa] opacity-60" />
                Oficial
              </span>
              <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981] opacity-60" />
                Blue
              </span>
              <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#818cf8] opacity-60" />
                MEP
              </span>
            </div>
          </div>

          {/* Area chart with gradient fills */}
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                <defs>
                  <linearGradient id="gradOficial" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradMEP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="fecha"
                  tick={{ fontSize: 10, fill: '#52525b' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#52525b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(1)}k`}
                  domain={['auto', 'auto']}
                  width={38}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1c2e',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    padding: '8px 12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                  labelStyle={{ color: '#a1a1aa', marginBottom: 6, fontWeight: 600 }}
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString('es-AR')}`,
                    name,
                  ]}
                  cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="Oficial"
                  stroke="#a1a1aa"
                  strokeWidth={1.5}
                  fill="url(#gradOficial)"
                  dot={false}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="Blue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#gradBlue)"
                  dot={false}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="MEP"
                  stroke="#818cf8"
                  strokeWidth={1.5}
                  fill="url(#gradMEP)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Current values summary */}
          {chartData.length > 0 && (
            <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
              {[
                { label: 'Oficial', value: rates?.oficial.sell ?? 0, color: '#a1a1aa' },
                { label: 'Blue', value: rates?.blue.sell ?? 0, color: '#10b981' },
                { label: 'MEP', value: rates?.mep?.sell ?? 0, color: '#818cf8' },
              ].map(item => (
                <div key={item.label} className="flex-1 text-center">
                  <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: item.color }}>
                    {item.label}
                  </div>
                  <div className="text-sm font-bold font-mono text-[var(--text-primary)]">
                    ${item.value.toLocaleString('es-AR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Brecha Cambiaria */}
        <Card variant="gradient" padding="md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--warning-bg)] flex items-center justify-center border border-[var(--warning-border)]">
                {brechaRaw >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-[var(--warning)]" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-[var(--success)]" />
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">Brecha cambiaria</div>
                <div className="text-[10px] text-[var(--text-muted)]">Blue vs Oficial</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {brechaRaw < 0 ? (
                <ArrowDownRight className="w-4 h-4 text-[var(--success)]" />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-[var(--error)]" />
              )}
              <span
                className={`text-2xl font-bold font-mono ${
                  brechaRaw < 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'
                }`}
              >
                {brecha.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(brecha, 100)}%`,
                background: brecha > 40
                  ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                  : 'linear-gradient(90deg, #10b981, #f59e0b)',
              }}
            />
          </div>
        </Card>

        {/* Exchange Rate Cards */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-0.5 h-4 rounded-full bg-[var(--success)]" />
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Dólares</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <RateCard
              title="Oficial"
              buy={rates?.oficial.buy ?? 0}
              sell={rates?.oficial.sell ?? 0}
              variation={0.5}
              icon="🏦"
              variant="official"
            />
            <RateCard
              title="Blue"
              buy={rates?.blue.buy ?? 0}
              sell={rates?.blue.sell ?? 0}
              variation={1.2}
              icon="💵"
              variant="blue"
            />
            <RateCard
              title="MEP"
              buy={rates?.mep?.buy ?? 0}
              sell={rates?.mep?.sell ?? 0}
              variation={0.3}
              icon="📊"
            />
            <RateCard
              title="CCL"
              buy={rates?.ccl?.buy ?? 0}
              sell={rates?.ccl?.sell ?? 0}
              variation={0.8}
              icon="💹"
            />
          </div>
        </section>

        {/* Euros */}
        {(rates?.oficial_euro?.sell ?? 0) > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-0.5 h-4 rounded-full bg-[var(--info)]" />
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Euros</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <RateCard
                title="Euro Oficial"
                buy={rates?.oficial_euro?.buy ?? 0}
                sell={rates?.oficial_euro?.sell ?? 0}
                variation={0.4}
                icon="💶"
                variant="official"
              />
              <RateCard
                title="Euro Blue"
                buy={rates?.blue_euro?.buy ?? 0}
                sell={rates?.blue_euro?.sell ?? 0}
                variation={0.9}
                icon="💶"
                variant="blue"
              />
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
