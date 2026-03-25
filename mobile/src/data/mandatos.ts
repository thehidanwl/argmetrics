import { Mandato } from '../types';

export const MANDATOS: Mandato[] = [
  {
    id: 'nestor',
    presidente: 'Néstor Kirchner',
    asuncion: '2003-05-25',
    fin: '2007-12-10',
    partido: 'FPV',
    color: '#5DADE2',
    orden: 1,
  },
  {
    id: 'cfk1',
    presidente: 'Cristina F. (1° mandato)',
    asuncion: '2007-12-10',
    fin: '2011-12-10',
    partido: 'FPV',
    color: '#2E86C1',
    orden: 2,
  },
  {
    id: 'cfk2',
    presidente: 'Cristina F. (2° mandato)',
    asuncion: '2011-12-10',
    fin: '2015-12-10',
    partido: 'FPV',
    color: '#2980B9',
    orden: 3,
  },
  {
    id: 'macri',
    presidente: 'Mauricio Macri',
    asuncion: '2015-12-10',
    fin: '2019-12-10',
    partido: 'PRO/Cambiemos',
    color: '#F4D03F',
    orden: 4,
  },
  {
    id: 'alberto',
    presidente: 'Alberto Fernández',
    asuncion: '2019-12-10',
    fin: '2023-12-10',
    partido: 'FdT',
    color: '#85C1E9',
    orden: 5,
  },
  {
    id: 'milei',
    presidente: 'Javier Milei',
    asuncion: '2023-12-10',
    fin: null,
    partido: 'LLA',
    color: '#8E44AD',
    orden: 6,
  },
];

/** Devuelve el mandato activo para una fecha dada */
export function getMandatoForDate(dateStr: string): Mandato | null {
  const date = new Date(dateStr);
  return (
    MANDATOS.find((m) => {
      const start = new Date(m.asuncion);
      const end = m.fin ? new Date(m.fin) : new Date('2099-01-01');
      return date >= start && date <= end;
    }) ?? null
  );
}
