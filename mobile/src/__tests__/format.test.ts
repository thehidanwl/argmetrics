import { describe, it, expect } from 'vitest';
import { formatDateShort, formatDateLong, formatValue, formatVariation } from '../utils/format';

describe('formatDateShort', () => {
  it('formatea correctamente', () => {
    expect(formatDateShort('2024-03-15')).toBe('3/24');
    expect(formatDateShort('2024-12-01')).toBe('12/24');
    expect(formatDateShort('2020-01-01')).toBe('1/20');
  });

  it('retorna — para fechas inválidas', () => {
    expect(formatDateShort('no-es-fecha')).toBe('—');
    expect(formatDateShort('')).toBe('—');
  });
});

describe('formatDateLong', () => {
  it('formatea correctamente', () => {
    expect(formatDateLong('2024-03-15')).toBe('3/2024');
    expect(formatDateLong('2024-11-01')).toBe('11/2024');
  });

  it('retorna — para fechas inválidas', () => {
    expect(formatDateLong('invalid')).toBe('—');
  });
});

describe('formatValue', () => {
  it('formatea porcentajes', () => {
    expect(formatValue(4.2, '%')).toBe('4.2%');
    expect(formatValue(100, '%')).toBe('100.0%');
  });

  it('formatea ARS', () => {
    expect(formatValue(1200, 'ARS')).toContain('1.200');
  });

  it('formatea puntos', () => {
    expect(formatValue(1800, 'pts')).toContain('1.800');
  });

  it('retorna — para valores no finitos', () => {
    expect(formatValue(Infinity, '%')).toBe('—');
    expect(formatValue(NaN, '%')).toBe('—');
  });
});

describe('formatVariation', () => {
  it('muestra + para positivos', () => {
    expect(formatVariation(5.3)).toBe('+5.3%');
  });

  it('no muestra + para negativos', () => {
    expect(formatVariation(-3.1)).toBe('-3.1%');
  });

  it('retorna — para null/undefined', () => {
    expect(formatVariation(null)).toBe('—');
    expect(formatVariation(undefined)).toBe('—');
  });

  it('retorna — para Infinity', () => {
    expect(formatVariation(Infinity)).toBe('—');
  });
});
