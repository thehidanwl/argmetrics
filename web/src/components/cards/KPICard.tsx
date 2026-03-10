'use client';

import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value?: string;
    label?: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function KPICard({ title, value, subtitle, trend, variant = 'default' }: KPICardProps) {
  const getVariantColor = () => {
    switch (variant) {
      case 'success': return 'text-[var(--success)]';
      case 'warning': return 'text-[var(--warning)]';
      case 'error': return 'text-[var(--error)]';
      default: return 'text-[var(--text-primary)]';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up': return <TrendingUp className="w-3 h-3" />;
      case 'down': return <TrendingDown className="w-3 h-3" />;
      default: return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    switch (trend.direction) {
      case 'up': return 'text-[var(--success)]';
      case 'down': return 'text-[var(--error)]';
      default: return 'text-[var(--text-secondary)]';
    }
  };

  return (
    <Card className="min-w-[140px]">
      <div className="text-[var(--text-secondary)] text-[12px] uppercase tracking-wide mb-1">
        {title}
      </div>
      <div className={`text-2xl font-bold font-mono ${getVariantColor()}`}>
        {typeof value === 'number' ? value.toLocaleString('es-AR') : value}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${getTrendColor()}`}>
          {getTrendIcon()}
          {trend.value && <span>{trend.value}</span>}
          {trend.label && <span className="text-[var(--text-muted)]">{trend.label}</span>}
        </div>
      )}
      {subtitle && (
        <div className="text-[var(--text-muted)] text-xs mt-1">
          {subtitle}
        </div>
      )}
    </Card>
  );
}
