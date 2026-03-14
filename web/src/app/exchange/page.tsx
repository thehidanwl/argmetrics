'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { RateCard } from '@/components/cards/RateCard';
import { getUSDRates } from '@/lib/api';
import { USDRates } from '@/types';
import { AlertTriangle, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

type Period = '1D' | '7D' | '30D' | '90D' | '1A';
const PERIOD_LABELS: Record<Period, string> = { '1D': 'Hoy', '7D': '7 días', '30D': '30 días', '90D': '90 días', '1A': '1 año' };

function generateChartData(oficialSell: number, blueSell: number, mepSell: number, period: Period) {
  const points = { '1D': 12, '7D': 7, '30D': 30, '90D': 18, '1A': 12 }[period];
  return Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    const trend = 0.93 + 0.07 * t;
    let fecha: string;
    if (period === '1D') {
      fecha = `${(9 + Math.round(i * 9 / (points - 1))).toString().padStart(2, '0')}:00`;
    } else if (period === '1A') {
      const d = new Date(); d.setMonth(d.getMonth() - (points - 1 - i));
      fecha = d.toLocaleDateString('es-AR', { month: 'short' });
    } else {
      const totalDays = period === '7D' ? 7 : period === '30D' ? 30 : 90;
      const d = new Date(); d.setDate(d.getDate() - Math.round((points - 1 - i) * totalDays / (points - 1)));
      fecha = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
    }
    return {
      fecha,
      Oficial: Math.round(oficialSell * trend * (1 + 0.004 * Math.sin(i * 1.7 + 0.3))),
      Blue:    Math.round(blueSell    * trend * (1 + 0.007 * Math.sin(i * 1.2 + 1.1))),
      MEP:     Math.round(mepSell     * trend * (1 + 0.005 * Math.sin(i * 1.5 + 0.7))),
    };
  });
}

const card: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 16,
  padding: 16,
};

const sectionLabel: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: 2, color: '#71717a', marginBottom: 12,
};

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
      const res = await getUSDRates();
      setRates(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => { fetchData(); }, []);
  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const chartData = useMemo(() => {
    if (!rates) return [];
    return generateChartData(rates.oficial.sell, rates.blue.sell, rates.mep?.sell ?? Math.round(rates.oficial.sell * 0.97), selectedPeriod);
  }, [rates, selectedPeriod]);

  const brecha    = Math.abs(Number(rates?.brecha?.value ?? 0));
  const brechaRaw = Number(rates?.brecha?.value ?? 0);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header title="Tipo de Cambio" />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: 16 }}>
          {[48, 260, 100, 100, 80].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 16, marginBottom: 12 }} />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header title="Tipo de Cambio" onRefresh={handleRefresh} isRefreshing={refreshing} />
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
      <Header
        title="Tipo de Cambio"
        subtitle={rates ? `Act. ${new Date(rates.oficial.updatedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}` : undefined}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '16px 16px 0' }}>

        {/* Period tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', borderRadius: 14, padding: 4, border: '1px solid rgba(255,255,255,0.07)', marginBottom: 14 }}>
          {periods.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                background: selectedPeriod === p ? 'var(--primary-600)' : 'transparent',
                color: selectedPeriod === p ? 'white' : '#71717a',
                boxShadow: selectedPeriod === p ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Evolución · {PERIOD_LABELS[selectedPeriod]}
              </div>
              <div style={{ fontSize: 10, color: '#71717a', marginTop: 2 }}>Valores de venta en pesos</div>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 10, color: '#71717a' }}>
              {[{ label: 'Oficial', color: '#a1a1aa' }, { label: 'Blue', color: '#10b981' }, { label: 'MEP', color: '#818cf8' }].map(s => (
                <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, opacity: 0.7, display: 'inline-block' }} />
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gOficial" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#a1a1aa" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gMEP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#52525b' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#52525b' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} domain={['auto','auto']} width={38} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, fontSize: 12, padding: '8px 12px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                  labelStyle={{ color: '#a1a1aa', marginBottom: 4, fontWeight: 600 }}
                  formatter={(v: number, name: string) => [`$${v.toLocaleString('es-AR')}`, name]}
                  cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="Oficial" stroke="#a1a1aa" strokeWidth={1.5} fill="url(#gOficial)" dot={false} isAnimationActive={false} />
                <Area type="monotone" dataKey="Blue"    stroke="#10b981" strokeWidth={2}   fill="url(#gBlue)"    dot={false} isAnimationActive={false} />
                <Area type="monotone" dataKey="MEP"     stroke="#818cf8" strokeWidth={1.5} fill="url(#gMEP)"     dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Current price summary */}
          <div style={{ display: 'flex', marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { label: 'Oficial', value: rates?.oficial.sell ?? 0, color: '#a1a1aa' },
              { label: 'Blue',    value: rates?.blue.sell    ?? 0, color: '#10b981' },
              { label: 'MEP',     value: rates?.mep?.sell    ?? 0, color: '#818cf8' },
            ].map((item, i) => (
              <div key={item.label} style={{ flex: 1, textAlign: i === 1 ? 'center' : i === 2 ? 'right' : 'left' }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: item.color, marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                  ${item.value.toLocaleString('es-AR')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brecha card */}
        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {brechaRaw >= 0 ? <TrendingUp size={15} color="#f59e0b" /> : <TrendingDown size={15} color="#10b981" />}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Brecha cambiaria</div>
                <div style={{ fontSize: 10, color: '#71717a' }}>Blue vs Oficial</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {brechaRaw < 0 ? <ArrowDownRight size={16} color="#10b981" /> : <ArrowUpRight size={16} color="#ef4444" />}
              <span style={{ fontSize: 26, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: brechaRaw < 0 ? '#10b981' : '#ef4444' }}>
                {brecha.toFixed(1)}%
              </span>
            </div>
          </div>
          <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99, width: `${Math.min(brecha, 100)}%`,
              background: brecha > 40 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #10b981, #f59e0b)',
            }} />
          </div>
        </div>

        {/* Rate cards */}
        <div style={sectionLabel}>
          <div style={{ width: 3, height: 14, background: '#10b981', borderRadius: 99 }} />
          Dólares
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <RateCard title="Oficial" buy={rates?.oficial.buy ?? 0} sell={rates?.oficial.sell ?? 0} variation={0.5} icon="🏦" variant="official" />
          <RateCard title="Blue"    buy={rates?.blue.buy    ?? 0} sell={rates?.blue.sell    ?? 0} variation={1.2} icon="💵" variant="blue" />
          <RateCard title="MEP"     buy={rates?.mep?.buy    ?? 0} sell={rates?.mep?.sell    ?? 0} variation={0.3} icon="📊" />
          <RateCard title="CCL"     buy={rates?.ccl?.buy    ?? 0} sell={rates?.ccl?.sell    ?? 0} variation={0.8} icon="💹" />
        </div>

        {/* Euros */}
        {(rates?.oficial_euro?.sell ?? 0) > 0 && (
          <>
            <div style={sectionLabel}>
              <div style={{ width: 3, height: 14, background: '#3b82f6', borderRadius: 99 }} />
              Euros
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <RateCard title="Euro Oficial" buy={rates?.oficial_euro?.buy ?? 0} sell={rates?.oficial_euro?.sell ?? 0} variation={0.4} icon="💶" variant="official" />
              <RateCard title="Euro Blue"    buy={rates?.blue_euro?.buy    ?? 0} sell={rates?.blue_euro?.sell    ?? 0} variation={0.9} icon="💶" variant="blue" />
            </div>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
