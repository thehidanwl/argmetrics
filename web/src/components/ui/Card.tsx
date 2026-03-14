'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const PADDING = { none: 0, sm: 12, md: 16, lg: 24 };

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', padding = 'md', hover = false, className = '', style, ...props }, ref) => {
    const base: React.CSSProperties = {
      background: variant === 'gradient'
        ? 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-tertiary) 100%)'
        : variant === 'outlined'
          ? 'transparent'
          : 'var(--bg-card)',
      border: variant === 'outlined'
        ? '1.5px solid rgba(255,255,255,0.08)'
        : '1px solid rgba(255,255,255,0.10)',
      borderRadius: 16,
      padding: PADDING[padding],
      boxShadow: variant === 'elevated' ? '0 8px 24px rgba(0,0,0,0.4)' : undefined,
      transition: 'all 0.2s ease',
      cursor: hover ? 'pointer' : undefined,
      ...style,
    };

    return (
      <div ref={ref} style={base} className={`${hover ? 'card-lift' : ''} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
