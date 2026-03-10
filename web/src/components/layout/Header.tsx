'use client';

import { RefreshCw, Bell, Search, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ title, subtitle, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-2xl mx-auto px-4 py-3.5">
        <div className="flex items-center justify-between">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              {/* Subtle glow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 blur-lg -z-10" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#f4f4f5] tracking-tight">{title}</h1>
              {subtitle && (
                <p className="text-xs text-[#71717a] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:border-[var(--primary-500)]/40 hover:bg-[var(--bg-card-hover)] transition-all duration-200 group"
                aria-label="Actualizar"
              >
                <RefreshCw 
                  className={`w-4.5 h-4.5 text-[#a1a1aa] group-hover:text-[#f4f4f5] transition-colors ${isRefreshing ? 'animate-spin' : ''}`} 
                />
              </button>
            )}
            <button
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:border-[var(--primary-500)]/40 hover:bg-[var(--bg-card-hover)] transition-all duration-200 group"
              aria-label="Notificaciones"
            >
              <Bell className="w-4.5 h-4.5 text-[#a1a1aa] group-hover:text-[#f4f4f5] transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
