'use client';

import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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

export function KPICard({ title, value, subtitle, trend, variant = 'default', icon }: KPICardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', glowColor: 'rgba(16, 185, 129, 0.08)' };
      case 'warning': return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', glowColor: 'rgba(245, 158, 11, 0.08)' };
      case 'error': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', glowColor: 'rgba(239, 68, 68, 0.08)' };
      case 'blue': return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', glowColor: 'rgba(59, 130, 246, 0.08)' };
      default: return { color: '#f4f4f5', bg: 'rgba(99, 102, 241, 0.12)', glowColor: 'rgba(99, 102, 241, 0.08)' };
    }
  };

  const variantStyles = getVariantStyles();

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.direction === 'up' 
      ? <ArrowUpRight className="w-2.5 h-2.5" />
      : trend.direction === 'down'
        ? <ArrowDownRight className="w-2.5 h-2.5" />
        : <Minus className="w-2.5 h-2.5" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    switch (trend.direction) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      default: return '#a1a1aa';
    }
  };

  return (
    <Card 
      variant="gradient" 
      padding="sm" 
      hover 
      className="relative overflow-hidden group"
      style={{ boxShadow: '0 0 0 1px var(--border-subtle), inset 0 1px 0 0 var(--border-subtle)' }}
    >
      {/* Background Accent - Softer glow */}
      <div 
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-40 transition-opacity duration-300 group-hover:opacity-60"
        style={{ background: `radial-gradient(circle, ${variantStyles.glowColor} 0%, transparent 70%)` }}
      />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-[#71717a] font-semibold truncate">
            {title}
          </span>
          {icon && (
            <div 
              className="p-1.5 rounded-lg"
              style={{ backgroundColor: variantStyles.bg, color: variantStyles.color }}
            >
              {icon}
            </div>
          )}
        </div>
        
        <div 
          className="text-xl font-bold font-mono tracking-tight"
          style={{ color: variantStyles.color }}
        >
          {typeof value === 'number' ? value.toLocaleString('es-AR') : value}
        </div>
        
        {trend && (
          <div 
            className="flex items-center gap-1 text-[10px] font-medium mt-1.5"
            style={{ color: getTrendColor() }}
          >
            {getTrendIcon()}
            {trend.value && <span>{trend.value}</span>}
            {trend.label && <span className="text-[#52525b] ml-0.5">{trend.label}</span>}
          </div>
        )}
        
        {subtitle && (
          <div className="text-[9px] text-[#52525b] mt-1">
            {subtitle}
          </div>
        )}
      </div>
    </Card>
  );
}
