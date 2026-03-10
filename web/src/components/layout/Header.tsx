'use client';

import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ title, subtitle, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-[var(--bg-primary)] border-b border-[var(--border-default)] px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{title}</h1>
          {subtitle && (
            <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>
          )}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-[var(--text-secondary)] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    </header>
  );
}
