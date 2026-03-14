'use client';

import { RefreshCw, Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ title, subtitle, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(18,18,26,0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.10)',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo / Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>A</span>
            </div>
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#f4f4f5', letterSpacing: -0.5, margin: 0 }}>{title}</h1>
            {subtitle && (
              <p style={{ fontSize: 11, color: '#71717a', display: 'flex', alignItems: 'center', gap: 5, margin: 0, marginTop: 1 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse-glow 2s infinite' }} />
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid rgba(255,255,255,0.10)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              aria-label="Actualizar"
            >
              <RefreshCw size={16} color="#a1a1aa" style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          )}
          <button
            style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid rgba(255,255,255,0.10)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            aria-label="Notificaciones"
          >
            <Bell size={16} color="#a1a1aa" />
          </button>
        </div>
      </div>
    </header>
  );
}
