'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Bell, Moon, RefreshCw, Wifi, Info, ChevronRight, AlertTriangle, DollarSign } from 'lucide-react';

interface AlertItem { id: number; name: string; enabled: boolean; }
interface Settings { darkMode: boolean; autoRefresh: boolean; wifiOnly: boolean; preferredCurrency: string; alerts: AlertItem[]; }

const DEFAULT_SETTINGS: Settings = {
  darkMode: true, autoRefresh: true, wifiOnly: false, preferredCurrency: 'USD',
  alerts: [
    { id: 1, name: 'Dólar oficial > $1,500', enabled: true },
    { id: 2, name: 'Dólar blue > $1,600', enabled: false },
    { id: 3, name: 'Inflación mensual > 5%', enabled: false },
    { id: 4, name: 'Riesgo país > 2,000 pts', enabled: false },
  ],
};

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      style={{
        width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
        background: enabled ? 'var(--primary-600)' : 'rgba(255,255,255,0.12)',
        position: 'relative', flexShrink: 0, transition: 'background 0.2s',
      }}
    >
      <div style={{
        position: 'absolute', top: 4, width: 16, height: 16, borderRadius: '50%',
        background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        transform: `translateX(${enabled ? 24 : 4}px)`, transition: 'transform 0.2s',
      }} />
    </button>
  );
}

const card: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 16,
  overflow: 'hidden',
};

const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 16px',
};

const divider: React.CSSProperties = {
  height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 16px',
};

const sectionLabel: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: 2, color: '#71717a', marginBottom: 10,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('argmetrics_settings');
      if (stored) setSettings(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('argmetrics_settings', JSON.stringify(settings));
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 1500);
      return () => clearTimeout(t);
    } catch {}
  }, [settings]);

  const update = (patch: Partial<Settings>) => setSettings(prev => ({ ...prev, ...patch }));
  const toggleAlert = (id: number) =>
    setSettings(prev => ({ ...prev, alerts: prev.alerts.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a) }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 96 }}>
      <Header title="Ajustes" subtitle={saved ? 'Guardado ✓' : undefined} />

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '16px 16px 0' }}>

        {/* Alerts */}
        <div style={sectionLabel}>
          <Bell size={13} color="var(--primary-400)" />
          Alertas
        </div>
        <div style={{ ...card, marginBottom: 20 }}>
          {settings.alerts.map((alert, idx) => (
            <div key={alert.id}>
              <div style={row}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AlertTriangle size={14} color="var(--warning)" />
                  <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{alert.name}</span>
                </div>
                <Toggle enabled={alert.enabled} onToggle={() => toggleAlert(alert.id)} />
              </div>
              {idx < settings.alerts.length - 1 && <div style={divider} />}
            </div>
          ))}
        </div>

        {/* Appearance */}
        <div style={sectionLabel}>
          <Moon size={13} color="var(--primary-400)" />
          Apariencia
        </div>
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={row}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Moon size={14} color="#71717a" />
              <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>Modo oscuro</span>
            </div>
            <Toggle enabled={settings.darkMode} onToggle={() => update({ darkMode: !settings.darkMode })} />
          </div>
          <div style={divider} />
          <div style={row}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <DollarSign size={14} color="#71717a" />
              <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>Moneda preferida</span>
            </div>
            <span style={{ fontSize: 13, color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>{settings.preferredCurrency}</span>
          </div>
        </div>

        {/* Data */}
        <div style={sectionLabel}>
          <RefreshCw size={13} color="var(--primary-400)" />
          Datos
        </div>
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={row}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <RefreshCw size={14} color="#71717a" />
              <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>Auto-actualizar</span>
            </div>
            <Toggle enabled={settings.autoRefresh} onToggle={() => update({ autoRefresh: !settings.autoRefresh })} />
          </div>
          <div style={divider} />
          <div style={row}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Wifi size={14} color="#71717a" />
              <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>Solo WiFi</span>
            </div>
            <Toggle enabled={settings.wifiOnly} onToggle={() => update({ wifiOnly: !settings.wifiOnly })} />
          </div>
        </div>

        {/* About */}
        <div style={sectionLabel}>
          <Info size={13} color="var(--primary-400)" />
          Acerca de
        </div>
        <div style={{ ...card, marginBottom: 24 }}>
          {[
            { left: 'Versión', right: '1.0.0', chevron: false },
            { left: 'Fuentes de datos', right: 'INDEC · BCRA · Bluelytics', chevron: false },
            { left: 'Términos y Condiciones', right: '', chevron: true },
            { left: 'Política de Privacidad', right: '', chevron: true },
          ].map((item, idx, arr) => (
            <div key={item.left}>
              <div style={row}>
                <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{item.left}</span>
                {item.chevron
                  ? <ChevronRight size={16} color="#71717a" />
                  : <span style={{ fontSize: 12, color: '#71717a', fontFamily: item.left === 'Versión' ? "'JetBrains Mono', monospace" : undefined }}>{item.right}</span>
                }
              </div>
              {idx < arr.length - 1 && <div style={divider} />}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, color: '#52525b', paddingBottom: 8 }}>
          <div>ArgMetrics © 2026</div>
          <div style={{ marginTop: 4 }}>Datos con fines informativos únicamente</div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
