'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { KPICard } from '@/components/cards/KPICard';
import { RateCard } from '@/components/cards/RateCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sparkline } from '@/components/charts/Sparkline';
import { getUSDRates, getHealth } from '@/lib/api';
import { USDRates, HealthStatus } from '@/types';
import { 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Globe,
  ChevronRight,
  AlertOctagon,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  Zap
} from 'lucide-react';

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

  // Calcular brecha
  const brecha = rates?.brecha?.value ? Math.abs(rates.brecha.value) : 0;
  const brechaDirection = (rates?.brecha?.value || 0) >= 0 ? 'up' : 'down';

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Header title="ArgMetrics" />
        <div className="p-6 space-y-6 pb-28 max-w-2xl mx-auto">
          {/* Premium Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton rounded-2xl h-28 border border-[var(--border-subtle)]" />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton rounded-xl h-20 border border-[var(--border-subtle)]" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton rounded-2xl h-32 border border-[var(--border-subtle)]" />
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
        subtitle={health ? `Actualizado ${new Date(health.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}` : undefined}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <main className="p-6 space-y-6 max-w-2xl mx-auto">
        
        {/* Hero Stats - 2 columnas mejorado */}
        <div className="grid grid-cols-2 gap-4">
          <KPICard
            title="Riesgo País"
            value={rates ? "1,785" : "—"}
            trend={{ direction: brechaDirection as 'up' | 'down', value: `${brecha.toFixed(1)}%`, label: 'brecha' }}
            variant="error"
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
          />
          <KPICard
            title="Tasa BCRA"
            value="38.0%"
            trend={{ direction: 'neutral', value: '0%', label: 'fija' }}
            variant="warning"
            icon={<Activity className="w-3.5 h-3.5" />}
          />
        </div>

        {/* Tipos de Cambio - Grid 2x2 premium */}
        <div className="grid grid-cols-2 gap-4">
          {/* Oficial */}
          <Card variant="gradient" padding="md" className="relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-[#a1a1aa] font-semibold">Oficial</span>
              <span className="text-xs">🏦</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xl font-bold font-mono text-[#f4f4f5] tracking-tight">
                  ${rates?.oficial.sell.toLocaleString('es-AR')}
                </div>
                <div className="text-[9px] text-[#71717a]">Venta</div>
              </div>
              <Sparkline data={[1430, 1435, 1440, 1438, 1441]} color="#a1a1aa" width={50} height={24} />
            </div>
          </Card>

          {/* Blue */}
          <Card variant="gradient" padding="md" className="relative overflow-hidden group">
            {/* Glow effect */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#10b981]/10 rounded-full blur-2xl group-hover:bg-[#10b981]/20 transition-all duration-500" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-[#10b981] font-semibold">Blue</span>
              <span className="text-xs">💵</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xl font-bold font-mono text-[#10b981] tracking-tight">
                  ${rates?.blue.sell.toLocaleString('es-AR')}
                </div>
                <div className="text-[9px] text-[#71717a]">Venta</div>
              </div>
              <Sparkline data={[1410, 1415, 1420, 1422, 1425]} color="#10b981" width={50} height={24} />
            </div>
          </Card>

          {/* MEP */}
          <Card variant="gradient" padding="md" className="relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-[#818cf8] font-semibold">MEP</span>
              <span className="text-xs">📊</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xl font-bold font-mono text-[#818cf8] tracking-tight">
                  ${rates?.mep?.sell?.toLocaleString('es-AR') || '—'}
                </div>
                <div className="text-[9px] text-[#71717a]">Venta</div>
              </div>
              <Sparkline data={[1375, 1380, 1388, 1392, 1395]} color="#818cf8" width={50} height={24} />
            </div>
          </Card>

          {/* CCL */}
          <Card variant="gradient" padding="md" className="relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-[#f59e0b] font-semibold">CCL</span>
              <span className="text-xs">💹</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xl font-bold font-mono text-[#f59e0b] tracking-tight">
                  ${rates?.ccl?.sell?.toLocaleString('es-AR') || '—'}
                </div>
                <div className="text-[9px] text-[#71717a]">Venta</div>
              </div>
              <Sparkline data={[1395, 1400, 1405, 1410, 1412]} color="#f59e0b" width={50} height={24} />
            </div>
          </Card>
        </div>

        {/* Brecha cambiaria - Premium card */}
        <Card variant="gradient" padding="md" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--warning-bg)] flex items-center justify-center border border-[var(--warning-border)]">
              <TrendingUp className="w-5 h-5 text-[var(--warning)]" />
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)]">Brecha Oficial vs Blue</div>
              <div className="text-[10px] text-[var(--text-muted)]">Variación semanal</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {brechaDirection === 'down' ? (
              <ArrowDownRight className="w-5 h-5 text-[var(--success)]" />
            ) : (
              <ArrowUpRight className="w-5 h-5 text-[var(--error)]" />
            )}
            <span className={`text-xl font-bold font-mono ${brechaDirection === 'down' ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
              {brecha.toFixed(1)}%
            </span>
          </div>
        </Card>

        {/* Tasas de Cambio Detalladas */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Detalle de Tasas</h2>
            <button className="text-xs text-[var(--primary-400)] hover:text-[var(--primary-300)] flex items-center gap-0.5 transition-colors">
              Ver más <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <RateCard
              title="Dólar Oficial"
              buy={rates?.oficial.buy || 0}
              sell={rates?.oficial.sell || 0}
              variation={0.8}
              icon="🏦"
              variant="official"
            />
            <RateCard
              title="Dólar Blue"
              buy={rates?.blue.buy || 0}
              sell={rates?.blue.sell || 0}
              variation={1.2}
              icon="💵"
              variant="blue"
            />
            <RateCard
              title="Dólar MEP"
              buy={rates?.mep?.buy || 0}
              sell={rates?.mep?.sell || 0}
              variation={-0.5}
              icon="📊"
              variant="default"
            />
            <RateCard
              title="Dólar CCL"
              buy={rates?.ccl?.buy || 0}
              sell={rates?.ccl?.sell || 0}
              variation={0.3}
              icon="💹"
              variant="default"
            />
          </div>
        </section>

        {/* Explorar - Grid 2 columnas */}
        <section>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Explorar</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card variant="outlined" padding="sm" hover className="group">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[var(--primary-500)]/10 flex items-center justify-center border border-[var(--primary-500)]/20 group-hover:border-[var(--primary-500)]/40 transition-colors">
                  <Activity className="w-5 h-5 text-[var(--primary-400)]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Economía</div>
                  <div className="text-[10px] text-[var(--text-muted)]">12 indicadores</div>
                </div>
              </div>
            </Card>
            <Card variant="outlined" padding="sm" hover className="group">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[var(--success-bg)] flex items-center justify-center border border-[var(--success-border)] group-hover:border-[var(--success)]/40 transition-colors">
                  <Globe className="w-5 h-5 text-[var(--success)]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Social</div>
                  <div className="text-[10px] text-[var(--text-muted)]">5 indicadores</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="text-center py-4">
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
