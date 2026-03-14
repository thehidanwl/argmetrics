'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface RateCardProps {
  title: string;
  buy: number;
  sell: number;
  variation?: number;
  icon?: string;
  variant?: 'default' | 'blue' | 'official';
}

const VARIANTS = {
  blue:     { accent: '#10b981' },
  official: { accent: '#a1a1aa' },
  default:  { accent: '#818cf8' },
};

export function RateCard({ title, buy, sell, variation = 0, icon = '💵', variant = 'default' }: RateCardProps) {
  const { accent } = VARIANTS[variant];
  const isPositive = variation >= 0;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 16,
      padding: 14,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* subtle top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}60, transparent)`, borderRadius: '16px 16px 0 0' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 15 }}>{icon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#f4f4f5' }}>{title}</span>
        </div>
        {variation !== 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            padding: '3px 7px', borderRadius: 8, fontSize: 10, fontWeight: 700,
            background: isPositive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            color: isPositive ? '#10b981' : '#ef4444',
            border: `1px solid ${isPositive ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}>
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(variation).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Buy / Sell grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '8px 10px' }}>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: '#71717a', marginBottom: 3 }}>Compra</div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#f4f4f5' }}>
            ${buy.toLocaleString('es-AR')}
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '8px 10px' }}>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: '#71717a', marginBottom: 3 }}>Venta</div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: accent }}>
            ${sell.toLocaleString('es-AR')}
          </div>
        </div>
      </div>
    </div>
  );
}
