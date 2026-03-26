import { DataPoint } from '../types';

/**
 * Calcula variación interanual: porcentaje de cambio vs mismo mes del año anterior.
 * Excluye puntos donde el valor base es 0 (evita división por cero / Infinity).
 */
/** Extrae year/month de un ISO date string sin usar Date() para evitar timezone issues */
function parseDate(dateStr: string): { year: number; month: number } {
  const parts = dateStr.split('-');
  return { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) };
}

export function calcInteranual(data: DataPoint[]): DataPoint[] {
  return data
    .map((point) => {
      const { year: y2, month: m2 } = parseDate(point.date);
      const sameMonthLastYear = data.find((p) => {
        const { year: y1, month: m1 } = parseDate(p.date);
        return m1 === m2 && y1 === y2 - 1;
      });
      if (!sameMonthLastYear || sameMonthLastYear.value === 0) return null;
      const variation = ((point.value - sameMonthLastYear.value) / Math.abs(sameMonthLastYear.value)) * 100;
      if (!isFinite(variation)) return null;
      return { date: point.date, value: parseFloat(variation.toFixed(2)), source: point.source };
    })
    .filter((p): p is DataPoint => p !== null);
}

/**
 * Calcula acumulado anual: reinicia cada año a base 100.
 * Los datos de entrada deben ser variaciones mensuales en porcentaje.
 */
export function calcAcumulado(data: DataPoint[]): DataPoint[] {
  if (data.length === 0) return [];
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  let acum = 1;
  let lastYear = parseDate(sorted[0].date).year;

  return sorted.map((point) => {
    const year = parseDate(point.date).year;
    if (year !== lastYear) {
      acum = 1;
      lastYear = year;
    }
    acum *= 1 + point.value / 100;
    return { date: point.date, value: parseFloat(((acum - 1) * 100).toFixed(2)), source: point.source };
  });
}

/**
 * Genera una serie de sparkline aleatoria basada en un valor base.
 * Solo para uso como placeholder mientras no haya datos reales.
 */
export function generateSparkline(base: number, points = 8, volatility = 0.04): number[] {
  if (base <= 0 || !isFinite(base)) return Array(points).fill(0);
  const data: number[] = [base];
  for (let i = 1; i < points; i++) {
    const delta = (Math.random() - 0.48) * Math.max(base, 1) * volatility;
    data.push(Math.max(0, data[i - 1] + delta));
  }
  return data;
}
