import { IndicatorDef } from '../types';

export const INDICATORS: IndicatorDef[] = [
  // ─── ECONÓMICAS ─────────────────────────────────────────────────────────────
  {
    id: 'inflacion',
    label: 'Inflación',
    labelShort: 'Inflac.',
    category: 'economicas',
    unit: '%',
    periodType: 'monthly',
    icon: 'trending-up',
    color: '#ef4444',
    description: 'Variación del Índice de Precios al Consumidor (IPC)',
    temporalities: ['monthly', 'interanual', 'acumulado', 'mandato'],
    toggles: [],
    chips: [
      { id: 'ipc_general', label: 'IPC General', metricName: 'inflation', source: 'INDEC', isDefault: true },
      { id: 'ipc_nucleo', label: 'Núcleo', metricName: 'inflation_nucleo', source: 'INDEC' },
      { id: 'ipc_regulados', label: 'Regulados', metricName: 'inflation_regulados', source: 'INDEC' },
      { id: 'ipc_estacionales', label: 'Estacionales', metricName: 'inflation_estacionales', source: 'INDEC' },
      { id: 'ipc_alimentos', label: 'Alimentos', metricName: 'inflation_alimentos', source: 'INDEC' },
    ],
  },
  {
    id: 'dolar',
    label: 'Dólar',
    labelShort: 'Dólar',
    category: 'economicas',
    unit: 'ARS',
    periodType: 'daily',
    icon: 'cash',
    color: '#10b981',
    description: 'Cotizaciones del dólar en sus distintas variantes',
    temporalities: ['monthly', 'interanual', 'mandato'],
    toggles: [
      { id: 'real', label: 'Valor real (ajustado por IPC Arg)' },
    ],
    chips: [
      { id: 'usd_oficial', label: 'Oficial', metricName: 'usd_oficial', source: 'BCRA', isDefault: true },
      { id: 'usd_blue', label: 'Blue', metricName: 'usd_blue', source: 'Bluelytics', isDefault: true },
      { id: 'usd_mep', label: 'MEP', metricName: 'usd_mep', source: 'BYMA' },
      { id: 'usd_ccl', label: 'CCL', metricName: 'usd_ccl', source: 'BYMA' },
      { id: 'brecha', label: 'Brecha %', metricName: 'usd_brecha', source: 'Cálculo propio' },
    ],
  },
  {
    id: 'actividad',
    label: 'Actividad',
    labelShort: 'Activid.',
    category: 'economicas',
    unit: 'índice',
    periodType: 'monthly',
    icon: 'bar-chart',
    color: '#3b82f6',
    description: 'Estimador Mensual de Actividad Económica y PBI',
    temporalities: ['monthly', 'interanual', 'acumulado', 'mandato'],
    toggles: [
      { id: 'real', label: 'Precios constantes' },
      { id: 'per_capita', label: 'Per cápita' },
    ],
    chips: [
      { id: 'emae', label: 'EMAE', metricName: 'emae', source: 'INDEC', isDefault: true },
      { id: 'pbi', label: 'PBI', metricName: 'gdp', source: 'INDEC' },
      { id: 'ventas_super', label: 'Supermercados', metricName: 'retail_sales', source: 'INDEC' },
    ],
  },
  {
    id: 'riesgo_pais',
    label: 'Riesgo País',
    labelShort: 'Riesgo',
    category: 'economicas',
    unit: 'pts',
    periodType: 'daily',
    icon: 'alert-circle',
    color: '#f59e0b',
    description: 'EMBI+ Argentina — diferencial de tasas soberanas (JPMorgan)',
    temporalities: ['monthly', 'mandato'],
    toggles: [],
    chips: [
      { id: 'embi', label: 'EMBI+ Argentina', metricName: 'country_risk', source: 'JPMorgan', isDefault: true },
    ],
  },
  {
    id: 'reservas',
    label: 'Reservas',
    labelShort: 'Reservas',
    category: 'economicas',
    unit: 'USD M',
    periodType: 'daily',
    icon: 'shield-checkmark',
    color: '#06b6d4',
    description: 'Reservas internacionales del Banco Central',
    temporalities: ['monthly', 'mandato'],
    toggles: [],
    chips: [
      { id: 'reservas_brutas', label: 'Brutas', metricName: 'reserves', source: 'BCRA', isDefault: true },
    ],
  },

  // ─── SOCIALES ───────────────────────────────────────────────────────────────
  {
    id: 'pobreza',
    label: 'Pobreza',
    labelShort: 'Pobreza',
    category: 'sociales',
    unit: '%',
    periodType: 'quarterly',
    icon: 'people',
    color: '#e879f9',
    description: 'Porcentaje de personas bajo la línea de pobreza',
    temporalities: ['monthly', 'mandato'],
    toggles: [],
    chips: [
      { id: 'pobreza_indec', label: 'INDEC (EPH)', metricName: 'poverty', source: 'INDEC', isDefault: true },
      { id: 'indigencia_indec', label: 'Indigencia', metricName: 'indigence', source: 'INDEC' },
    ],
  },
  {
    id: 'distribucion',
    label: 'Desigualdad',
    labelShort: 'Gini',
    category: 'sociales',
    unit: 'índice',
    periodType: 'quarterly',
    icon: 'analytics',
    color: '#a78bfa',
    description: 'Coeficiente de Gini y brecha de ingresos',
    temporalities: ['monthly', 'mandato'],
    toggles: [],
    chips: [
      { id: 'gini', label: 'Coef. Gini', metricName: 'gini', source: 'INDEC', isDefault: true },
    ],
  },

  // ─── LABORALES ───────────────────────────────────────────────────────────────
  {
    id: 'salarios',
    label: 'Salarios',
    labelShort: 'Salarios',
    category: 'laborales',
    unit: 'ARS',
    periodType: 'monthly',
    icon: 'wallet',
    color: '#34d399',
    description: 'Remuneraciones promedio del sector formal privado',
    temporalities: ['monthly', 'interanual', 'mandato'],
    toggles: [
      { id: 'real', label: 'Valor real (ajustado por IPC)' },
      { id: 'usd_oficial', label: 'En USD (oficial)' },
      { id: 'usd_blue', label: 'En USD (blue)' },
    ],
    chips: [
      { id: 'ripte', label: 'RIPTE', metricName: 'wage_ripte', source: 'Min. Trabajo', isDefault: true },
      { id: 'privado_registrado', label: 'Privado registrado', metricName: 'wage_private', source: 'INDEC' },
      { id: 'smvm', label: 'Salario mínimo', metricName: 'wage_minimum', source: 'Min. Trabajo' },
    ],
  },
  {
    id: 'empleo',
    label: 'Empleo',
    labelShort: 'Empleo',
    category: 'laborales',
    unit: '%',
    periodType: 'quarterly',
    icon: 'briefcase',
    color: '#fb923c',
    description: 'Tasas de desocupación, empleo y actividad (EPH)',
    temporalities: ['monthly', 'mandato'],
    toggles: [],
    chips: [
      { id: 'desocupacion', label: 'Desocupación', metricName: 'unemployment', source: 'INDEC', isDefault: true },
      { id: 'tasa_empleo', label: 'Tasa de empleo', metricName: 'employment_rate', source: 'INDEC' },
      { id: 'informalidad', label: 'Informalidad', metricName: 'informality_rate', source: 'INDEC' },
    ],
  },
  {
    id: 'poder_adquisitivo',
    label: 'Poder Adquisitivo',
    labelShort: 'Poder Adq.',
    category: 'laborales',
    unit: 'unidades',
    periodType: 'monthly',
    icon: 'pricetag',
    color: '#f472b6',
    description: '¿Cuántos bienes se compran con un salario promedio?',
    temporalities: ['monthly', 'mandato'],
    toggles: [],
    chips: [
      { id: 'kg_asado', label: 'Kg de asado', metricName: 'purchasing_asado', source: 'RIPTE/INDEC', isDefault: true },
      { id: 'litros_nafta', label: 'Litros nafta', metricName: 'purchasing_nafta', source: 'RIPTE/YPF' },
      { id: 'bigmacs', label: 'Big Macs', metricName: 'purchasing_bigmac', source: 'RIPTE/The Economist' },
    ],
  },

  // ─── FISCALES ───────────────────────────────────────────────────────────────
  {
    id: 'deuda',
    label: 'Deuda Pública',
    labelShort: 'Deuda',
    category: 'fiscales',
    unit: 'USD B',
    periodType: 'quarterly',
    icon: 'card',
    color: '#f87171',
    description: 'Stock de deuda soberana del sector público nacional',
    temporalities: ['monthly', 'mandato'],
    toggles: [
      { id: 'pct_pbi', label: 'En % del PBI' },
    ],
    chips: [
      { id: 'deuda_bruta', label: 'Deuda bruta', metricName: 'public_debt', source: 'Sec. Finanzas', isDefault: true },
      { id: 'pasivos_bcra', label: 'Pasivos BCRA', metricName: 'bcra_liabilities', source: 'BCRA' },
    ],
  },
  {
    id: 'fiscal',
    label: 'Resultado Fiscal',
    labelShort: 'Fiscal',
    category: 'fiscales',
    unit: 'ARS M',
    periodType: 'monthly',
    icon: 'calculator',
    color: '#a3e635',
    description: 'Resultado primario y financiero del Sector Público',
    temporalities: ['monthly', 'acumulado', 'mandato'],
    toggles: [
      { id: 'pct_pbi', label: 'En % del PBI' },
      { id: 'real', label: 'Valor real (IPC)' },
    ],
    chips: [
      { id: 'resultado_primario', label: 'Resultado primario', metricName: 'fiscal_primary', source: 'Sec. Hacienda', isDefault: true },
      { id: 'resultado_financiero', label: 'Resultado financiero', metricName: 'fiscal_financial', source: 'Sec. Hacienda' },
      { id: 'ingresos', label: 'Ingresos', metricName: 'fiscal_revenue', source: 'Sec. Hacienda' },
    ],
  },
  {
    id: 'comercio_exterior',
    label: 'Comercio Exterior',
    labelShort: 'Comercio',
    category: 'fiscales',
    unit: 'USD M',
    periodType: 'monthly',
    icon: 'globe',
    color: '#67e8f9',
    description: 'Exportaciones, importaciones y balanza comercial',
    temporalities: ['monthly', 'acumulado', 'interanual', 'mandato'],
    toggles: [],
    chips: [
      { id: 'exportaciones', label: 'Exportaciones', metricName: 'exports', source: 'INDEC', isDefault: true },
      { id: 'importaciones', label: 'Importaciones', metricName: 'imports', source: 'INDEC' },
      { id: 'balanza', label: 'Balanza', metricName: 'trade_balance', source: 'INDEC' },
    ],
  },
];

/** Indicadores agrupados por categoría */
export const INDICATORS_BY_CATEGORY = INDICATORS.reduce(
  (acc, ind) => {
    if (!acc[ind.category]) acc[ind.category] = [];
    acc[ind.category].push(ind);
    return acc;
  },
  {} as Record<string, IndicatorDef[]>
);

export function getIndicator(id: string): IndicatorDef | undefined {
  return INDICATORS.find((i) => i.id === id);
}
