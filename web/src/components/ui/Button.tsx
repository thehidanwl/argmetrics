'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    className = '',
    ...props 
  }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-semibold rounded-xl
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0D1117]
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
    `;

    const variants = {
      primary: `
        bg-gradient-to-r from-[#6366F1] to-[#4F46E5]
        text-white
        hover:from-[#818CF8] hover:to-[#6366F1]
        focus:ring-[#6366F1]
        shadow-lg shadow-[#6366F1]/25
        hover:shadow-xl hover:shadow-[#6366F1]/35
      `,
      secondary: `
        bg-[#21262D]
        text-[#F0F6FC]
        border border-[#30363D]
        hover:bg-[#30363D]
        hover:border-[#6366F1]
        focus:ring-[#6366F1]
      `,
      ghost: `
        bg-transparent
        text-[#8B949E]
        hover:bg-[#21262D]
        hover:text-[#F0F6FC]
        focus:ring-[#6366F1]
      `,
      danger: `
        bg-gradient-to-r from-[#EF4444] to-[#DC2626]
        text-white
        hover:from-[#F87171] hover:to-[#EF4444]
        focus:ring-[#EF4444]
        shadow-lg shadow-[#EF4444]/25
      `,
      success: `
        bg-gradient-to-r from-[#22C55E] to-[#16A34A]
        text-white
        hover:from-[#4ADE80] hover:to-[#22C55E]
        focus:ring-[#22C55E]
        shadow-lg shadow-[#22C55E]/25
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon}
        {children}
        {rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
