'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    children, 
    variant = 'default', 
    padding = 'md',
    hover = false,
    className = '',
    ...props 
  }, ref) => {
    const baseStyles = `
      rounded-2xl
      transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
    `;

    const variants = {
      default: `
        bg-[var(--bg-card)]
        border border-[var(--border-default)]
      `,
      elevated: `
        bg-[var(--bg-card)]
        shadow-[var(--shadow-lg)]
        border border-[var(--border-default)]
      `,
      outlined: `
        bg-transparent
        border-2 border-[var(--border-subtle)]
        hover:border-[var(--primary-500)]/40
        hover:bg-[var(--bg-card-hover)]
      `,
      gradient: `
        bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-tertiary)]
        border border-[var(--border-default)]
      `,
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const hoverStyles = hover 
      ? 'card-lift hover:shadow-[var(--shadow-xl)] hover:border-[var(--primary-500)]/30 cursor-pointer' 
      : '';

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${paddings[padding]}
          ${hoverStyles}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
