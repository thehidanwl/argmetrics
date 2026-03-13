'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
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
// Uses sine wave oscillations + linear trend to simulate realistic price movement.
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
          <div className="skeleton rounded-2xl h-52" />
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
        <div className="flex gap-2">
          {periods.map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                selectedPeriod === period
                  ? 'bg-[var(--primary-600)] text-white shadow-lg shadow-purple-500/20'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:border-[var(--primary-500)]/40 hover:text-[var(--text-primary)]'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Chart */}
        <Card variant="gradient" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {PERIOD_LABELS[selectedPeriod]}
            </h3>
            <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-[#a1a1aa] inline-block rounded-full" />
                Oficial
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-[#10b981] inline-block rounded-full" />
                Blue
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-[#818cf8] inline-block rounded-full" />
                MEP
              </span>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
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
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  labelStyle={{ color: 'var(--text-secondary)', marginBottom: 4 }}
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString('es-AR')}`,
                    name,
                  ]}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="Oficial"
                  stroke="#a1a1aa"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="Blue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="MEP"
                  stroke="#818cf8"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Exchange Rate Cards */}
        <section>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Dólares</h2>
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

        {/* Brecha Cambiaria */}
        <Card variant="gradient" padding="md" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--warning-bg)] flex items-center justify-center border border-[var(--warning-border)]">
              {brechaRaw >= 0 ? (
                <TrendingUp className="w-4 h-4 text-[var(--warning)]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[var(--success)]" />
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--text-primary)]">Brecha cambiaria</div>
              <div className="text-[10px] text-[var(--text-muted)]">Oficial vs Blue</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
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
        </Card>

        {/* Euros */}
        {(rates?.oficial_euro?.sell ?? 0) > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Euros</h2>
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
