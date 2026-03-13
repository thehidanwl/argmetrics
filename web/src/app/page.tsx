'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { KPICard } from '@/components/cards/KPICard';
import { Card } from '@/components/ui/Card';
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
  DollarSign,
} from 'lucide-react';

// Generates a deterministic sparkline based on a reference value.
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
  badge?: string;
}

function RateGridCard({ title, value, sparkline, color, icon, badge }: RateGridCardProps) {
  return (
    <Card variant="gradient" padding="md" className="relative overflow-hidden group">
      <div
        className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-20 transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
      />
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color }}>
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
              style={{ backgroundColor: `${color}18`, color }}
            >
              {badge}
            </span>
          )}
          <span className="text-sm">{icon}</span>
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-xl font-bold font-mono tracking-tight leading-none" style={{ color }}>
            ${value.toLocaleString('es-AR')}
          </div>
          <div className="text-[9px] text-[var(--text-muted)] mt-1">Venta</div>
        </div>
        <Sparkline data={sparkline} color={color} width={56} height={28} />
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

  const blueSparkline = useMemo(
    () => generateSparkline(rates?.blue.sell ?? 1425),
    [rates?.blue.sell]
  );
  const oficialSparkline = useMemo(
    () => generateSparkline(rates?.oficial.sell ?? 1441),
    [rates?.oficial.sell]
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
          <div className="skeleton rounded-2xl h-36 border border-[var(--border-subtle)]" />
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
            <button
              onClick={handleRefresh}
              className="w-full py-2.5 bg-[var(--primary-600)] text-white rounded-xl text-sm font-semibold"
            >
              Reintentar
            </button>
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

      <main className="p-5 space-y-5 max-w-2xl mx-auto">

        {/* ── HERO: Dólar Blue spotlight ── */}
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(16,185,129,0.25)] animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, var(--bg-card) 50%, var(--bg-tertiary) 100%)',
          }}
        >
          {/* Glow orb */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />

          <div className="p-5">
            {/* Label row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <DollarSign className="w-3.5 h-3.5 text-[var(--success)]" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--success)]">
                  Dólar Blue
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-1 rounded-full border border-[var(--border-subtle)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                EN VIVO
              </span>
            </div>

            {/* Big price */}
            <div className="flex items-end gap-4 mt-1">
              <div className="text-5xl font-bold font-mono tracking-tight text-white leading-none">
                ${(rates?.blue.sell ?? 1425).toLocaleString('es-AR')}
              </div>
              <Sparkline
                data={blueSparkline}
                color="#10b981"
                width={80}
                height={36}
              />
            </div>

            {/* Sub-row */}
            <div className="flex items-center gap-5 mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Compra</div>
                <div className="text-sm font-bold font-mono text-[var(--text-primary)]">
                  ${(rates?.blue.buy ?? 1415).toLocaleString('es-AR')}
                </div>
              </div>
              <div className="w-px h-8 bg-[var(--border-subtle)]" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Brecha</div>
                <div className={`text-sm font-bold font-mono flex items-center gap-1 ${brechaRaw >= 0 ? 'text-[var(--error)]' : 'text-[var(--success)]'}`}>
                  {brechaRaw >= 0
                    ? <ArrowUpRight className="w-3.5 h-3.5" />
                    : <ArrowDownRight className="w-3.5 h-3.5" />
                  }
                  {brecha.toFixed(1)}%
                </div>
              </div>
              <div className="w-px h-8 bg-[var(--border-subtle)]" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Oficial</div>
                <div className="text-sm font-bold font-mono text-[var(--text-secondary)]">
                  ${(rates?.oficial.sell ?? 1441).toLocaleString('es-AR')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI GRID ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-0.5 h-4 rounded-full bg-[var(--primary-500)]" />
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Indicadores clave</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 stagger-children">
            <KPICard
              title="Riesgo País"
              value={countryRisk ? countryRisk.value.toLocaleString('es-AR') : '1,785'}
              trend={{ direction: 'down', value: '−2.5%', label: 'hoy' }}
              variant="error"
              icon={<AlertTriangle className="w-3.5 h-3.5" />}
            />
            <KPICard
              title="Inflación"
              value={inflation ? `${inflation.value}%` : '3.7%'}
              trend={{ direction: 'neutral', value: 'mensual', label: '' }}
              variant="warning"
              icon={<Activity className="w-3.5 h-3.5" />}
            />
          </div>
        </div>

        {/* ── TIPOS DE CAMBIO ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-0.5 h-4 rounded-full bg-[var(--success)]" />
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Tipos de cambio</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 stagger-children">
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
              badge="LIBRE"
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
        </div>

        {/* ── BRECHA CAMBIARIA (full-width) ── */}
        <Card variant="gradient" padding="md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--warning-bg)] flex items-center justify-center border border-[var(--warning-border)]">
                <TrendingUp className="w-4 h-4 text-[var(--warning)]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">Brecha cambiaria</div>
                <div className="text-[10px] text-[var(--text-muted)]">Blue vs Oficial</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {brechaRaw >= 0
                ? <ArrowUpRight className="w-4 h-4 text-[var(--error)]" />
                : <ArrowDownRight className="w-4 h-4 text-[var(--success)]" />
              }
              <span
                className={`text-2xl font-bold font-mono ${
                  brechaRaw >= 0 ? 'text-[var(--error)]' : 'text-[var(--success)]'
                }`}
              >
                {brecha.toFixed(1)}%
              </span>
            </div>
          </div>
          {/* Visual bar */}
          <div className="mt-1">
            <div className="flex justify-between text-[9px] text-[var(--text-muted)] mb-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(brecha, 100)}%`,
                  background: brecha > 40
                    ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                    : 'linear-gradient(90deg, #10b981, #f59e0b)',
                }}
              />
            </div>
          </div>
        </Card>

        {/* ── EXPLORAR ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-0.5 h-4 rounded-full bg-[var(--primary-400)]" />
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Explorar</h2>
          </div>
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
        </div>

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
