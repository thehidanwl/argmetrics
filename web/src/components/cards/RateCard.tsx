'use client';

import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface RateCardProps {
  title: string;
  buy: number;
  sell: number;
  variation?: number;
  icon?: string;
  variant?: 'default' | 'blue' | 'official';
}

export function RateCard({ title, buy, sell, variation = 0, icon = '💵', variant = 'default' }: RateCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'blue': 
        return { 
          accent: '#10b981', 
          bg: 'rgba(16, 185, 129, 0.08)',
          gradient: 'from-[rgba(16,185,129,0.08)] to-transparent'
        };
      case 'official': 
        return { 
          accent: '#a1a1aa', 
          bg: 'rgba(161, 161, 170, 0.08)',
          gradient: 'from-[rgba(161,161,170,0.08)] to-transparent'
        };
      default: 
        return { 
          accent: '#818cf8', 
          bg: 'rgba(129, 140, 248, 0.08)',
          gradient: 'from-[rgba(129,140,248,0.08)] to-transparent'
        };
    }
  };

  const styles = getVariantStyles();
  const isPositive = variation >= 0;

  return (
    <Card variant="gradient" padding="sm" hover className="relative overflow-hidden group">
      {/* Background Gradient - Subtle */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-60`} />
      
      {/* Border gradient on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
        style={{ background: `linear-gradient(135deg, ${styles.accent}20, transparent)`, border: `1px solid ${styles.accent}30` }} 
      />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">{icon}</span>
            <span className="text-[11px] font-semibold text-[#f4f4f5] truncate">{title}</span>
          </div>
          {variation !== 0 && (
            <div className={`
              flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold
              ${isPositive 
                ? 'bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success-border)]' 
                : 'bg-[var(--error-bg)] text-[var(--error)] border border-[var(--error-border)]'
              }
            `}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(variation).toFixed(1)}%
            </div>
          )}
        </div>

        {/* Rates - Clean grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Buy */}
          <div 
            className="rounded-xl p-3 border transition-colors duration-200 group-hover:border-[var(--border-default)]"
            style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="text-[9px] uppercase tracking-wider text-[#71717a] font-medium mb-1">
              Compra
            </div>
            <div className="text-base font-bold font-mono text-[#f4f4f5] tracking-tight">
              ${buy.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
            </div>
          </div>
          
          {/* Sell */}
          <div 
            className="rounded-xl p-3 border transition-colors duration-200 group-hover:border-[var(--border-default)]"
            style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="text-[9px] uppercase tracking-wider text-[#71717a] font-medium mb-1">
              Venta
            </div>
            <div 
              className="text-base font-bold font-mono tracking-tight"
              style={{ color: styles.accent }}
            >
              ${sell.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Arrow indicator - Smooth fade */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-[-4px]">
          <ArrowRight className="w-4 h-4" style={{ color: styles.accent }} />
        </div>
      </div>
    </Card>
  );
}
