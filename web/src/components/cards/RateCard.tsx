'use client';

import { Card } from '../ui/Card';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface RateCardProps {
  title: string;
  buy: number;
  sell: number;
  variation?: number;
  currency?: string;
  icon?: string;
}

export function RateCard({ title, buy, sell, variation, currency = '$', icon }: RateCardProps) {
  const formatValue = (value: number) => {
    return value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const isPositive = variation !== undefined && variation >= 0;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-xl">{icon}</span>}
        <h4 className="text-[var(--text-primary)] font-semibold">{title}</h4>
      </div>
      
      <div className="flex justify-between">
        <div>
          <div className="text-[var(--text-secondary)] text-xs mb-1">Compra</div>
          <div className="text-xl font-mono font-semibold text-[var(--text-primary)]">
            {currency}{formatValue(buy)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[var(--text-secondary)] text-xs mb-1">Venta</div>
          <div className="text-xl font-mono font-semibold text-[var(--text-primary)]">
            {currency}{formatValue(sell)}
          </div>
        </div>
      </div>

      {variation !== undefined && (
        <div className={`flex items-center gap-1 mt-3 pt-3 border-t border-[var(--border-default)] ${isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
          {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          <span className="text-sm font-medium">
            {isPositive ? '+' : ''}{variation.toFixed(2)}%
          </span>
          <span className="text-xs text-[var(--text-muted)]">vs ayer</span>
        </div>
      )}
    </Card>
  );
}
