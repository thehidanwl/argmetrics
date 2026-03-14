'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Sparkline } from '@/components/charts/Sparkline';
import { getUSDRates, getMetrics } from '@/lib/api';
import { USDRates, Metric } from '@/types';
import {
  AlertTriangle, Activity, ArrowUpRight, ArrowDownRight,
  TrendingUp, AlertOctagon, BarChart3, Globe, DollarSign,
} from 'lucide-react';

function generateSparkline(base: number, points = 7): number[] {
  return Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    return Math.round(base * (0.96 + 0.04 * t) * (1 + 0.005 * Math.sin(i * 1.7 + base % 3)));
  });
}

// Reusable inline style constants
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

export default function Dashboard() {
  const [rates, setRates] = useState<USDRates | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const [ratesRes, metricsRes] = await Promise.all([getUSDRates(), getMetrics({ limit: 20 })]);
      setRates(ratesRes.data);
      setMetrics(metricsRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const inflation   = metrics.find(m => m.name === 'inflation');
  const countryRisk = metrics.find(m => m.name === 'country_risk');
  const brecha      = Math.abs(Number(rates?.brecha?.value ?? 0));
  const brechaRaw   = Number(rates?.brecha?.value ?? 0);

  const blueSp    = useMemo(() => generateSparkline(rates?.blue.sell    ?? 1425), [rates?.blue.sell]);
  const oficialSp = useMemo(() => generateSparkline(rates?.oficial.sell ?? 1441), [rates?.oficial.sell]);
  const mepSp     = useMemo(() => generateSparkline(rates?.mep?.sell    ?? 1395), [rates?.mep?.sell]);
  const cclSp     = useMemo(() => generateSparkline(rates?.ccl?.sell    ?? 1412), [rates?.ccl?.sell]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header title="ArgMetrics" />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: 16 }}>
          {[140, 90, 90, 130, 70, 90].map((h, i) => (
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
        <Header title="ArgMetrics" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 16 }}>
          <div style={{ ...card, textAlign: 'center', maxWidth: 360, padding: 32 }}>
            <AlertOctagon size={40} color="var(--error)" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Error al cargar</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>{error}</div>
            <button
              onClick={handleRefresh}
              style={{ width: '100%', padding: '10px 0', background: 'var(--primary-600)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Reintentar
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const blueSell    = rates?.blue.sell    ?? 1425;
  const blueBuy     = rates?.blue.buy     ?? 1415;
  const oficialSell = rates?.oficial.sell ?? 1441;
  const mepSell     = rates?.mep?.sell    ?? 1395;
  const cclSell     = rates?.ccl?.sell    ?? 1412;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 96 }}>
      <Header
        title="ArgMetrics"
        subtitle={rates ? `Act. ${new Date(rates.oficial.updatedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}` : undefined}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '16px 16px 0' }}>

        {/* ── HERO: USD Blue ── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.13) 0%, var(--bg-card) 55%, var(--bg-tertiary) 100%)',
          border: '1px solid rgba(16,185,129,0.22)',
          borderRadius: 20,
          padding: 20,
          marginBottom: 12,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* glow */}
          <div style={{ position: 'absolute', top: -32, right: -32, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.18), transparent)', filter: 'blur(24px)', pointerEvents: 'none' }} />

          {/* label row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={13} color="#10b981" />
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: '#10b981' }}>Dólar Blue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 600, color: '#71717a', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 99, padding: '3px 9px' }}>
              <span className="status-dot success" style={{ width: 6, height: 6 }} />
              EN VIVO
            </div>
          </div>

          {/* big price + sparkline */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 52, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#fff', lineHeight: 1, letterSpacing: -1 }}>
              ${blueSell.toLocaleString('es-AR')}
            </div>
            <Sparkline data={blueSp} color="#10b981" width={88} height={40} />
          </div>

          {/* sub-stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { label: 'Compra', value: `$${blueBuy.toLocaleString('es-AR')}`, color: '#f4f4f5' },
              { label: 'Brecha', value: `${brecha.toFixed(1)}%`, color: brechaRaw >= 0 ? '#ef4444' : '#10b981' },
              { label: 'Oficial', value: `$${oficialSell.toLocaleString('es-AR')}`, color: '#a1a1aa' },
            ].map((item, i) => (
              <div key={item.label} style={{ flex: 1, textAlign: i === 1 ? 'center' : i === 2 ? 'right' : 'left' }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: '#71717a', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── INDICADORES MACRO ── */}
        <div style={sectionLabel}>
          <div style={{ width: 3, height: 14, background: 'var(--primary-500)', borderRadius: 99 }} />
          Indicadores macro
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {/* Riesgo País */}
          <div style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-tertiary))', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#71717a' }}>Riesgo País</span>
              <div style={{ padding: 5, borderRadius: 8, background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                <AlertTriangle size={12} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#ef4444', letterSpacing: -0.5 }}>
              {countryRisk ? countryRisk.value.toLocaleString('es-AR') : '1,785'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 5, color: '#10b981', fontSize: 11, fontWeight: 600 }}>
              <ArrowDownRight size={11} />
              <span>−2.5% hoy</span>
            </div>
          </div>

          {/* Inflación */}
          <div style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-tertiary))', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#71717a' }}>Inflación IPC</span>
              <div style={{ padding: 5, borderRadius: 8, background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                <Activity size={12} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#f59e0b', letterSpacing: -0.5 }}>
              {inflation ? `${inflation.value}%` : '3.7%'}
            </div>
            <div style={{ fontSize: 11, color: '#71717a', marginTop: 5, fontWeight: 500 }}>mensual · INDEC</div>
          </div>
        </div>

        {/* ── COTIZACIONES ── */}
        <div style={sectionLabel}>
          <div style={{ width: 3, height: 14, background: '#10b981', borderRadius: 99 }} />
          Cotizaciones USD
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Oficial', value: oficialSell, sp: oficialSp, color: '#a1a1aa', badge: null },
            { label: 'Blue',    value: blueSell,    sp: blueSp,    color: '#10b981', badge: 'LIBRE' },
            { label: 'MEP',     value: mepSell,     sp: mepSp,     color: '#818cf8', badge: null },
            { label: 'CCL',     value: cclSell,     sp: cclSp,     color: '#f59e0b', badge: null },
          ].map(rate => (
            <div key={rate.label} style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-tertiary))', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, padding: 14, position: 'relative', overflow: 'hidden' }}>
              {/* color glow top */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 60, height: 60, borderRadius: '50%', background: `radial-gradient(circle, ${rate.color}22, transparent)`, filter: 'blur(12px)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: rate.color }}>{rate.label}</span>
                {rate.badge && (
                  <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: `${rate.color}18`, color: rate.color }}>{rate.badge}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: rate.color, lineHeight: 1 }}>
                    ${rate.value.toLocaleString('es-AR')}
                  </div>
                  <div style={{ fontSize: 9, color: '#71717a', marginTop: 4 }}>Venta</div>
                </div>
                <Sparkline data={rate.sp} color={rate.color} width={52} height={26} />
              </div>
            </div>
          ))}
        </div>

        {/* ── BRECHA CAMBIARIA ── */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} color="#f59e0b" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Brecha cambiaria</div>
                <div style={{ fontSize: 10, color: '#71717a', marginTop: 2 }}>Blue vs Oficial</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {brechaRaw >= 0
                ? <ArrowUpRight size={16} color="#ef4444" />
                : <ArrowDownRight size={16} color="#10b981" />}
              <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: brechaRaw >= 0 ? '#ef4444' : '#10b981' }}>
                {brecha.toFixed(1)}%
              </span>
            </div>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              width: `${Math.min(brecha, 100)}%`,
              background: brecha > 40 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #10b981, #f59e0b)',
              transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#71717a', marginTop: 4 }}>
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>

        {/* ── EXPLORAR ── */}
        <div style={sectionLabel}>
          <div style={{ width: 3, height: 14, background: 'var(--primary-400)', borderRadius: 99 }} />
          Explorar
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { icon: <BarChart3 size={20} color="var(--primary-400)" />, label: 'Economía', count: '9 indicadores', bg: 'rgba(99,102,241,0.10)', border: 'rgba(99,102,241,0.2)' },
            { icon: <Globe size={20} color="#10b981" />, label: 'Social', count: '2 indicadores', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.2)' },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--bg-card)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 14, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: item.bg, border: `1px solid ${item.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: '#71717a', marginTop: 2 }}>{item.count}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', fontSize: 10, color: '#52525b', paddingBottom: 8 }}>
          Datos informativos. No constituyen asesoramiento financiero.
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
