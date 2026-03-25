// ─── Tipos base ───────────────────────────────────────────────────────────────

export type Category = 'economy' | 'social' | 'consumption';
export type PeriodType = 'daily' | 'monthly' | 'quarterly' | 'annually';

/** Las 4 categorías principales de la app (tabs) */
export type AppCategory = 'economicas' | 'sociales' | 'laborales' | 'fiscales';

/** Modos de temporalidad disponibles en la pantalla de indicador */
export type TemporalityMode = 'monthly' | 'interanual' | 'acumulado' | 'mandato';

// ─── Indicadores ──────────────────────────────────────────────────────────────

/** Una subcategoría/serie seleccionable (chip) dentro de un indicador */
export interface ChipDef {
  id: string;           // ej: "ipc_general"
  label: string;        // ej: "IPC General"
  metricName: string;   // nombre en la DB, ej: "inflation"
  source: string;       // "INDEC", "UCA", etc.
  isDefault?: boolean;
}

/** Toggle contextual disponible para un indicador en el panel ⚙️ */
export interface ToggleDef {
  id: 'real' | 'usd_oficial' | 'usd_blue' | 'per_capita' | 'pct_pbi';
  label: string;
}

/** Definición de un indicador en el catálogo */
export interface IndicatorDef {
  id: string;                           // ej: "inflacion"
  label: string;                        // ej: "Inflación"
  labelShort: string;                   // ej: "Inflac." (para bottom bar y chips de mandato)
  category: AppCategory;
  unit: string;                         // ej: "%", "ARS", "USD"
  periodType: PeriodType;
  chips: ChipDef[];
  temporalities: TemporalityMode[];
  toggles: ToggleDef[];
  icon: string;                         // nombre de Ionicon
  color: string;                        // color del indicador
  description: string;
}

// ─── Mandatos presidenciales ──────────────────────────────────────────────────

export interface Mandato {
  id: string;
  presidente: string;
  asuncion: string;   // YYYY-MM-DD
  fin: string | null; // null si es actual
  partido: string;
  color: string;      // hex
  orden: number;
}

// ─── Datos de series temporales ───────────────────────────────────────────────

export interface DataPoint {
  date: string;   // ISO string
  value: number;
  source?: string;
}

export interface SeriesData {
  chipId: string;
  label: string;
  color: string;
  data: DataPoint[];
}

// ─── Modelos de API existentes ────────────────────────────────────────────────

export interface Metric {
  id: string;
  category: Category;
  name: string;
  value: number;
  date: string;
  periodType: PeriodType;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetricDataPoint {
  date: string;
  value: number;
}

export interface MetricSeries {
  name: string;
  category: Category;
  description: string;
  unit: string;
  latest: {
    value: number;
    date: string;
    variation: number;
    variationType: string;
  };
  series: MetricDataPoint[];
}

export interface USDExchangeRates {
  oficial?: ExchangeRate;
  official?: ExchangeRate;
  blue?: ExchangeRate;
  mep?: ExchangeRate;
  ccl?: ExchangeRate;
  brecha?: { value: number | string; unit: string };
}

export interface ExchangeRate {
  buy: number;
  sell: number;
  updatedAt: string;
}

export interface CountryRisk {
  value: number;
  unit?: string;
  variation: number;
  variationType?: string;
  updatedAt: string;
}

export interface CategoryInfo {
  name: Category;
  description: string;
  metricsCount: number;
}

export interface MetricInfo {
  name: string;
  category: Category;
  description: string;
  unit: string;
  periodType: PeriodType;
  source: string;
  dateRange: { from: string; to: string };
}

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  cached?: boolean;
  expiresAt?: string;
  mock?: boolean;
}

export interface ApiError {
  error: { code: string; message: string };
}
