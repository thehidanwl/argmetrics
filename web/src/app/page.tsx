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
  ArrowDownRight
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
        <div className="p-3 space-y-3 pb-24 max-w-2xl mx-auto">
          {/* Compact Skeleton */}
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-[#161B22] rounded-xl h-20 border border-[#30363D]" />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-[#161B22] rounded-xl h-16 border border-[#30363D]" />
            ))}
          </div>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-[#161B22] rounded-xl h-24 border border-[#30363D]" />
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
            <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/15 flex items-center justify-center mx-auto mb-4">
              <AlertOctagon className="w-8 h-8 text-[#EF4444]" />
            </div>
            <h3 className="text-lg font-bold text-[#F0F6FC] mb-2">Algo salió mal</h3>
            <p className="text-[#8B949E] text-sm mb-6">{error}</p>
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
    <div className="min-h-screen bg-[var(--bg-primary)] pb-24">
      <Header 
        title="ArgMetrics" 
        subtitle={health ? `Actualizado ${new Date(health.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}` : undefined}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <main className="p-3 space-y-3 max-w-2xl mx-auto">
        
        {/* Header Stats - 2 columnas compactas */}
        <div className="grid grid-cols-2 gap-2">
          <KPICard
            title="Riesgo País"
            value={rates ? "1,785" : "—"}
            trend={{ direction: brechaDirection as 'up' | 'down', value: `${brecha.toFixed(1)}%`, label: 'brecha' }}
            variant="error"
            icon={<AlertTriangle className="w-3 h-3" />}
          />
          <KPICard
            title="Tasa BCRA"
            value="38.0%"
            trend={{ direction: 'neutral', value: '0%', label: 'fija' }}
            variant="warning"
            icon={<Activity className="w-3 h-3" />}
          />
        </div>

        {/* Tipos de Cambio - Grid 2x2 compacto */}
        <div className="grid grid-cols-2 gap-2">
          {/* Oficial */}
          <Card variant="gradient" padding="sm" className="relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase tracking-wider text-[#8B949E] font-semibold">Oficial</span>
              <span className="text-[9px] text-[#8B949E]">🏦</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-lg font-bold font-mono text-[#F0F6FC]">
                  ${rates?.oficial.sell.toLocaleString('es-AR')}
                </div>
                <div className="text-[8px] text-[#6E7681]">Venta</div>
              </div>
              <Sparkline data={[1430, 1435, 1440, 1438, 1441]} color="#8B949E" width={40} height={20} />
            </div>
          </Card>

          {/* Blue */}
          <Card variant="gradient" padding="sm" className="relative overflow-hidden bg-gradient-to-br from-[#161B22] to-[#22C55E]/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase tracking-wider text-[#22C55E] font-semibold">Blue</span>
              <span className="text-[9px] text-[#22C55E]">💵</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-lg font-bold font-mono text-[#22C55E]">
                  ${rates?.blue.sell.toLocaleString('es-AR')}
                </div>
                <div className="text-[8px] text-[#6E7681]">Venta</div>
              </div>
              <Sparkline data={[1410, 1415, 1420, 1422, 1425]} color="#22C55E" width={40} height={20} />
            </div>
          </Card>

          {/* MEP */}
          <Card variant="gradient" padding="sm" className="relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase tracking-wider text-[#6366F1] font-semibold">MEP</span>
              <span className="text-[9px] text-[#6366F1]">📊</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-lg font-bold font-mono text-[#6366F1]">
                  ${rates?.mep?.sell?.toLocaleString('es-AR') || '—'}
                </div>
                <div className="text-[8px] text-[#6E7681]">Venta</div>
              </div>
              <Sparkline data={[1375, 1380, 1388, 1392, 1395]} color="#6366F1" width={40} height={20} />
            </div>
          </Card>

          {/* CCL */}
          <Card variant="gradient" padding="sm" className="relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase tracking-wider text-[#F59E0B] font-semibold">CCL</span>
              <span className="text-[9px] text-[#F59E0B]">💹</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-lg font-bold font-mono text-[#F59E0B]">
                  ${rates?.ccl?.sell?.toLocaleString('es-AR') || '—'}
                </div>
                <div className="text-[8px] text-[#6E7681]">Venta</div>
              </div>
              <Sparkline data={[1395, 1400, 1405, 1410, 1412]} color="#F59E0B" width={40} height={20} />
            </div>
          </Card>
        </div>

        {/* Brecha cambiaria - mini card */}
        <div className="flex items-center justify-between px-2 py-2 bg-[#21262D] rounded-xl border border-[#30363D]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#8B949E]" />
            <span className="text-xs text-[#8B949E]">Brecha Oficial vs Blue</span>
          </div>
          <div className="flex items-center gap-1">
            {brechaDirection === 'down' ? (
              <ArrowDownRight className="w-3 h-3 text-[#22C55E]" />
            ) : (
              <ArrowUpRight className="w-3 h-3 text-[#EF4444]" />
            )}
            <span className={`text-sm font-bold font-mono ${brechaDirection === 'down' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              {brecha.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Tasas de Cambio Detalladas */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-[#F0F6FC]">Detalle de Tasas</h2>
            <button className="text-xs text-[#6366F1] hover:text-[#818CF8] flex items-center gap-0.5">
              Ver más <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
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
          <h2 className="text-sm font-bold text-[#F0F6FC] mb-2">Explorar</h2>
          <div className="grid grid-cols-2 gap-2">
            <Card variant="outlined" padding="sm" hover className="group">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#6366F1]/15 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-[#6366F1]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#F0F6FC]">Economía</div>
                  <div className="text-[9px] text-[#6E7681]">12 indicadores</div>
                </div>
              </div>
            </Card>
            <Card variant="outlined" padding="sm" hover className="group">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#22C55E]/15 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-[#22C55E]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#F0F6FC]">Social</div>
                  <div className="text-[9px] text-[#6E7681]">5 indicadores</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="text-center py-2">
          <p className="text-[9px] text-[#6E7681]">
            Datos de referencia. No constituyen asesoramiento financiero.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
