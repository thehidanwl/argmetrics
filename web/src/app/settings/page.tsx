'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Bell, Moon, RefreshCw, Wifi, Info, ChevronRight, AlertTriangle, DollarSign } from 'lucide-react';

interface AlertItem {
  id: number;
  name: string;
  enabled: boolean;
}

interface Settings {
  darkMode: boolean;
  autoRefresh: boolean;
  wifiOnly: boolean;
  preferredCurrency: string;
  alerts: AlertItem[];
}

const DEFAULT_SETTINGS: Settings = {
  darkMode: true,
  autoRefresh: true,
  wifiOnly: false,
  preferredCurrency: 'USD',
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
      className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
        enabled ? 'bg-[var(--primary-600)]' : 'bg-[var(--bg-tertiary)]'
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <div
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('argmetrics_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem('argmetrics_settings', JSON.stringify(settings));
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 1500);
      return () => clearTimeout(t);
    } catch {
      // ignore storage errors
    }
  }, [settings]);

  const update = (patch: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  };

  const toggleAlert = (id: number) => {
    setSettings(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-28">
      <Header
        title="Ajustes"
        subtitle={saved ? 'Guardado' : undefined}
      />

      <main className="p-5 space-y-5 max-w-2xl mx-auto">
        {/* Alerts */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-[var(--primary-400)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Alertas</h2>
          </div>
          <Card>
            {settings.alerts.map((alert, idx) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between py-3.5 px-1 ${
                  idx < settings.alerts.length - 1 ? 'border-b border-[var(--border-subtle)]' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[var(--warning)] flex-shrink-0" />
                  <span className="text-sm text-[var(--text-primary)]">{alert.name}</span>
                </div>
                <Toggle enabled={alert.enabled} onToggle={() => toggleAlert(alert.id)} />
              </div>
            ))}
          </Card>
        </section>

        {/* Appearance */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Moon className="w-4 h-4 text-[var(--primary-400)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Apariencia</h2>
          </div>
          <Card>
            <div className="flex items-center justify-between py-3.5 px-1">
              <div className="flex items-center gap-2.5">
                <Moon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <span className="text-sm text-[var(--text-primary)]">Modo oscuro</span>
              </div>
              <Toggle
                enabled={settings.darkMode}
                onToggle={() => update({ darkMode: !settings.darkMode })}
              />
            </div>
            <div className="flex items-center justify-between py-3.5 px-1 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <span className="text-sm text-[var(--text-primary)]">Moneda preferida</span>
              </div>
              <span className="text-sm text-[var(--text-secondary)]">{settings.preferredCurrency}</span>
            </div>
          </Card>
        </section>

        {/* Data */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-4 h-4 text-[var(--primary-400)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Datos</h2>
          </div>
          <Card>
            <div className="flex items-center justify-between py-3.5 px-1">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <span className="text-sm text-[var(--text-primary)]">Auto-actualizar</span>
              </div>
              <Toggle
                enabled={settings.autoRefresh}
                onToggle={() => update({ autoRefresh: !settings.autoRefresh })}
              />
            </div>
            <div className="flex items-center justify-between py-3.5 px-1 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <Wifi className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <span className="text-sm text-[var(--text-primary)]">Solo WiFi</span>
              </div>
              <Toggle
                enabled={settings.wifiOnly}
                onToggle={() => update({ wifiOnly: !settings.wifiOnly })}
              />
            </div>
          </Card>
        </section>

        {/* About */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-[var(--primary-400)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Acerca de</h2>
          </div>
          <Card>
            <div className="flex items-center justify-between py-3.5 px-1">
              <span className="text-sm text-[var(--text-secondary)]">Versión</span>
              <span className="text-sm text-[var(--text-primary)]">1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-3.5 px-1 border-t border-[var(--border-subtle)]">
              <span className="text-sm text-[var(--text-secondary)]">Fuentes de datos</span>
              <span className="text-sm text-[var(--text-primary)]">INDEC · BCRA · Bluelytics</span>
            </div>
            <div className="flex items-center justify-between py-3.5 px-1 border-t border-[var(--border-subtle)]">
              <span className="text-sm text-[var(--text-primary)]">Términos y Condiciones</span>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
            <div className="flex items-center justify-between py-3.5 px-1 border-t border-[var(--border-subtle)]">
              <span className="text-sm text-[var(--text-primary)]">Política de Privacidad</span>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
          </Card>
        </section>

        <div className="text-center py-4 text-xs text-[var(--text-muted)]">
          <p>ArgMetrics © 2026</p>
          <p className="mt-1">Datos con fines informativos únicamente</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
