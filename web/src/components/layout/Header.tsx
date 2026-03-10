'use client';

import { RefreshCw, Menu, Bell, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ title, subtitle, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-2xl mx-auto px-3 py-3">
        <div className="flex items-center justify-between">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center shadow-lg shadow-[#6366F1]/30">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#F0F6FC] tracking-tight">{title}</h1>
              {subtitle && (
                <p className="text-xs text-[#8B949E]">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#21262D] border border-[#30363D] hover:border-[#6366F1] hover:bg-[#30363D] transition-all duration-200 group"
                aria-label="Actualizar"
              >
                <RefreshCw 
                  className={`w-5 h-5 text-[#8B949E] group-hover:text-[#6366F1] transition-colors ${isRefreshing ? 'animate-spin' : ''}`} 
                />
              </button>
            )}
            <button
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#21262D] border border-[#30363D] hover:border-[#6366F1] hover:bg-[#30363D] transition-all duration-200 group"
              aria-label="Notificaciones"
            >
              <Bell className="w-5 h-5 text-[#8B949E] group-hover:text-[#6366F1] transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
