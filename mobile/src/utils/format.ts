/**
 * Parsea año y mes de un ISO date string sin usar Date() para evitar
 * problemas de timezone (new Date('YYYY-MM-DD') es UTC midnight).
 */
function parseYearMonth(dateStr: string): { year: string; month: number } | null {
  const parts = dateStr?.split('-');
  if (!parts || parts.length < 2) return null;
  const year = parts[0];
  const month = parseInt(parts[1], 10);
  if (!year || isNaN(month) || month < 1 || month > 12) return null;
  return { year, month };
}

/**
 * Formatea una fecha ISO a formato corto: "3/24" (mes/año 2 dígitos)
 */
export function formatDateShort(dateStr: string): string {
  const parsed = parseYearMonth(dateStr);
  if (!parsed) return '—';
  return `${parsed.month}/${parsed.year.slice(2)}`;
}

/**
 * Formatea una fecha ISO a formato largo: "3/2024"
 */
export function formatDateLong(dateStr: string): string {
  const parsed = parseYearMonth(dateStr);
  if (!parsed) return '—';
  return `${parsed.month}/${parsed.year}`;
}

/**
 * Formatea un número según la unidad del indicador.
 */
export function formatValue(value: number, unit: string): string {
  if (!isFinite(value)) return '—';
  if (unit === '%') return `${value.toFixed(1)}%`;
  if (unit === 'ARS') return `$${value.toLocaleString('es-AR')}`;
  if (unit === 'USD M' || unit === 'USD B') return value.toFixed(1);
  if (unit === 'pts') return value.toLocaleString('es-AR');
  return value.toFixed(2);
}

/**
 * Formatea una variación porcentual con signo: "+3.2%" o "-1.5%"
 */
export function formatVariation(variation: number | null | undefined): string {
  if (variation == null || !isFinite(variation)) return '—';
  const sign = variation > 0 ? '+' : '';
  return `${sign}${variation.toFixed(1)}%`;
}
