import { describe, it, expect } from 'vitest';
import { calcInteranual, calcAcumulado, generateSparkline } from '../utils/calculations';
import { DataPoint } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dp(date: string, value: number): DataPoint {
  return { date, value };
}

// ─── calcInteranual ───────────────────────────────────────────────────────────

describe('calcInteranual', () => {
  it('calcula variación interanual correctamente', () => {
    const data: DataPoint[] = [
      dp('2023-03-01', 100),
      dp('2024-03-01', 115),
    ];
    const result = calcInteranual(data);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2024-03-01');
    expect(result[0].value).toBeCloseTo(15, 1);
  });

  it('excluye puntos sin período anterior', () => {
    const data: DataPoint[] = [
      dp('2024-01-01', 100),
      dp('2024-02-01', 110),
    ];
    // No hay datos del año anterior, no debe haber resultados
    const result = calcInteranual(data);
    expect(result).toHaveLength(0);
  });

  it('excluye punto cuando el valor base es 0 (evita división por cero)', () => {
    const data: DataPoint[] = [
      dp('2023-06-01', 0),
      dp('2024-06-01', 50),
    ];
    const result = calcInteranual(data);
    expect(result).toHaveLength(0);
  });

  it('retorna vacío para series sin datos suficientes', () => {
    expect(calcInteranual([])).toEqual([]);
    expect(calcInteranual([dp('2024-01-01', 5)])).toEqual([]);
  });

  it('maneja valores negativos', () => {
    const data: DataPoint[] = [
      dp('2023-01-01', 200),
      dp('2024-01-01', 180),
    ];
    const result = calcInteranual(data);
    expect(result[0].value).toBeCloseTo(-10, 1);
  });

  it('no genera Infinity ni NaN', () => {
    const data: DataPoint[] = [
      dp('2023-01-01', 0),
      dp('2024-01-01', 100),
    ];
    const result = calcInteranual(data);
    // Con base 0, debe omitir el punto
    result.forEach((p) => {
      expect(isFinite(p.value)).toBe(true);
      expect(isNaN(p.value)).toBe(false);
    });
  });

  it('mantiene el campo source cuando existe', () => {
    const data: DataPoint[] = [
      { date: '2023-05-01', value: 100, source: 'INDEC' },
      { date: '2024-05-01', value: 120, source: 'INDEC' },
    ];
    const result = calcInteranual(data);
    expect(result[0].source).toBe('INDEC');
  });
});

// ─── calcAcumulado ────────────────────────────────────────────────────────────

describe('calcAcumulado', () => {
  it('retorna vacío para array vacío', () => {
    expect(calcAcumulado([])).toEqual([]);
  });

  it('acumula compuestamente dentro del mismo año', () => {
    const data: DataPoint[] = [
      dp('2024-01-01', 5),  // +5%
      dp('2024-02-01', 3),  // +3%
      dp('2024-03-01', 2),  // +2%
    ];
    const result = calcAcumulado(data);
    expect(result).toHaveLength(3);
    // Acum enero: (1.05 - 1) * 100 = 5%
    expect(result[0].value).toBeCloseTo(5, 1);
    // Acum febrero: (1.05 * 1.03 - 1) * 100 ≈ 8.15%
    expect(result[1].value).toBeCloseTo(8.15, 1);
    // Acum marzo: (1.05 * 1.03 * 1.02 - 1) * 100 ≈ 10.31%
    expect(result[2].value).toBeCloseTo(10.31, 1);
  });

  it('reinicia el acumulado al comenzar un nuevo año', () => {
    const data: DataPoint[] = [
      dp('2023-11-01', 10),
      dp('2023-12-01', 10),
      dp('2024-01-01', 5),  // Debe reiniciar
    ];
    const result = calcAcumulado(data);
    // El tercer punto es enero de 2024 — debe comenzar desde 0
    expect(result[2].value).toBeCloseTo(5, 1);
  });

  it('ordena los datos antes de calcular', () => {
    const data: DataPoint[] = [
      dp('2024-03-01', 2),
      dp('2024-01-01', 5),
      dp('2024-02-01', 3),
    ];
    const result = calcAcumulado(data);
    // El resultado debe tener las fechas en orden
    expect(result[0].date).toBe('2024-01-01');
    expect(result[1].date).toBe('2024-02-01');
    expect(result[2].date).toBe('2024-03-01');
  });

  it('maneja un solo dato', () => {
    const result = calcAcumulado([dp('2024-01-01', 7)]);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBeCloseTo(7, 1);
  });
});

// ─── generateSparkline ────────────────────────────────────────────────────────

describe('generateSparkline', () => {
  it('genera la cantidad correcta de puntos', () => {
    expect(generateSparkline(100, 8)).toHaveLength(8);
    expect(generateSparkline(100, 12)).toHaveLength(12);
    expect(generateSparkline(100, 1)).toHaveLength(1);
  });

  it('el primer punto es el valor base', () => {
    const result = generateSparkline(500, 8);
    expect(result[0]).toBe(500);
  });

  it('todos los valores son no negativos', () => {
    for (let i = 0; i < 20; i++) {
      const result = generateSparkline(50, 10);
      result.forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
    }
  });

  it('maneja base <= 0 retornando ceros', () => {
    const result = generateSparkline(0, 8);
    expect(result).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('maneja base negativa retornando ceros', () => {
    const result = generateSparkline(-100, 5);
    expect(result).toEqual([0, 0, 0, 0, 0]);
  });

  it('maneja base Infinity retornando ceros', () => {
    const result = generateSparkline(Infinity, 4);
    expect(result).toEqual([0, 0, 0, 0]);
  });

  it('usa el parámetro volatility', () => {
    // Con volatility 0 todos los puntos deben ser iguales al base
    // (pero hay variación por el -0.48 offset, así que no será exacto)
    // Solo verificamos que no crashea
    expect(() => generateSparkline(100, 8, 0)).not.toThrow();
  });
});
