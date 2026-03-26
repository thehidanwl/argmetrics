/** Paleta de colores de la app — fuente única de verdad */
export const Colors = {
  bg: {
    primary: '#0a0a0b',
    secondary: '#1c1c26',
    card: '#1c1c1e',
    elevated: '#23232f',
    input: '#2c2c2e',
  },
  text: {
    primary: '#f4f4f5',
    secondary: '#a1a1aa',
    muted: '#71717a',
    faint: '#52525a',
  },
  border: {
    subtle: 'rgba(255,255,255,0.06)',
    default: 'rgba(255,255,255,0.07)',
    strong: 'rgba(255,255,255,0.10)',
    accent: 'rgba(129,140,248,0.2)',
  },
  accent: {
    indigo: '#818cf8',
    indigoBg: '#3730a3',
    indigoDeep: '#1e3a5f',
    blue: '#60a5fa',
  },
  indicator: {
    green: '#10b981',
    red: '#ef4444',
    amber: '#f59e0b',
    slate: '#94a3b8',
    purple: '#e879f9',
    orange: '#fb923c',
    cyan: '#67e8f9',
  },
} as const;
