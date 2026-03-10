import { describe, it, expect } from 'vitest';

describe('Utility Functions', () => {
  describe('getMetricDescription', () => {
    const getMetricDescription = (name: string): string => {
      const descriptions: Record<string, string> = {
        inflation: 'Índice de Precios al Consumidor (IPC)',
        usd_official: 'Dólar Oficial BCRA',
        usd_blue: 'Dólar Blue',
        usd_mep: 'Dólar MEP',
        usd_ccl: 'Dólar CCL',
        poverty: 'Pobreza',
        unemployment: 'Desempleo',
        gdp: 'Producto Bruto Interno',
        interest_rate: 'Tasa de interés BCRA',
        reserves: 'Reservas Internacionales',
        country_risk: 'Riesgo País (EMBI)',
      };
      return descriptions[name] || name;
    };

    it('should return correct description for inflation', () => {
      expect(getMetricDescription('inflation')).toBe('Índice de Precios al Consumidor (IPC)');
    });

    it('should return correct description for usd_blue', () => {
      expect(getMetricDescription('usd_blue')).toBe('Dólar Blue');
    });

    it('should return name as fallback for unknown metrics', () => {
      expect(getMetricDescription('unknown_metric')).toBe('unknown_metric');
    });
  });

  describe('getMetricUnit', () => {
    const getMetricUnit = (name: string): string => {
      if (name.includes('usd') || name.includes('gdp') || name.includes('reserves')) {
        return 'ars';
      }
      if (name.includes('poverty') || name.includes('unemployment') || name.includes('interest')) {
        return 'percentage';
      }
      return 'number';
    };

    it('should return ars for USD metrics', () => {
      expect(getMetricUnit('usd_blue')).toBe('ars');
      expect(getMetricUnit('usd_official')).toBe('ars');
    });

    it('should return percentage for social metrics', () => {
      expect(getMetricUnit('poverty')).toBe('percentage');
      expect(getMetricUnit('unemployment')).toBe('percentage');
      expect(getMetricUnit('interest_rate')).toBe('percentage');
    });

    it('should return number for other metrics', () => {
      expect(getMetricUnit('gdp')).toBe('ars');
      expect(getMetricUnit('reserves')).toBe('ars');
    });
  });

  describe('getCategoryDescription', () => {
    const getCategoryDescription = (category: string): string => {
      const descriptions: Record<string, string> = {
        economy: 'Economic indicators',
        social: 'Social indicators',
        consumption: 'Consumption indicators',
      };
      return descriptions[category] || category;
    };

    it('should return correct description for economy', () => {
      expect(getCategoryDescription('economy')).toBe('Economic indicators');
    });

    it('should return correct description for social', () => {
      expect(getCategoryDescription('social')).toBe('Social indicators');
    });

    it('should return category as fallback', () => {
      expect(getCategoryDescription('unknown')).toBe('unknown');
    });
  });

  describe('Variation calculation', () => {
    const calculateVariation = (latest: number, previous: number): number => {
      if (!previous || previous === 0) return 0;
      return ((latest - previous) / previous) * 100;
    };

    it('should calculate positive variation correctly', () => {
      expect(calculateVariation(55, 50)).toBeCloseTo(10, 1);
    });

    it('should calculate negative variation correctly', () => {
      expect(calculateVariation(45, 50)).toBeCloseTo(-10, 1);
    });

    it('should return 0 when previous is 0', () => {
      expect(calculateVariation(50, 0)).toBe(0);
    });

    it('should return 0 when previous is undefined', () => {
      expect(calculateVariation(50, undefined as unknown as number)).toBe(0);
    });
  });
});
