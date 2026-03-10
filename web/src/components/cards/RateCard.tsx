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
          accent: '#22C55E', 
          bg: 'rgba(34, 197, 94, 0.05)',
          gradient: 'from-[#22C55E]/10 to-transparent'
        };
      case 'official': 
        return { 
          accent: '#8B949E', 
          bg: 'rgba(139, 148, 158, 0.05)',
          gradient: 'from-[#8B949E]/10 to-transparent'
        };
      default: 
        return { 
          accent: '#6366F1', 
          bg: 'rgba(99, 102, 241, 0.05)',
          gradient: 'from-[#6366F1]/10 to-transparent'
        };
    }
  };

  const styles = getVariantStyles();
  const isPositive = variation >= 0;

  return (
    <Card variant="gradient" padding="sm" hover className="relative overflow-hidden group">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-50`} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{icon}</span>
            <span className="text-[10px] font-semibold text-[#F0F6FC] truncate">{title}</span>
          </div>
          {variation !== 0 && (
            <div className={`
              flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-semibold
              ${isPositive ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#EF4444]/15 text-[#EF4444]'}
            `}>
              {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {Math.abs(variation).toFixed(1)}%
            </div>
          )}
        </div>

        {/* Rates - Compact grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {/* Buy */}
          <div className="bg-[#0D1117]/50 rounded-lg p-2 border border-[#30363D]/50">
            <div className="text-[8px] uppercase tracking-wider text-[#6E7681] mb-0.5">
              Compra
            </div>
            <div className="text-sm font-bold font-mono text-[#F0F6FC]">
              ${buy.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
            </div>
          </div>
          
          {/* Sell */}
          <div className="bg-[#0D1117]/50 rounded-lg p-2 border border-[#30363D]/50">
            <div className="text-[8px] uppercase tracking-wider text-[#6E7681] mb-0.5">
              Venta
            </div>
            <div 
              className="text-sm font-bold font-mono"
              style={{ color: styles.accent }}
            >
              ${sell.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="w-4 h-4 text-[#6366F1]" />
        </div>
      </div>
    </Card>
  );
}
