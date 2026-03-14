'use client';

import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value?: string;
    label?: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'error' | 'blue';
  icon?: React.ReactNode;
}

const VARIANTS = {
  success: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', glow: 'rgba(16,185,129,0.06)' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', glow: 'rgba(245,158,11,0.06)' },
  error:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  glow: 'rgba(239,68,68,0.06)'  },
  blue:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', glow: 'rgba(59,130,246,0.06)' },
  default: { color: '#818cf8', bg: 'rgba(99,102,241,0.12)', glow: 'rgba(99,102,241,0.06)' },
};

const TREND_COLORS = { up: '#10b981', down: '#ef4444', neutral: '#71717a' };

export function KPICard({ title, value, subtitle, trend, variant = 'default', icon }: KPICardProps) {
  const v = VARIANTS[variant];
  const trendColor = trend ? TREND_COLORS[trend.direction] : '';
  const TrendIcon = trend?.direction === 'up' ? ArrowUpRight : trend?.direction === 'down' ? ArrowDownRight : Minus;

  return (
    <div
      style={{
        background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-tertiary) 100%)`,
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 16,
        padding: 14,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* glow orb */}
      <div style={{
        position: 'absolute', top: -24, right: -24,
        width: 80, height: 80, borderRadius: '50%',
        background: `radial-gradient(circle, ${v.glow} 0%, transparent 70%)`,
        filter: 'blur(16px)', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#71717a' }}>
          {title}
        </span>
        {icon && (
          <div style={{ padding: 6, borderRadius: 8, background: v.bg, color: v.color }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: v.color, letterSpacing: -0.5 }}>
        {typeof value === 'number' ? value.toLocaleString('es-AR') : value}
      </div>

      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 6, color: trendColor, fontSize: 11, fontWeight: 600 }}>
          <TrendIcon size={12} />
          {trend.value && <span>{trend.value}</span>}
          {trend.label && <span style={{ color: '#52525b', marginLeft: 2 }}>{trend.label}</span>}
        </div>
      )}
      {subtitle && <div style={{ fontSize: 10, color: '#52525b', marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}
