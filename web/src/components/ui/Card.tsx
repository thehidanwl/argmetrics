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
      transition-all duration-200 ease-out
    `;

    const variants = {
      default: `
        bg-[#161B22]
        border border-[#30363D]
      `,
      elevated: `
        bg-[#161B22]
        shadow-xl shadow-black/30
        border border-[#30363D]
      `,
      outlined: `
        bg-transparent
        border-2 border-[#30363D]
        hover:border-[#6366F1]
      `,
      gradient: `
        bg-gradient-to-br from-[#161B22] to-[#21262D]
        border border-[#30363D]
      `,
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const hoverStyles = hover 
      ? 'hover:shadow-xl hover:shadow-black/20 hover:border-[#6366F1]/50 hover:scale-[1.01] cursor-pointer' 
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
