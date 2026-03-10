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
      case 'success': return { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)', glow: 'shadow-[#22C55E]/5' };
      case 'warning': return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', glow: 'shadow-[#F59E0B]/5' };
      case 'error': return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', glow: 'shadow-[#EF4444]/5' };
      case 'blue': return { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', glow: 'shadow-[#3B82F6]/5' };
      default: return { color: '#F0F6FC', bg: 'rgba(99, 102, 241, 0.1)', glow: 'shadow-[#6366F1]/5' };
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
      case 'up': return '#22C55E';
      case 'down': return '#EF4444';
      default: return '#8B949E';
    }
  };

  return (
    <Card 
      variant="gradient" 
      padding="sm" 
      hover 
      className={`relative overflow-hidden ${variantStyles.glow}`}
    >
      {/* Background Accent */}
      <div 
        className="absolute top-0 right-0 w-12 h-12 rounded-full opacity-15 blur-xl"
        style={{ backgroundColor: variantStyles.color }}
      />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] uppercase tracking-wider text-[#6E7681] font-semibold truncate">
            {title}
          </span>
          {icon && (
            <div 
              className="p-1 rounded-md"
              style={{ backgroundColor: variantStyles.bg, color: variantStyles.color }}
            >
              {icon}
            </div>
          )}
        </div>
        
        <div 
          className="text-lg font-bold font-mono"
          style={{ color: variantStyles.color }}
        >
          {typeof value === 'number' ? value.toLocaleString('es-AR') : value}
        </div>
        
        {trend && (
          <div 
            className="flex items-center gap-0.5 text-[9px] font-medium"
            style={{ color: getTrendColor() }}
          >
            {getTrendIcon()}
            {trend.value && <span>{trend.value}</span>}
            {trend.label && <span className="text-[#6E7681] ml-0.5">{trend.label}</span>}
          </div>
        )}
        
        {subtitle && (
          <div className="text-[8px] text-[#6E7681] mt-0.5">
            {subtitle}
          </div>
        )}
      </div>
    </Card>
  );
}
