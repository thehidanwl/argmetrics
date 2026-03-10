'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Bell, Moon, Globe, RefreshCw, Wifi, Info, ChevronRight, AlertTriangle, DollarSign } from 'lucide-react';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);
  const [refreshFrequency, setRefreshFrequency] = useState('15min');
  const [preferredCurrency, setPreferredCurrency] = useState('USD');

  const alerts = [
    { id: 1, name: 'Dólar oficial > $900', enabled: true },
    { id: 2, name: 'Dólar blue > $1,100', enabled: false },
    { id: 3, name: 'Inflación mensual > 5%', enabled: false },
    { id: 4, name: 'Riesgo país > 2000 pts', enabled: false },
  ];

  const [alertSettings, setAlertSettings] = useState(alerts);

  const toggleAlert = (id: number) => {
    setAlertSettings(alerts.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-20">
      <Header title="Ajustes" />

      <main className="p-4 space-y-6">
        {/* Alerts Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-[var(--primary-500)]" />
            <h2 className="text-lg font-semibold">Alertas</h2>
          </div>
          <Card>
            {alertSettings.map((alert) => (
              <div 
                key={alert.id} 
                className="flex items-center justify-between py-3 border-b border-[var(--border-default)] last:border-0"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
                  <span className="text-sm">{alert.name}</span>
                </div>
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    alert.enabled ? 'bg-[var(--primary-600)]' : 'bg-[var(--bg-tertiary)]'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    alert.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </Card>
        </section>

        {/* Appearance Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Moon className="w-5 h-5 text-[var(--primary-500)]" />
            <h2 className="text-lg font-semibold">Apariencia</h2>
          </div>
          <Card>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
                <span className="text-sm">Modo Oscuro</span>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  darkMode ? 'bg-[var(--primary-600)]' : 'bg-[var(--bg-tertiary)]'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[var(--text-secondary)]" />
                <span className="text-sm">Moneda preferida</span>
              </div>
              <button className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                {preferredCurrency}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </section>

        {/* Data Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-5 h-5 text-[var(--primary-500)]" />
            <h2 className="text-lg font-semibold">Datos</h2>
          </div>
          <Card>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[var(--text-secondary)]" />
                <span className="text-sm">Auto-actualizar</span>
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  autoRefresh ? 'bg-[var(--primary-600)]' : 'bg-[var(--bg-tertiary)]'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[var(--text-secondary)]" />
                <span className="text-sm">Frecuencia</span>
              </div>
              <button className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                {refreshFrequency}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-[var(--text-secondary)]" />
                <span className="text-sm">WiFi solo</span>
              </div>
              <button
                onClick={() => setWifiOnly(!wifiOnly)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  wifiOnly ? 'bg-[var(--primary-600)]' : 'bg-[var(--bg-tertiary)]'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  wifiOnly ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </Card>
        </section>

        {/* About Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-[var(--primary-500)]" />
            <h2 className="text-lg font-semibold">Acerca de</h2>
          </div>
          <Card>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-[var(--text-secondary)]">Versión</span>
              <span className="text-sm">1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-[var(--border-default)]">
              <span className="text-sm text-[var(--text-secondary)]">Fuentes de datos</span>
              <span className="text-sm">INDEC, BCRA</span>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-[var(--border-default)]">
              <span className="text-sm">Términos y Condiciones</span>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
            <div className="flex items-center justify-between py-3 border-t border-[var(--border-default)]">
              <span className="text-sm">Política de Privacidad</span>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center py-6 text-xs text-[var(--text-muted)]">
          <p>ArgMetrics © 2026</p>
          <p className="mt-1">Datos con fines informativos</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
