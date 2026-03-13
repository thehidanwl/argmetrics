'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { KPICard } from '@/components/cards/KPICard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sparkline } from '@/components/charts/Sparkline';
import { getUSDRates, getMetrics } from '@/lib/api';
import { USDRates, Metric } from '@/types';
import {
  TrendingUp,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  AlertOctagon,
  Zap,
  Globe,
  BarChart3,
} from 'lucide-react';

// Generates a deterministic sparkline based on a reference value.
// Uses a sine wave + linear trend to simulate realistic price movement.
function generateSparkline(baseValue: number, points = 7): number[] {
  return Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    const trend = 0.96 + 0.04 * t;
    const wave = 0.005 * Math.sin(i * 1.7 + baseValue % 3);
    return Math.round(baseValue * trend * (1 + wave));
  });
}

interface RateGridCardProps {
  title: string;
  value: number;
  sparkline: number[];
  color: string;
  icon: string;
}

function RateGridCard({ title, value, sparkline, color, icon }: RateGridCardProps) {
  return (
    <Card variant="gradient" padding="md" className="relative overflow-hidden group">
      <div
        className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-20 transition-opacity duration-300 group-hover:opacity-35"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
      />
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color }}>
          {title}
        </span>
        <span className="text-xs">{icon}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-lg font-bold font-mono tracking-tight" style={{ color }}>
            ${value.toLocaleString('es-AR')}
          </div>
          <div className="text-[9px] text-[var(--text-muted)] mt-0.5">Venta</div>
        </div>
        <Sparkline data={sparkline} color={color} width={52} height={26} />
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const [rates, setRates] = useState<USDRates | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const [ratesRes, metricsRes] = await Promise.all([
        getUSDRates(),
        getMetrics({ limit: 20 }),
      ]);
      setRates(ratesRes.data);
      setMetrics(metricsRes.data);
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

  const inflation = metrics.find(m => m.name === 'inflation');
  const countryRisk = metrics.find(m => m.name === 'country_risk');

  const brecha = Math.abs(Number(rates?.brecha?.value ?? 0));
  const brechaRaw = Number(rates?.brecha?.value ?? 0);
  const brechaDirection = brechaRaw >= 0 ? 'up' : 'down';

  const oficialSparkline = useMemo(
    () => generateSparkline(rates?.oficial.sell ?? 1441),
    [rates?.oficial.sell]
  );
  const blueSparkline = useMemo(
    () => generateSparkline(rates?.blue.sell ?? 1425),
    [rates?.blue.sell]
  );
  const mepSparkline = useMemo(
    () => generateSparkline(rates?.mep?.sell ?? 1395),
    [rates?.mep?.sell]
  );
  const cclSparkline = useMemo(
    () => generateSparkline(rates?.ccl?.sell ?? 1412),
    [rates?.ccl?.sell]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Header title="ArgMetrics" />
        <div className="p-5 space-y-4 pb-28 max-w-2xl mx-auto">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map(i => (
              <div key={i} className="skeleton rounded-2xl h-24 border border-[var(--border-subtle)]" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton rounded-2xl h-28 border border-[var(--border-subtle)]" />
            ))}
          </div>
          <div className="skeleton rounded-2xl h-16 border border-[var(--border-subtle)]" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Header title="ArgMetrics" />
        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="text-center p-8 max-w-sm w-full">
            <div className="w-16 h-16 rounded-2xl bg-[var(--error-bg)] flex items-center justify-center mx-auto mb-4 border border-[var(--error-border)]">
              <AlertOctagon className="w-8 h-8 text-[var(--error)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Algo salió mal</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">{error}</p>
            <Button onClick={handleRefresh} loading={refreshing} fullWidth>
              Reintentar
            </Button>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-28">
      <Header
        title="ArgMetrics"
        subtitle={
          rates
            ? `Actualizado ${new Date(rates.oficial.updatedAt).toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
              })}`
            : undefined
        }
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <main className="p-5 space-y-4 max-w-2xl mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <KPICard
            title="Riesgo País"
            value={countryRisk ? countryRisk.value.toLocaleString('es-AR') : '1,785'}
            trend={{ direction: 'down', value: '−2.5%', label: 'hoy' }}
            variant="error"
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
          />
          <KPICard
            title="Inflación"
            value={inflation ? `${inflation.value}%` : '4.2%'}
            trend={{ direction: 'neutral', value: 'mensual', label: '' }}
            variant="warning"
            icon={<Activity className="w-3.5 h-3.5" />}
          />
        </div>

        {/* USD Rate Grid */}
        <div className="grid grid-cols-2 gap-3">
          <RateGridCard
            title="Oficial"
            value={rates?.oficial.sell ?? 1441}
            sparkline={oficialSparkline}
            color="#a1a1aa"
            icon="🏦"
          />
          <RateGridCard
            title="Blue"
            value={rates?.blue.sell ?? 1425}
            sparkline={blueSparkline}
            color="#10b981"
            icon="💵"
          />
          <RateGridCard
            title="MEP"
            value={rates?.mep?.sell ?? 1395}
            sparkline={mepSparkline}
            color="#818cf8"
            icon="📊"
          />
          <RateGridCard
            title="CCL"
            value={rates?.ccl?.sell ?? 1412}
            sparkline={cclSparkline}
            color="#f59e0b"
            icon="💹"
          />
        </div>

        {/* Brecha */}
        <Card variant="gradient" padding="md" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--warning-bg)] flex items-center justify-center border border-[var(--warning-border)]">
              <TrendingUp className="w-4 h-4 text-[var(--warning)]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--text-primary)]">Brecha cambiaria</div>
              <div className="text-[10px] text-[var(--text-muted)]">Oficial vs Blue</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {brechaDirection === 'down' ? (
              <ArrowDownRight className="w-4 h-4 text-[var(--success)]" />
            ) : (
              <ArrowUpRight className="w-4 h-4 text-[var(--error)]" />
            )}
            <span
              className={`text-xl font-bold font-mono ${
                brechaDirection === 'down' ? 'text-[var(--success)]' : 'text-[var(--error)]'
              }`}
            >
              {brecha.toFixed(1)}%
            </span>
          </div>
        </Card>

        {/* Explore */}
        <section>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Explorar</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card variant="outlined" padding="sm" hover className="group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-500)]/10 flex items-center justify-center border border-[var(--primary-500)]/20 group-hover:border-[var(--primary-500)]/40 transition-colors">
                  <BarChart3 className="w-5 h-5 text-[var(--primary-400)]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Economía</div>
                  <div className="text-[10px] text-[var(--text-muted)]">9 indicadores</div>
                </div>
              </div>
            </Card>
            <Card variant="outlined" padding="sm" hover className="group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--success-bg)] flex items-center justify-center border border-[var(--success-border)] group-hover:border-[var(--success)]/40 transition-colors">
                  <Globe className="w-5 h-5 text-[var(--success)]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Social</div>
                  <div className="text-[10px] text-[var(--text-muted)]">2 indicadores</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <div className="text-center py-2">
          <p className="text-[10px] text-[var(--text-muted)] flex items-center justify-center gap-1">
            <Zap className="w-3 h-3" />
            Datos de referencia. No constituyen asesoramiento financiero.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
